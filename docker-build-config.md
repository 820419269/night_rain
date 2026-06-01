# Docker BuildKit 配置说明

## 概述

本项目已优化 Docker 构建过程，使用 BuildKit 缓存机制避免每次重新下载依赖。

## 启用 BuildKit

### 方法 1：全局启用（推荐）

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
export DOCKER_BUILDKIT=1
```

### 方法 2：单次构建启用

```bash
DOCKER_BUILDKIT=1 docker-compose build
```

### 方法 3：配置 daemon.json

编辑 `/etc/docker/daemon.json`：

```json
{
  "features": {
    "buildkit": true
  }
}
```

然后重启 Docker：

```bash
sudo systemctl restart docker
```

## 使用方法

### 首次构建（需要下载依赖）

```bash
cd /workspace
DOCKER_BUILDKIT=1 docker-compose build
```

### 后续构建（使用缓存，速度极快）

```bash
cd /workspace
DOCKER_BUILDKIT=1 docker-compose build
```

### 完整启动项目

```bash
cd /workspace
DOCKER_BUILDKIT=1 docker-compose up -d
```

## 优化策略说明

### 1. 后端 (api/Dockerfile)

- 使用 `# syntax=docker/dockerfile:1.4` 启用高级语法
- 先复制 `pom.xml`，利用 Docker 层缓存
- 使用 `--mount=type=cache,target=/root/.m2/repository` 持久化 Maven 本地仓库
- 添加 `-B` 批处理模式标志，减少输出

### 2. 前端 (Dockerfile)

- 使用 `# syntax=docker/dockerfile:1.4` 启用高级语法
- 先复制 `package.json` 和 `pnpm-lock.yaml`
- 使用 `--mount=type=cache,target=/pnpm/store` 缓存 pnpm store
- 使用 `--frozen-lockfile` 确保依赖锁定

### 3. 缓存机制

- 依赖文件不变时，不会重新下载依赖
- 仅当 `pom.xml` 或 `package.json` 变更时，才重新解析依赖
- Maven 本地仓库和 pnpm store 持久化在 Docker 缓存卷中

## 缓存清理

### 清理所有构建缓存（谨慎使用）

```bash
docker builder prune -a
```

### 只清理未使用的缓存

```bash
docker builder prune
```

## 验证构建

### 查看构建缓存使用情况

```bash
docker builder du
```

### 检查缓存是否生效

观察构建输出中是否有：
```
=> CACHED [stage-name n/m] ...
```

## 常见问题

### Q: 仍然重新下载依赖怎么办？

A: 检查以下几点：
1. 确认已启用 BuildKit (`DOCKER_BUILDKIT=1`)
2. 检查 `pom.xml` / `package.json` 是否被修改
3. 清理缓存后重新构建一次

### Q: 如何强制重新下载依赖？

A: 清理缓存后重新构建：

```bash
docker builder prune -a
DOCKER_BUILDKIT=1 docker-compose build --no-cache
```

### Q: BuildKit 不支持怎么办？

A: 更新 Docker 到 18.09 或更高版本，BuildKit 默认已包含。
