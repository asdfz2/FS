<template>
  <FormPage
    eyebrow="PROFILE"
    :title="pageTitle"
    :lead="pageLead"
    :submitting="submitting"
    submit-text="保存"
    @submit="onUpdateHandler"
    @cancel="goBack"
  >
    <el-form
      class="detail-form-content"
      ref="ruleForm"
      :model="ruleForm"
      label-width="80px"
    >
     <el-row>
                              <el-col :span="12">
        <el-form-item   v-if="flag=='yonghu'"  label="用户名" prop="yonghuming">
          <el-input v-model="ruleForm.yonghuming" readonly              placeholder="用户名" clearable></el-input>
        </el-form-item>
      </el-col>
                                          <el-col :span="12">
        <el-form-item   v-if="flag=='yonghu'"  label="姓名" prop="xingming">
          <el-input v-model="ruleForm.xingming"               placeholder="姓名" clearable></el-input>
        </el-form-item>
      </el-col>
                        <el-col :span="12">
        <el-form-item   v-if="flag=='yonghu'"  label="手机" prop="shouji">
          <el-input v-model="ruleForm.shouji"               placeholder="手机" clearable></el-input>
        </el-form-item>
      </el-col>
                        <el-col :span="12">
        <el-form-item   v-if="flag=='yonghu'"  label="邮箱" prop="youxiang">
          <el-input v-model="ruleForm.youxiang"               placeholder="邮箱" clearable></el-input>
        </el-form-item>
      </el-col>
                        <el-col :span="12">
        <el-form-item   v-if="flag=='yonghu'"  label="身份证" prop="shenfenzheng">
          <el-input v-model="ruleForm.shenfenzheng"               placeholder="身份证" clearable></el-input>
        </el-form-item>
      </el-col>
                        <el-col :span="24">
        <el-form-item v-if="flag=='yonghu'" label="照片" prop="zhaopian">
          <file-upload
          tip="点击上传照片"
          action="file/upload"
          :limit="3"
          :multiple="true"
          :fileUrls="ruleForm.zhaopian?ruleForm.zhaopian:''"
          @change="yonghuzhaopianUploadChange"
          ></file-upload>
        </el-form-item>
      </el-col>
                                                                        <el-col :span="12">
        <el-form-item   v-if="flag=='defaultuser'"  label="用户名" prop="username">
          <el-input v-model="ruleForm.username"               placeholder="用户名" clearable></el-input>
        </el-form-item>
      </el-col>
                                          <el-col :span="12">
        <el-form-item   v-if="flag=='defaultuser'"  label="姓名" prop="name">
          <el-input v-model="ruleForm.name"               placeholder="姓名" clearable></el-input>
        </el-form-item>
      </el-col>
                        <el-col :span="12">
        <el-form-item v-if="flag=='defaultuser'"  label="性别" prop="sex">
          <el-select v-model="ruleForm.sex" placeholder="请选择性别">
            <el-option
              v-for="(item,index) in defaultusersexOptions"
              :key="index"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>
                        <el-col :span="12">
        <el-form-item   v-if="flag=='defaultuser'"  label="年龄" prop="age">
          <el-input v-model="ruleForm.age"               placeholder="年龄" clearable></el-input>
        </el-form-item>
      </el-col>
                                                                  <el-col :span="12">
        <el-form-item   v-if="flag=='defaultuser'"  label="电话" prop="phone">
          <el-input v-model="ruleForm.phone"               placeholder="电话" clearable></el-input>
        </el-form-item>
      </el-col>
                        <el-col :span="12">
        <el-form-item   v-if="flag=='defaultuser'"  label="邮箱" prop="email">
          <el-input v-model="ruleForm.email"               placeholder="邮箱" clearable></el-input>
        </el-form-item>
      </el-col>




            <el-col :span="12">
        <el-form-item   v-if="flag=='users'"  label="用户名" prop="username">
          <el-input v-model="ruleForm.username"               placeholder="用户名" clearable></el-input>
        </el-form-item>
      </el-col>
                                          <el-col :span="12">
        <el-form-item   v-if="flag=='users'"  label="角色" prop="role">
          <el-select  v-model="ruleForm.role" placeholder="请选择角色">
            <el-option
                v-for="(item,index) in usersroleOptions"
                v-bind:key="index"
                :label="item"
                :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>
                                          <el-col :span="12">
        <el-form-item   v-if="flag=='users'"  label="密码" prop="password">
          <el-input v-model="ruleForm.password"               placeholder="密码" show-password clearable></el-input>
        </el-form-item>
      </el-col>
    </el-row>
    </el-form>
  </FormPage>
