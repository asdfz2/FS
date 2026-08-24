# 校园周边美食分享平台

基于 Vue 3 + Spring Boot 的校园周边美食分享平台，包含前台浏览、用户社交、美食收藏和管理后台。项目面向校园场景，用户可以浏览美食、查看详情、管理好友和收藏，管理员可以在后台维护美食内容与轮播图。

## 技术栈

**前端**

- Vue 3
- Vite 6
- Vue Router 4
- Element Plus
- Sass

**后端**

- Spring Boot 2.7
- MyBatis Plus
- MySQL 8
- Maven

## 功能清单

### 用户端

- 首页：轮播图、美食推荐、搜索、分页
- 美食鉴赏：美食列表、美食详情、价格与浏览数
- 我的好友：添加 / 删除好友
- 我的收藏：收藏 / 取消收藏美食
- 登录注册：用户 / 管理员双角色登录，注册只需用户名、密码、手机号

### 管理端

- 工作台
- 用户管理
- 美食鉴赏管理
- 轮播图管理

## 目录结构

```text
├── front/                  # Vue 3 前端
│   ├── src/
│   │   ├── components/     # 公共组件
│   │   ├── router/         # 路由配置
│   │   ├── utils/          # 工具函数
│   │   └── views/          # 页面视图
│   └── package.json
├── back/                   # Spring Boot 后端
│   ├── src/main/java/      # Java 源码
│   ├── src/main/resources/ # 配置与静态资源
│   └── pom.xml
├── FS.sql                  # 数据库初始化脚本（已脱敏示例数据）
└── README.md
```

## 快速启动

### 1. 初始化数据库

创建 MySQL 数据库并导入脚本：

```bash
mysql -uroot -p < FS.sql
```

默认数据库名：`fs`

### 2. 启动后端

```bash
cd back
mvn spring-boot:run
```

后端默认运行在：`http://localhost:8080/api`

### 3. 启动前端

```bash
cd front
npm install
npm run dev
```

前端默认运行在：`http://localhost:8081`

## 演示账号

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `123456` |
| 普通用户 | `用户1` | `123456` |

> 密码已使用 BCrypt 加密存储，默认密码均为 `123456`，登录后建议修改。

> **注意**：如果之前已用旧版 SQL 初始化过数据库，表中用户的密码是明文，登录会失败。需重新导入 `FS.sql` 或手动更新密码哈希值。

## 说明

- 数据库脚本中的示例数据已脱敏，手机号、邮箱、身份证号均为测试数据
- 后端数据库连接配置位于 `back/src/main/resources/application.yml`
- 前端 API 代理配置位于 `front/vite.config.js`
