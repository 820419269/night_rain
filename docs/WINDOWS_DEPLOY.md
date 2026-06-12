# Windows 本地部署指南

## 方式一：Docker Desktop（推荐）

### 1. 安装 Docker Desktop

1. **下载 Docker Desktop**
   - 访问 https://www.docker.com/products/docker-desktop/
   - 下载 Windows 版本（约 500MB）

2. **安装 WSL 2（如果没有）**
   ```powershell
   # 以管理员身份打开 PowerShell
   wsl --install
   # 重启电脑
   ```

3. **安装 Docker Desktop**
   - 运行下载的 `Docker Desktop Installer.exe`
   - 勾选 "Use WSL 2 instead of Hyper-V"
   - 等待安装完成

4. **验证安装**
   ```powershell
   docker --version
   docker compose version
   ```

### 2. 配置 Windows 文件行尾符

Docker 在 Windows 上需要处理行尾符问题：

```powershell
# 在项目目录下执行
git config --global core.autocrlf true
```

### 3. 启动部署

```powershell
# 进入项目目录
cd C:\path\to\badminton-analysis

# 启用 BuildKit
$env:DOCKER_BUILDKIT=1
$env:COMPOSE_DOCKER_CLI_BUILD=1

# 复制并配置环境变量
copy .env.production.example .env.production
# 编辑 .env.production 配置密码

# 启动服务
docker compose -f docker-compose.prod.yml up -d

# 查看状态
docker compose -f docker-compose.prod.yml ps
```

### 4. 访问应用

- 前端: http://localhost
- 后端 API: http://localhost/api
- 健康检查: http://localhost/api/health

### 5. Windows Docker 特殊配置

在 `docker-compose.prod.yml` 中添加 Windows 兼容性配置：

```yaml
# 在 MySQL 服务中添加
services:
  mysql:
    # ... 其他配置
    shm_size: '256mb'  # Windows 共享内存问题修复
```

---

## 方式二：原生部署（不使用 Docker）

### 前提条件

