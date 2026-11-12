package com;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("mysql-it")
@Transactional
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_IT", matches = "true")
class MySqlApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String userToken;
    private String adminToken;
    private static final long TEST_USER_ID = 910001L;
    private static final long TEST_FRIEND_ID = 910003L;
    private static final long TEST_ADMIN_ID = 910002L;
    private static final long TEST_CONTENT_ID = 910010L;
    private static final String TEST_PASSWORD = "integration-password";

    @BeforeEach
    void loginUsers() throws Exception {
        String hash = new BCryptPasswordEncoder().encode(TEST_PASSWORD);
        jdbcTemplate.update(
                "insert into yonghu (id, yonghuming, mima, xingming, shenfenzheng) values (?,?,?,?,?)",
                TEST_USER_ID, "it-user", hash, "集成测试用户", "110105200001010099"
        );
        jdbcTemplate.update(
                "insert into users (id, username, password, role) values (?,?,?,?)",
                TEST_ADMIN_ID, "it-admin", hash, "管理员"
        );
        jdbcTemplate.update(
                "insert into yonghu (id, yonghuming, mima, xingming, shenfenzheng) values (?,?,?,?,?)",
                TEST_FRIEND_ID, "it-friend", hash, "集成测试好友", "110105200001010098"
        );
        userToken = login("/yonghu/login", "it-user");
        adminToken = login("/users/login", "it-admin");
    }

    @Test
    void loginAndRoleBoundariesWorkAgainstMysql() throws Exception {
        mockMvc.perform(get("/users/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));

        mockMvc.perform(get("/users/page").header("Token", userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(403));

        mockMvc.perform(get("/users/page").header("Token", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void commentIsStoredWithAuthenticatedOwner() throws Exception {
        String content = "mysql-it-comment-" + System.nanoTime();
        mockMvc.perform(post("/discussmeishijianshang/save")
                        .header("Token", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "refid", 22,
                                "content", content,
                                "userid", 999,
                                "nickname", "伪造用户"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        Map<String, Object> row = jdbcTemplate.queryForMap(
                "select userid, nickname from discussmeishijianshang where content = ?",
                content
        );
        assertEquals(TEST_USER_ID, ((Number) row.get("userid")).longValue());
        assertEquals("it-user", row.get("nickname"));
    }

    @Test
    void collectionIsStoredWithAuthenticatedOwner() throws Exception {
        String name = "mysql-it-collection-" + System.nanoTime();
        mockMvc.perform(post("/storeup/save")
                        .header("Token", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "refid", 22,
                                "tablename", "meishijianshang",
                                "name", name,
                                "picture", "/api/upload/test.jpg",
                                "userid", 999
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        Long userId = jdbcTemplate.queryForObject(
                "select userid from storeup where name = ?",
                Long.class,
                name
        );
        assertEquals(TEST_USER_ID, userId);
    }

    @Test
    void friendSavingRejectsSelfAndDuplicatesAgainstMysql() throws Exception {
        mockMvc.perform(post("/wodehaoyou/save")
                        .header("Token", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "yonghuming", "it-user",
                                "xingming", "集成测试用户"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("不能添加自己为好友"));

        String payload = objectMapper.writeValueAsString(Map.of(
                "yonghuming", "it-friend",
                "xingming", "集成测试好友"
        ));
        mockMvc.perform(post("/wodehaoyou/save")
                        .header("Token", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        mockMvc.perform(post("/wodehaoyou/save")
                        .header("Token", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("该用户已在好友列表中"));

        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from wodehaoyou where userid = ? and yonghuming = ?",
                Integer.class,
                TEST_USER_ID,
                "it-friend"
        );
        assertEquals(1, count);

        mockMvc.perform(get("/wodehaoyou/list")
                        .header("Token", userToken)
                        .param("page", "1")
                        .param("limit", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1));

        mockMvc.perform(post("/wodehaoyou/delete")
                        .header("Token", userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[1380000001074]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    void contentReviewUpdatesStatusAndWritesAuditLog() throws Exception {
        jdbcTemplate.update(
                "insert into meishijianshang " +
                        "(id, fabushijian, meishimingcheng, meishileibie, meishijieshao, yonghuming, xingming, audit_status, content_version) " +
                        "values (?, current_date, ?, ?, ?, ?, ?, 'PENDING', 1)",
                TEST_CONTENT_ID, "集成测试投稿", "小吃", "用于验证审核事务和审计日志", "it-user", "集成测试用户"
        );

        mockMvc.perform(post("/meishijianshang/review")
                        .header("Token", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "id", TEST_CONTENT_ID,
                                "contentVersion", 1,
                                "action", "APPROVE",
                                "reason", ""
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.auditStatus").value("APPROVED"));

        Map<String, Object> content = jdbcTemplate.queryForMap(
                "select audit_status, audit_by from meishijianshang where id = ?",
                TEST_CONTENT_ID
        );
        assertEquals("APPROVED", content.get("audit_status"));
        assertEquals("it-admin", content.get("audit_by"));

        Integer logCount = jdbcTemplate.queryForObject(
                "select count(*) from content_audit_log where content_id = ? and content_version = 1",
                Integer.class,
                TEST_CONTENT_ID
        );
        assertEquals(1, logCount);

        mockMvc.perform(get("/meishijianshang/auditLogs/" + TEST_CONTENT_ID)
                        .header("Token", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data[0].action").value("APPROVED"))
                .andExpect(jsonPath("$.data[0].operator").value("it-admin"));

        mockMvc.perform(post("/meishijianshang/review")
                        .header("Token", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "id", TEST_CONTENT_ID,
                                "contentVersion", 1,
                                "action", "REJECT",
                                "reason", "重复审核"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(409));
    }

    private String login(String path, String username) throws Exception {
        MvcResult result = mockMvc.perform(post(path)
                        .param("username", username)
                        .param("password", TEST_PASSWORD))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andReturn();
        JsonNode body = objectMapper.readTree(
                result.getResponse().getContentAsString(StandardCharsets.UTF_8)
        );
        return body.get("token").asText();
    }
}
