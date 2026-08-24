<template>
  <main class="login-page">
    <section class="brand-panel">
      <router-link class="brand" to="/front">校园周边美食分享平台</router-link>
      <h1>登录后继续分享</h1>
      <p>收藏喜欢的店铺，评论真实体验，和同学交换好味道。</p>
    </section>

    <section class="form-panel">
      <div class="form-card">
        <header>
          <h2>账号登录</h2>
          <p>还没有账号？<el-button type="primary" link @click="register">立即注册</el-button></p>
        </header>

        <el-form label-position="top" @submit.prevent="login">
          <el-form-item label="用户名">
            <el-input v-model="rulesForm.username" autocomplete="username" placeholder="请输入用户名">
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </el-form-item>

          <el-form-item label="密码">
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

          <el-form-item label="角色">
            <el-radio-group v-model="rulesForm.role" class="role-group">
              <el-radio v-for="item in loginRoles" :key="item.roleName" :value="item.roleName">
                {{ item.roleName }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-button class="submit" type="primary" size="large" :loading="submitting" native-type="submit">
            登录
          </el-button>
        </el-form>
      </div>
    </section>
  </main>
</template>

<script>
import { Lock, User } from '@element-plus/icons-vue'
import menu from '@/utils/menu'

export default {
  components: { Lock, User },
  data() {
    return {
      submitting: false,
      rulesForm: {
        username: '',
        password: '',
        role: ''
      }
    }
  },
  computed: {
    loginRoles() {
      return menu.list()
        .filter(item => item.hasBackLogin === '是' || item.hasFrontLogin === '是')
        .sort((a, b) => (a.roleName === '用户' ? -1 : 0) - (b.roleName === '用户' ? -1 : 0))
    }
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
      if (!this.rulesForm.role) return this.$message.warning('请选择角色')

      const role = this.loginRoles.find(item => item.roleName === this.rulesForm.role)
      if (!role) return this.$message.error('登录角色不存在')

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
  grid-template-columns: minmax(0, 1fr) minmax(0, 520px);
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
    margin-bottom: 28px;
    color: #008565;
    font-size: 18px;
    font-weight: 700;
    text-decoration: none;
  }

  h1 {
    max-width: 480px;
    margin: 0 0 16px;
    font-size: clamp(30px, 5vw, 52px);
    line-height: 1.15;
    letter-spacing: 0;
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
  padding: 24px;
  background: #fff;
  border-left: 1px solid #e7ece9;
}

.form-card {
  width: min(380px, 100%);
  margin: 0 auto;

  header {
    margin-bottom: 26px;

    h2 { margin: 0 0 7px; color: #263238; font-size: 25px; }
    p { margin: 0; color: #75827c; font-size: 14px; }
  }

  .role-group { width: 100%; }
  .submit { width: 100%; margin-top: 4px; }
}

@media (max-width: 860px) {
  .login-page { grid-template-columns: minmax(0, 1fr); }
  .brand-panel {
    padding: 34px 24px 20px;

    .brand { margin-bottom: 16px; font-size: 16px; }
    h1 { font-size: 28px; }
    p { font-size: 14px; }
  }
  .form-panel {
    align-items: flex-start;
    border-left: 0;
    border-top: 1px solid #e7ece9;
  }
}
</style>
