package com.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.interceptor.AuthorizationInterceptor;

@Configuration
public class InterceptorConfig implements WebMvcConfigurer {

    private final java.util.List<String> allowedOrigins;

    public InterceptorConfig(
            @Value("${app.cors.allowed-origins:http://localhost:8081,http://localhost:8080,http://127.0.0.1:8081,http://127.0.0.1:8080}")
            java.util.List<String> allowedOrigins
    ) {
        this.allowedOrigins = allowedOrigins;
    }

	
    @Bean
    public AuthorizationInterceptor getAuthorizationInterceptor() {
        return new AuthorizationInterceptor(allowedOrigins);
    }
	
	@Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(getAuthorizationInterceptor()).addPathPatterns("/**").excludePathPatterns("/static/**", "/admin/**");
	}

	/**
	 * 配置静态资源映射
	 */
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/**")
        .addResourceLocations("classpath:/resources/")
        .addResourceLocations("classpath:/static/")
        .addResourceLocations("classpath:/admin/")
        .addResourceLocations("classpath:/public/")
        .setCacheControl(CacheControl.noCache());
    }
}
