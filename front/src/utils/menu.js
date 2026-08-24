const menu = {
  list() {
    return [
      {
        roleName: '管理员',
        tableName: 'users',
        hasBackLogin: '是',
        hasBackRegister: '否',
        hasFrontLogin: '否',
        hasFrontRegister: '否',
        backMenu: [
          {
            menu: '用户管理',
            child: [{
              menu: '用户',
              tableName: 'yonghu',
              menuJump: '列表',
              buttons: ['新增', '查看', '修改', '删除']
            }]
          },
          {
            menu: '美食鉴赏管理',
            child: [{
              menu: '美食鉴赏',
              tableName: 'meishijianshang',
              menuJump: '列表',
              buttons: ['新增', '查看', '修改', '删除', '查看评论']
            }]
          },
          {
            menu: '轮播图管理',
            child: [{
              menu: '轮播图',
              tableName: 'config',
              menuJump: '列表',
              buttons: ['新增', '查看', '修改', '删除']
            }]
          }
        ],
        frontMenu: [
          {
            menu: '美食鉴赏模块',
            child: [{
              menu: '美食鉴赏列表',
              tableName: 'meishijianshang',
              menuJump: '列表',
              buttons: ['查看']
            }]
          }
        ]
      },
      {
        roleName: '用户',
        tableName: 'yonghu',
        hasBackLogin: '否',
        hasBackRegister: '否',
        hasFrontLogin: '是',
        hasFrontRegister: '是',
        backMenu: [],
        frontMenu: [
          {
            menu: '美食鉴赏模块',
            child: [{
              menu: '美食鉴赏列表',
              tableName: 'meishijianshang',
              menuJump: '列表',
              buttons: ['查看']
            }]
          }
        ]
      }
    ]
  }
}

export default menu
