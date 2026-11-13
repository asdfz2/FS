package com.service.ai;

import java.util.function.Consumer;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

/**
 * 测试用 AiClient：不发真实网络请求，按固定切块吐出 OpenAI 兼容增量帧，可注入异常。
 */
public class MockAiClient implements AiClient {
    public static final String CANNED_TEXT =
            "**综合评价**：整体不错。\n\n**优点**：味道好、分量足。\n\n**缺点**：高峰期上菜慢。\n\n**适合谁**：喜欢热闹聚餐的朋友。\n\n（由 AI 生成，仅供参考）";

    private String cannedText = CANNED_TEXT;
    private RuntimeException failure;
    private boolean configured = true;

    @Override
    public String streamChat(String prompt, Consumer<String> onPayload) throws Exception {
        if (failure != null) {
            throw failure;
        }
        // 按 8 个字符切块，模拟流式增量并包装成 OpenAI 兼容帧
        for (int i = 0; i < cannedText.length(); i += 8) {
            String piece = cannedText.substring(i, Math.min(i + 8, cannedText.length()));
            JSONObject delta = new JSONObject();
            delta.put("content", piece);
            JSONObject choice = new JSONObject();
            choice.put("delta", delta);
            choice.put("index", 0);
            JSONObject frame = new JSONObject();
            JSONArray choices = new JSONArray();
            choices.add(choice);
            frame.put("choices", choices);
            onPayload.accept(frame.toJSONString());
        }
        return cannedText;
    }

    @Override
    public String model() {
        return "mock-ai-model";
    }

    @Override
    public boolean isConfigured() {
        return configured;
    }

    public void setCannedText(String cannedText) {
        this.cannedText = cannedText;
    }

    public void setFailure(RuntimeException failure) {
        this.failure = failure;
    }

    public void setConfigured(boolean configured) {
        this.configured = configured;
    }
}
