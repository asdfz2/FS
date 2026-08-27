<template>
  <div class="front-layout">
    <!-- 顶部导航 -->
    <header class="front-header">
      <div class="header-inner">
        <router-link to="/front" class="brand">
          <span class="wordmark">food<span class="dot">.</span></span>
          <span class="brand-name">校园周边</span>
        </router-link>

        <nav class="nav" aria-label="前台导航">
          <router-link to="/front" class="nav-item" :class="{active: isActive('/front', true)}">首页</router-link>
          <router-link to="/front/meishijianshang" class="nav-item" :class="{active: isActive('/front/meishijianshang')}">美食鉴赏</router-link>
          <router-link v-if="isUser" to="/front/wodehaoyou" class="nav-item" :class="{active: isActive('/front/wodehaoyou')}">我的好友</router-link>
          <router-link v-if="isUser" to="/front/storeup" class="nav-item" :class="{active: isActive('/front/storeup')}">我的收藏</router-link>
          <router-link to="/index" class="nav-item" v-if="isAdmin">后台管理</router-link>
        </nav>

        <div class="user-area">
          <template v-if="isLogin">
            <span class="username">{{ role }} · {{ userName }}</span>
            <button class="link-btn" @click="logout">退出</button>
          </template>
          <template v-else>
            <button class="link-btn" @click="goLogin">登录</button>
            <button class="link-btn link-btn--accent" @click="goRegister">加入吃货圈</button>
          </template>
        </div>
      </div>
    </header>

    <!-- 杂志感 hero（仅首页） -->
    <section v-if="$route.path === '/front'" class="hero">
      <div class="hero-inner">
        <div class="hero-text">
          <p class="eyebrow">
            <span class="dot" aria-hidden="true"></span>
            DISCOVER · 校园周边美食
          </p>
          <h1 class="hero-title">
            在校门口，<br>
            吃点<span class="ink-accent">好的</span>。
          </h1>
          <p class="hero-lead">
            一份由同学们共同记录的校园周边美食分享。从校门口的烟火气，到宿舍楼下的甜品店。
          </p>
          <div class="hero-actions">
            <button class="btn-primary" @click="$router.push('/front/meishijianshang')">
              去看推荐
              <ui-icon name="arrow_right" :size="14" />
            </button>
            <button v-if="!isLogin" class="btn-text" @click="goLogin">继续分享</button>
            <button v-else class="btn-text" @click="$router.push('/front/meishijianshang')">浏览全部</button>
          </div>
          <dl class="hero-stats">
            <div><dt>{{ stats.food }}</dt><dd>累计分享</dd></div>
            <div><dt>{{ stats.view }}</dt><dd>浏览次数</dd></div>
            <div><dt>{{ stats.friend }}</dt><dd>活跃同学</dd></div>
          </dl>
        </div>

        <div class="hero-image" :style="heroImageStyle">
          <div class="hero-image-overlay">
            <p class="hero-image-caption">
              <span class="caption-eyebrow">{{ heroEyebrow }}</span>
              <span class="caption-title">{{ heroTitle }}</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 内容区 -->
    <main class="front-content">
      <router-view />
    </main>

    <!-- 页脚 -->
    <footer class="front-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="wordmark">food<span class="dot">.</span></span>
          <p class="footer-tag">校园周边美食分享平台</p>
        </div>
        <nav class="footer-nav" aria-label="底部导航">
          <router-link to="/front" class="footer-link">首页</router-link>
          <router-link to="/front/meishijianshang" class="footer-link">美食鉴赏</router-link>
          <router-link v-if="isUser" to="/front/storeup" class="footer-link">我的收藏</router-link>
          <router-link v-if="isUser" to="/front/wodehaoyou" class="footer-link">我的好友</router-link>
        </nav>
        <div class="footer-meta">
          <p>© 2026 校园周边美食分享</p>
          <p class="muted">在这里吃顿好的。</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { resolveUploadUrl } from '@/utils/utils'
import UiIcon from '@/components/ui/Icon.vue'

export default {
  components: { UiIcon },
  data() {
    return {
      isLogin: false,
      role: '',
      userName: '',
      swiperList: [],
      stats: { food: '—', view: '—', friend: '—' }
    }
  },
  computed: {
    isAdmin() { return this.isLogin && this.role === '管理员' },
    isUser() { return this.isLogin && this.role === '用户' },
    heroImageStyle() {
      const url = this.swiperList[0]?.value ? resolveUploadUrl(this.swiperList[0].value) : ''
      return {
        backgroundImage: url ? `linear-gradient(rgba(22,20,19,.35), rgba(22,20,19,.55)), url(${url})` : 'linear-gradient(135deg, #2a2520 0%, #161413 100%)'
      }
    },
    heroEyebrow() {
      return this.swiperList[0]?.name || '今日甄选'
    },
    heroTitle() {
      return this.swiperList[0]?.name ? '这张图来自同学上传' : '校园周边的味道'
    }
  },
  mounted() {
    this.checkLogin()
    this.getSwiper()
    this.loadStats()
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
      this.$http({ url: 'config/list', method: 'get' }).then(({ data }) => {
        if (data && data.code === 0) this.swiperList = data.data.list || []
      }).catch(() => {})
    },
    async loadStats() {
      const tasks = [
        this.countOf('meishijianshang', 'food'),
        this.countOf('yonghu', 'friend')
      ]
      try {
        const { data } = await this.$http({ url: 'meishijianshang/list?page=1&limit=1000', method: 'get' })
        if (data?.code === 0) {
          const total = (data.data?.list || []).reduce((s, x) => s + (Number(x.clicknum) || 0), 0)
          this.stats.view = total.toLocaleString()
        }
      } catch (_) {}
      await Promise.all(tasks)
    },
    async countOf(table, key) {
      try {
        const { data } = await this.$http({ url: `${table}/list?page=1&limit=1`, method: 'get' })
        if (data?.code === 0) this.stats[key] = (data.data?.total ?? 0).toLocaleString()
      } catch (_) {}
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
.front-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  --header-h: 72px;
}

.front-header {
  position: sticky;
  top: 0; left: 0; right: 0;
  z-index: 50;
  background: var(--paper);
  border-bottom: 1px solid var(--rule);
}
.header-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 28px;
  height: var(--header-h);
  padding: 0 var(--gutter);
}
.brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
  text-decoration: none;
  color: var(--ink);
}
.wordmark {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 26px;
  letter-spacing: -.02em;
  font-variation-settings: "opsz" 96;
  .dot { color: var(--accent); }
}
.brand-name {
  font-size: 13px;
  color: var(--ink-soft);
}

