package com.entity.vo;

/**
 * AI 食客共识卡片读取视图。summaryText 为 null 表示没有缓存。
 */
public class AiSummaryVO {
    /** 摘要正文（Markdown）；null = 未生成/无缓存 */
    private String summaryText;
    /** 生成时的评论数；null = 未生成/无缓存 */
    private Integer commentCount;
    /** 当前评论数 */
    private Integer currentCommentCount;
    /** 生成时评论数与当前评论数不一致（含缓存外的增删） */
    private Boolean stale;
    /** 生成时间，yyyy-MM-dd HH:mm:ss；null = 未生成 */
    private String generatedAt;
    /** 生成模型；null = 未生成 */
    private String model;
    /** 生成所需的最少评论数 */
    private Integer minComments;
    /** 当前评论数是否达到生成门槛 */
    private Boolean commentCountEnough;

    public String getSummaryText() {
        return summaryText;
    }

    public void setSummaryText(String summaryText) {
        this.summaryText = summaryText;
    }

    public Integer getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(Integer commentCount) {
        this.commentCount = commentCount;
    }

    public Integer getCurrentCommentCount() {
        return currentCommentCount;
    }

    public void setCurrentCommentCount(Integer currentCommentCount) {
        this.currentCommentCount = currentCommentCount;
    }

    public Boolean getStale() {
        return stale;
    }

    public void setStale(Boolean stale) {
        this.stale = stale;
    }

    public String getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(String generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getMinComments() {
        return minComments;
    }

    public void setMinComments(Integer minComments) {
        this.minComments = minComments;
    }

    public Boolean getCommentCountEnough() {
        return commentCountEnough;
    }

    public void setCommentCountEnough(Boolean commentCountEnough) {
        this.commentCountEnough = commentCountEnough;
    }
}
