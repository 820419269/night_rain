#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

Write-Host "=== 羽毛球视频分析系统 - Windows 快速部署 ===" -ForegroundColor Green
Write-Host ""

# 检查 Docker
Write-Host "[1/5] 检查 Docker..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version 2>$null
    if (-not $dockerVersion) { throw "Docker not found" }
    Write-Host "  $dockerVersion" -ForegroundColor Gray
} catch {
    Write-Host "  错误: Docker 未安装或未启动" -ForegroundColor Red
    Write-Host "  请访问 https://docker.com/desktop 下载安装" -ForegroundColor Yellow
    exit 1
}

# 检查 Docker Desktop
try {
    $dockerPS = docker ps 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  警告: Docker 未运行，请启动 Docker Desktop" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "  错误: Docker 服务未运行" -ForegroundColor Red
    exit 1
}

# 配置 BuildKit
$env:DOCKER_BUILDKIT = "1"
$env:COMPOSE_DOCKER_CLI_BUILD = "1"
Write-Host "  BuildKit 已启用" -ForegroundColor Gray

# 配置环境文件
Write-Host ""
Write-Host "[2/5] 配置环境..." -ForegroundColor Cyan
if (-not (Test-Path ".env.production")) {
    if (Test-Path ".env.production.example") {
        Copy-Item ".env.production.example" ".env.production"
        Write-Host "  已创建 .env.production (请编辑配置密码)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  .env.production 已存在" -ForegroundColor Gray
}

# 确保目录存在
$dirs = @("logs", "logs/nginx", "uploads", "config")
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# 构建并启动
Write-Host ""
Write-Host "[3/5] 构建 Docker 镜像..." -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml build

Write-Host ""
Write-Host "[4/5] 启动服务..." -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml up -d

# 等待启动
Write-Host ""
Write-Host "[5/5] 等待服务就绪 (30秒)..." -ForegroundColor Cyan
$progress = 0
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    $progress += 3.33
    Write-Host -NoNewline "`r  进度: $([math]::Round($progress))% " -ForegroundColor Gray
}
Write-Host ""

# 显示状态
Write-Host ""
Write-Host "=== 服务状态 ===" -ForegroundColor Green
docker compose -f docker-compose.prod.yml ps

# 显示访问信息
Write-Host ""
Write-Host "=== 访问地址 ===" -ForegroundColor Green
Write-Host "  前端:       http://localhost" -ForegroundColor White
Write-Host "  API:        http://localhost/api" -ForegroundColor White
Write-Host "  健康检查:   http://localhost/api/health" -ForegroundColor White

Write-Host ""
Write-Host "=== 常用命令 ===" -ForegroundColor Cyan
Write-Host "  查看日志:   docker compose -f docker-compose.prod.yml logs -f" -ForegroundColor Gray
Write-Host "  停止服务:   docker compose -f docker-compose.prod.yml down" -ForegroundColor Gray
Write-Host "  重启服务:   docker compose -f docker-compose.prod.yml restart" -ForegroundColor Gray

Write-Host ""
Write-Host "部署完成!" -ForegroundColor Green
