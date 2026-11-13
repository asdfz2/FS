package com.service;

import java.util.List;
import java.util.function.Consumer;

import com.baomidou.mybatisplus.service.IService;
import com.entity.AiSummaryEntity;
import com.entity.DiscussmeishijianshangEntity;
import com.entity.MeishijianshangEntity;
import com.entity.vo.AiPrecheckResult;
import com.entity.vo.AiSummaryVO;

/**
 * AI 食客共识：摘要缓存读取 + 流式生成。
 */
public interface AiSummaryService extends IService<AiSummaryEntity> {

    /**
     * 读取摘要缓存视图。
     * @return 内容不存在时返回 null；否则返回视图（未缓存时 summaryText 为 null）
     */
    AiSummaryVO getSummary(Long contentId);

    /**
     * 生成前校验：内容存在 → 评论数达门槛 → AI 已配置 → 用户节流 → 全站日限额。
     * 校验通过时会写入一条 ai_usage（占用配额），失败时不消耗配额。
     */
    AiPrecheckResult precheckGenerate(Long contentId, Long userId);

    /**
     * 流式生成并保存。prompt 只包含该美食与评论；完整文本落库 ai_summary（按 content_id upsert）。
     * @param onChunk 每个 OpenAI 兼容增量帧（原始 `data:` 内容）回调，用于浏览器端直接按该协议渲染
     * @return 完整摘要文本
     */
    String generateAndSave(Long contentId, Long userId, Consumer<String> onChunk) throws Exception;

    /** 组装提示词（单独暴露便于测试） */
    String buildPrompt(MeishijianshangEntity food, List<DiscussmeishijianshangEntity> comments);
}
