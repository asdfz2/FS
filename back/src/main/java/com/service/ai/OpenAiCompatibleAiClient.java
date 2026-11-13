package com.service.ai;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Consumer;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

/**
 * OpenAI 兼容接口（默认指向 OpenRouter）的流式客户端。
 * 只依赖 JDK 自带的 java.net.http，不引入额外 HTTP 依赖。
 */
@Component
public class OpenAiCompatibleAiClient implements AiClient {
    private static final Logger log = LoggerFactory.getLogger(OpenAiCompatibleAiClient.class);

    @Value("${ai.api-key:}")
    private String apiKey;

    @Value("${ai.base-url:https://openrouter.ai/api/v1}")
    private String baseUrl;

    @Value("${ai.model:openrouter/free}")
    private String model;

    @Value("${ai.timeout-ms:30000}")
    private long timeoutMs;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean isConfigured() {
        return StringUtils.isNotBlank(apiKey);
    }

    @Override
    public String model() {
        return model;
    }

    @Override
    public String streamChat(String prompt, Consumer<String> onPayload) throws Exception {
        if (!isConfigured()) {
            throw new IllegalStateException("AI_API_KEY 未配置");
        }
        try {
            return doStream(prompt, onPayload);
        } catch (Exception first) {
            // 只有一个字都没推给调用方时才安全重试，避免重复帧
            if (onChunkEmitted.get()) {
                throw first;
            }
            log.warn("AI 流式请求失败，重试一次：{}", first.getMessage());
            return doStream(prompt, onPayload);
        }
    }

    private final AtomicBoolean onChunkEmitted = new AtomicBoolean(false);

    private String doStream(String prompt, Consumer<String> onPayload) throws Exception {
        onChunkEmitted.set(false);

        JSONObject body = new JSONObject();
        body.put("model", model);
        body.put("stream", true);
        body.put("max_tokens", 1024);
        body.put("temperature", 0.7);
        JSONArray messages = new JSONArray();
        JSONObject message = new JSONObject();
        message.put("role", "user");
        message.put("content", prompt);
        messages.add(message);
        body.put("messages", messages);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(StringUtils.removeEnd(baseUrl, "/") + "/chat/completions"))
                .timeout(Duration.ofMillis(timeoutMs))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json; charset=utf-8")
                .POST(HttpRequest.BodyPublishers.ofString(body.toJSONString(), StandardCharsets.UTF_8))
                .build();

        HttpResponse<java.io.InputStream> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

        int status = response.statusCode();
        if (status < 200 || status >= 300) {
            String errorBody = readQuietly(response.body());
            throw new IOException("AI 接口返回 " + status + (StringUtils.isBlank(errorBody) ? "" : "：" + abbrev(errorBody, 200)));
        }

        StringBuilder full = new StringBuilder();
        int malformedFrames = 0;
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || !line.startsWith("data:")) {
                    continue;
                }
                String payload = line.substring("data:".length()).trim();
                if ("[DONE]".equals(payload)) {
                    break;
                }
                try {
                    JSONObject frame = JSONObject.parseObject(payload);
                    JSONArray choices = frame.getJSONArray("choices");
                    if (choices == null || choices.isEmpty()) {
                        continue;
                    }
                    JSONObject delta = choices.getJSONObject(0).getJSONObject("delta");
                    String piece = delta == null ? null : delta.getString("content");
                    if (StringUtils.isNotEmpty(piece)) {
                        full.append(piece);
                        onChunkEmitted.set(true);
                        // 透传 OpenAI 兼容增量帧：浏览器侧直接按该协议解析
                        onPayload.accept(payload);
                    }
                } catch (Exception parseError) {
                    malformedFrames++;
                    if (malformedFrames > 16) {
                        throw new IOException("AI 流式响应解析失败，异常帧过多");
                    }
                    log.debug("跳过无法解析的 SSE 帧：{}", abbrev(payload, 80));
                }
            }
        }

        String text = full.toString().trim();
        if (text.isEmpty()) {
            throw new IOException("AI 返回内容为空");
        }
        return text;
    }

    private static String readQuietly(java.io.InputStream stream) {
        if (stream == null) {
            return "";
        }
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null && sb.length() < 2000) {
                sb.append(line).append('\n');
            }
            return sb.toString().trim();
        } catch (IOException e) {
            return "";
        }
    }

    private static String abbrev(String value, int max) {
        if (value == null) {
            return "";
        }
        String flat = value.replaceAll("\\s+", " ").trim();
        return flat.length() <= max ? flat : flat.substring(0, max) + "...";
    }
}
