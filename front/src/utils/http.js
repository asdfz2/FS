import axios from 'axios'
import router from '@/router/router-static'
import storage from '@/utils/storage'

const http = axios.create({
    timeout: 1000 * 86400,
    withCredentials: true,
    baseURL: '/springboot35l3z',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
})
// 请求拦截
http.interceptors.request.use(config => {
    const token = storage.get('Token')
    if (token) {
        config.headers['Token'] = token // 请求头带上token
    }
    return config
}, error => {
    return Promise.reject(error)
})
// 响应拦截
http.interceptors.response.use(response => {
    if (response.data && response.data.code === 401) { // 401, token失效
        storage.remove('Token')
        // 只在非登录页面跳转，游客页面不做强制跳转
        try {
            const currentRoute = router.currentRoute?.value?.name
            if (currentRoute && currentRoute !== 'frontHome' && currentRoute !== 'frontMeishijianshang' && currentRoute !== 'frontWodehaoyou' && currentRoute !== 'frontStoreup' && currentRoute !== 'frontMeishijianshangDetail' && currentRoute !== 'login' && currentRoute !== 'register') {
                router.push({ name: 'login' })
            } else if (currentRoute) {
                // 前台路由遇到401，带redirect跳登录，登录后回到当前页
                const currentPath = router.currentRoute?.value?.fullPath || '/front'
                router.push({ name: 'login', query: { redirect: currentPath } })
            }
        } catch(e) {
            // 路由未初始化时忽略
        }
    }
    return response
}, error => {
    return Promise.reject(error)
})
export default http