package com.service;

import java.util.List;

import com.entity.ContentAuditLogEntity;
import com.entity.vo.ContentReviewResult;

public interface ContentReviewService {
    ContentReviewResult review(
            Long contentId,
            Integer contentVersion,
            String action,
            String reason,
            String operator
    );

    List<ContentAuditLogEntity> selectLogs(Long contentId);
}
