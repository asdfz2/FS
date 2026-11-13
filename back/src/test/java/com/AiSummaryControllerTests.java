package com;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Date;

import com.entity.TokenEntity;
import com.entity.vo.AiPrecheckResult;
import com.entity.vo.AiSummaryVO;
import com.service.AiSummaryService;
import com.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiSummaryControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TokenService tokenService;

    @MockBean
    private AiSummaryService aiSummaryService;

    private TokenEntity userToken;

    @BeforeEach
    void setUp() {
        userToken = token(11L, "用户1", "yonghu", "用户");
        when(tokenService.getTokenEntity("user-token")).thenReturn(userToken);
    }

    @Test
    void getSummaryRejectsIllegalId() throws Exception {
        mockMvc.perform(get("/ai/summary/abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void getSummaryReturns404WhenContentMissing() throws Exception {
        when(aiSummaryService.getSummary(22L)).thenReturn(null);

        mockMvc.perform(get("/ai/summary/22"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void getSummaryWithoutCacheReturnsSidebandFields() throws Exception {
        AiSummaryVO vo = new AiSummaryVO();
        vo.setCurrentCommentCount(2);
        vo.setMinComments(3);
        vo.setCommentCountEnough(false);
        vo.setStale(false);
        when(aiSummaryService.getSummary(22L)).thenReturn(vo);

        mockMvc.perform(get("/ai/summary/22"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.minComments").value(3))
                .andExpect(jsonPath("$.commentCount").value(2));
    }

    @Test
    void getSummaryWithCacheReturnsBodyAndIsAnonymousReadable() throws Exception {
        AiSummaryVO vo = new AiSummaryVO();
        vo.setSummaryText("**综合评价**：不错");
        vo.setCommentCount(4);
        vo.setCurrentCommentCount(4);
        vo.setStale(false);
        vo.setGeneratedAt("2026-11-13 10:00:00");
        vo.setModel("mock-ai-model");
        vo.setMinComments(3);
        vo.setCommentCountEnough(true);
        when(aiSummaryService.getSummary(22L)).thenReturn(vo);

        mockMvc.perform(get("/ai/summary/22"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.summaryText").value("**综合评价**：不错"))
                .andExpect(jsonPath("$.data.stale").value(false))
                .andExpect(jsonPath("$.data.commentCountEnough").value(true));
    }

    @Test
    void generateRejectsAnonymousWith401() throws Exception {
        mockMvc.perform(post("/ai/summary/22/generate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void generateRejectsIllegalIdWith400() throws Exception {
        mockMvc.perform(post("/ai/summary/not-a-number/generate").header("Token", "user-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void generateReturns429WhenDailyLimitReached() throws Exception {
        when(aiSummaryService.precheckGenerate(anyLong(), anyLong()))
                .thenReturn(AiPrecheckResult.failure(429, "今日 AI 额度已用完，请明天再来"));

        mockMvc.perform(post("/ai/summary/22/generate").header("Token", "user-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(429))
                .andExpect(jsonPath("$.msg").value("今日 AI 额度已用完，请明天再来"));
    }

    @Test
    void generateReturns503WhenAiNotConfigured() throws Exception {
        when(aiSummaryService.precheckGenerate(anyLong(), anyLong()))
                .thenReturn(AiPrecheckResult.failure(503, "AI 服务未配置，请联系管理员"));

        mockMvc.perform(post("/ai/summary/22/generate").header("Token", "user-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(503));
    }

    private TokenEntity token(Long userId, String username, String table, String role) {
        TokenEntity token = new TokenEntity();
        token.setUserid(userId);
        token.setUsername(username);
        token.setTablename(table);
        token.setRole(role);
        token.setToken("token");
        token.setExpiratedtime(new Date(System.currentTimeMillis() + 60_000));
        return token;
    }
}
