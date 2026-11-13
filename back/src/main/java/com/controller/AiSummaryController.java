package com.controller;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

import javax.servlet.http.HttpServletRequest;

import com.alibaba.fastjson.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.annotation.IgnoreAuth;
import com.entity.vo.AiPrecheckResult;
import com.entity.vo.AiSummaryVO;
import com.service.AiSummaryService;
import com.service.ai.AiClientException;
import com.utils.R;

/**
 * AI 食客共识：缓存读取（匿名可读）+ SSE 流式生成（登录可调）。
 */
@RestController
@RequestMapping("/ai")
public class AiSummaryController {
    private static final Logger log = LoggerFactory.getLogger(AiSummaryController.class);

    @Autowired
    private AiSummaryService aiSummaryService;

    @Value("${ai.timeout-ms:30000}")
    private long aiTimeoutMs;

    private final ExecutorService aiExecutor = Executors.newFixedThreadPool(2, r -> {
        Thread t = new Thread(r, "ai-summary-stream");
        t.setDaemon(true);
        return t;
    });

    /**
     * 读取缓存摘要。无缓存时 data 为 null，并附带 minComments / commentCount（当前评论数）。
     */
    @IgnoreAuth
    @RequestMapping(value = "/summary/{contentId}", method = RequestMethod.GET)
    public R summary(@PathVariable("contentId") String contentId) {
        Long id = parseId(contentId);
        if (id == null) {
            return R.error(400, "内容 ID 不合法");
        }
        AiSummaryVO vo = aiSummaryService.getSummary(id);
        if (vo == null) {
            return R.error(404, "内容不存在");
        }
        if (vo.getSummaryText() == null) {
            R result = R.ok();
            result.put("data", null);
            result.put("minComments", vo.getMinComments());
            result.put("commentCount", vo.getCurrentCommentCount());
            return result;
        }
        return R.ok().put("data", vo);
    }

    /**
     * SSE 流式生成（原生 SseEmitter 返回值，ResponseBodyEmitterReturnValueHandler 支持）。
     * 成功：OpenAI 兼容增量帧原样透传，一行 data:{"choices":[{"delta":{"content":"..."}}]}，
     * 结束帧 data:[DONE]。
     * 校验/预检失败（401/400/429/503）：立即完成的错误帧 data:{"error":"...","code":...}，前端据此展示文案或限流态。
     * 匿名请求在拦截器阶段就被 AuthorizationInterceptor 以 401 R.error 拦截，不会到这里。
     */
    @RequestMapping(value = "/summary/{contentId}/generate", method = RequestMethod.POST)
    public SseEmitter generate(@PathVariable("contentId") String contentId, HttpServletRequest request) {
        Long id = parseId(contentId);
        if (id == null) {
            return errorEmitter(400, "内容 ID 不合法");
        }
        Object userIdObj = request.getSession().getAttribute("userId");
        if (!(userIdObj instanceof Long)) {
            return errorEmitter(401, "请先登录");
        }
        Long userId = (Long) userIdObj;

        AiPrecheckResult precheck = aiSummaryService.precheckGenerate(id, userId);
        if (!precheck.isOk()) {
            return errorEmitter(precheck.getCode(), precheck.getMsg());
        }

        SseEmitter emitter = new SseEmitter(aiTimeoutMs + 10_000);
        emitter.onTimeout(() -> log.warn("AI 摘要 SSE 超时：contentId={}", id));
        emitter.onError(error -> log.warn("AI 摘要 SSE 异常：contentId={}, error={}", id, error.getMessage()));

        aiExecutor.execute(() -> streamToEmitter(id, userId, emitter));
        return emitter;
    }

    /** 校验/预检失败：单帧错误（带 code）后立即完成，不占用真实配额 */
    private SseEmitter errorEmitter(int code, String msg) {
        SseEmitter emitter = new SseEmitter(10_000L);
        aiExecutor.execute(() -> {
            try {
                emitter.send(SseEmitter.event().data(errorFrame(code, msg)));
                emitter.complete();
            } catch (Exception e) {
                log.warn("发送 AI 错误帧失败：{}", e.getMessage());
                emitter.completeWithError(e);
            }
        });
        return emitter;
    }

    private void streamToEmitter(Long contentId, Long userId, SseEmitter emitter) {
        try {
            Consumer<String> onChunk = chunk -> {
                // 透传 OpenAI 兼容增量帧
                if (!sendFrame(emitter, chunk)) {
                    throw new SseClientGoneException();
                }
            };
            aiSummaryService.generateAndSave(contentId, userId, onChunk);
            sendFrame(emitter, "[DONE]");
            try {
                emitter.complete();
            } catch (IllegalStateException alreadyDone) {
                // emitter 可能已因客户端断开而 completeWithError
            }
        } catch (SseClientGoneException clientGone) {
            log.info("SSE 客户端已断开，停止推送：contentId={}", contentId);
        } catch (AiClientException e) {
            log.error("AI 摘要生成失败（上游）：contentId={}, userId={}, code={}",
                    contentId, userId, e.getCode(), e);
            if (sendFrame(emitter, errorFrame(e.getCode(), e.getMessage()))) {
                try {
                    emitter.complete();
                } catch (IllegalStateException alreadyDone) {
                    // 同上
                }
            }
        } catch (Exception e) {
            log.error("AI 摘要生成失败：contentId={}, userId={}", contentId, userId, e);
            if (sendFrame(emitter, errorFrame(500, "AI 共识暂时不可用，请稍后再试"))) {
                try {
                    emitter.complete();
                } catch (IllegalStateException alreadyDone) {
                    // 同上
                }
            }
        }
    }

    /** 客户端在生成中途断开；用于中止后台推送，不当作生成失败处理 */
    private static class SseClientGoneException extends RuntimeException {
    }

    /** @return false 表示客户端已断开，调用方应停止推送 */
    private boolean sendFrame(SseEmitter emitter, String data) {
        try {
            emitter.send(SseEmitter.event().data(data));
            return true;
        } catch (IOException e) {
            log.info("SSE 客户端已断开：{}", e.getMessage());
            try {
                emitter.completeWithError(e);
            } catch (IllegalStateException alreadyDone) {
                // emitter 可能已被超时/异常草完全
            }
            return false;
        }
    }

    private static String errorFrame(int code, String msg) {
        JSONObject json = new JSONObject();
        json.put("error", msg);
        json.put("code", code);
        return json.toJSONString();
    }

    private static Long parseId(String raw) {
        if (raw == null) {
            return null;
        }
        try {
            long value = Long.parseLong(raw.trim());
            return value > 0 ? value : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
