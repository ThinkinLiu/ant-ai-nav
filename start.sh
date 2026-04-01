#!/bin/bash

#############################################################
# 蚂蚁AI导航 - Docker 一键部署脚本
# 
# 使用方法：
#   chmod +x start.sh
#   ./start.sh
#############################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "=========================================="
echo "  蚂蚁AI导航 - Docker 部署"
echo "=========================================="
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装"
    log_info "请先安装 Docker: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# 检查 Docker 服务
if ! systemctl is-active --quiet docker 2>/dev/null; then
    log_info "启动 Docker 服务..."
    systemctl start docker
fi

# 配置 Docker 镜像加速（如果未配置）
if [ ! -f "/etc/docker/daemon.json" ]; then
    log_info "配置 Docker 镜像加速..."
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://dockerhub.icu",
    "https://docker.m.daocloud.io"
  ]
}
EOF
    systemctl daemon-reload
    systemctl restart docker
    log_success "Docker 镜像加速配置完成"
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    if [ -f ".env.docker" ]; then
        log_warn ".env 文件不存在，从模板创建..."
        cp .env.docker .env
        log_warn "请编辑 .env 文件填入真实配置后重新运行"
        echo ""
        echo "编辑命令: nano .env"
        echo "重新运行: ./start.sh"
        exit 1
    else
        log_error "缺少 .env 文件"
        echo ""
        echo "请创建 .env 文件，内容如下："
        echo ""
        cat << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
COZE_WORKLOAD_IDENTITY_API_KEY=your-api-key
COZE_WORKLOAD_IDENTITY_CLIENT_ID=your-client-id
COZE_WORKLOAD_IDENTITY_CLIENT_SECRET=your-client-secret
COZE_INTEGRATION_BASE_URL=https://integration.coze.cn
EOF
        exit 1
    fi
fi

# 检查环境变量是否已配置
if grep -q "your-" .env 2>/dev/null; then
    log_error ".env 文件包含占位符，请先配置真实值"
    echo "编辑命令: nano .env"
    exit 1
fi

log_success "环境配置检查通过"

# 停止旧容器
if docker ps -a --format '{{.Names}}' | grep -q "^ant-ai-nav$"; then
    log_info "停止旧容器..."
    docker-compose down
fi

# 构建并启动
log_info "开始构建..."
docker-compose up -d --build

if [ $? -ne 0 ]; then
    log_error "构建失败"
    exit 1
fi

# 等待启动
log_info "等待服务启动..."
sleep 10

# 健康检查
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000 2>/dev/null || echo "000")

echo ""
echo "=========================================="
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    log_success "部署成功！"
else
    log_warn "服务已启动，但健康检查返回: HTTP ${HTTP_CODE}"
    log_info "请查看日志: docker-compose logs -f"
fi
echo "=========================================="
echo ""
echo "访问地址: http://$(hostname -I | awk '{print $1}'):5000"
echo ""
echo "常用命令："
echo "  查看日志: docker-compose logs -f"
echo "  重启服务: docker-compose restart"
echo "  停止服务: docker-compose down"
echo ""
