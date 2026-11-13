package com.service.impl;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.dao.AiUsageDao;
import com.entity.AiUsageEntity;
import com.service.AiUsageService;

@Service("aiUsageService")
public class AiUsageServiceImpl extends ServiceImpl<AiUsageDao, AiUsageEntity> implements AiUsageService {
}