- Java 17+ (https://adoptium.net/)
- Node.js 18+ (https://nodejs.org/)
- MySQL 8.0 (https://dev.mysql.com/downloads/mysql/)

### 1. 安装 MySQL

```powershell
# 下载 MySQL Installer
# https://dev.mysql.com/downloads/installer/

# 或使用 Chocolatey
choco install mysql

# 启动 MySQL 服务
net start mysql

# 登录 MySQL
mysql -u root -p

# 创建数据库和用户
CREATE DATABASE badminton_analysis;
CREATE USER 'badminton_app'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON badminton_analysis.* TO 'badminton_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. 初始化数据库

```powershell
# 在项目目录执行
mysql -u badminton_app -p badminton_analysis < api/database/init.sql
```

### 3. 配置后端

```powershell
# 进入后端目录
cd api

# 创建 application.yml（如果不存在）
# 编辑数据库连接配置

# 构建后端
mvn clean package -DskipTests

# 运行后端（后台运行）
java -jar target/*.jar
```

### 4. 安装前端依赖

```powershell
# 新开一个终端窗口
cd badminton-analysis

# 安装 pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

### 5. 配置 API 地址

如果前端和后端分开运行，修改 `src/services/api.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:18080/api';
```

---

## 方式三：使用 WSL 2（Linux 子系统）

### 1. 安装 WSL 2

```powershell
# 以管理员身份打开 PowerShell
wsl --install -d Ubuntu-22.04

# 重启后设置用户名和密码
```

### 2. 在 WSL 中安装工具

```bash
# 更新包
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Java
sudo apt install openjdk-17-jdk -y

# 安装 Maven
sudo apt install maven -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# 安装 pnpm
npm install -g pnpm
```

### 3. 挂载 Windows 磁盘

```bash
# WSL 中访问 Windows 文件
cd /mnt/c/path/to/project

# 或者在 Windows 资源管理器中访问 WSL
# \\wsl$\Ubuntu\home\username\project
```

### 4. 启动 Docker Desktop

确保 Docker Desktop 已启动（WSL 需要 Docker Desktop 后端）

### 5. 运行部署

```bash
cd ~/badminton-analysis

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

docker compose -f docker-compose.prod.yml up -d
```

---

## 常见问题与解决方案

### 问题 1：Docker Desktop 启动失败

**错误**: "Docker Desktop is not running"

**解决方案**:
```powershell
# 重启 Docker Desktop 服务
Restart-Service com.docker.service

# 或在任务管理器中重启 Docker Desktop 应用
```

### 问题 2：端口被占用

**错误**: "Bind for 0.0.0.0:80 failed: port is already allocated"

**解决方案**:
```powershell
# 查找占用端口的进程
netstat -ano | findstr :80

# 关闭占用进程或修改 docker-compose.yml 中的端口映射
```

### 问题 3：MySQL 连接被拒绝

**错误**: "Connection refused" 或 "Authentication failed"

**解决方案**:
```powershell
# 重置 MySQL root 密码
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
```

### 问题 4：Windows 路径太长

**错误**: "filename too long"

**解决方案**:
```powershell
# 在 Git 中启用长路径支持
git config --global core.longpaths true

# 或在 PowerShell 中
git config --system core.longpaths true
```

### 问题 5：Docker 构建慢

**解决方案**:
1. 确保 Docker Desktop 设置中勾选 "Use WSL 2"
2. 增加 Docker Desktop 资源限制
3. 在 Docker Desktop 设置中分配更多 CPU 和内存

### 问题 6：前端编译内存不足

**解决方案**:
- 增加 Docker Desktop 内存到至少 4GB
- 或在前端 Dockerfile 中添加 Node 内存限制

---

## 快速启动脚本（Windows PowerShell）

创建 `deploy-windows.ps1`:

```powershell
#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

Write-Host "=== 羽毛球视频分析系统 - Windows 部署脚本 ===" -ForegroundColor Green

# 1. 检查 Docker
Write-Host "`n[1/4] 检查 Docker..." -ForegroundColor Cyan
docker --version | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: Docker 未安装或未启动" -ForegroundColor Red
    Write-Host "请访问 https://docker.com/desktop 安装 Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# 2. 配置环境
Write-Host "`n[2/4] 配置环境..." -ForegroundColor Cyan
$env:DOCKER_BUILDKIT = "1"
$env:COMPOSE_DOCKER_CLI_BUILD = "1"

if (-not (Test-Path ".env.production")) {
    Write-Host "创建 .env.production..." -ForegroundColor Yellow
    Copy-Item ".env.production.example" ".env.production"
    Write-Host "请编辑 .env.production 配置密码" -ForegroundColor Yellow
    Write-Host "配置完成后按回车继续..." -ForegroundColor Yellow
    Read-Host
}

# 3. 启动服务
Write-Host "`n[3/4] 启动服务..." -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml up -d --build

# 4. 等待服务就绪
Write-Host "`n[4/4] 等待服务就绪..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# 检查服务状态
Write-Host "`n=== 服务状态 ===" -ForegroundColor Green
docker compose -f docker-compose.prod.yml ps

Write-Host "`n=== 访问地址 ===" -ForegroundColor Green
Write-Host "前端: http://localhost" -ForegroundColor White
Write-Host "API:  http://localhost/api" -ForegroundColor White
Write-Host "健康检查: http://localhost/api/health" -ForegroundColor White

Write-Host "`n部署完成!" -ForegroundColor Green
```

---

## 部署检查清单

| 检查项 | 状态 |
|--------|------|
| Docker Desktop 已启动 | ☐ |
| WSL 2 已安装（可选） | ☐ |
| 端口 80、3306、18080 未被占用 | ☐ |
| .env.production 已配置 | ☐ |
| MySQL 数据库已初始化 | ☐ |
| 防火墙已允许必要端口 | ☐ |

---

## 性能优化建议

### Docker Desktop 配置

1. 打开 Docker Desktop 设置
2. Resources:
   - Memory: 8GB+ (推荐 16GB)
   - CPUs: 4+ (推荐 8)
   - Swap: 2GB
   - Disk image size: 100GB+

### Windows 防火墙

允许以下入站规则：
- TCP 80 (HTTP)
- TCP 443 (HTTPS，可选)
- TCP 3306 (MySQL，仅开发环境)

```powershell
# 快速命令
New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
```
