//配置路由
import { createRouter, createWebHashHistory } from 'vue-router'
//1.创建组件
import FrontLayout from '@/views/FrontLayout'
import FrontHome from '@/views/FrontHome'
import FrontMeishijianshang from '@/views/FrontMeishijianshang'
import FrontDetail from '@/views/FrontDetail'
import FrontWodehaoyou from '@/views/FrontWodehaoyou'
import FrontStoreup from '@/views/FrontStoreup'
import Index from '@/views/index'
import Home from '@/views/home'
import Login from '@/views/login'
import NotFound from '@/views/404'
import UpdatePassword from '@/views/update-password'
import pay from '@/views/pay'
import register from '@/views/register'
import center from '@/views/center'
    import meishijianshang from '@/views/modules/meishijianshang/list'
    import yonghu from '@/views/modules/yonghu/list'
    import discussmeishijianshang from '@/views/modules/discussmeishijianshang/list'
    import storeup from '@/views/modules/storeup/list'
    import config from '@/views/modules/config/list'
    import wodehaoyou from '@/views/modules/wodehaoyou/list'


//2.配置路由   注意：名字
const routes = [{
    path: '/index',
    name: 'index',
    component: Index,
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
	path: '/storeup',
        name: '我的收藏管理',
        component: storeup
      }
          ,{
	path: '/config',
        name: '轮播图管理',
        component: config
      }
          ,{
	path: '/wodehaoyou',
        name: '我的好友',
        component: wodehaoyou
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
      component: FrontWodehaoyou
    }, {
      path: 'storeup',
      name: 'frontStoreup',
      component: FrontStoreup
    }]
  },
  {
    path: '/',
    name: 'default',
    redirect: '/index'
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
