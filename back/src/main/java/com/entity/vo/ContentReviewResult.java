package com.entity.vo;

public class ContentReviewResult {
    private final int code;
    private final String message;
    private final String auditStatus;
    private final Integer contentVersion;

    private ContentReviewResult(int code, String message, String auditStatus, Integer contentVersion) {
        this.code = code;
        this.message = message;
        this.auditStatus = auditStatus;
        this.contentVersion = contentVersion;
    }

    public static ContentReviewResult success(String auditStatus, Integer contentVersion) {
        return new ContentReviewResult(0, "审核完成", auditStatus, contentVersion);
    }

    public static ContentReviewResult failure(int code, String message) {
        return new ContentReviewResult(code, message, null, null);
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public String getAuditStatus() {
        return auditStatus;
    }

    public Integer getContentVersion() {
        return contentVersion;
    }
}
