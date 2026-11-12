import storage from '@/utils/storage'

const today = () => new Date().toISOString().slice(0, 10)

export const foodSchema = {
  endpoint: 'meishijianshang',
  eyebrow: 'FOOD',
  title: '美食鉴赏',
  lead: '维护校园周边美食内容、图片和互动数据。',
  search: [
    {
      type: 'daterange',
      label: '发布时间',
      startKey: 'fabushijianstart',
      endKey: 'fabushijianend',
    },
  ],
  columns: [
    { prop: 'fabushijian', label: '发布时间', minWidth: 120 },
    { prop: 'auditStatus', label: '审核状态', width: 110 },
    { prop: 'contentVersion', label: '版本', width: 80 },
    { prop: 'submitTime', label: '提交时间', minWidth: 170 },
    { prop: 'meishimingcheng', label: '美食名称', minWidth: 150 },
    { prop: 'meishileibie', label: '美食类别', minWidth: 120 },
    { prop: 'meishijieshao', label: '美食介绍', minWidth: 220, ellipsis: true },
    { prop: 'shangpusuozaidi', label: '商铺所在地', minWidth: 220, ellipsis: true },
    { prop: 'tuijianzhishu', label: '推荐指数', width: 110 },
    { prop: 'meishizhaopian', label: '美食照片', type: 'image', width: 120 },
    { prop: 'shangpinjiage', label: '商品价格', width: 110 },
    { prop: 'yonghuming', label: '用户名', minWidth: 110 },
    { prop: 'xingming', label: '姓名', minWidth: 110 },
  ],
  fields: [
    { prop: 'fabushijian', label: '发布时间', type: 'date', defaultValue: today },
    { prop: 'meishimingcheng', label: '美食名称' },
    { prop: 'meishileibie', label: '美食类别' },
    {
      prop: 'tuijianzhishu',
      label: '推荐指数',
      type: 'select',
      options: ['1星', '2星', '3星', '4星', '5星'],
    },
    { prop: 'shangpinjiage', label: '商品价格' },
    { prop: 'shangpusuozaidi', label: '商铺所在地', span: 24 },
    {
      prop: 'meishijieshao',
      label: '美食介绍',
      type: 'textarea',
      rows: 6,
      span: 24,
    },
    {
      prop: 'meishizhaopian',
      label: '美食照片',
      type: 'upload',
      limit: 3,
      multiple: true,
      span: 24,
    },
    { prop: 'yonghuming', label: '用户名' },
    { prop: 'xingming', label: '姓名' },
  ],
  defaults: () => ({
    fabushijian: today(),
    yonghuming: storage.get('adminName'),
    xingming: storage.get('adminName'),
  }),
  rowActions: [
    {
      key: 'comments',
      label: '查看评论',
      type: 'primary',
      to: (row) => ({ path: '/discussmeishijianshang', query: { refid: row.id } }),
    },
  ],
}

export const userSchema = {
  endpoint: 'yonghu',
  eyebrow: 'USERS',
  title: '用户管理',
  lead: '维护普通用户资料和登录凭据。',
  search: [{ prop: 'yonghuming', label: '用户名' }],
  columns: [
    { prop: 'yonghuming', label: '用户名', minWidth: 120 },
    { prop: 'xingming', label: '姓名', minWidth: 110 },
    { prop: 'shouji', label: '手机', minWidth: 140 },
    { prop: 'youxiang', label: '邮箱', minWidth: 190 },
    { prop: 'shenfenzheng', label: '身份证', minWidth: 190 },
    { prop: 'zhaopian', label: '照片', type: 'image', width: 120 },
  ],
  fields: [
    { prop: 'yonghuming', label: '用户名', required: true },
    { prop: 'mima', label: '密码', type: 'password', requiredOnCreate: true },
    { prop: 'xingming', label: '姓名', required: true },
    { prop: 'shouji', label: '手机' },
    { prop: 'youxiang', label: '邮箱' },
    { prop: 'shenfenzheng', label: '身份证', required: true },
    {
      prop: 'zhaopian',
      label: '照片',
      type: 'upload',
      limit: 3,
      multiple: true,
      span: 24,
    },
  ],
}

export const commentSchema = {
  endpoint: 'discussmeishijianshang',
  eyebrow: 'COMMENTS',
  title: '评论管理',
  lead: '查看用户反馈并维护商家回复。',
  creatable: false,
  adminOnly: true,
  keepRouteQuery: { refid: 'refid' },
  search: [
    { prop: 'nickname', label: '用户名' },
    { prop: 'content', label: '评论内容' },
  ],
  columns: [
    { prop: 'nickname', label: '用户名', minWidth: 120 },
    { prop: 'content', label: '评论内容', minWidth: 260, ellipsis: true },
    { prop: 'reply', label: '回复内容', minWidth: 240, ellipsis: true },
  ],
  fields: [
    { prop: 'content', label: '评论内容', type: 'textarea', readonly: true, span: 24 },
    { prop: 'reply', label: '回复内容', type: 'textarea', rows: 6, span: 24 },
  ],
  rowActions: [
    {
      key: 'reply',
      label: '回复',
      type: 'primary',
      mode: 'edit',
    },
  ],
}

export const bannerSchema = {
  endpoint: 'config',
  eyebrow: 'BANNERS',
  title: '轮播图管理',
  lead: '维护首页轮播图的名称与图片。',
  search: [{ prop: 'name', label: '名称' }],
  columns: [
    { prop: 'name', label: '名称', minWidth: 180 },
    { prop: 'value', label: '图片', type: 'image', width: 160 },
  ],
  fields: [
    { prop: 'name', label: '名称', required: true },
    {
      prop: 'value',
      label: '图片',
      type: 'upload',
      limit: 1,
      multiple: false,
      span: 24,
    },
  ],
}

export const adminSchemas = {
  food: foodSchema,
  user: userSchema,
  comment: commentSchema,
  banner: bannerSchema,
}
