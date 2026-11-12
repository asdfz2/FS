package com.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Date;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

import com.utils.ValidatorUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.baomidou.mybatisplus.mapper.Wrapper;
import com.annotation.IgnoreAuth;

import com.entity.MeishijianshangEntity;
import com.entity.TokenEntity;
import com.entity.vo.ContentReviewResult;
import com.entity.view.MeishijianshangView;

import com.service.ContentReviewService;
import com.service.MeishijianshangService;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MD5Util;
import com.utils.MPUtil;
import com.utils.CommonUtil;


/**
 * 美食鉴赏
 * 后端接口
 * @author 
 * @email 
 * @date 2021-03-12 20:57:00
 */
@RestController
@RequestMapping("/meishijianshang")
public class MeishijianshangController {
    @Autowired
    private MeishijianshangService meishijianshangService;

    @Autowired
    private ContentReviewService contentReviewService;

    @Autowired
    private TokenService tokenService;
    


    /**
     * 后端列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,MeishijianshangEntity meishijianshang,
		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date fabushijianstart, 
    		@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date fabushijianend,
		HttpServletRequest request){
		Object tableName = request.getSession().getAttribute("tableName");
		if("yonghu".equals(tableName)) {
			meishijianshang.setYonghuming((String)request.getSession().getAttribute("username"));
		}
        EntityWrapper<MeishijianshangEntity> ew = new EntityWrapper<MeishijianshangEntity>();
		if(fabushijianstart!=null) ew.ge("fabushijian", fabushijianstart);
        	if(fabushijianend!=null) ew.le("fabushijian", fabushijianend);
		PageUtils page = meishijianshangService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, meishijianshang), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前端列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,MeishijianshangEntity meishijianshang, HttpServletRequest request){
        EntityWrapper<MeishijianshangEntity> ew = new EntityWrapper<MeishijianshangEntity>();
		ew.eq("audit_status", "APPROVED");
		PageUtils page = meishijianshangService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, meishijianshang), params), params));
        return R.ok().put("data", page);
    }

	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( MeishijianshangEntity meishijianshang){
       	EntityWrapper<MeishijianshangEntity> ew = new EntityWrapper<MeishijianshangEntity>();
		ew.eq("audit_status", "APPROVED");
      	ew.allEq(MPUtil.allEQMapPre( meishijianshang, "meishijianshang")); 
        return R.ok().put("data", meishijianshangService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(MeishijianshangEntity meishijianshang){
        EntityWrapper< MeishijianshangEntity> ew = new EntityWrapper< MeishijianshangEntity>();
		ew.eq("audit_status", "APPROVED");
 		ew.allEq(MPUtil.allEQMapPre( meishijianshang, "meishijianshang")); 
		MeishijianshangView meishijianshangView =  meishijianshangService.selectView(ew);
		return R.ok("查询美食鉴赏成功").put("data", meishijianshangView);
    }
	
    /**
     * 后端详情
     */
	@IgnoreAuth
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        MeishijianshangEntity meishijianshang = meishijianshangService.selectById(id);
		if(meishijianshang == null || !"APPROVED".equals(meishijianshang.getAuditStatus())) {
			return R.error(404, "内容不存在或尚未通过审核");
		}
		meishijianshang.setClicknum(meishijianshang.getClicknum()+1);
		meishijianshang.setClicktime(new Date());
		meishijianshangService.updateById(meishijianshang);
        return R.ok().put("data", meishijianshang);
    }

    /**
     * 前端详情
     */
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        MeishijianshangEntity meishijianshang = meishijianshangService.selectById(id);
		if(meishijianshang == null || !"APPROVED".equals(meishijianshang.getAuditStatus())) {
			return R.error(404, "内容不存在或尚未通过审核");
		}
		meishijianshang.setClicknum(meishijianshang.getClicknum()+1);
		meishijianshang.setClicktime(new Date());
		meishijianshangService.updateById(meishijianshang);
        return R.ok().put("data", meishijianshang);
    }
    


    /**
     * 赞或踩
     */
    @RequestMapping("/thumbsup/{id}")
    public R vote(@PathVariable("id") String id,String type){
        MeishijianshangEntity meishijianshang = meishijianshangService.selectById(id);
        if(type.equals("1")) {
        	meishijianshang.setThumbsupnum(meishijianshang.getThumbsupnum()+1);
        } else {
        	meishijianshang.setCrazilynum(meishijianshang.getCrazilynum()+1);
        }
        meishijianshangService.updateById(meishijianshang);
        return R.ok("投票成功");
    }

    /**
     * 后端保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody MeishijianshangEntity meishijianshang, HttpServletRequest request){
    	meishijianshang.setId(new Date().getTime()+new Double(Math.floor(Math.random()*1000)).longValue());
		meishijianshang.setAuditStatus("APPROVED");
		meishijianshang.setAuditReason(null);
		meishijianshang.setAuditBy(currentOperator(request));
		meishijianshang.setAuditTime(new Date());
		meishijianshang.setContentVersion(1);
		meishijianshang.setSubmitTime(new Date());
    	//ValidatorUtils.validateEntity(meishijianshang);
        meishijianshangService.insert(meishijianshang);
        return R.ok();
    }
    
    /**
     * 前端保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody MeishijianshangEntity meishijianshang, HttpServletRequest request){
    	meishijianshang.setId(new Date().getTime()+new Double(Math.floor(Math.random()*1000)).longValue());
		meishijianshang.setYonghuming((String) request.getSession().getAttribute("username"));
		meishijianshang.setXingming((String) request.getSession().getAttribute("username"));
		meishijianshang.setAuditStatus("PENDING");
		meishijianshang.setAuditReason(null);
		meishijianshang.setAuditBy(null);
		meishijianshang.setAuditTime(null);
		meishijianshang.setContentVersion(1);
		meishijianshang.setSubmitTime(new Date());
    	//ValidatorUtils.validateEntity(meishijianshang);
        meishijianshangService.insert(meishijianshang);
        return R.ok("投稿已提交，等待审核");
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    public R update(@RequestBody MeishijianshangEntity meishijianshang, HttpServletRequest request){
        //ValidatorUtils.validateEntity(meishijianshang);
		MeishijianshangEntity existing = meishijianshangService.selectById(meishijianshang.getId());
		if(existing != null) {
			meishijianshang.setContentVersion(existing.getContentVersion() == null ? 1 : existing.getContentVersion());
		}
		meishijianshang.setAuditStatus("APPROVED");
		meishijianshang.setAuditReason(null);
		meishijianshang.setAuditBy(currentOperator(request));
		meishijianshang.setAuditTime(new Date());
        meishijianshangService.updateById(meishijianshang);//全部更新
        return R.ok();
    }

	@RequestMapping("/mine")
	public R mine(@RequestParam Map<String, Object> params, MeishijianshangEntity meishijianshang, HttpServletRequest request){
		meishijianshang.setYonghuming((String) request.getSession().getAttribute("username"));
		EntityWrapper<MeishijianshangEntity> ew = new EntityWrapper<>();
		PageUtils page = meishijianshangService.queryPage(params, MPUtil.sort(MPUtil.likeOrEq(ew, meishijianshang), params));
		return R.ok().put("data", page);
	}

	@RequestMapping("/mine/{id}")
	public R mineDetail(@PathVariable("id") Long id, HttpServletRequest request){
		MeishijianshangEntity content = meishijianshangService.selectById(id);
		String username = (String) request.getSession().getAttribute("username");
		if(content == null || !username.equals(content.getYonghuming())) {
			return R.error(404, "投稿不存在");
		}
		return R.ok().put("data", content);
	}

	@RequestMapping("/resubmit")
	public R resubmit(@RequestBody MeishijianshangEntity meishijianshang, HttpServletRequest request){
		if(meishijianshang.getId() == null) {
			return R.error(400, "缺少投稿 ID");
		}
		MeishijianshangEntity existing = meishijianshangService.selectById(meishijianshang.getId());
		String username = (String) request.getSession().getAttribute("username");
		if(existing == null || !username.equals(existing.getYonghuming())) {
			return R.error(404, "投稿不存在");
		}
		if("PENDING".equals(existing.getAuditStatus())) {
			return R.error(409, "正在审核中的内容不能重复提交");
		}

		int nextVersion = (existing.getContentVersion() == null ? 1 : existing.getContentVersion()) + 1;
		MeishijianshangEntity update = new MeishijianshangEntity();
		update.setId(meishijianshang.getId());
		update.setFabushijian(meishijianshang.getFabushijian());
		update.setMeishimingcheng(meishijianshang.getMeishimingcheng());
		update.setMeishileibie(meishijianshang.getMeishileibie());
		update.setMeishijieshao(meishijianshang.getMeishijieshao());
		update.setShangpusuozaidi(meishijianshang.getShangpusuozaidi());
		update.setTuijianzhishu(meishijianshang.getTuijianzhishu());
		update.setMeishizhaopian(meishijianshang.getMeishizhaopian());
		update.setShangpinjiage(meishijianshang.getShangpinjiage());
		update.setAuditStatus("PENDING");
		update.setAuditReason(null);
		update.setAuditBy(null);
		update.setAuditTime(null);
		update.setContentVersion(nextVersion);
		update.setSubmitTime(new Date());
		meishijianshangService.updateById(update);
		return R.ok("已重新提交审核").put("contentVersion", nextVersion);
	}

	@RequestMapping("/review")
	public R review(@RequestBody Map<String, Object> payload, HttpServletRequest request){
		Long contentId = payload.get("id") == null ? null : Long.valueOf(payload.get("id").toString());
		Integer contentVersion = payload.get("contentVersion") == null
				? null
				: Integer.valueOf(payload.get("contentVersion").toString());
		ContentReviewResult result = contentReviewService.review(
				contentId,
				contentVersion,
				String.valueOf(payload.get("action")),
				payload.get("reason") == null ? null : payload.get("reason").toString(),
				currentOperator(request)
		);
		if(result.getCode() != 0) {
			return R.error(result.getCode(), result.getMessage());
		}
		return R.ok(result.getMessage())
				.put("auditStatus", result.getAuditStatus())
				.put("contentVersion", result.getContentVersion());
	}

	@RequestMapping("/auditLogs/{id}")
	public R auditLogs(@PathVariable("id") Long id){
		return R.ok().put("data", contentReviewService.selectLogs(id));
	}
    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        meishijianshangService.deleteBatchIds(Arrays.asList(ids));
        return R.ok();
    }
    
    /**
     * 提醒接口
     */
	@RequestMapping("/remind/{columnName}/{type}")
	public R remindCount(@PathVariable("columnName") String columnName, HttpServletRequest request, 
						 @PathVariable("type") String type,@RequestParam Map<String, Object> map) {
		map.put("column", columnName);
		map.put("type", type);
		
		if(type.equals("2")) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Calendar c = Calendar.getInstance();
			Date remindStartDate = null;
			Date remindEndDate = null;
			if(map.get("remindstart")!=null) {
				Integer remindStart = Integer.parseInt(map.get("remindstart").toString());
				c.setTime(new Date()); 
				c.add(Calendar.DAY_OF_MONTH,remindStart);
				remindStartDate = c.getTime();
				map.put("remindstart", sdf.format(remindStartDate));
			}
			if(map.get("remindend")!=null) {
				Integer remindEnd = Integer.parseInt(map.get("remindend").toString());
				c.setTime(new Date());
				c.add(Calendar.DAY_OF_MONTH,remindEnd);
				remindEndDate = c.getTime();
				map.put("remindend", sdf.format(remindEndDate));
			}
		}
		
		Wrapper<MeishijianshangEntity> wrapper = new EntityWrapper<MeishijianshangEntity>();
		if(map.get("remindstart")!=null) {
			wrapper.ge(columnName, map.get("remindstart"));
		}
		if(map.get("remindend")!=null) {
			wrapper.le(columnName, map.get("remindend"));
		}

		String tableName = request.getSession().getAttribute("tableName").toString();
		if(tableName.equals("yonghu")) {
			wrapper.eq("yonghuming", (String)request.getSession().getAttribute("username"));
		}

		int count = meishijianshangService.selectCount(wrapper);
		return R.ok().put("count", count);
	}
	
	/**
     * 前端智能排序
     */
	@IgnoreAuth
    @RequestMapping("/autoSort")
    public R autoSort(@RequestParam Map<String, Object> params,MeishijianshangEntity meishijianshang, HttpServletRequest request,String pre){
        EntityWrapper<MeishijianshangEntity> ew = new EntityWrapper<MeishijianshangEntity>();
		ew.eq("audit_status", "APPROVED");
        Map<String, Object> newMap = new HashMap<String, Object>();
        Map<String, Object> param = new HashMap<String, Object>();
		Iterator<Map.Entry<String, Object>> it = param.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry<String, Object> entry = it.next();
			String key = entry.getKey();
			String newKey = entry.getKey();
			if (pre.endsWith(".")) {
				newMap.put(pre + newKey, entry.getValue());
			} else if (StringUtils.isEmpty(pre)) {
				newMap.put(newKey, entry.getValue());
			} else {
				newMap.put(pre + "." + newKey, entry.getValue());
			}
		}
		params.put("sort", "clicknum");
        params.put("order", "desc");
		PageUtils page = meishijianshangService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, meishijianshang), params), params));
        return R.ok().put("data", page);
    }

	private String currentOperator(HttpServletRequest request) {
		String tokenValue = request.getHeader("Token");
		TokenEntity token = StringUtils.isNotBlank(tokenValue) ? tokenService.getTokenEntity(tokenValue) : null;
		if(token != null && StringUtils.isNotBlank(token.getUsername())) {
			return token.getUsername();
		}
		Object username = request.getSession().getAttribute("username");
		return username == null ? "system" : username.toString();
	}


}
