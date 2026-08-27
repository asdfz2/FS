<template>
  <header class="admin-header">
    <router-link to="/index" class="brand">
      <span class="wordmark">food<span class="dot">.</span></span>
      <span class="brand-meta">
        <span class="brand-line">workbench</span>
        <span class="brand-name">{{ projectName }}</span>
      </span>
    </router-link>

    <nav class="quick-nav" aria-label="后台快捷">
      <a class="quick-item" @click="onIndexTap">前台</a>
      <a class="quick-item" @click="onLogout">退出</a>
    </nav>

    <div class="user">
      <div class="avatar" aria-hidden="true">{{ avatarText }}</div>
      <div class="meta">
        <span class="role">{{ roleLabel }}</span>
        <span class="name">{{ userName }}</span>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return { user: {} }
  },
  computed: {
    projectName() {
      return this.$project?.projectName || '校园周边美食分享'
    },
    role() { return this.$storage.get('role') || '' },
    userName() { return this.$storage.get('adminName') || '访客' },
    roleLabel() {
      return this.role === '管理员' ? 'ADMIN' : this.role === '用户' ? 'USER' : 'GUEST'
    },
    avatarText() {
      const n = this.userName || 'G'
      return n.trim().slice(0, 1).toUpperCase()
    }
  },
  mounted() {
    const sessionTable = this.$storage.get('sessionTable')
    const token = this.$storage.get('Token')
    if (!token || !sessionTable) return
    this.$http({ url: sessionTable + '/session', method: 'get' }).then(({ data }) => {
      if (data && data.code === 0) this.user = data.data || {}
    })
  },
  methods: {
    onLogout() {
      this.$storage.remove('Token')
      this.$storage.remove('role')
      this.$storage.remove('adminName')
      this.$storage.remove('sessionTable')
      this.$router.replace({ name: 'login' })
    },
    onIndexTap() { this.$router.push('/front') }
  }
}
</script>

<style lang="scss" scoped>
.admin-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 64px;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 0 28px;
  background: var(--ink);
  color: #fbf7f0;
  border-bottom: 1px solid rgba(251, 247, 240, .08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}
.wordmark {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 26px;
  letter-spacing: -.02em;
  font-variation-settings: "opsz" 96;
  .dot { color: var(--accent); }
}
.brand-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
  padding-left: 12px;
  border-left: 1px solid rgba(251, 247, 240, .12);
}
.brand-line {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: rgba(251, 247, 240, .5);
}
.brand-name {
  font-size: 13px;
  color: rgba(251, 247, 240, .88);
  margin-top: 2px;
}

.quick-nav {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 8px;
}
.quick-item {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgba(251, 247, 240, .65);
  cursor: pointer;
  transition: color .15s ease;
  text-decoration: none;
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
  &:hover { color: var(--accent); border-bottom-color: var(--accent); }
}

.user {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 14px;
}
.meta { display: flex; flex-direction: column; line-height: 1.2; }
.role {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: rgba(251, 247, 240, .55);
}
.name { color: #fbf7f0; font-size: 13px; font-weight: 500; }

@media (max-width: 720px) {
  .admin-header { padding: 0 16px; gap: 12px; }
  .brand-meta { display: none; }
  .user .meta { display: none; }
}
</style>
