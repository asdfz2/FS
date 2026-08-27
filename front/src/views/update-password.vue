<template>
  <FormPage
    eyebrow="ACCOUNT"
    title="修改密码"
    lead="定期更换密码可以让账号更安全。"
    :submitting="submitting"
    submit-text="保存"
    @submit="onUpdateHandler"
    @cancel="goBack"
  >
    <el-form
      class="pwd-form"
      ref="ruleForm"
      :rules="rules"
      :model="ruleForm"
      label-width="100px"
    >
      <el-form-item label="原密码" prop="password">
        <el-input v-model="ruleForm.password" type="password" show-password autocomplete="current-password" placeholder="请输入当前密码"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newpassword">
        <el-input v-model="ruleForm.newpassword" type="password" show-password autocomplete="new-password" placeholder="请输入新密码"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="repassword">
        <el-input v-model="ruleForm.repassword" type="password" show-password autocomplete="new-password" placeholder="请再次输入新密码"></el-input>
      </el-form-item>
    </el-form>
  </FormPage>
</template>
<script>
import FormPage from '@/components/ui/FormPage.vue'
export default {
  components: { FormPage },
  data() {
    return {
      submitting: false,
      ruleForm: {},
      user: {},
      rules: {
        password:    [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
        newpassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
        repassword:  [{ required: true, message: '请再次输入新密码', trigger: 'blur' }]
      }
    };
  },
  mounted() {
    this.$http({
      url: `${this.$storage.get('sessionTable')}/session`,
      method: 'get'
    }).then(({ data }) => {
      if (data && data.code === 0) {
        this.user = data.data;
      } else {
        this.$message.error(data.msg);
      }
    });
  },
  methods: {
    goBack() { this.$router.go(-1) },
    onUpdateHandler() {
      this.$refs['ruleForm'].validate(valid => {
        if (!valid) return
        const oldPwd = this.user.mima || this.user.password
        if (this.ruleForm.password !== oldPwd) {
          this.$message.error('原密码错误')
          return
        }
        if (this.ruleForm.newpassword !== this.ruleForm.repassword) {
          this.$message.error('两次密码输入不一致')
          return
        }
        this.submitting = true
        this.user.password = this.ruleForm.newpassword
        this.user.mima = this.ruleForm.newpassword
        this.$http({
          url: `${this.$storage.get('sessionTable')}/update`,
          method: 'post',
          data: this.user
        }).then(({ data }) => {
          if (data && data.code === 0) {
            this.$message.success('修改成功，下次登录生效')
          } else {
            this.$message.error(data.msg)
          }
        }).finally(() => { this.submitting = false })
      })
    }
  }
};
</script>
<style lang="scss" scoped>
.pwd-form {
  background: transparent;
  border: 0;
  padding: 0;
  :deep(.el-form-item) { max-width: 480px; }
}
</style>
