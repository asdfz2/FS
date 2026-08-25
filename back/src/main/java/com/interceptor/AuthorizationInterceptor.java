package com.interceptor;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.alibaba.fastjson.JSONObject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.http.HttpStatus;

import com.annotation.IgnoreAuth;
import com.entity.EIException;
import com.entity.TokenEntity;
import com.service.TokenService;
import com.utils.R;

/**
 * 权限(Token)验证
 */
public class AuthorizationInterceptor implements HandlerInterceptor {

    public static final String LOGIN_TOKEN_KEY = "Token";

    private final List<String> allowedOrigins;

    @Autowired
    private TokenService tokenService;

    public AuthorizationInterceptor(
            @Value("${app.cors.allowed-origins:http://localhost:8081,http://localhost:8080,http://127.0.0.1:8081,http://127.0.0.1:8080}")
            List<String> allowedOrigins
    ) {
        this.allowedOrigins = allowedOrigins;
    }
    
	@Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

			//支持跨域请求
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Headers", "x-requested-with,request-source,Token, Origin,imgType, Content-Type, cache-control,postman-token,Cookie, Accept,authorization");
        String origin = request.getHeader("Origin");
        if (origin != null && allowedOrigins.contains(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        }
	// 跨域时会首先发送一个OPTIONS请求，这里我们给OPTIONS请求直接返回正常状态
	if (request.getMethod().equals(RequestMethod.OPTIONS.name())) {
        	response.setStatus(HttpStatus.OK.value());
            return false;
        }

        if (isAdminOnlyPath(request)) {
            String token = request.getHeader(LOGIN_TOKEN_KEY);
            TokenEntity adminToken = StringUtils.isNotBlank(token)
                    ? tokenService.getTokenEntity(token)
                    : null;
            if (adminToken == null) {
                writeJson(response, R.error(401, "请先登录"));
                return false;
            }
            if (!"管理员".equals(adminToken.getRole())) {
                writeJson(response, R.error(403, "无后台访问权限"));
                return false;
            }
            return true;
        }
        
        IgnoreAuth annotation;
        if (handler instanceof HandlerMethod) {
            annotation = ((HandlerMethod) handler).getMethodAnnotation(IgnoreAuth.class);
        } else {
            return true;
        }

        //从header中获取token
        String token = request.getHeader(LOGIN_TOKEN_KEY);
        
        /**
         * 不需要验证权限的方法直接放过
         */
        if(annotation!=null) {
        	return true;
        }
        
        TokenEntity tokenEntity = null;
        if(StringUtils.isNotBlank(token)) {
        	tokenEntity = tokenService.getTokenEntity(token);
        }
        
        if(tokenEntity != null) {
        	request.getSession().setAttribute("userId", tokenEntity.getUserid());
        	request.getSession().setAttribute("role", tokenEntity.getRole());
        	request.getSession().setAttribute("tableName", tokenEntity.getTablename());
        	request.getSession().setAttribute("username", tokenEntity.getUsername());
        	return true;
        }
        
		PrintWriter writer = null;
		response.setCharacterEncoding("UTF-8");
		response.setContentType("application/json; charset=utf-8");
		try {
		    writer = response.getWriter();
		    writer.print(JSONObject.toJSONString(R.error(401, "请先登录")));
		} finally {
		    if(writer != null){
		        writer.close();
		    }
		}
//				throw new EIException("请先登录", 401);
		return false;
    }

    private boolean isAdminOnlyPath(HttpServletRequest request) {
        String contextPath = request.getContextPath();
        String uri = request.getRequestURI();
        String path = contextPath.isEmpty() || !uri.startsWith(contextPath)
                ? uri
                : uri.substring(contextPath.length());

        if (path.startsWith("/users/") && !path.equals("/users/login") && !path.equals("/users/register")) {
            return true;
        }

        if (path.startsWith("/yonghu/")) {
            String action = path.substring("/yonghu/".length());
            return !action.equals("login")
                    && !action.equals("register")
                    && !action.equals("session")
                    && !action.equals("logout")
                    && !action.equals("update");
        }

        if (path.startsWith("/config/")) {
            return !path.equals("/config/list");
        }

        if (path.startsWith("/meishijianshang/")) {
            String action = path.substring("/meishijianshang/".length());
            return action.equals("page")
                    || action.equals("save")
                    || action.equals("add")
                    || action.equals("update")
                    || action.equals("delete")
                    || action.equals("autoSort")
                    || action.startsWith("remind/");
        }

        if (path.startsWith("/discussmeishijianshang/")) {
            String action = path.substring("/discussmeishijianshang/".length());
            return action.equals("page")
                    || action.equals("update")
                    || action.equals("delete")
                    || action.startsWith("remind/");
        }

        return false;
    }

    private void writeJson(HttpServletResponse response, Object body) throws IOException {
        PrintWriter writer = null;
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=utf-8");
        try {
            writer = response.getWriter();
            writer.print(JSONObject.toJSONString(body));
        } finally {
            if (writer != null) {
                writer.close();
            }
        }
    }
}
