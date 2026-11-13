-- AI 食客共识：摘要缓存表与生成配额日志表
-- 用法：mysql -u <user> -p fs < sql/migrations/20261113_ai_summary.sql
-- 幂等：CREATE TABLE IF NOT EXISTS，可重复执行
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `ai_summary` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `content_id` bigint NOT NULL COMMENT '美食内容 ID（meishijianshang.id）',
  `summary_text` mediumtext COMMENT '摘要正文（Markdown）',
  `comment_count` int NOT NULL COMMENT '生成时评论数',
  `model` varchar(120) DEFAULT NULL COMMENT '生成模型',
  `generated_by` bigint DEFAULT NULL COMMENT '生成人 userid',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_content_id` (`content_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 食客共识摘要缓存';

CREATE TABLE IF NOT EXISTS `ai_usage` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint NOT NULL COMMENT '用户 ID',
  `content_id` bigint NOT NULL COMMENT '美食内容 ID（meishijianshang.id）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  PRIMARY KEY (`id`),
  KEY `idx_created` (`created_at`),
  KEY `idx_user_content_time` (`user_id`, `content_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI 生成配额日志';
