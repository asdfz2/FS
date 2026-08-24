import { createApp } from 'vue'
import App from '@/App.vue'
import {
  ElLoadingDirective,
  ElMessage,
  ElMessageBox,
  ElNotification
} from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'
import 'element-plus/es/components/loading/style/css'
import '@/assets/css/element-variables.scss'
import '@/assets/css/style.scss'
// 加载路由
import router from '@/router/router-static.js'
// 面包屑导航，注册为全局组件
import BreadCrumbs from '@/components/common/BreadCrumbs'
// ajax
import http from '@/utils/http.js'
// 基础配置
import base from '@/utils/base'
// 工具类
import { isAuth } from '@/utils/utils'
// storage 封装
import storage from "@/utils/storage"
// 上传组件
import FileUpload from "@/components/common/FileUpload"
// api 接口
import api from '@/utils/api'
// 数据校验工具类
import * as validate from '@/utils/validate.js'
// MD5
import md5 from 'js-md5'
// SVG 图标
import { registerSvgIcon } from '@/icons'

const app = createApp(App)

registerSvgIcon(app)

app.config.globalProperties.$validate = validate
app.config.globalProperties.$http = http
app.config.globalProperties.$base = base.get()
app.config.globalProperties.$project = base.getProjectName()
app.config.globalProperties.$storage = storage
app.config.globalProperties.$api = api
app.config.globalProperties.isAuth = isAuth
app.config.globalProperties.$md5 = md5

app.use(router)

app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$confirm = ElMessageBox.confirm
app.config.globalProperties.$prompt = ElMessageBox.prompt
app.config.globalProperties.$alert = ElMessageBox.alert
app.config.globalProperties.$notify = ElNotification
app.directive('loading', ElLoadingDirective)

// 注册全局组件
app.component('bread-crumbs', BreadCrumbs)
app.component('file-upload', FileUpload)

app.mount('#app')
