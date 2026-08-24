<template>
  <main class="register-page">
    <section class="brand-panel">
      <router-link class="brand" to="/front">校园周边美食分享平台</router-link>
      <h1>注册账号</h1>
      <p>创建账号后，可以收藏店铺、发表评论和管理好友。</p>
    </section>

    <section class="form-panel">
      <div class="form-card">
        <header>
          <h2>{{ roleTitle }}</h2>
          <p>已有账号？<el-button type="primary" link @click="$router.push('/login')">直接登录</el-button></p>
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

          <el-button class="submit" type="primary" size="large" native-type="submit" :loading="submitting">
            注册
          </el-button>
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
    return {
      tableName: '',
      fields: [],
      ruleForm: {},
      submitting: false
    }
  },
  computed: {
    roleTitle() {
      return '用户注册'
    }
  },
  mounted() {
    const storedTable = this.$storage.get('loginTable')
    this.tableName = FIELD_CONFIG[storedTable] ? storedTable : 'yonghu'
    this.fields = FIELD_CONFIG[this.tableName]
    this.ruleForm = Object.fromEntries(this.fields.map(field => [field.key, '']))
  },
  methods: {
    validateField(field) {
      const value = String(this.ruleForm[field.key] || '').trim()
      if (field.required && !value) return `${field.label}不能为空`
      if (value && field.validator && !this.$validate[field.validator](value)) {
        return field.message
      }
      return ''
    },
    async register() {
      for (const field of this.fields) {
        const message = this.validateField(field)
        if (message) {
          this.$message.warning(message)
          return
        }
      }

      this.submitting = true
      try {
        const { data } = await this.$http({
          url: `${this.tableName}/register`,
          method: 'post',
          data: this.ruleForm
        })
        if (!data || data.code !== 0) {
          this.$message.error(data ? data.msg : '注册失败')
          return
        }
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
  grid-template-columns: minmax(0, 1fr) minmax(0, 560px);
  min-height: 100vh;
  background: #f4f7f5;
}

.brand-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(28px, 6vw, 84px);
  color: #263238;

  .brand {
    align-self: flex-start;
    margin-bottom: 26px;
    color: #008565;
    font-size: 18px;
    font-weight: 700;
    text-decoration: none;
  }

  h1 {
    margin: 0 0 14px;
    font-size: clamp(30px, 5vw, 48px);
    line-height: 1.15;
  }

  p {
    max-width: 420px;
    margin: 0;
    color: #61706a;
    font-size: 16px;
    line-height: 1.7;
  }
}

.form-panel {
  display: flex;
  align-items: center;
  padding: 28px 24px;
  overflow-y: auto;
  background: #fff;
  border-left: 1px solid #e7ece9;
}

.form-card {
  width: min(420px, 100%);
  margin: auto;

  header {
    margin-bottom: 24px;

    h2 { margin: 0 0 7px; color: #263238; font-size: 25px; }
    p { margin: 0; color: #75827c; font-size: 14px; }
  }

  .submit { width: 100%; margin-top: 4px; }
}

@media (max-width: 860px) {
  .register-page { grid-template-columns: minmax(0, 1fr); }
  .brand-panel { padding: 32px 24px 20px;
    .brand { margin-bottom: 14px; font-size: 16px; }
    h1 { font-size: 28px; }
    p { font-size: 14px; }
  }
  .form-panel { align-items: flex-start; border-left: 0; border-top: 1px solid #e7ece9; }
}
</style>
