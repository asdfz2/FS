# 校园周边美食分享平台

一个前后端分离的校园美食分享示例项目。前台支持浏览、搜索、详情、收藏和好友功能；后台提供美食内容、评论、轮播图和用户管理。

项目定位是完整业务流程练习，不是生产系统。已部署阿里云 2核2G 服务器（Docker 单机编排），纯 IP 访问，域名备案进行中；压测和生产级安全加固仍在后续计划中。

线上 Demo 账号：`admin`（密码已改为非公开强密码，本地开发仍是 `123456`）。

## 技术栈

| 分层 | 技术 |
| --- | --- |
| 前端 | Vue 3、Vite、Vue Router 4、Element Plus、Axios、DOMPurify、ECharts |
| 后端 | Spring Boot 2.7、MyBatis Plus、Java 17 |
| 数据库 | MySQL 8 |
| 工具链 | ESLint、Prettier、Vitest |

前端首页与列表页使用 `<script setup>` 和 `useFoodList` composable 复用分页、搜索和错误状态。后台页面仍保留部分 Options API 代码，属于渐进迁移范围。

## 功能

- 美食列表、关键词搜索、分页浏览、详情展示
- 富文本介绍渲染前使用 DOMPurify 过滤
- 登录注册、Token 请求头、路由守卫和基础角色控制
- 收藏、点赞、踩、评论、好友添加
- 管理端工作台图表、内容维护和用户管理

## 安全实现

已实现：

- 用户密码使用 BCrypt 哈希存储
- 数据库密码通过 `DB_PASSWORD` 环境变量注入
- 开发环境 CORS 只允许 localhost / 127.0.0.1 的 8080 与 8081
- 文件上传校验扩展名白名单
- 服务端按接口路径校验管理员 Token

限制：

- 自研 Token 方案没有刷新令牌、设备管理和防重放设计
- 路由守卫只控制前端入口，真正的权限依赖后端接口校验
- 当前 CORS 白名单面向本地开发，公开部署前必须改成实际域名
- 示例账号和演示数据不适合暴露到公网

## 本地运行

环境要求：JDK 17+、Maven 3.8+、MySQL 8+、Node.js 18+。

```bash
# 1. 准备数据库
mysql -uroot -p < FS.sql

# 2. 配置数据库密码
setx DB_PASSWORD "你的数据库密码"

# 3. 启动后端，默认 http://localhost:8080/api
cd back
mvn spring-boot:run

# 4. 启动前端，默认 http://localhost:8081
cd front
npm install
npm run dev
```

演示账号：

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `123456` |
| 普通用户 | `用户1` | `123456` |

## 检查命令

```bash
cd front
npm run lint       # ESLint；存量警告会列出，但不阻塞
npm run test       # Vitest 单元测试
npm run build      # 生产构建
```

## 部署

前端默认由 GitHub Actions 发布到 GitHub Pages。部署时通过 `VITE_API_BASE_URL` 指向后端域名，例如：

```bash
VITE_API_BASE_URL=https://your-api.example.com npm run build -- --base=/FS/
```

后端提供多阶段 Dockerfile。部署时注入外部 MySQL 连接和线上 CORS 域名：

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://...
SPRING_DATASOURCE_USERNAME=...
DB_PASSWORD=...
APP_CORS_ALLOWED_ORIGINS=https://asdfz2.github.io
```

### 大陆服务器适配（已内置）

- `Dockerfile` 内置阿里云 Maven 镜像源、`Dockerfile.web` 内置 npmmirror：大陆服务器直连 Maven Central / npmjs 容易连接停滞导致构建卡死
- `docker-compose.yml` 内置 JVM 堆上限（`-Xmx384m`）与 MySQL 裁剪（关闭 performance_schema、缩小 buffer pool），适配 2核2G 小内存机器
- 服务器建议先开 2GB swap 再首次构建；2C2G 上首次构建约 5–15 分钟

## 项目结构

```text
front/
  src/
    components/        # 公共组件
    composables/       # 可复用组合式逻辑
    router/            # 路由与守卫
    utils/             # HTTP、存储、XSS 过滤等工具
    views/             # 前台页面与后台管理页面
  tests/               # Vitest 测试
back/
  src/main/java/com/   # Controller / Service / DAO / 拦截器
  src/main/resources/  # 配置文件与上传资源
FS.sql                 # 数据库初始化脚本
```

## 已知限制与后续计划

1. 域名备案进行中，通过后把 Demo 切换到域名 + HTTPS 访问。
2. 清理后台生成式 CRUD 页面，继续迁移到 Composition API。
3. 增加 Vue 组件测试、API 集成测试和 CI。
4. 用 Lighthouse 记录真实性能基线，再做针对性优化。
5. 将上传文件迁移到对象存储，并补充图片处理与访问控制。
