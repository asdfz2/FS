<template>
  <main class="register-page">
    <section class="brand-panel">
      <div class="brand-overlay">
        <router-link class="brand" to="/front">
          <span class="wordmark">food<span class="dot">.</span></span>
          <span class="brand-name">校园周边</span>
        </router-link>
        <div class="brand-text">
          <p class="eyebrow">
            <span class="dot" aria-hidden="true"></span>
            JOIN US
          </p>
          <h1>加入<br>吃货圈。</h1>
          <p class="lead">创建账号，收藏喜欢的店，认识一起找好吃的同学。</p>
        </div>
      </div>
    </section>

    <section class="form-panel">
      <div class="form-card">
        <header>
          <p class="eyebrow">
            <span class="dot" aria-hidden="true"></span>
            SIGN UP
          </p>
          <h2>{{ roleTitle }}</h2>
          <p class="sub">
            已有账号？
            <button class="link-btn" @click="$router.push('/login')">直接登录</button>
          </p>
        </header>

        <el-form label-position="top" @submit.prevent="register">
          <el-form-item v-for="field in fields" :key="field.key" :label="field.label">
            <el-input
              v-model="ruleForm[field.key]"
              :type="field.type"
              :placeholder="field.placeholder"
              :autocomplete="field.autocomplete || 'off'"
              :show-password="field.type === 'password'"
              clearable
            />
          </el-form-item>

          <button class="btn-primary" type="submit" :disabled="submitting">
            {{ submitting ? '提交中…' : '加入吃货圈' }}
            <span class="arrow" aria-hidden="true">→</span>
          </button>
        </el-form>
      </div>
    </section>
  </main>
</template>

<script>
const FIELD_CONFIG = {
  yonghu: [
    { key: 'yonghuming', label: '用户名', placeholder: '请输入用户名', required: true, autocomplete: 'username' },
    { key: 'mima', label: '密码', type: 'password', placeholder: '请输入密码', required: true, autocomplete: 'new-password' },
    { key: 'shouji', label: '手机号', placeholder: '请输入手机号', required: true, validator: 'isMobile', message: '手机号格式不正确' }
  ]
}

export default {
  data() {
    return { tableName: '', fields: [], ruleForm: {}, submitting: false }
  },
  computed: {
    roleTitle() { return '用户注册' }
  },
  mounted() {
    const storedTable = this.$storage.get('loginTable')
    this.tableName = FIELD_CONFIG[storedTable] ? storedTable : 'yonghu'
    this.fields = FIELD_CONFIG[this.tableName]
    this.ruleForm = Object.fromEntries(this.fields.map(f => [f.key, '']))
  },
  methods: {
    validateField(field) {
      const value = String(this.ruleForm[field.key] || '').trim()
      if (field.required && !value) return `${field.label}不能为空`
      if (value && field.validator && !this.$validate[field.validator](value)) return field.message
      return ''
    },
    async register() {
      for (const field of this.fields) {
        const message = this.validateField(field)
        if (message) { this.$message.warning(message); return }
      }
      this.submitting = true
      try {
        const { data } = await this.$http({
          url: `${this.tableName}/register`,
          method: 'post',
          data: this.ruleForm
        })
        if (!data || data.code !== 0) { this.$message.error(data ? data.msg : '注册失败'); return }
        this.$message.success('注册成功')
        await this.$router.replace('/login')
      } catch (error) {
        this.$message.error('注册服务暂时不可用')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.register-page {
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
  display: flex; flex-direction: column; justify-content: space-between;
  padding: clamp(28px, 5vw, 64px);
  background-image:
    radial-gradient(900px 600px at -10% 100%, rgba(214, 80, 44, .45), transparent 60%),
    radial-gradient(600px 400px at 110% -10%, rgba(214, 80, 44, .25), transparent 60%);
}
.brand {
  display: inline-flex; align-items: baseline; gap: 10px;
  text-decoration: none; color: inherit;
  z-index: 1;
}
.wordmark {
  font-family: var(--font-display);
  font-weight: 700; font-size: 30px; letter-spacing: -.02em;
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

.form-panel {
  display: flex; align-items: center; justify-content: center;
  padding: 56px 40px;
  background: var(--paper);
  overflow-y: auto;
}
.form-card {
  width: min(420px, 100%);
  display: flex; flex-direction: column; gap: 28px;
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
    padding: 0; background: transparent; border: 0;
    color: var(--accent);
    font-family: var(--font-display);
    font-size: 13px; font-weight: 600;
    border-bottom: 1px solid var(--accent);
    cursor: pointer;
    &:hover { color: var(--accent-2); border-bottom-color: var(--accent-2); }
  }
}

.btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
  padding: 14px 22px;
  background: var(--ink);
  color: #fbf7f0;
  border: 0; border-radius: var(--r-1);
  font-family: var(--font-display);
  font-size: 14px; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase;
  cursor: pointer;
  transition: background-color .15s ease, transform .12s ease;
  &:hover { background: #2a2520; }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: .55; cursor: not-allowed; }
  .arrow { font-size: 16px; transition: transform .15s ease; }
  &:hover:not(:disabled) .arrow { transform: translateX(3px); }
}

@media (max-width: 860px) {
  .register-page { grid-template-columns: minmax(0, 1fr); }
  .brand-panel { min-height: 220px; }
  .brand-overlay { padding: 28px 24px; }
  .brand-text { padding: 16px 0 8px; h1 { font-size: 30px; } }
  .form-panel { padding: 32px 20px 56px; }
}
</style>
