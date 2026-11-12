package com.service.impl;

import java.util.Date;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.dao.ContentAuditLogDao;
import com.entity.ContentAuditLogEntity;
import com.entity.MeishijianshangEntity;
import com.entity.vo.ContentReviewResult;
import com.service.ContentReviewService;
import com.service.MeishijianshangService;

@Service("contentReviewService")
public class ContentReviewServiceImpl implements ContentReviewService {
    @Autowired
    private MeishijianshangService meishijianshangService;

    @Autowired
    private ContentAuditLogDao contentAuditLogDao;

    @Override
    @Transactional
    public ContentReviewResult review(
            Long contentId,
            Integer contentVersion,
            String action,
            String reason,
            String operator
    ) {
        if (contentId == null || contentVersion == null) {
            return ContentReviewResult.failure(400, "缺少内容 ID 或版本号");
        }

        String normalizedAction = StringUtils.upperCase(StringUtils.trimToEmpty(action));
        if (!"APPROVE".equals(normalizedAction) && !"REJECT".equals(normalizedAction)) {
            return ContentReviewResult.failure(400, "审核动作必须是 APPROVE 或 REJECT");
        }
        if ("REJECT".equals(normalizedAction) && StringUtils.isBlank(reason)) {
            return ContentReviewResult.failure(400, "驳回时必须填写原因");
        }

        MeishijianshangEntity current = meishijianshangService.selectById(contentId);
        if (current == null) {
            return ContentReviewResult.failure(404, "内容不存在");
        }
        if (!"PENDING".equals(current.getAuditStatus())) {
            return ContentReviewResult.failure(409, "该内容不在待审核状态");
        }
        if (!contentVersion.equals(current.getContentVersion())) {
            return ContentReviewResult.failure(409, "内容版本已变化，请刷新后重试");
        }

        String nextStatus = "APPROVE".equals(normalizedAction) ? "APPROVED" : "REJECTED";
        MeishijianshangEntity update = new MeishijianshangEntity();
        update.setAuditStatus(nextStatus);
        update.setAuditReason("REJECT".equals(normalizedAction) ? StringUtils.trim(reason) : null);
        update.setAuditBy(operator);
        update.setAuditTime(new Date());

        EntityWrapper<MeishijianshangEntity> wrapper = new EntityWrapper<>();
        wrapper.eq("id", contentId);
        wrapper.eq("audit_status", "PENDING");
        wrapper.eq("content_version", contentVersion);
        int updated = meishijianshangService.update(update, wrapper) ? 1 : 0;
        if (updated == 0) {
            return ContentReviewResult.failure(409, "内容已被其他管理员处理，请刷新");
        }

        ContentAuditLogEntity log = new ContentAuditLogEntity();
        log.setId(new Date().getTime() * 1000 + ThreadLocalRandom.current().nextInt(1000));
        log.setContentId(contentId);
        log.setContentVersion(contentVersion);
        log.setAction(nextStatus);
        log.setOperator(operator);
        log.setReason(update.getAuditReason());
        log.setCreatedAt(new Date());
        contentAuditLogDao.insert(log);

        return ContentReviewResult.success(nextStatus, contentVersion);
    }

    @Override
    public List<ContentAuditLogEntity> selectLogs(Long contentId) {
        EntityWrapper<ContentAuditLogEntity> wrapper = new EntityWrapper<>();
        wrapper.eq("content_id", contentId);
        wrapper.orderBy("created_at", false);
        return contentAuditLogDao.selectList(wrapper);
    }
}
