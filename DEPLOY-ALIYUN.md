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

2. `.env` 不要提交到 Git（`.gitignore` 已排除 `.env` / `.env.*`，保留 `.env.example` 模板）。
3. 服务器定期 `apt update && apt upgrade`。

## 四、域名与备案（重要前提）

- 中国大陆服务器**绑域名对外提供网站服务需要 ICP 备案**（要有域名，流程约 1–2 周，在阿里云备案控制台走）。
- 简历项目链接如果用纯 IP 形式能访问，但观感差且无法上 HTTPS；正式对外建议：注册域名 → 备案 → Nginx 配证书（可用 certbot 或阿里云免费证书）。
- 不想备案的替代：买香港/海外节点（免备案，延迟略高）。

## 五、日常更新

```bash
cd /root/FS
git pull --ff-only
docker compose stop mysql          # 见下方"构建期间"——必须
docker compose build web
docker compose up -d web
docker compose start mysql
```

上传的图片存在 `upload-data` 卷中，重建容器不丢失；数据库同理。

### 只改前端时

改 `front/` 下的文件时，`app` 和 `mysql` 都不需要动：

```bash
cd /root/FS
git pull --ff-only
docker compose stop mysql
docker compose build web
docker compose up -d web
docker compose start mysql
```

### 构建期间：先停 MySQL

2核2G 机器上同时跑 MySQL + Spring Boot + Vite 构建，内存和 CPU 都会打满。
实测后果是 **sshd 握手超时，连不上机器**（`kex_exchange_identification: Connection timed out`），
阿里云控制台的远程连接也会一并失败，只能去控制台点「重启」。

构建前 `docker compose stop mysql` 能腾出约 400MB，构建完记得 `start` 回来。
构建本身放后台跑，避免 SSH 会话被长时间占住：

```bash
nohup docker compose build --progress plain web > /tmp/webbuild.log 2>&1 &
tail -f /tmp/webbuild.log     # 另开一个会话观察
```

### SSH 连不上时的排查

先确认是机器的问题还是本地网络的问题：

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://<公网IP>/    # 网站还活着吗
Test-NetConnection <公网IP> -Port 22                          # 端口通吗
```

网站 200 但 SSH banner 超时 = 机器负载过高，等构建结束或去控制台重启。
端口不通 = 安全组或防火墙问题。

SSH 会话**间隔开**，连续快速发起多次连接也会触发超时。

### 服务器上的代码应该是 git 工作副本

如果 `cd /root/FS && git status` 报 `not a git repository`，说明代码是 ZIP 解压或
scp 上传的副本，`git pull` 执行不了。要转成 git 工作副本（先备份，确认无独有改动再换）：

```bash
cd /root && tar czf /root/FS-backup.tar.gz FS     # 1. 备份
git clone https://github.com/<owner>/<repo>.git FS-git   # 2. 拉到旁边
cd FS-git && git ls-files | while IFS= read -r f; do
  mkdir -p "/root/FS/$(dirname "$f")" && cp "$f" "/root/FS/$f"
done                                           # 3. 同步跟踪文件
mv /root/FS-git/.git /root/FS/.git && rm -rf /root/FS-git   # 4. 只搬 .git 进去
cd /root/FS && git checkout -- . && git status  # 5. 校验
```

第 3 步只覆盖 git 跟踪的文件，`.env`、`back/log.txt` 等运行时文件原地不动。
第 5 步 `git status` 应该只显示 `?? .env`，或因 `.gitignore` 已排除 `.env` 而完全干净。

> `git checkout -- .` 会还原**所有被 git 跟踪**的文件。如果你把运行时文件误提交进了仓库，
> 这一步会把它一并覆盖掉——所以第 1 步的 tar 备份不是走形式，别跳过。
> 验证完确认网站正常，备份可保留几天后再删。

### .env 不进版本库

`.env` 只存在于部署机器上，含 `DB_PASSWORD`，绝不能提交。
仓库 `.gitignore` 已排除 `.env` / `.env.*`（保留 `.env.example`）。
新增部署机器时按第二节生成 `.env` 即可，仓库里只有无密码的模板。

### 磁盘清理

构建缓存会累积，2G 机器尤其明显：

```bash
docker system df                    # 看占用
docker builder prune -f             # 清构建缓存，不影响运行中的容器
```

上传图片（`upload-data` 卷）和数据库（`mysql-data` 卷）**不要动**，删了数据就没了。
