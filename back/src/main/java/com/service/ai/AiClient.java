package com.service.ai;

import java.util.function.Consumer;

/**
 * OpenAI 兼容的流式对话客户端抽象。
 * 实现负责把模型返回的 SSE 增量帧原样交回给调用方（透传），并返回拼接后的完整正文。
 */
public interface AiClient {

    /**
     * 流式生成。每收到一个上游 `data:` 帧就原样回调 onPayload（已剔除 [DONE] 结束帧）。
     *
     * @param prompt   完整提示词
     * @param onPayload 原始 `data:` 帧回调（不可为 null）；帧内容是 OpenAI 兼容的 JSON
     * @return 完整正文
     * @throws Exception 网络/协议/配额等错误；已输出过内容时不会重试
     */
    String streamChat(String prompt, Consumer<String> onPayload) throws Exception;

    /** 当前使用的模型名（用于落库展示） */
    String model();

    /** 是否已配置可用的 API Key；未配置时生成接口返回 503 */
    boolean isConfigured();
}
