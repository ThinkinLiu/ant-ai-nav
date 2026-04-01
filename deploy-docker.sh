# 蚂蚁AI导航 - Docker 一键部署脚本
# 
# 使用方法：
#   chmod +x deploy-docker.sh
#   ./deploy-docker.sh [项目目录名]
#
# 示例：
#   ./deploy-docker.sh ant-ai-nav

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查命令
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装"
        return 1
    fi
    return 0
}

# 主函数
main() {
    PROJECT_NAME="${1:-ant-ai-nav}"
    PROJECT_DIR="/www/wwwroot/${PROJECT_NAME}"

    echo ""
    echo "=========================================="
    echo "  蚂蚁AI导航 - Docker 部署脚本"
    echo "=========================================="
    echo ""

    log_info "项目名称: ${PROJECT_NAME}"
    log_info "项目目录: ${PROJECT_DIR}"
    echo ""

    # 检查 Docker
    log_info "检查 Docker 环境..."
    if ! check_command docker; then
        log_info "正在安装 Docker..."
        curl -fsSL https://get.docker.com | sh
        systemctl start docker
        systemctl enable docker
        log_success "Docker 安装完成"
    else
        log_success "Docker 已安装: $(docker -v)"
    fi

    # 检查 Docker 服务
    if ! systemctl is-active --quiet docker; then
        log_info "启动 Docker 服务..."
        systemctl start docker
        systemctl enable docker
    fi
    log_success "Docker 服务运行中"

    # 检查项目目录
    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "项目目录不存在: ${PROJECT_DIR}"
        log_info "请先上传项目代码或克隆仓库"
        exit 1
    fi

    cd $PROJECT_DIR

    # 检查必要文件
    log_info "检查项目文件..."
    
    if [ ! -f "docker-compose.yml" ]; then
        log_error "缺少 docker-compose.yml 文件"
        exit 1
    fi

    if [ ! -f "Dockerfile" ]; then
        log_error "缺少 Dockerfile 文件"
        exit 1
    fi

    # 检查环境变量
    if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
        log_warn "未找到环境变量文件"
        log_warn "请创建 .env.local 文件并配置必要的环境变量"
        echo ""
        echo "示例："
        echo "  cat > .env.local << 'EOF'"
        echo "  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co"
        echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key"
        echo "  EOF"
        echo ""
        read -p "是否继续部署？(y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    # 停止旧容器
    echo ""
    log_info "检查现有容器..."
    
    if docker ps -a --format '{{.Names}}' | grep -q "^${PROJECT_NAME}$"; then
        log_info "停止并删除旧容器..."
        docker-compose down
    fi

    # 构建镜像
    echo ""
    log_info "构建 Docker 镜像..."
    docker-compose build --no-cache

    if [ $? -ne 0 ]; then
        log_error "镜像构建失败"
        exit 1
    fi

    log_success "镜像构建完成"

    # 启动容器
    echo ""
    log_info "启动容器..."
    docker-compose up -d

    if [ $? -ne 0 ]; then
        log_error "容器启动失败"
        exit 1
    fi

    log_success "容器启动完成"

    # 等待服务就绪
    echo ""
    log_info "等待服务就绪..."
    sleep 10

    # 健康检查
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
        log_success "健康检查通过 (HTTP ${HTTP_CODE})"
    else
        log_warn "健康检查返回: HTTP ${HTTP_CODE}"
        log_info "请查看容器日志: docker-compose logs -f"
    fi

    # 输出部署信息
    echo ""
    echo "=========================================="
    echo "  部署完成！"
    echo "=========================================="
    echo ""
    echo "项目信息："
    echo "  - 项目名称: ${PROJECT_NAME}"
    echo "  - 项目目录: ${PROJECT_DIR}"
    echo "  - 访问地址: http://127.0.0.1:5000"
    echo ""
    echo "常用命令："
    echo "  - 查看状态: docker-compose ps"
    echo "  - 查看日志: docker-compose logs -f"
    echo "  - 重启服务: docker-compose restart"
    echo "  - 停止服务: docker-compose down"
    echo "  - 更新部署: docker-compose up -d --build"
    echo ""
    echo "Nginx 配置："
    echo "  - 在宝塔面板创建网站"
    echo "  - 配置反向代理到 http://127.0.0.1:5000"
    echo ""
    log_success "Docker 部署完成"
}

# 执行主函数
main "$@"
