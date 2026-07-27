import { createApp } from 'vue'
import App from '@/App.vue'
// Element Plus 完全引入
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/css/element-variables.scss'
import '@/assets/css/style.scss'
// 加载路由
import router from '@/router/router-static.js'
// 面包屑导航，注册为全局组件
import BreadCrumbs from '@/components/common/BreadCrumbs'
// 引入echart
import * as echarts from 'echarts'
import 'echarts/theme/macarons.js'
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
// 富文本编辑组件
import Editor from "@/components/common/Editor"
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
app.config.globalProperties.$echarts = echarts
app.config.globalProperties.$base = base.get()
app.config.globalProperties.$project = base.getProjectName()
app.config.globalProperties.$storage = storage
app.config.globalProperties.$api = api
app.config.globalProperties.isAuth = isAuth
app.config.globalProperties.$md5 = md5

app.use(ElementPlus, { size: 'default', zIndex: 3000 })
app.use(router)

// 注册全局组件
app.component('bread-crumbs', BreadCrumbs)
app.component('file-upload', FileUpload)
app.component('editor', Editor)

app.mount('#app')
