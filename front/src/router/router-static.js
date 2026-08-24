//配置路由
import { createRouter, createWebHashHistory } from 'vue-router'
import storage from '@/utils/storage'
// 路由组件按需加载，避免后台和富文本模块进入首屏包
const FrontLayout = () => import('@/views/FrontLayout')
const FrontHome = () => import('@/views/FrontHome')
const FrontMeishijianshang = () => import('@/views/FrontMeishijianshang')
const FrontDetail = () => import('@/views/FrontDetail')
const FrontWodehaoyou = () => import('@/views/FrontWodehaoyou')
const FrontStoreup = () => import('@/views/FrontStoreup')
const Index = () => import('@/views/index')
const Home = () => import('@/views/home')
const Login = () => import('@/views/login')
const NotFound = () => import('@/views/404')
const UpdatePassword = () => import('@/views/update-password')
const pay = () => import('@/views/pay')
const register = () => import('@/views/register')
const center = () => import('@/views/center')
const meishijianshang = () => import('@/views/modules/meishijianshang/list')
const yonghu = () => import('@/views/modules/yonghu/list')
const discussmeishijianshang = () => import('@/views/modules/discussmeishijianshang/list')
const config = () => import('@/views/modules/config/list')


//2.配置路由   注意：名字
const routes = [{
    path: '/index',
    name: 'index',
    component: Index,
    meta: { requiresAdmin: true },
    children: [{
      // 空字符串表示默认子路由，匹配 /index 本身
      path: '',
      name: 'home',
      component: Home,
      meta: {icon:'', title:'center'}
    }, {
      path: '/updatePassword',
      name: '修改密码',
      component: UpdatePassword,
      meta: {icon:'', title:'updatePassword'}
    }, {
      path: '/pay',
      name: '支付',
      component: pay,
      meta: {icon:'', title:'pay'}
    }, {
      path: '/center',
      name: '个人信息',
      component: center,
      meta: {icon:'', title:'center'}
    }
          ,{
	path: '/meishijianshang',
        name: '美食鉴赏',
        component: meishijianshang
      }
          ,{
	path: '/yonghu',
        name: '用户',
        component: yonghu
      }
          ,{
	path: '/discussmeishijianshang',
        name: '美食鉴赏评论',
        component: discussmeishijianshang
      }
          ,{
	path: '/config',
        name: '轮播图管理',
        component: config
      }
        ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {icon:'', title:'login'}
  },
  {
    path: '/register',
    name: 'register',
    component: register,
    meta: {icon:'', title:'register'}
  },
  /* ========= 前台路由（游客/普通用户都可访问） ========= */
  {
    path: '/front',
    component: FrontLayout,
    children: [{
      path: '',
      name: 'frontHome',
      component: FrontHome
    }, {
      path: 'meishijianshang',
      name: 'frontMeishijianshang',
      component: FrontMeishijianshang
    }, {
      path: 'meishijianshang/detail',
      name: 'frontMeishijianshangDetail',
      component: FrontDetail
    }, {
      path: 'wodehaoyou',
      name: 'frontWodehaoyou',
      meta: { requiresUser: true },
      component: FrontWodehaoyou
    }, {
      path: 'storeup',
      name: 'frontStoreup',
      meta: { requiresUser: true },
      component: FrontStoreup
    }]
  },
  {
    path: '/',
    name: 'default',
    redirect: '/front'
  }, /*默认跳转路由*/
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: NotFound
  }
]
//3.实例化VueRouter  注意：名字
const router = createRouter({
  history: createWebHashHistory(),
  routes // （缩写）相当于 routes: routes
})

export default router

router.beforeEach((to) => {
  const requiresUser = to.matched.some(record => record.meta.requiresUser)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const role = storage.get('role')
  if (requiresUser && role !== '用户') {
    if (!role) return { path: '/login', query: { redirect: to.fullPath } }
    return { path: '/front' }
  }
  if (requiresAdmin && role !== '管理员') {
    return { path: '/front' }
  }
  return true
})
