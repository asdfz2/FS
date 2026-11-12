ALTER TABLE meishijianshang
  ADD COLUMN audit_status varchar(20) NOT NULL DEFAULT 'APPROVED' COMMENT '审核状态',
  ADD COLUMN audit_reason varchar(500) DEFAULT NULL COMMENT '审核说明',
  ADD COLUMN audit_by varchar(200) DEFAULT NULL COMMENT '审核人',
  ADD COLUMN audit_time datetime DEFAULT NULL COMMENT '审核时间',
  ADD COLUMN content_version int NOT NULL DEFAULT 1 COMMENT '内容版本',
  ADD COLUMN submit_time datetime DEFAULT CURRENT_TIMESTAMP COMMENT '最近提交时间',
  ADD INDEX idx_meishijianshang_audit_status (audit_status);

CREATE TABLE content_audit_log (
  id bigint NOT NULL COMMENT '主键',
  content_id bigint NOT NULL COMMENT '内容 ID',
  content_version int NOT NULL COMMENT '内容版本',
  action varchar(20) NOT NULL COMMENT '审核结果',
  operator varchar(200) NOT NULL COMMENT '操作人',
  reason varchar(500) DEFAULT NULL COMMENT '审核说明',
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (id),
  KEY idx_audit_content (content_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='内容审核日志';

UPDATE meishijianshang
SET audit_status = 'APPROVED',
    content_version = 1,
    submit_time = addtime;
