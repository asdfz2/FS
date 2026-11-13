package com.service.ai;

/**
 * AI 上游调用失败：携带一个可安全展示给前端的用户文案与错误码。
 * 上游原始报错（可能包含 provider、key 信息）只进日志，不透传给浏览器。
 */
public class AiClientException extends Exception {
    private static final long serialVersionUID = 1L;

    /** 建议前端使用的错误码（429 限流 / 504 超时 / 502 上游异常 / 500 通用） */
    private final int code;

    public AiClientException(int code, String userMessage) {
        super(userMessage);
        this.code = code;
    }

    public AiClientException(int code, String userMessage, Throwable cause) {
        super(userMessage, cause);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
