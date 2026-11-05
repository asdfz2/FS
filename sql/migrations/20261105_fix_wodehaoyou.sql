-- Remove duplicate and self-referencing friend records, then enforce uniqueness.
DELETE duplicate
FROM wodehaoyou duplicate
JOIN wodehaoyou original
  ON duplicate.userid = original.userid
 AND duplicate.yonghuming = original.yonghuming
 AND duplicate.id > original.id;

DELETE friend
FROM wodehaoyou friend
JOIN yonghu user_account
  ON friend.userid = user_account.id
WHERE friend.yonghuming = user_account.yonghuming;

ALTER TABLE wodehaoyou
  ADD UNIQUE KEY uk_wodehaoyou_user_friend (userid, yonghuming);
