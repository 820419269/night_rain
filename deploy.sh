#!/bin/bash
# 羽毛球视频分析系统 - 生产部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 和 Docker Compose
check_dependencies() {
    log_info "检查依赖..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

    # 检查 DOCKER_BUILDKIT
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1

    log_info "依赖检查完成"
}

# 初始化环境
init_env() {
    log_info "初始化环境..."

    if [ ! -f .env.production ]; then
        log_warn ".env.production 不存在，创建示例配置..."
        cp .env.production.example .env.production 2>/dev/null || true
        log_warn "请编辑 .env.production 文件配置数据库密码等敏感信息"
    fi

    # 创建必要目录
    mkdir -p logs/nginx uploads config

    log_info "环境初始化完成"
}

# 构建 Docker 镜像
build_images() {
    log_info "构建 Docker 镜像（使用 BuildKit 缓存）..."

    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1

    # 构建所有服务
    docker compose -f docker-compose.prod.yml build --no-cache

    log_info "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."

    # 清理旧容器
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true

    # 启动服务
    docker compose -f docker-compose.prod.yml up -d

    # 等待服务健康
    log_info "等待服务启动..."
    sleep 10

    # 检查服务状态
    check_services
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."

    local max_attempts=30
    local attempt=1

    # 检查 MySQL
    while [ $attempt -le $max_attempts ]; do
        if docker compose -f docker-compose.prod.yml exec -T mysql mysqladmin ping -h localhost -u root -p${MYSQL_ROOT_PASSWORD} &> /dev/null; then
            log_info "MySQL 已就绪"
            break
        fi
        log_info "等待 MySQL 启动... ($attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done

    # 检查后端
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -sf http://localhost:18080/api/health &> /dev/null; then
            log_info "后端服务已就绪"
            break
        fi
        log_info "等待后端服务启动... ($attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done

    # 检查前端
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -sf http://localhost/health &> /dev/null; then
            log_info "前端服务已就绪"
            break
        fi
        log_info "等待前端服务启动... ($attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done

    # 显示最终状态
    show_status
}

# 显示服务状态
show_status() {
    log_info "========== 服务状态 =========="
    docker compose -f docker-compose.prod.yml ps
    log_info "==============================="
    log_info ""
    log_info "访问地址:"
    log_info "  前端: http://localhost"
    log_info "  后端 API: http://localhost:18080/api"
    log_info "  健康检查: http://localhost/api/health"
    log_info ""
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    docker compose -f docker-compose.prod.yml down
    log_info "服务已停止"
}

# 查看日志
logs() {
    docker compose -f docker-compose.prod.yml logs -f --tail=100 "$@"
}

# 清理 Docker 资源
cleanup() {
    log_warn "清理 Docker 资源..."
    docker compose -f docker-compose.prod.yml down -v --rmi all
    docker system prune -f
    log_info "清理完成"
}

# 显示帮助
show_help() {
    echo "羽毛球视频分析系统 - 部署脚本"
    echo ""
    echo "用法: $0 <命令>"
    echo ""
    echo "命令:"
    echo "  start     启动所有服务（构建 + 运行）"
    echo "  build     仅构建 Docker 镜像"
    echo "  stop      停止所有服务"
    echo "  restart   重启所有服务"
    echo "  status    查看服务状态"
    echo "  logs      查看日志 (可选: 服务名)"
    echo "  cleanup   清理 Docker 资源"
    echo "  help      显示帮助"
    echo ""
}

# 主函数
main() {
    case "${1:-start}" in
        start)
            check_dependencies
            init_env
            build_images
            start_services
            ;;
        build)
            check_dependencies
            build_images
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            start_services
            ;;
        status)
            show_status
            ;;
        logs)
            logs "${2:-}"
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
