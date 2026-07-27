# 校园周边美食分享平台 - Code Wiki

> **项目编号**: FS | **技术栈**: Spring Boot 2.2.2 + MyBatis-Plus + MySQL + Vue.js + Layui  
> **项目描述**: 基于Vue.js和SpringBoot的校园美食分享平台，分为管理后台和用户网页端，支持管理员和普通用户两种角色。

---

## 目录

1. [项目整体架构](#1-项目整体架构)
2. [技术栈与依赖](#2-技术栈与依赖)
3. [项目目录结构](#3-项目目录结构)
4. [数据库设计](#4-数据库设计)
5. [后端核心模块详解](#5-后端核心模块详解)
   - [5.1 启动入口](#51-启动入口)
   - [5.2 配置层 (config)](#52-配置层-config)
   - [5.3 注解层 (annotation)](#53-注解层-annotation)
   - [5.4 拦截器层 (interceptor)](#54-拦截器层-interceptor)
   - [5.5 控制器层 (controller)](#55-控制器层-controller)
   - [5.6 服务层 (service)](#56-服务层-service)
   - [5.7 数据访问层 (dao)](#57-数据访问层-dao)
   - [5.8 实体层 (entity)](#58-实体层-entity)
   - [5.9 工具类层 (utils)](#59-工具类层-utils)
6. [前端设计](#6-前端设计)
7. [API接口汇总](#7-api接口汇总)
8. [项目运行方式](#8-项目运行方式)
9. [角色权限说明](#9-角色权限说明)

---

## 1. 项目整体架构

项目采用经典的 **前后端分离** 架构，前端为纯静态页面（Vue.js + Layui），后端为 Spring Boot RESTful API 服务。

```
┌─────────────────────────────────────────────────────┐
│                    前端 (Frontend)                    │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │   管理后台 (Admin)  │  │   用户网页端 (User Portal)  │ │
│  │   Vue.js + Layui  │  │   Vue.js + Layui + CSS  │ │
│  └────────┬─────────┘  └────────────┬─────────────┘ │
└───────────┼──────────────────────────┼───────────────┘
            │         HTTP/REST        │
            ▼                          ▼
┌─────────────────────────────────────────────────────┐
│                后端 (Spring Boot)                     │
│  ┌────────────────────────────────────────────────┐ │
│  │         Interceptor (Token 鉴权)                │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │              Controller 层 (9个)                │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │              Service 层 (8个接口)               │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │              DAO 层 (9个Mapper)                 │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │              Entity 层 (9个实体)                │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ JDBC
                       ▼
┌─────────────────────────────────────────────────────┐
│              MySQL 数据库 (fs)                      │
│  8张数据表: users, yonghu, defaultuser,              │
│  meishijianshang, storeup, wodehaoyou,               │
│  discussmeishijianshang, config, token               │
└─────────────────────────────────────────────────────┘
```

### 核心设计模式

- **MVC分层架构**: Controller → Service → DAO → Entity，职责清晰
- **Token 认证机制**: 基于自定义 Token 的登录状态管理，通过拦截器 (`AuthorizationInterceptor`) 统一鉴权
- **MyBatis-Plus 通用 CRUD**: Entity 继承 `ServiceImpl`，自动获得增删改查能力
- **统一响应格式**: 所有 API 返回 `R` 对象（继承 `HashMap`），包含 `code`、`msg`、`data` 字段

---

## 2. 技术栈与依赖

### 后端核心依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 2.2.2.RELEASE | 基础框架 |
| MyBatis-Plus | 2.3 | ORM框架，简化数据库操作 |
| mybatis-spring-boot-starter | 2.1.1 | MyBatis与Spring Boot集成 |
| MySQL Connector | 8.0.32 | MySQL数据库驱动 |
| Apache Shiro | 1.3.2 | 安全框架（已引入但未深度使用） |
| FastJson | 1.2.8 | JSON序列化 |
| Hutool | 4.0.12 | Java工具类库 |
| Apache Commons Lang3 | 3.0 | 通用工具类 |
| Commons IO | 2.5 | IO操作工具 |
| Validation API | 2.0.1.Final | 数据校验 |
| 百度AI SDK | 4.4.1 | 百度人脸识别、地图API |

### 前端核心依赖

| 依赖 | 用途 |
|------|------|
| Vue.js | 前端响应式框架 |
| Layui | UI组件库 |
| ElementUI | 后台管理UI组件 |
| jQuery | DOM操作 |
| Bootstrap 3 | 响应式布局 |

---

## 3. 项目目录结构

```
FoodSharingPlatform-main/
├── README.md                          # 项目简介
├── FS.sql                           # 数据库初始化脚本（含建表+测试数据）
├── back/                              # 后端Spring Boot项目
│   ├── pom.xml                        # Maven依赖配置
│   └── src/
│       └── main/
│           ├── java/com/
│           │   ├── SpringbootSchemaApplication.java  # 启动类
│           │   ├── annotation/         # 自定义注解
│           │   │   ├── IgnoreAuth.java          # 忽略Token验证
│           │   │   ├── LoginUser.java           # 登录用户参数注解
│           │   │   └── APPLoginUser.java        # App登录用户注解
│           │   ├── config/             # 配置类
│           │   │   ├── InterceptorConfig.java   # 拦截器配置
│           │   │   └── MybatisPlusConfig.java   # MyBatis-Plus分页配置
│           │   ├── controller/         # 控制器（9个）
│           │   │   ├── UserController.java          # 管理员用户登录/注册
│           │   │   ├── YonghuController.java        # 普通用户(用户)CRUD
│           │   │   ├── DefaultuserController.java   # 注册用户CRUD
│           │   │   ├── MeishijianshangController.java # 美食鉴赏CRUD
│           │   │   ├── StoreupController.java       # 收藏管理
│           │   │   ├── WodehaoyouController.java    # 我的好友管理
│           │   │   ├── ConfigController.java        # 系统配置管理
│           │   │   ├── CommonController.java        # 通用接口(统计/联动)
│           │   │   └── FileController.java          # 文件上传/下载
│           │   ├── dao/                # 数据访问层（9个Mapper接口）
│           │   │   ├── CommonDao.java         # 通用SQL执行接口
│           │   │   ├── UserDao.java
│           │   │   ├── YonghuDao.java
│           │   │   ├── DefaultuserDao.java
│           │   │   ├── MeishijianshangDao.java
│           │   │   ├── StoreupDao.java
│           │   │   ├── WodehaoyouDao.java
│           │   │   ├── ConfigDao.java
│           │   │   └── TokenDao.java
│           │   ├── entity/             # 实体类（三层模型）
│           │   │   ├── model/          # 基础模型
│           │   │   ├── view/           # 视图模型（含关联查询）
│           │   │   ├── vo/             # 值对象
│           │   │   ├── UserEntity.java            # 管理员用户 (users表)
│           │   │   ├── YonghuEntity.java          # 普通用户 (yonghu表)
│           │   │   ├── DefaultuserEntity.java     # 注册用户 (defaultuser表)
│           │   │   ├── MeishijianshangEntity.java # 美食鉴赏 (meishijianshang表)
│           │   │   ├── StoreupEntity.java         # 收藏 (storeup表)
│           │   │   ├── WodehaoyouEntity.java      # 我的好友 (wodehaoyou表)
│           │   │   ├── ConfigEntity.java          # 系统配置 (config表)
│           │   │   ├── TokenEntity.java           # Token (token表)
│           │   │   ├── DiscussmeishijianshangEntity.java # 美食鉴赏评论
│           │   │   └── EIException.java           # 自定义异常
│           │   ├── interceptor/        # 拦截器
│           │   │   └── AuthorizationInterceptor.java  # Token鉴权拦截器
│           │   ├── service/            # 服务接口
│           │   │   ├── impl/           # 服务实现（8个）
│           │   │   ├── CommonService.java
│           │   │   ├── ConfigService.java
│           │   │   ├── TokenService.java
│           │   │   ├── UserService.java
│           │   │   ├── YonghuService.java
│           │   │   ├── DefaultuserService.java
│           │   │   ├── MeishijianshangService.java
│           │   │   ├── StoreupService.java
│           │   │   └── WodehaoyouService.java
│           │   └── utils/              # 工具类（13个）
│           │       ├── R.java                # 统一响应封装
│           │       ├── PageUtils.java        # 分页工具
│           │       ├── Query.java            # 查询条件封装
│           │       ├── MPUtil.java           # MyBatis-Plus查询构建
│           │       ├── CommonUtil.java       # 通用工具
│           │       ├── MD5Util.java          # MD5加密
│           │       ├── BaiduUtil.java        # 百度API工具
│           │       ├── FileUtil.java         # 文件操作工具
│           │       ├── HttpClientUtils.java  # HTTP请求工具
│           │       ├── JQPageInfo.java       # 分页信息
│           │       ├── SQLFilter.java        # SQL防注入
│           │       ├── SpringContextUtils.java # Spring上下文
│           │       └── ValidatorUtils.java   # 校验工具
│           └── resources/
│               ├── application.yml           # 应用配置
│               ├── mapper/                   # MyBatis XML映射文件
│               └── front/                    # 前端静态资源
│                   └── front/
│                       ├── index.html        # 首页
│                       ├── css/              # 样式文件
│                       ├── js/               # JS脚本
│                       ├── elementui/        # ElementUI组件
│                       ├── layui/            # Layui组件
│                       ├── pages/            # 各功能页面
│                       │   ├── login/        # 登录页
│                       │   ├── home/         # 主页
│                       │   ├── config/       # 配置管理
│                       │   ├── users/        # 管理员管理
│                       │   ├── yonghu/       # 用户管理
│                       │   ├── defaultuser/  # 注册用户管理
│                       │   ├── storeup/      # 收藏管理
│                       │   └── wodehaoyou/   # 好友管理
│                       └── xznstatic/        # 静态资源
└── ES6特性面试回复_代码分析.xlsx         # 附加文档
```

---

## 4. 数据库设计

数据库名: `fs`，字符集: `utf8mb4`，共8张表。

### 4.1 表关系图

```
users (管理员)
  │
  └── token (登录凭证)
  
yonghu (普通用户/用户)
  ├── meishijianshang (美食鉴赏) ── discussmeishijianshang (评论)
  ├── storeup (收藏)
  └── wodehaoyou (我的好友)

defaultuser (注册用户)
  └── 独立注册体系

config (系统配置)
  └── 键值对配置
```

### 4.2 各表结构

#### users (管理员用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| username | varchar(100) | 用户名 |
| password | varchar(100) | 密码 |
| role | varchar(100) | 角色（默认"管理员"） |
| addtime | timestamp | 创建时间 |

> 默认管理员: `admin / 123456`

#### yonghu (普通用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| yonghuming | varchar(200) | 用户名（唯一） |
| mima | varchar(200) | 密码 |
| xingming | varchar(200) | 姓名 |
| shouji | varchar(200) | 手机 |
| youxiang | varchar(200) | 邮箱 |
| shenfenzheng | varchar(200) | 身份证 |
| zhaopian | varchar(200) | 照片URL |
| addtime | timestamp | 创建时间 |

#### defaultuser (注册用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| username | varchar(200) | 用户名（唯一） |
| mima | varchar(200) | 密码 |
| name | varchar(200) | 姓名 |
| sex | varchar(200) | 性别 |
| age | int | 年龄 |
| phone | varchar(200) | 电话 |
| picture | varchar(200) | 照片URL |
| email | varchar(200) | 邮箱 |
| addtime | timestamp | 创建时间 |

#### meishijianshang (美食鉴赏表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| fabushijian | date | 发布时间 |
| meishimingcheng | varchar(200) | 美食名称 |
| meishileibie | varchar(200) | 美食类别 |
| meishijieshao | longtext | 美食介绍 |
| shangpusuozaidi | varchar(200) | 商铺所在地 |
| tuijianzhishu | varchar(200) | 推荐指数(1-5星) |
| meishizhaopian | varchar(200) | 美食照片URL |
| shangpinjiage | varchar(200) | 商品价格 |
| yonghuming | varchar(200) | 发布用户名 |
| xingming | varchar(200) | 发布者姓名 |
| thumbsupnum | int | 点赞数 |
| crazilynum | int | 踩数 |
| clicktime | datetime | 最近点击时间 |
| clicknum | int | 点击次数 |
| addtime | timestamp | 创建时间 |

#### storeup (收藏表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| userid | bigint | 用户ID |
| refid | bigint | 收藏对象ID |
| tablename | varchar(200) | 来源表名 |
| name | varchar(200) | 收藏名称 |
| picture | varchar(200) | 收藏图片URL |
| addtime | timestamp | 创建时间 |

#### wodehaoyou (我的好友表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| yonghuming | varchar(200) | 好友用户名 |
| xingming | varchar(200) | 好友姓名 |
| tianjiashijian | datetime | 添加时间 |
| userid | bigint | 当前用户ID |
| addtime | timestamp | 创建时间 |

#### discussmeishijianshang (美食鉴赏评论表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| refid | bigint | 关联美食鉴赏ID |
| userid | bigint | 评论用户ID |
| nickname | varchar(200) | 用户名 |
| content | longtext | 评论内容 |
| reply | longtext | 回复内容 |
| addtime | timestamp | 创建时间 |

#### token (登录凭证表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| userid | bigint | 用户ID |
| username | varchar(100) | 用户名 |
| tablename | varchar(100) | 用户来源表 |
| role | varchar(100) | 角色 |
| token | varchar(200) | Token值(32位随机串) |
| addtime | timestamp | 创建时间 |
| expiratedtime | timestamp | 过期时间(1小时) |

#### config (系统配置表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 主键，自增 |
| name | varchar(100) | 配置项名称 |
| value | varchar(100) | 配置项值 |

---

## 5. 后端核心模块详解

### 5.1 启动入口

**文件**: [SpringbootSchemaApplication.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/SpringbootSchemaApplication.java)

```java
@SpringBootApplication
@MapperScan(basePackages = {"com.dao"})
public class SpringbootSchemaApplication extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(SpringbootSchemaApplication.class, args);
    }
}
```

- 使用 `@MapperScan` 扫描 DAO 接口
- 继承 `SpringBootServletInitializer` 支持 war 包部署

### 5.2 配置层 (config)

#### InterceptorConfig
**文件**: [InterceptorConfig.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/config/InterceptorConfig.java)

- 注册 `AuthorizationInterceptor` 拦截所有请求 (`/**`)
- 排除 `/static/**` 静态资源路径
- 重写 `addResourceHandlers` 配置静态资源映射（因为继承了 `WebMvcConfigurationSupport` 会覆盖默认配置）

#### MybatisPlusConfig
**文件**: [MybatisPlusConfig.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/config/MybatisPlusConfig.java)

- 注册 `PaginationInterceptor` 分页插件，支持 MyBatis-Plus 分页查询

### 5.3 注解层 (annotation)

#### @IgnoreAuth
**文件**: [IgnoreAuth.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/annotation/IgnoreAuth.java)

- 标记在 Controller 方法上，表示该方法**不需要 Token 验证**
- 典型使用场景：登录、注册、首页数据列表

#### @LoginUser
**文件**: [LoginUser.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/annotation/LoginUser.java)

- 标记在方法参数上，用于注入当前登录用户信息

### 5.4 拦截器层 (interceptor)

#### AuthorizationInterceptor
**文件**: [AuthorizationInterceptor.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/interceptor/AuthorizationInterceptor.java)

**核心流程**:
1. 设置跨域响应头（CORS）
2. 处理 OPTIONS 预检请求，直接返回 200
3. 检查方法是否有 `@IgnoreAuth` 注解 → 有则放行
4. 从请求头 `Token` 获取 token 值
5. 调用 `TokenService.getTokenEntity(token)` 验证 token 有效性
6. 验证通过 → 将 userId、role、tableName、username 存入 Session
7. 验证失败 → 返回 JSON: `{"code":401,"msg":"请先登录"}`

### 5.5 控制器层 (controller)

#### UserController — 管理员用户
**路径**: `/users`  
**文件**: [UserController.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/controller/UserController.java)

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/login` | 管理员登录 | @IgnoreAuth |
| POST | `/register` | 管理员注册 | @IgnoreAuth |
| GET | `/logout` | 退出登录 | 需要 |
| POST | `/resetPass` | 密码重置为123456 | @IgnoreAuth |
| GET | `/page` | 分页列表 | 需要 |
| GET | `/list` | 列表 | 需要 |
| GET | `/info/{id}` | 详情 | 需要 |
| GET | `/session` | 获取当前Session用户 | 需要 |
| POST | `/save` | 新增 | 需要 |
| PUT | `/update` | 修改 | 需要 |
| DELETE | `/delete` | 批量删除 | 需要 |

**登录逻辑**: 验证 username + password → 生成 token → 返回 token

#### YonghuController — 普通用户
**路径**: `/yonghu`  
**文件**: [YonghuController.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/controller/YonghuController.java)

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/login` | 用户登录 | @IgnoreAuth |
| POST | `/register` | 用户注册 | @IgnoreAuth |
| GET | `/logout` | 退出 | 需要 |
| GET | `/session` | 当前用户信息 | 需要 |
| POST | `/resetPass` | 密码重置 | @IgnoreAuth |
| GET | `/page` | 后端分页列表 | 需要 |
| GET | `/list` | 前端分页列表 | 需要 |
| GET | `/lists` | 列表 | 需要 |
| GET | `/query` | 条件查询 | 需要 |
| GET | `/info/{id}` | 后端详情 | 需要 |
| GET | `/detail/{id}` | 前端详情 | 需要 |
| POST | `/save` | 后端新增 | 需要 |
| POST | `/add` | 前端新增 | 需要 |
| PUT | `/update` | 修改 | 需要 |
| DELETE | `/delete` | 批量删除 | 需要 |
| GET | `/remind/{columnName}/{type}` | 提醒计数 | 需要 |

**ID生成策略**: `new Date().getTime() + random(0-1000)` 生成唯一ID

#### MeishijianshangController — 美食鉴赏
**路径**: `/meishijianshang`  
**文件**: [MeishijianshangController.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/controller/MeishijianshangController.java)

**核心功能**:
- **CRUD操作**: 增删改查美食鉴赏记录
- **点赞/踩**: `/thumbsup/{id}?type=1` (赞) 或 `type=2` (踩)
- **点击计数**: 查看详情时自动 `clicknum+1` 并更新 `clicktime`
- **智能排序**: `/autoSort` 按点击量降序排列
- **日期范围筛选**: 支持 `fabushijianstart` / `fabushijianend` 参数
- **用户数据隔离**: 普通用户只能看到自己发布的美食鉴赏

#### StoreupController — 收藏管理
**路径**: `/storeup`  
**文件**: [StoreupController.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/controller/StoreupController.java)

- 收藏支持多表关联（通过 `tablename` + `refid` 定位）
- 非管理员自动过滤当前用户的收藏记录
- 新增时自动注入 `userid`

#### WodehaoyouController — 我的好友
**路径**: `/wodehaoyou`  
**文件**: [WodehaoyouController.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/controller/WodehaoyouController.java)

- 好友关系管理，支持日期范围筛选
- 非管理员只能看到自己的好友列表

#### DefaultuserController — 注册用户
**路径**: `/defaultuser`  
**文件**: [DefaultuserController.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/controller/DefaultuserController.java)

- 独立的注册用户体系，功能与 YonghuController 类似
- 支持登录、注册、密码重置

#### ConfigController — 系统配置
**路径**: `/config`  
**文件**: [ConfigController.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/controller/ConfigController.java)

- 键值对配置管理（如轮播图、百度API Key等）
- `GET /info?name=xxx` 按名称查询配置

#### CommonController — 通用接口
**路径**: `/`  
**文件**: [CommonController.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/controller/CommonController.java)

| 路径 | 说明 |
|------|------|
| `/location?lng=&lat=` | 百度地图逆地理编码 |
| `/matchFace?face1=&face2=` | 百度人脸比对 |
| `/option/{tableName}/{columnName}` | 获取表字段下拉选项（联动） |
| `/follow/{tableName}/{columnName}` | 按字段获取单条记录 |
| `/sh/{tableName}` | 审核状态修改 |
| `/remind/{tableName}/{columnName}/{type}` | 提醒计数 |
| `/cal/{tableName}/{columnName}` | 单列求和/最大/最小/平均 |
| `/group/{tableName}/{columnName}` | 分组统计 |
| `/value/{tableName}/{xColumnName}/{yColumnName}` | 按值统计（二维） |

#### FileController — 文件管理
**路径**: `/file`  
**文件**: [FileController.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/controller/FileController.java)

- `POST /upload`: 上传文件到 `static/upload/` 目录，文件名格式为 `时间戳.扩展名`
- `GET /download`: 下载文件（@IgnoreAuth）

### 5.6 服务层 (service)

#### TokenService
**文件**: [TokenServiceImpl.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/service/impl/TokenServiceImpl.java)

**核心方法**:

- `generateToken(Long userid, String username, String tableName, String role)`: 
  - 生成32位随机字符串作为 token
  - 有效期1小时
  - 同一用户+角色已有token则更新，否则新建

- `getTokenEntity(String token)`:
  - 验证 token 是否存在且未过期
  - 过期返回 null

#### CommonService
**文件**: [CommonServiceImpl.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/service/impl/CommonServiceImpl.java)

- 通用SQL执行服务，支持动态表名/字段名的查询
- 实现统计、分组、联动下拉等功能

### 5.7 数据访问层 (dao)

#### CommonDao — 通用DAO
**文件**: [CommonDao.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/dao/CommonDao.java) + [CommonDao.xml](file:///d:/FoodSharingPlatform-main/back/src/main/resources/mapper/CommonDao.xml)

核心SQL模板：
- `getOption`: `SELECT DISTINCT ${column} FROM ${table}` — 动态字段查询
- `getFollowByOption`: `SELECT * FROM ${table} WHERE ${column}=#{columnValue}` — 关联查询
- `sh`: `UPDATE ${table} SET sfsh=#{sfsh} WHERE id=#{id}` — 审核操作
- `remindCount`: 按条件计数
- `selectCal`: `SELECT sum/max/min/avg` — 聚合统计
- `selectGroup`: `GROUP BY` 分组统计
- `selectValue`: 二维统计 `SELECT ${xColumn}, sum(${yColumn}) total FROM ${table} GROUP BY ${xColumn}`

其余 DAO（UserDao、YonghuDao 等）继承 MyBatis-Plus 的 `BaseMapper`，提供通用 CRUD。

### 5.8 实体层 (entity)

实体采用 **三层模型** 设计：

| 层级 | 包路径 | 说明 |
|------|--------|------|
| Entity | `com.entity` | 数据库表映射，`@TableName` 注解 |
| Model | `com.entity.model` | 基础模型，继承Entity |
| View | `com.entity.view` | 视图模型，支持关联查询 |
| VO | `com.entity.vo` | 值对象，用于前端数据传输 |

**关键实体**:

- **MeishijianshangEntity**: 美食鉴赏核心实体，包含点赞/踩、点击计数等字段
- **StoreupEntity**: 通用收藏实体，通过 `tablename`+`refid` 实现多类型收藏
- **TokenEntity**: Token实体，包含过期时间逻辑
- **ConfigEntity**: 键值对配置实体

### 5.9 工具类层 (utils)

#### R — 统一响应封装
**文件**: [R.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/utils/R.java)

继承 `HashMap<String, Object>`，提供链式调用：

```java
R.ok().put("data", page)           // 成功: {"code":0, "data":...}
R.ok("操作成功")                    // 成功: {"code":0, "msg":"操作成功"}
R.error("账号或密码不正确")         // 失败: {"code":500, "msg":"..."}
R.error(401, "请先登录")           // 自定义状态码
```

#### PageUtils — 分页工具
**文件**: [PageUtils.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/utils/PageUtils.java)

封装分页结果：`total`(总记录数)、`pageSize`(每页大小)、`totalPage`(总页数)、`currPage`(当前页)、`list`(数据列表)

#### MPUtil — MyBatis-Plus查询构建工具
**文件**: [MPUtil.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/utils/MPUtil.java)

核心方法：
- `likeOrEq(wrapper, bean)`: 模糊匹配或精确匹配（含 `%` 则模糊）
- `between(wrapper, params)`: 范围查询（`_start`/`_end` 后缀）
- `sort(wrapper, params)`: 排序（`sort`+`order` 参数）
- `allEQMapPre(bean, pre)`: Bean转Map并驼峰转下划线
- `camelToUnderline(str)`: 驼峰命名转下划线

#### BaiduUtil — 百度API工具
**文件**: [BaiduUtil.java](file:///d:/FoodSharingPlatform-main/back/src/main/java/com/utils/BaiduUtil.java)

- `getCityByLonLat(key, lng, lat)`: 调用百度地图逆地理编码API获取省市区
- `getAuth(ak, sk)`: 获取百度AI开放平台 access_token

---

## 6. 前端设计

### 6.1 页面结构

```
front/
├── index.html                    # 首页（含导航栏、轮播图）
├── pages/
│   ├── login/login.html          # 登录页
│   ├── home/home.html            # 主页
│   ├── config/                   # 系统配置管理
│   │   ├── add.html              # 新增配置
│   │   ├── list.html             # 配置列表
│   │   └── detail.html           # 配置详情
│   ├── users/                    # 管理员管理
│   │   ├── add.html
│   │   ├── list.html
│   │   └── detail.html
│   ├── yonghu/                   # 用户管理
│   │   ├── add.html
│   │   ├── list.html
│   │   ├── detail.html
│   │   ├── center.html           # 个人中心
│   │   └── register.html         # 注册页
│   ├── defaultuser/              # 注册用户管理
│   │   ├── add.html
│   │   └── list.html
│   ├── storeup/                  # 收藏管理
│   │   └── list.html
│   └── wodehaoyou/               # 好友管理
│       ├── add.html
│       ├── list.html
│       └── detail.html
```

### 6.2 前端配置 (config.js)
**文件**: [config.js](file:///d:/FoodSharingPlatform-main/back/src/main/resources/front/front/js/config.js)

核心配置：
- `projectName`: "校园周边美食分享平台"
- `swiper`: 轮播图配置（宽高、切换动画、间隔等）
- `indexNav`: 首页导航菜单（美食鉴赏、我的好友）
- `adminurl`: 管理后台地址
- `menu`: 角色菜单权限配置（JSON），定义了管理员和用户两种角色各自的后台菜单和前端菜单
- `isAuth(tableName, key)`: 后台权限校验函数
- `isFrontAuth(tableName, key)`: 前端权限校验函数

### 6.3 技术特点
- 使用 **Vue.js** 进行数据绑定和组件化
- 使用 **Layui** 作为UI框架（表格、表单、弹层等）
- 使用 **ElementUI** 辅助后台管理界面
- 前端路由采用 iframe 嵌入方式
- 通过 `localStorage` 存储 token 和用户信息

---

## 7. API接口汇总

### 7.1 认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/users/login` | 管理员登录 |
| POST | `/users/register` | 管理员注册 |
| POST | `/yonghu/login` | 用户登录 |
| POST | `/yonghu/register` | 用户注册 |
| POST | `/defaultuser/login` | 注册用户登录 |
| POST | `/defaultuser/register` | 注册用户注册 |
| GET | `/users/logout` | 退出登录 |
| POST | `/users/resetPass` | 重置密码 |

### 7.2 美食鉴赏

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/meishijianshang/page` | 分页列表 |
| GET | `/meishijianshang/list` | 前端列表（@IgnoreAuth） |
| GET | `/meishijianshang/info/{id}` | 详情（含点击计数） |
| GET | `/meishijianshang/detail/{id}` | 前端详情 |
| POST | `/meishijianshang/save` | 新增 |
| POST | `/meishijianshang/add` | 前端新增 |
| PUT | `/meishijianshang/update` | 修改 |
| DELETE | `/meishijianshang/delete` | 删除 |
| GET | `/meishijianshang/thumbsup/{id}` | 点赞/踩 |
| GET | `/meishijianshang/autoSort` | 智能排序 |

### 7.3 收藏管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/storeup/page` | 分页列表 |
| GET | `/storeup/list` | 前端列表 |
| POST | `/storeup/save` | 新增收藏 |
| DELETE | `/storeup/delete` | 删除收藏 |

### 7.4 好友管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/wodehaoyou/page` | 分页列表 |
| GET | `/wodehaoyou/list` | 前端列表 |
| POST | `/wodehaoyou/save` | 添加好友 |
| DELETE | `/wodehaoyou/delete` | 删除好友 |

### 7.5 通用接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/option/{tableName}/{columnName}` | 下拉选项 |
| GET | `/remind/{tableName}/{columnName}/{type}` | 提醒计数 |
| GET | `/cal/{tableName}/{columnName}` | 聚合统计 |
| GET | `/group/{tableName}/{columnName}` | 分组统计 |
| GET | `/value/{tableName}/{xColumn}/{yColumn}` | 二维统计 |
| POST | `/sh/{tableName}` | 审核操作 |
| GET | `/location` | 百度地图定位 |
| POST | `/matchFace` | 人脸比对 |

### 7.6 文件管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/file/upload` | 文件上传 |
| GET | `/file/download` | 文件下载 |

---

## 8. 项目运行方式

### 8.1 环境要求

| 软件 | 版本要求 |
|------|----------|
| JDK | 1.8+ |
| MySQL | 8.0+ |
| Maven | 3.3+ |
| Node.js | (可选，前端开发) |

### 8.2 运行步骤

**1. 数据库初始化**

```bash
# 登录 MySQL，执行 SQL 脚本
mysql -u root -p < FS.sql
```

数据库连接信息：
- 地址: `127.0.0.1:3306`
- 数据库名: `fs`
- 用户名: `root`
- 密码: `123456`

**2. 启动后端服务**

```bash
cd back
mvn clean package -DskipTests
java -jar target/FS-0.0.1-SNAPSHOT.jar
```

或使用 Maven 直接运行：

```bash
cd back
mvn spring-boot:run
```

**3. 访问应用**

- 后端服务: `http://localhost:8080/springboot35l3z`
- 前端首页: `http://localhost:8080/springboot35l3z/front/index.html`
- 管理后台: `http://localhost:8080/springboot35l3z/admin/dist/index.html`

### 8.3 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123456 |
| 用户 | 用户1 | 123456 |
| 用户 | 1 | 1 |

### 8.4 配置文件说明

**文件**: [application.yml](file:///d:/FoodSharingPlatform-main/back/src/main/resources/application.yml)

| 配置项 | 说明 |
|--------|------|
| `server.port` | 服务端口: 8080 |
| `server.servlet.context-path` | 上下文路径: `/springboot35l3z` |
| `spring.datasource.url` | 数据库连接 |
| `spring.servlet.multipart.max-file-size` | 上传文件大小限制: 10MB |
| `mybatis-plus.mapper-locations` | Mapper XML 扫描路径 |
| `mybatis-plus.global-config.db-column-underline` | 驼峰转下划线: true |
| `mybatis-plus.configuration.log-impl` | SQL日志输出 |

---

## 9. 角色权限说明

### 管理员 (users 表，role="管理员")
- 可管理所有用户、美食鉴赏、好友、收藏
- 可管理系统配置（轮播图等）
- 可查看所有数据，无数据隔离
- 后台菜单: 用户管理、美食鉴赏管理、我的好友管理、我的收藏管理、系统管理

### 普通用户/用户 (yonghu 表，role="用户")
- 可发布美食鉴赏、点赞/踩
- 可添加好友、收藏美食
- 只能查看和管理自己的数据
- 后台菜单: 美食鉴赏管理、我的好友管理、我的收藏管理
- 前端菜单: 美食鉴赏列表、我的好友列表

### 注册用户 (defaultuser 表，role="注册用户")
- 独立的注册体系
- 功能与普通用户类似

---

> **文档生成时间**: 2026-06-27  
> **项目编号**: FS — 校园周边美食分享平台