</template>
<script>
import { isNumber,isIntNumer,isEmail,isMobile,isPhone,isURL,checkIdCard } from "@/utils/validate";
import FormPage from '@/components/ui/FormPage.vue'

export default {
  components: { FormPage },
  data() {
    return {
      submitting: false,
      ruleForm: {},
      flag: '',
      usersFlag: false,
      defaultusersexOptions: [],
      usersroleOptions: []
    };
  },
  computed: {
    pageTitle() {
      if (this.flag === 'yonghu') return '个人资料'
      if (this.flag === 'defaultuser') return '个人资料'
      if (this.flag === 'users') return '账号设置'
      return '个人资料'
    },
    pageLead() {
      return '这里管理你在平台上展示给别人的信息。'
    }
  },
  mounted() {
    var table = this.$storage.get("sessionTable");
    this.flag = table;
    this.$http({
      url: `${this.$storage.get("sessionTable")}/session`,
      method: "get"
    }).then(({ data }) => {
      if (data && data.code === 0) {
        this.ruleForm = data.data;
      } else {
        this.$message.error(data.msg);
      }
    });
      this.defaultusersexOptions = "男,女".split(',')
    this.$http({
      url: `users/page?page=1&limit=100`,
      method: "get"
    }).then(({data}) => {
      if (data && data.code === 0) {
        this.usersroleOptions = data.data.list.filter(item=>item.role==='管理员'||item.role==='用户').map(item=>item.role)
      }
    })
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    yonghuzhaopianUploadChange(fileUrls) {
        this.ruleForm.zhaopian = fileUrls;
    },
    defaultuserpictureUploadChange(fileUrls) {
        this.ruleForm.picture = fileUrls;
    },
    onUpdateHandler() {
      if((!this.ruleForm.yonghuming)&& 'yonghu'==this.flag){
        this.$message.error('用户名不能为空');
        return
      }
      if((!this.ruleForm.mima)&& 'yonghu'==this.flag){
        this.$message.error('密码不能为空');
        return
      }
      if((!this.ruleForm.xingming)&& 'yonghu'==this.flag){
        this.$message.error('姓名不能为空');
        return
      }
      if((!this.ruleForm.shenfenzheng)&& 'yonghu'==this.flag){
        this.$message.error('身份证不能为空');
        return
      }
      if((!this.ruleForm.username)&& 'defaultuser'==this.flag){
        this.$message.error('用户名不能为空');
        return
      }
      if((!this.ruleForm.mima)&& 'defaultuser'==this.flag){
        this.$message.error('密码不能为空');
        return
      }
      if( 'defaultuser' ==this.flag && this.ruleForm.age&&(!isIntNumer(this.ruleForm.age))){
       this.$message.error(`年龄应输入整数`);
        return
      }
      if( 'defaultuser' ==this.flag && this.ruleForm.phone&&(!isPhone(this.ruleForm.phone))){
       this.$message.error(`电话应输入电话格式`);
        return
      }
      if( 'defaultuser' ==this.flag && this.ruleForm.email&&(!isEmail(this.ruleForm.email))){
       this.$message.error(`邮箱应输入邮箱格式`);
        return
      }
      this.submitting = true
      this.$http({
        url: `${this.$storage.get("sessionTable")}/update`,
        method: "post",
        data: this.ruleForm
      }).then(({ data }) => {
        if (data && data.code === 0) {
          this.$message({
            message: "修改信息成功",
            type: "success",
            duration: 1500,
            onClose: () => {
              this.$router.go(-1);
            }
          });
        } else {
          this.$message.error(data.msg);
        }
      }).finally(() => { this.submitting = false })
    }
  }
};
</script>
<style lang="scss" scoped>
.detail-form-content {
  background: transparent;
  border: 0;
  padding: 0;
  :deep(.el-input) { min-width: 0; max-width: none; }
}
</style>
