# 校园周边美食分享平台

一个前后端分离的校园美食分享平台。前台支持浏览、搜索、详情、收藏、投稿和好友功能；后台提供内容审核、用户、评论和轮播图管理。

项目定位是完整业务系统练习，不是生产系统。已部署阿里云 2核2G 服务器（Docker 单机编排），纯 IP 访问，域名备案进行中；压测和生产级安全加固仍在后续计划中。

源码：[github.com/asdfz2/FS](https://github.com/asdfz2/FS)

在线 Demo：<http://116.62.198.68>

## 技术栈

| 分层 | 技术 |
| --- | --- |
| 前端 | Vue 3、Vite、Vue Router 4、Element Plus、Axios、DOMPurify、ECharts |
| 后端 | Spring Boot 2.7、MyBatis Plus、Java 17 |
| 数据库 | MySQL 8 |
| 工具链 | ESLint、Prettier、Vitest、Playwright、GitHub Actions |

前端首页与列表页使用 `useFoodList` 管理分页、搜索、错误和请求取消，使用 `useFoodListRoute` 同步 URL 状态；后台四类活跃 CRUD 页面使用配置驱动的通用列表与表单组件。

## 功能

- 美食列表、关键词搜索、分页浏览、详情展示
- 搜索、分类、页码和视图同步 URL，刷新与浏览器前进后退可恢复状态
- 快速切换查询时取消旧请求，避免过期响应覆盖新结果
- 收藏采用乐观更新，接口失败自动回滚
- 普通用户投稿、查看审核状态、根据驳回原因修改并重新提交
- 管理员按待审核、已通过、已驳回筛选内容，并执行通过或驳回
- 审核使用内容版本号进行并发冲突控制，每次审核写入独立审计日志
- 富文本介绍渲染前使用 DOMPurify 过滤
- 详情页 AI 食客共识：基于评论的缓存摘要 + SSE 流式生成（SseEmitter）、过期提示、每日限额
- 登录注册、Token 请求头、路由守卫和基础角色控制
- 收藏、点赞、踩、评论、好友添加
- 管理端工作台图表、内容维护和用户管理

## 安全实现

已实现：

- 用户密码使用 BCrypt 哈希存储
- 数据库密码通过 `DB_PASSWORD` 环境变量注入
- AI 接口密钥通过 `AI_API_KEY` 环境变量注入，浏览器不接触；摘要 GET 匿名可读，POST 生成需登录，同一内容 10 分钟 1 次、全站每日 100 次（`ai_usage` 配额日志计数）
- AI 输出按不可信内容处理：marked 转 HTML → DOMPurify 过滤 → 才 `v-html`，顺序不可反
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

# 1.1 如果库来自旧版本（已含审核工作流但无 AI 表），补跑 AI 迁移与补种：
mysql -uroot -p fs < sql/migrations/20261113_ai_summary.sql
mysql -uroot -p fs < sql/migrations/20261113_ai_summary_seed.sql   # 22/24 号美食补至 4 条评论（可重复执行）

# 2. 配置数据库密码
setx DB_PASSWORD "你的数据库密码"

# 2.1（可选）配置 AI 食客共识；不配也能跑，生成接口返回 503、卡片显示不可用
setx AI_API_KEY "你的 OpenRouter key"

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
| 普通用户 | `用户1` | `123456` |

管理员账号不在公开仓库和简历中提供，管理端功能通过录屏或本地环境演示。

## 检查命令

```bash
cd front
npm run lint       # ESLint，要求零警告
npm run test       # Vitest 单元测试
npm run test:e2e   # Playwright 浏览器流程测试
npm run build      # 生产构建
npm run check:bundle # 检查首屏、分包和中文字体体积
```

当前前端检查结果：

- 10 个 Vitest 测试文件、44 个单元测试通过（含 AI 摘要 SSE 解析、状态机和渲染链 24 个）。
- 14 条 Playwright 流程通过，覆盖 URL 状态、搜索、分页、请求竞态、收藏回滚、返回滚动恢复、用户投稿重提、管理员审核、登录守卫、移动端宽度、AI 缓存渲染 / 流式生成 / 过期提示 / 未登录态 / 日限额文案。
- 16 个 API 契约测试通过（原 8 个 + AI 接口 8 个）；15 个 AI 服务单元测试通过；另有 5 个真实 MySQL 集成测试通过。
- 入口 JS 为 120.0 KB gzip，最大 chunk 为 330.7 KB 不回退（marked 落在详情页异步 chunk，不占首屏）。
- 移除完整中文 Web Font 后，构建不再输出 Noto Sans SC 字体文件，中文正文使用系统字体栈。

关键取舍和演示顺序见 [CASE-STUDY.md](CASE-STUDY.md)。

已有数据库升级时先执行审核工作流迁移，再执行 AI 迁移与补种：

```bash
mysql -uroot -p fs < sql/migrations/20261109_content_review_workflow.sql
mysql -uroot -p fs < sql/migrations/20261113_ai_summary.sql       # 可重复执行（CREATE TABLE IF NOT EXISTS）
mysql -uroot -p fs < sql/migrations/20261113_ai_summary_seed.sql   # 可重复执行（按内容判重）
```

后端快速测试使用 H2，不依赖本地 MySQL：

```bash
cd back
mvn -Dmaven.test.skip=false test
```

真实 MySQL 8 API 集成测试由 GitHub Actions 的 `Backend checks` 工作流运行，本地可设置 `RUN_MYSQL_IT=true` 后手动执行。

```bash
cd back
RUN_MYSQL_IT=true mvn -Dmaven.test.skip=false -Dtest=MySqlApiIntegrationTests test
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
AI_API_KEY=...            # 可选；不配置则生成接口返回 503，摘要读缓存不受影响
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=openrouter/free
AI_DAILY_LIMIT=100
```

已有数据库升级到本次版本时，先执行好友数据清理和唯一约束迁移：

```bash
mysql -uroot -p fs < sql/migrations/20261105_fix_wodehaoyou.sql
mysql -uroot -p fs < sql/migrations/20261113_ai_summary.sql
mysql -uroot -p fs < sql/migrations/20261113_ai_summary_seed.sql
```

### 大陆服务器适配（已内置）

- `Dockerfile` 内置阿里云 Maven 镜像源、`Dockerfile.web` 内置 npmmirror：大陆服务器直连 Maven Central / npmjs 容易连接停滞导致构建卡死
- `docker-compose.yml` 内置 JVM 堆上限（`-Xmx384m`）与 MySQL 裁剪（关闭 performance_schema、缩小 buffer pool），适配 2核2G 小内存机器
- 服务器建议先开 2GB swap 再首次构建；2C2G 上首次构建约 5–15 分钟
- **字体自托管**：`@fontsource/fraunces`（英文标题）+ `@fontsource/noto-sans-sc`（中文正文），运行时零外部网络，规避大陆 `fonts.googleapis.com` 不可达导致的字体回退到宋体/微软雅黑

### 2核2G 小内存更新前端（推荐路径）

`docker compose up -d --build` 在 2C2G 上重编 Vite 容易 OOM 挤掉 sshd。改为本地构建 + `docker cp` 注入：

```bash
# 本地
cd front && npm ci && npm run build
tar -czf dist-new.tar.gz -C dist .
scp dist-new.tar.gz root@<server>:/tmp/

# 服务器
ssh root@<server>
rm -rf /tmp/dist && mkdir -p /tmp/dist && tar -xzf /tmp/dist-new.tar.gz -C /tmp/dist
docker cp /tmp/dist/. fs-web-1:/usr/share/nginx/html/
# nginx 立即从磁盘服务新文件，无需重启
```

后端没改时无需重建 app 容器。

## 项目结构

```text
front/
  src/
    components/        # 公共组件
    composables/       # 可复用组合式逻辑
    router/            # 路由与守卫
    utils/             # HTTP、存储、XSS 过滤等工具
    views/             # 前台页面与后台管理页面
  tests/               # Vitest 与 Playwright 测试
back/
  src/main/java/com/   # Controller / Service / DAO / 拦截器
  src/main/resources/  # 配置文件与上传资源
FS.sql                 # 数据库初始化脚本
```

## 已知限制与后续计划

1. 域名备案进行中，通过后把 Demo 切换到域名 + HTTPS 访问。
2. 继续补齐后台通用组件的交互与边界测试。
3. 扩展 API 集成测试覆盖面，并补充部署后健康检查。
4. 将当前构建指标接入 Lighthouse CI，持续跟踪 LCP 和 CLS。
5. 将上传文件迁移到对象存储，并补充图片处理与访问控制。
