<template>
  <main class="login-page">
    <section class="brand-panel" :style="brandStyle">
      <div class="brand-overlay">
        <router-link class="brand" to="/front">
          <span class="wordmark">food<span class="dot">.</span></span>
          <span class="brand-name">校园周边</span>
        </router-link>
        <div class="brand-text">
          <p class="eyebrow">
            <span class="dot" aria-hidden="true"></span>
            WELCOME BACK
          </p>
          <h1>回来继续<br>吃顿好的。</h1>
          <p class="lead">收藏喜欢的店铺，评论真实体验，和同学交换好味道。</p>
        </div>
        <p class="caption">{{ caption }}</p>
      </div>
    </section>

    <section class="form-panel">
      <div class="form-card">
        <header>
          <p class="eyebrow">
            <span class="dot" aria-hidden="true"></span>
            SIGN IN
          </p>
          <h2>账号登录</h2>
          <p class="sub">
            还没有账号？
            <button class="link-btn" @click="register">加入吃货圈</button>
          </p>
        </header>

        <el-form label-position="top" @submit.prevent="login">
          <el-form-item :label="fieldUser">
            <el-input v-model="rulesForm.username" autocomplete="username" placeholder="请输入用户名">
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </el-form-item>

          <el-form-item :label="fieldPwd">
            <el-input
              v-model="rulesForm.password"
              type="password"
              autocomplete="current-password"
              show-password
              placeholder="请输入密码"
              @keyup.enter="login"
            >
              <template #prefix><el-icon><Lock /></el-icon></template>
            </el-input>
          </el-form-item>

          <el-form-item :label="fieldRole">
            <el-radio-group v-model="rulesForm.role" class="role-group">
              <el-radio v-for="item in loginRoles" :key="item.roleName" :value="item.roleName">
                {{ item.roleName }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <button class="btn-primary" type="submit" :disabled="submitting">
            {{ submitting ? '登录中…' : '继续分享' }}
            <span class="arrow" aria-hidden="true">→</span>
          </button>
        </el-form>
      </div>
    </section>
  </main>
</template>

<script>
import { Lock, User } from '@element-plus/icons-vue'
import menu from '@/utils/menu'
import { c } from '@/utils/copy'

export default {
  components: { Lock, User },
  data() {
    return {
      submitting: false,
      rulesForm: { username: '', password: '', role: '' }
    }
  },
  computed: {
    loginRoles() {
      return menu.list()
        .filter(item => item.hasBackLogin === '是' || item.hasFrontLogin === '是')
        .sort((a, b) => (a.roleName === '用户' ? -1 : 0) - (b.roleName === '用户' ? -1 : 0))
    },
    fieldUser() { return c('field.username') },
    fieldPwd()  { return c('field.password') },
    fieldRole() { return c('field.role') },
    brandStyle() {
      // 杂志感左栏背景：暖橙红渐变 + 噪点纹理（CSS 模拟），不依赖外网图
      return {
        background: 'linear-gradient(155deg, #1b1612 0%, #2a1f18 60%, #d6502c 130%)'
      }
    },
    caption() { return '从校门口的烟火气，到宿舍楼下的甜品店。' }
  },
  mounted() {
    this.rulesForm.role = this.loginRoles[0]?.roleName || ''
  },
  methods: {
    register() {
      this.$storage.set('loginTable', 'yonghu')
      this.$router.push('/register')
    },
    async login() {
      if (!this.rulesForm.username) return this.$message.warning('请输入用户名')
      if (!this.rulesForm.password) return this.$message.warning('请输入密码')
      if (!this.rulesForm.role) return this.$message.warning('请选择身份')

      const role = this.loginRoles.find(item => item.roleName === this.rulesForm.role)
      if (!role) return this.$message.error('登录身份不存在')

      this.submitting = true
      try {
        const username = encodeURIComponent(this.rulesForm.username)
        const password = encodeURIComponent(this.rulesForm.password)
        const { data } = await this.$http({
          url: `${role.tableName}/login?username=${username}&password=${password}`,
          method: 'post'
        })
        if (!data || data.code !== 0) {
          this.$message.error(data ? data.msg : '登录失败')
          return
        }

        this.$storage.set('Token', data.token)
        this.$storage.set('role', this.rulesForm.role)
        this.$storage.set('sessionTable', role.tableName)
        this.$storage.set('adminName', this.rulesForm.username)
        this.$message.success('登录成功')

        const redirect = String(this.$route.query.redirect || '')
        let target = { path: role.roleName === '管理员' ? '/index' : '/front' }
        if (redirect.startsWith('/')) {
          const [path, queryText = ''] = redirect.split('?')
          target = { path, query: Object.fromEntries(new URLSearchParams(queryText)) }
        }
        await this.$router.replace(target)
      } catch (error) {
        this.$message.error('登录服务暂时不可用')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  min-height: 100vh;
  background: var(--paper);
}

.brand-panel {
  position: relative;
  background: var(--ink);
  color: #fbf7f0;
  overflow: hidden;
}
.brand-overlay {
  position: absolute; inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(28px, 5vw, 64px);
  background-image:
    radial-gradient(900px 600px at 110% 100%, rgba(214, 80, 44, .55), transparent 60%),
    radial-gradient(600px 400px at -10% -10%, rgba(214, 80, 44, .25), transparent 60%);
}
.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  z-index: 1;
}
.wordmark {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -.02em;
  .dot { color: var(--accent); }
}
.brand-name { color: rgba(251, 247, 240, .55); font-size: 13px; }

.brand-text {
  margin-top: auto;
  padding: 32px 0 24px;
  z-index: 1;
  .eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    margin: 0 0 20px;
    font-family: var(--font-display);
    font-size: 11px; font-weight: 600;
    letter-spacing: .2em; text-transform: uppercase;
    color: var(--accent);
    .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--accent); }
  }
  h1 {
    margin: 0 0 18px;
    color: #fbf7f0;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: clamp(36px, 5.4vw, 60px);
    line-height: 1.05;
    letter-spacing: -.02em;
    font-variation-settings: "opsz" 144;
  }
  .lead {
    max-width: 38ch;
    margin: 0;
    color: rgba(251, 247, 240, .72);
    font-size: 16px; line-height: 1.6;
  }
}
.caption {
  margin: 0;
  color: rgba(251, 247, 240, .45);
  font-family: var(--font-display);
  font-style: italic;
  font-size: 13px;
  z-index: 1;
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 40px;
  background: var(--paper);
}
.form-card {
  width: min(380px, 100%);
  display: flex;
  flex-direction: column;
  gap: 28px;
  header { display: flex; flex-direction: column; gap: 4px; }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    margin: 0 0 8px;
    font-family: var(--font-display);
    font-size: 11px; font-weight: 600;
    letter-spacing: .2em; text-transform: uppercase;
    color: var(--accent);
    .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--accent); }
  }
  h2 {
    margin: 0;
    color: var(--ink);
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 32px;
    letter-spacing: -.01em;
  }
  .sub { margin: 6px 0 0; color: var(--ink-soft); font-size: 14px; }
  .link-btn {
    padding: 0;
    background: transparent; border: 0;
    color: var(--accent);
    font-family: var(--font-display);
    font-size: 13px; font-weight: 600;
    border-bottom: 1px solid var(--accent);
    cursor: pointer;
    &:hover { color: var(--accent-2); border-bottom-color: var(--accent-2); }
  }
}

.role-group { width: 100%; }

.btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
  padding: 14px 22px;
  background: var(--ink);
  color: #fbf7f0;
  border: 0;
  border-radius: var(--r-1);
  font-family: var(--font-display);
  font-size: 14px; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase;
  cursor: pointer;
  transition: background-color .15s ease, transform .12s ease;
  &:hover { background: #2a2520; }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: .55; cursor: not-allowed; }
  .arrow {
    font-size: 16px;
    transition: transform .15s ease;
  }
  &:hover:not(:disabled) .arrow { transform: translateX(3px); }
}

@media (max-width: 860px) {
  .login-page { grid-template-columns: minmax(0, 1fr); }
  .brand-panel { min-height: 220px; }
  .brand-overlay { padding: 28px 24px; }
  .brand-text { padding: 16px 0 8px; h1 { font-size: 30px; } }
  .form-panel { padding: 32px 20px 56px; }
}
</style>
