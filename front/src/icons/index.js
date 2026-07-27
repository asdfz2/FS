import SvgIcon from '@/components/SvgIcon' // svg component

// 注册 svg-icon 全局组件
export function registerSvgIcon(app) {
  app.component('svg-icon', SvgIcon)
}
