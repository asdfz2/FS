package com;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Date;

import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.entity.DiscussmeishijianshangEntity;
import com.entity.MeishijianshangEntity;
import com.entity.StoreupEntity;
import com.entity.TokenEntity;
import com.entity.UserEntity;
import com.entity.YonghuEntity;
import com.entity.vo.ContentReviewResult;
import com.service.ContentReviewService;
import com.service.DiscussmeishijianshangService;
import com.service.MeishijianshangService;
import com.service.StoreupService;
import com.service.TokenService;
import com.service.UserService;
import com.service.WodehaoyouService;
import com.service.YonghuService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiContractTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private TokenService tokenService;

    @MockBean
    private StoreupService storeupService;

    @MockBean
    private DiscussmeishijianshangService discussmeishijianshangService;

    @MockBean
    private WodehaoyouService wodehaoyouService;

    @MockBean
    private YonghuService yonghuService;

    @MockBean
    private MeishijianshangService meishijianshangService;

    @MockBean
    private ContentReviewService contentReviewService;

    private TokenEntity userToken;
    private TokenEntity adminToken;

    @BeforeEach
    void setUp() {
        userToken = token(11L, "用户1", "yonghu", "用户");
        adminToken = token(1L, "admin", "users", "管理员");
        when(tokenService.getTokenEntity("user-token")).thenReturn(userToken);
        when(tokenService.getTokenEntity("admin-token")).thenReturn(adminToken);
    }

    @Test
    void loginReturnsTokenForValidCredentials() throws Exception {
        UserEntity admin = new UserEntity();
        admin.setId(1L);
        admin.setUsername("admin");
        admin.setRole("管理员");
        admin.setPassword(new BCryptPasswordEncoder().encode("123456"));
        when(userService.selectOne(any(EntityWrapper.class))).thenReturn(admin);
        when(tokenService.generateToken(1L, "admin", "users", "管理员")).thenReturn("admin-token");

        mockMvc.perform(post("/users/login")
                        .param("username", "admin")
                        .param("password", "123456"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.token").value("admin-token"));
    }

    @Test
    void adminEndpointsRejectAnonymousAndRegularUsers() throws Exception {
        mockMvc.perform(get("/users/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));

        mockMvc.perform(get("/users/page").header("Token", "user-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    void adminCanReachAdminEndpoint() throws Exception {
        when(userService.queryPage(any(), any())).thenReturn(null);

        mockMvc.perform(get("/users/page").header("Token", "admin-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void collectionOwnerComesFromTokenSession() throws Exception {
        when(storeupService.insert(any(StoreupEntity.class))).thenReturn(true);

        mockMvc.perform(post("/storeup/save")
                        .header("Token", "user-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refid\":22,\"tablename\":\"meishijianshang\",\"name\":\"牛肉面\",\"picture\":\"food.jpg\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        ArgumentCaptor<StoreupEntity> captor = ArgumentCaptor.forClass(StoreupEntity.class);
        verify(storeupService).insert(captor.capture());
        assertEquals(11L, captor.getValue().getUserid());
    }

    @Test
    void commentOwnerAndNicknameComeFromTokenSession() throws Exception {
        when(discussmeishijianshangService.insert(any(DiscussmeishijianshangEntity.class))).thenReturn(true);

        mockMvc.perform(post("/discussmeishijianshang/save")
                        .header("Token", "user-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refid\":22,\"content\":\"味道很好\",\"userid\":999,\"nickname\":\"伪造用户\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        ArgumentCaptor<DiscussmeishijianshangEntity> captor =
                ArgumentCaptor.forClass(DiscussmeishijianshangEntity.class);
        verify(discussmeishijianshangService).insert(captor.capture());
        assertEquals(11L, captor.getValue().getUserid());
        assertEquals("用户1", captor.getValue().getNickname());
        assertNotNull(captor.getValue().getId());
    }

    @Test
    void friendSavingRejectsSelfAndDuplicates() throws Exception {
        mockMvc.perform(post("/wodehaoyou/save")
                        .header("Token", "user-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"yonghuming\":\"用户1\",\"xingming\":\"用户1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("不能添加自己为好友"));

        YonghuEntity friend = new YonghuEntity();
        friend.setYonghuming("用户2");
        friend.setXingming("周砚礼");
        when(yonghuService.selectOne(any(EntityWrapper.class))).thenReturn(friend);
        when(wodehaoyouService.selectCount(any(EntityWrapper.class))).thenReturn(1);

        mockMvc.perform(post("/wodehaoyou/save")
                        .header("Token", "user-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"yonghuming\":\"用户2\",\"xingming\":\"周砚礼\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("该用户已在好友列表中"));
    }

    @Test
    void userSubmissionIsPendingAndOwnedByTokenSession() throws Exception {
        when(meishijianshangService.insert(any(MeishijianshangEntity.class))).thenReturn(true);

        mockMvc.perform(post("/meishijianshang/add")
                        .header("Token", "user-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"meishimingcheng\":\"测试投稿\",\"meishileibie\":\"小吃\",\"meishijieshao\":\"这是一条用于测试的内容\",\"yonghuming\":\"伪造用户\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("投稿已提交，等待审核"));

        ArgumentCaptor<MeishijianshangEntity> captor =
                ArgumentCaptor.forClass(MeishijianshangEntity.class);
        verify(meishijianshangService).insert(captor.capture());
        assertEquals("用户1", captor.getValue().getYonghuming());
        assertEquals("PENDING", captor.getValue().getAuditStatus());
        assertEquals(1, captor.getValue().getContentVersion());
    }

    @Test
    void reviewRequiresAdminAndReturnsConflictDetails() throws Exception {
        mockMvc.perform(post("/meishijianshang/review")
                        .header("Token", "user-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":22,\"contentVersion\":3,\"action\":\"APPROVE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(403));

        when(contentReviewService.review(22L, 3, "REJECT", "图片不清晰", "admin"))
                .thenReturn(ContentReviewResult.failure(409, "内容版本已变化，请刷新后重试"));

        mockMvc.perform(post("/meishijianshang/review")
                        .header("Token", "admin-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":22,\"contentVersion\":3,\"action\":\"REJECT\",\"reason\":\"图片不清晰\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(409))
                .andExpect(jsonPath("$.msg").value("内容版本已变化，请刷新后重试"));
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
