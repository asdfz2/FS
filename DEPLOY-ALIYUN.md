# 阿里云单机部署指南（国内环境）

架构：一台服务器跑三个容器 —— MySQL 8 + Spring Boot 后端 + Nginx（托管前端构建产物并反代 `/api`）。同源部署，无跨域问题。

## 一、准备服务器

推荐**轻量应用服务器**（2核2G 起步，选 Ubuntu 22.04/24 镜像即可；价格和新用户/学生优惠以阿里云官网为准，本文不承诺具体数字）。

买好后记下公网 IP，安全组/防火墙放行：

| 端口 | 用途 | 建议 |
| --- | --- | --- |
| 80 | HTTP 访问 | 对公网开放 |
| 22 | SSH | 建议限制为你常用 IP |

MySQL 3306 **不对公网开放**（compose 里没有映射），只有容器网络内能连。

## 二、部署步骤

```bash
# 1. 登录服务器后安装 Docker（自带 Docker 镜像可跳过）
curl -fsSL https://get.docker.com | bash
systemctl enable --now docker

# 2. 拉代码
git clone https://github.com/asdfz2/FS.git
cd FS

# 3. 生成数据库强密码并写入 .env
openssl rand -base64 18   # 复制输出
cp .env.example .env
vi .env                   # DB_PASSWORD=粘贴强密码

# 4. 构建并启动（首次构建约几分钟）
docker compose up -d --build

# 5. 看状态
docker compose ps
docker compose logs -f app   # 看到 Started SpringbootSchemaApplication 即成功
```

浏览器访问 `http://<你的公网IP>/`。

首次启动 MySQL 会自动执行 `FS.sql` 建表导演示数据；之后重启不会重复导入（数据在 `mysql-data` 卷里持久化）。

## 三、上线前必做（安全）

1. **改掉演示密码**。仓库和 README 里有公开的 `admin / 123456`。登录后台改密，或直接改库：

   ```bash
   # 先本地生成 BCrypt 哈希（保留 $2 开头完整字符串），然后：
   docker compose exec mysql mysql -uroot -p<你的DB_PASSWORD> fs \
     -e "UPDATE users SET password='<新BCrypt哈希>' WHERE username='admin';"
   ```

2. `.env` 不要提交到 Git（已在 .gitignore 中排除）。
3. 服务器定期 `apt update && apt upgrade`。

## 四、域名与备案（重要前提）

- 中国大陆服务器**绑域名对外提供网站服务需要 ICP 备案**（要有域名，流程约 1–2 周，在阿里云备案控制台走）。
- 简历项目链接如果用纯 IP 形式能访问，但观感差且无法上 HTTPS；正式对外建议：注册域名 → 备案 → Nginx 配证书（可用 certbot 或阿里云免费证书）。
- 不想备案的替代：买香港/海外节点（免备案，延迟略高）。

## 五、日常更新

```bash
cd FS
git pull
docker compose up -d --build
```

上传的图片存在 `upload-data` 卷中，重建容器不丢失；数据库同理。
