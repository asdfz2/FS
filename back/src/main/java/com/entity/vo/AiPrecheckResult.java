package com.entity.vo;

/**
 * 生成前校验结果。ok=false 时 code/msg 用于直接返回给前端。
 */
public class AiPrecheckResult {
    private final boolean ok;
    private final int code;
    private final String msg;

    private AiPrecheckResult(boolean ok, int code, String msg) {
        this.ok = ok;
        this.code = code;
        this.msg = msg;
    }

    public static AiPrecheckResult ok() {
        return new AiPrecheckResult(true, 0, null);
    }

    public static AiPrecheckResult failure(int code, String msg) {
        return new AiPrecheckResult(false, code, msg);
    }

    public boolean isOk() {
        return ok;
    }

    public int getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }
}
