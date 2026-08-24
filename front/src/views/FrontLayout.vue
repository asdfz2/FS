<template>
  <div class="front-layout">
    <!-- 顶部导航 -->
    <div class="front-header">
      <div class="header-inner">
        <div class="logo">校园周边美食分享平台</div>
        <div class="nav">
          <router-link to="/front" class="nav-item" :class="{active: isActive('/front', true)}">首页</router-link>
          <router-link to="/front/meishijianshang" class="nav-item" :class="{active: isActive('/front/meishijianshang')}">美食鉴赏</router-link>
          <router-link v-if="isUser" to="/front/wodehaoyou" class="nav-item" :class="{active: isActive('/front/wodehaoyou')}">我的好友</router-link>
          <router-link v-if="isUser" to="/front/storeup" class="nav-item" :class="{active: isActive('/front/storeup')}">我的收藏</router-link>
          <!-- <router-link to="/front/personal" class="nav-item" :class="{active: $route.path === '/front/personal'}" v-if="isLogin">个人中心</router-link> -->
          <router-link to="/index" class="nav-item" v-if="isAdmin">后台管理</router-link>
        </div>
        <div class="user-area">
          <template v-if="isLogin">
            <span class="username">{{ role }}：{{ userName }}</span>
            <el-button size="small" type="danger" plain @click="logout">退出</el-button>
          </template>
          <template v-else>
            <el-button size="small" type="warning" @click="goLogin">登录</el-button>
            <el-button size="small" @click="goRegister">注册</el-button>
          </template>
        </div>
      </div>
    </div>
    <!-- 轮播图 -->
    <div class="swiper-section" v-if="$route.path === '/front' && swiperList.length > 0">
      <el-carousel :interval="5000" type="card" height="380px">
        <el-carousel-item v-for="(item, index) in swiperList" :key="index">
          <div class="swiper-item" :style="{backgroundImage: 'url(' + resolveUploadUrl(item.value) + ')'}">
            <div class="swiper-overlay">
              <h2>{{ item.name || '校园周边美食' }}</h2>
              <p>发现美食，分享快乐</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 内容区 -->
    <div class="front-content">
      <router-view />
    </div>
    <!-- 底部 -->
    <div class="front-footer">
      <p>校园周边美食分享平台 ©2026</p>
    </div>
  </div>
</template>

<script>
import { resolveUploadUrl } from '@/utils/utils'

export default {
  data() {
    return {
      isLogin: false,
      role: '',
      userName: '',
      swiperList: [],
    }
  },
  computed: {
    isAdmin() {
      return this.isLogin && this.role === '管理员'
    },
    isUser() {
      return this.isLogin && this.role === '用户'
    }
  },
  mounted() {
    this.checkLogin()
    this.getSwiper()
  },
  methods: {
    resolveUploadUrl,
    isActive(path, exact = false) {
      return exact ? this.$route.path === path : this.$route.path.startsWith(path)
    },
    checkLogin() {
      const token = this.$storage.get('Token')
      this.isLogin = !!token
      this.role = this.$storage.get('role') || ''
      this.userName = this.$storage.get('adminName') || ''
    },
    getSwiper() {
      this.$http({
        url: 'config/list',
        method: 'get'
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.swiperList = data.data.list || []
        }
      })
    },
    goLogin() { this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } }) },
    goRegister() { this.$router.push('/register') },
    logout() {
      this.$storage.remove('Token')
      this.$storage.remove('role')
      this.$storage.remove('adminName')
      this.$storage.remove('sessionTable')
      this.isLogin = false
      this.$router.push('/front')
    }
  }
}
</script>

<style lang="scss" scoped>
.front-layout { min-height: 100vh; display: flex; flex-direction: column; --header-height: 64px; }
.front-header {
  background: rgba(255, 255, 255, 0.94); backdrop-filter: blur(12px); border-bottom: 1px solid #e8ece9; box-shadow: 0 2px 12px rgba(31,45,39,0.05);
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  .header-inner {
    max-width: 1240px; margin: 0 auto; display: flex; align-items: center; gap: 24px;
    height: var(--header-height); padding: 0 24px;
  }
  .logo { font-size: 19px; font-weight: 700; letter-spacing: 0; color: #00a57d; white-space: nowrap; }
  .nav { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; overflow-x: auto; scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    .nav-item {
      color: #4b5b55; text-decoration: none; padding: 8px 14px; border-radius: 6px;
      transition: color .2s, background-color .2s; font-size: 15px; white-space: nowrap;
      &:hover { color: #00a57d; background: rgba(0,165,125,.07); }
      &.active { color: #008565; background: rgba(0,165,125,.11); font-weight: 600; }
    }
  }
  .user-area { display: flex; align-items: center; gap: 8px; white-space: nowrap;
    .username { max-width: 180px; overflow: hidden; text-overflow: ellipsis; font-size: 14px; color: #67756f; }
  }
}
.swiper-section {
  margin-top: var(--header-height); padding: 22px 0; background: #f4f7f5;
  .swiper-item {
    width: 100%; height: 100%; background-size: cover; background-position: center;
    border-radius: 12px; position: relative;
    .swiper-overlay {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.6));
      padding: 40px 24px 24px; color: #fff;
      h2 { font-size: 24px; margin-bottom: 4px; }
      p { font-size: 14px; opacity: 0.85; }
    }
  }
}
.front-content { flex: 1; margin-top: var(--header-height); background: #f4f7f5; min-height: calc(100vh - var(--header-height) - 64px); }
.front-footer {
  min-height: 64px; display: flex; align-items: center; justify-content: center; padding: 16px 20px;
  background: #fff; border-top: 1px solid #e8ece9; color: #78867f; font-size: 13px;
}

@media (max-width: 720px) {
  .front-layout { --header-height: 97px; }
  .front-header .header-inner { flex-wrap: wrap; align-content: center; gap: 2px 10px; min-height: var(--header-height); height: auto; padding: 7px 14px; }
  .front-header .logo { font-size: 16px; margin-right: 0; }
  .front-header .nav { order: 3; flex: 0 0 100%; }
  .front-header .user-area { margin-left: auto; }
  .front-header .nav-item { padding: 7px 10px; font-size: 14px; }
  .front-header .username { display: none; }
  .swiper-section { margin-top: var(--header-height); padding: 14px 0; }
  .front-content { margin-top: var(--header-height); min-height: calc(100vh - var(--header-height) - 64px); }
}
</style>
