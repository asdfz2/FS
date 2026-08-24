import axios from 'axios'
import router from '@/router/router-static'
import storage from '@/utils/storage'

const http = axios.create({
    timeout: 1000 * 15,
    withCredentials: true,
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
})
http.interceptors.request.use(config => {
    const token = storage.get('Token')
    if (token) {
        config.headers['Token'] = token
    }
    return config
}, error => {
    return Promise.reject(error)
})
http.interceptors.response.use(response => {
    if (response.data && response.data.code === 401) {
        storage.remove('Token')
        try {
            const currentRoute = router.currentRoute ? router.currentRoute.value ? router.currentRoute.value.name : null : null
            if (currentRoute && currentRoute !== 'frontHome' && currentRoute !== 'frontMeishijianshang' && currentRoute !== 'frontWodehaoyou' && currentRoute !== 'frontStoreup' && currentRoute !== 'frontMeishijianshangDetail' && currentRoute !== 'login' && currentRoute !== 'register') {
                router.push({ name: 'login' })
            } else if (currentRoute) {
                const currentPath = router.currentRoute.value.fullPath || '/front'
                router.push({ name: 'login', query: { redirect: currentPath } })
            }
        } catch(e) {
        }
    }
    return response
}, error => {
    return Promise.reject(error)
})
export default http