.nav { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; overflow-x: auto; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  .nav-item {
    position: relative;
    color: var(--ink-soft);
    text-decoration: none;
    padding: 10px 14px;
    font-size: 15px;
    transition: color .15s ease;
    &:hover { color: var(--ink); }
    &.active { color: var(--ink); font-weight: 600; }
    &.active::after {
      content: '';
      position: absolute;
      left: 14px; right: 14px; bottom: 4px;
      height: 2px;
      background: var(--accent);
    }
  }
}
.user-area { display: flex; align-items: center; gap: 14px; white-space: nowrap; }
.username { font-size: 13px; color: var(--ink-soft); }
.link-btn {
  padding: 6px 0;
  background: transparent;
  border: 0;
  color: var(--ink-soft);
  font-size: 14px;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: color .15s ease, border-color .15s ease;
  &:hover { color: var(--ink); border-bottom-color: var(--ink); }
  &--accent { color: var(--accent); border-bottom-color: var(--accent); }
  &--accent:hover { color: var(--accent-2); border-bottom-color: var(--accent-2); }
}

// —— Hero ——
.hero {
  background: var(--paper);
  border-bottom: 1px solid var(--rule);
}
.hero-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 56px var(--gutter) 64px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 48px;
  align-items: center;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 22px;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--accent);
  .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--accent); }
}
.hero-title {
  margin: 0 0 22px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(40px, 6vw, 72px);
  line-height: 1.02;
  letter-spacing: -.02em;
  color: var(--ink);
  font-variation-settings: "opsz" 144;
  .ink-accent { color: var(--accent); font-style: italic; }
}
.hero-lead {
  max-width: 46ch;
  margin: 0 0 28px;
  color: var(--ink-soft);
  font-size: 17px;
  line-height: 1.6;
}
.hero-actions { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; }
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  background: var(--ink);
  color: #fbf7f0;
  border: 0;
  border-radius: var(--r-1);
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color .15s ease, transform .12s ease;
  &:hover { background: #2a2520; }
  &:active { transform: translateY(1px); }
}
.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  background: transparent;
  border: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--ink);
  cursor: pointer;
  transition: color .15s ease, border-color .15s ease;
  &:hover { color: var(--accent); border-bottom-color: var(--accent); }
}
.hero-stats {
  display: flex;
  gap: 32px;
  margin: 40px 0 0;
  padding-top: 24px;
  border-top: 1px solid var(--rule);
  div { display: flex; flex-direction: column; gap: 4px; }
  dt {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 28px;
    color: var(--ink);
    letter-spacing: -.01em;
    font-variation-settings: "opsz" 96;
  }
  dd {
    margin: 0;
    font-family: var(--font-display);
    font-size: 11px;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: var(--ink-mute);
  }
}

.hero-image {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: var(--r-3);
  background-color: #2a2520;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  box-shadow: var(--shadow-2);
}
.hero-image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 28px;
  background: linear-gradient(180deg, transparent 50%, rgba(22,20,19,.65) 100%);
}
.hero-image-caption { margin: 0; display: flex; flex-direction: column; gap: 4px; color: #fbf7f0; }
.caption-eyebrow {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: rgba(251, 247, 240, .65);
}
.caption-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  font-style: italic;
  color: #fbf7f0;
}

// —— Content ——
.front-content {
  flex: 1;
  background: var(--paper);
}

// —— Footer ——
.front-footer {
  background: var(--ink);
  color: rgba(251, 247, 240, .72);
  padding: 56px var(--gutter) 40px;
}
.footer-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 36px;
  align-items: start;
}
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
  .wordmark { color: #fbf7f0; font-size: 32px; }
}
.footer-tag { margin: 0; color: rgba(251, 247, 240, .55); font-size: 13px; }
.footer-nav { display: flex; flex-wrap: wrap; gap: 10px 22px; }
.footer-link {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgba(251, 247, 240, .72);
  text-decoration: none;
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
  &:hover { color: #fbf7f0; border-bottom-color: var(--accent); }
}
.footer-meta {
  text-align: right;
  p { margin: 0; font-size: 12px; }
  .muted { color: rgba(251, 247, 240, .45); margin-top: 4px; font-style: italic; }
}

@media (max-width: 980px) {
  .hero-inner { grid-template-columns: minmax(0, 1fr); gap: 32px; padding: 40px 16px 48px; }
  .hero-image { aspect-ratio: 16 / 10; }
  .footer-inner { grid-template-columns: minmax(0, 1fr); }
  .footer-meta { text-align: left; }
}
@media (max-width: 720px) {
  .front-layout { --header-h: 60px; }
  .header-inner { padding: 0 16px; gap: 12px; }
  .brand-name { display: none; }
  .nav { order: 3; flex: 0 0 100%; }
  .hero-title { font-size: 38px; }
  .hero-stats { gap: 18px; }
  .hero-stats dt { font-size: 22px; }
}
</style>
