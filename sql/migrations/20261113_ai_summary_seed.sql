-- AI 食客共识演示补种：给 meishijianshang.id=22（厚切金枪鱼刺身）与 24（招牌肉蟹煲）补足 >=4 条评论
-- 口吻与现有演示库一致；只增不删；按 refid+userid+content 判重，可重复执行（幂等）
-- 用法：mysql -u <user> -p fs < sql/migrations/20261113_ai_summary_seed.sql
-- 注意：不修改 FS.sql 主数据；执行前请先跑 20261105 / 20261109 等已有迁移
-- 指定 utf8mb3 客户端字符集：目标表是 utf8mb3，避免与客户端默认字符集（如 gbk）混用 collation 报 1267
SET NAMES utf8mb3;

-- 22 刺身：现有 2 条（id=61 林晚秋、id=1380000000196 周砚礼），补 2 条
INSERT INTO `discussmeishijianshang` (`addtime`, `refid`, `userid`, `nickname`, `content`, `reply`)
SELECT '2026-11-01 12:30:00', 22, 13, '沈亦然', '刺身厚度给得很实在，芥末是现磨的，醋饭比例也合适。', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM `discussmeishijianshang`
  WHERE `refid` = 22 AND `userid` = 13 AND `content` = '刺身厚度给得很实在，芥末是现磨的，醋饭比例也合适。'
);

INSERT INTO `discussmeishijianshang` (`addtime`, `refid`, `userid`, `nickname`, `content`, `reply`)
SELECT '2026-11-02 19:00:00', 22, 16, '江叙白', '冰鲜感做得很好没有腥味，工作日来人少一点，周末上菜会慢。', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM `discussmeishijianshang`
  WHERE `refid` = 22 AND `userid` = 16 AND `content` = '冰鲜感做得很好没有腥味，工作日来人少一点，周末上菜会慢。'
);

-- 24 肉蟹煲：现有 1 条（id=63 顾青野），补 3 条
INSERT INTO `discussmeishijianshang` (`addtime`, `refid`, `userid`, `nickname`, `content`, `reply`)
SELECT '2026-11-01 18:30:00', 24, 11, '林晚秋', '蟹块肉质紧实，年糕吸满酱汁，微辣就很够味了。', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM `discussmeishijianshang`
  WHERE `refid` = 24 AND `userid` = 11 AND `content` = '蟹块肉质紧实，年糕吸满酱汁，微辣就很够味了。'
);

INSERT INTO `discussmeishijianshang` (`addtime`, `refid`, `userid`, `nickname`, `content`, `reply`)
SELECT '2026-11-03 12:00:00', 24, 15, '陈知遥', '分量很足两个人吃不完，鸡爪炖得脱骨，性价比可以。', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM `discussmeishijianshang`
  WHERE `refid` = 24 AND `userid` = 15 AND `content` = '分量很足两个人吃不完，鸡爪炖得脱骨，性价比可以。'
);

INSERT INTO `discussmeishijianshang` (`addtime`, `refid`, `userid`, `nickname`, `content`, `reply`)
SELECT '2026-11-03 20:30:00', 24, 1380000000209, '李清让', '酱汁拌饭绝了，就是蟹脚有点难剥，建议穿深色衣服来吃。', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM `discussmeishijianshang`
  WHERE `refid` = 24 AND `userid` = 1380000000209 AND `content` = '酱汁拌饭绝了，就是蟹脚有点难剥，建议穿深色衣服来吃。'
);
