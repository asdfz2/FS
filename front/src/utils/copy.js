// 文案集中 —— 替换默认 Element / 生成式模板的安全词。
// 调用：c('empty.foodList')

const T = {
  // 空状态
  'empty.foodList': {
    eyebrow: '目前还没有',
    title: '这里还很安静',
    message: '还没有人分享 — 或许你愿意第一个记录这家店的味道？'
  },
  'empty.friends': {
    eyebrow: '好友',
    title: '你的吃货圈还很空',
    message: '去美食详情页点 "加入吃货圈"，认识同好。'
  },
  'empty.storeup': {
    eyebrow: '收藏',
    title: '还没有收藏',
    message: '看到喜欢的店就收下，下次再回来。'
  },
  'empty.search': {
    eyebrow: '搜索',
    title: '没找到相关记录',
    message: '换一个关键词，或者浏览全部美食分享。'
  },
  'empty.comments': {
    eyebrow: '评论区',
    title: '还没有评论',
    message: '来聊两句 — 一句话也是分享。'
  },

  // 错误状态
  'error.load': '加载被风吹走了 — 再试一次',
  'error.network': '网络好像走神了 — 检查后重试',
  'error.notFound': '这条分享可能已删除，或暂时无法访问',

  // CTA
  'cta.retry': '再试一次',
  'cta.backHome': '回到首页',
  'cta.goList': '去看全部',
  'cta.viewDetail': '看看这家',
  'cta.detail': '查看详情',
  'cta.addFriend': '加入吃货圈',
  'cta.alreadyFriend': '已是好友',
  'cta.collect': '收下这家',
  'cta.uncollect': '已收下',
  'cta.publish': '发布',
  'cta.save': '保存',
  'cta.cancel': '取消',
  'cta.confirm': '确定',
  'cta.back': '返回',
  'cta.search': '搜索',
  'cta.login': '继续分享',
  'cta.register': '加入吃货圈',
  'cta.discover': '去看推荐',
  'cta.sendComment': '发出去',
  'cta.logout': '退出登录',
  'cta.toFront': '回到前台',

  // 区块
  'section.discover': '发现',
  'section.allPosts': '全部分享',
  'section.foodDetail': '详情',
  'section.foodIntro': '关于这家',
  'section.comments': '评论区',
  'section.workbench': '工作台',
  'section.personalInfo': '个人资料',
  'section.changePassword': '修改密码',
  'section.choosePay': '选择支付方式',

  // 标签
  'tag.featured': '推荐',
  'tag.viewed': '浏览',
  'tag.collected': '已收下',

  // 提示
  'toast.loginToAct': '登录后可以评论、点赞和收藏',
  'toast.loginNow': '立即登录',
  'toast.commentEmpty': '说点什么再发出去',
  'toast.collectOk': '已收下',
  'toast.uncollectOk': '已取消收藏',
  'toast.friendOk': '已加入吃货圈',
  'toast.thumbOk': '赞 +1',
  'toast.saveOk': '已保存',
  'toast.loginOk': '登录成功',

  // 字段
  'field.username': '账号',
  'field.password': '密码',
  'field.role': '身份',
  'field.phone': '手机号',
  'field.oldPwd': '当前密码',
  'field.newPwd': '新密码',
  'field.confirmPwd': '再次输入',

  // 通用
  'misc.roleAdmin': '管理员',
  'misc.roleUser': '用户',
  'misc.guest': '访客',
  'misc.anonymous': '匿名',
  'misc.search': '搜索美食',
  'misc.searchBy': '按名称搜索',
  'misc.total': '共 {n} 条',
  'misc.todayPick': '今日甄选',
  'misc.thisMonth': '本月新店',
  'misc.totalShares': '累计分享'
}

function interpolate(str, vars) {
  if (!vars) return str
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`))
}

export function c(key, vars) {
  const v = T[key]
  if (v == null) return key
  if (typeof v === 'string') return interpolate(v, vars)
  return {
    eyebrow: v.eyebrow || '',
    title: interpolate(v.title || '', vars),
    message: interpolate(v.message || '', vars)
  }
}

export default { c }
