<template>
  <div class="front-layout">
    <!-- 顶部导航 -->
    <div class="front-header">
      <div class="header-inner">
        <div class="logo">校园周边美食分享平台</div>
        <div class="nav">
          <router-link to="/front" class="nav-item" :class="{active: $route.path === '/front'}">首页</router-link>
          <router-link to="/front/meishijianshang" class="nav-item" :class="{active: $route.path === '/front/meishijianshang'}">美食鉴赏</router-link>
          <router-link v-if="isLogin" to="/front/wodehaoyou" class="nav-item" :class="{active: $route.path === '/front/wodehaoyou'}">我的好友</router-link>
          <router-link v-if="isLogin" to="/front/storeup" class="nav-item" :class="{active: $route.path === '/front/storeup'}">我的收藏</router-link>
          <!-- <router-link to="/front/personal" class="nav-item" :class="{active: $route.path === '/front/personal'}" v-if="isLogin">个人中心</router-link> -->
          <router-link to="/index" class="nav-item" v-if="isLogin">后台管理</router-link>
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
    <div class="swiper-section" v-if="$route.path === '/front'">
      <el-carousel :interval="4000" type="card" height="400px">
        <el-carousel-item v-for="(item, index) in swiperList" :key="index">
          <div class="swiper-item" :style="{backgroundImage: 'url(' + item.value + ')'}">
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
export default {
  data() {
    return {
      isLogin: false,
      role: '',
      userName: '',
      swiperList: [],
    }
  },
  mounted() {
    this.checkLogin()
    this.getSwiper()
  },
  methods: {
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
.front-layout { min-height: 100vh; display: flex; flex-direction: column; }
.front-header {
  background: #fff; border-bottom: 1px solid #e8e8e8; box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  .header-inner {
    max-width: 1200px; margin: 0 auto; display: flex; align-items: center;
    height: 60px; padding: 0 20px;
  }
  .logo { font-size: 20px; font-weight: bold; color: #00c292; margin-right: 40px; white-space: nowrap; }
  .nav { display: flex; gap: 4px; flex: 1;
    .nav-item {
      color: #333; text-decoration: none; padding: 8px 16px; border-radius: 4px;
      transition: all 0.2s; font-size: 15px;
      &:hover, &.active { color: #00c292; background: rgba(0,194,146,0.06); }
    }
  }
  .user-area { display: flex; align-items: center; gap: 8px; white-space: nowrap;
    .username { font-size: 14px; color: #666; }
  }
}
.swiper-section {
  margin-top: 60px; padding: 20px 0; background: #f5f7fa;
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
.front-content { flex: 1; margin-top: 60px; background: #f5f7fa; min-height: calc(100vh - 60px - 60px); }
.front-footer {
  height: 60px; display: flex; align-items: center; justify-content: center;
  background: #fff; border-top: 1px solid #e8e8e8; color: #999; font-size: 14px;
}
</style>
