#!/bin/bash

#############################################################
# 蚂蚁AI导航 - 宝塔服务器部署脚本
# 
# 使用方法：
#   chmod +x deploy.sh
#   ./deploy.sh <项目目录名>
#
# 示例：
#   ./deploy.sh ant-ai-nav
#############################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 检查服务是否运行
check_port() {
    if lsof -i:$1 &> /dev/null; then
        log_warn "端口 $1 已被占用"
        return 1
    fi
    return 0
}

# 主函数
main() {
    # 参数检查
    if [ -z "$1" ]; then
        log_error "请指定项目目录名"
        echo "使用方法: ./deploy.sh <项目目录名>"
        echo "示例: ./deploy.sh ant-ai-nav"
        exit 1
    fi

    PROJECT_NAME=$1
    PROJECT_DIR="/www/wwwroot/${PROJECT_NAME}"
    PORT=5000

    echo ""
    echo "=========================================="
    echo "  蚂蚁AI导航 - 宝塔部署脚本"
    echo "=========================================="
    echo ""

    log_info "项目名称: ${PROJECT_NAME}"
    log_info "项目目录: ${PROJECT_DIR}"
    log_info "运行端口: ${PORT}"
    echo ""

    # 检查项目目录
    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "项目目录不存在: ${PROJECT_DIR}"
        log_info "请先创建目录并上传项目代码"
        exit 1
    fi

    cd $PROJECT_DIR
    log_success "进入项目目录"

    # 检查必要文件
    log_info "检查项目文件..."
    
    if [ ! -f "package.json" ]; then
        log_error "缺少 package.json 文件"
        exit 1
    fi

    if [ ! -f ".coze" ] && [ ! -f "ecosystem.config.js" ]; then
        log_warn "缺少 PM2 配置文件，将使用默认配置"
    fi

    # 检查环境
    log_info "检查运行环境..."
    check_command "node"
    check_command "pnpm"
    check_command "pm2"

    NODE_VERSION=$(node -v)
    PNPM_VERSION=$(pnpm -v)
    
    log_success "Node.js 版本: ${NODE_VERSION}"
    log_success "pnpm 版本: ${PNPM_VERSION}"

    # 检查环境变量
    if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
        log_warn "未找到环境变量文件 (.env.local 或 .env.production)"
        log_warn "请确保已配置必要的环境变量"
    else
        log_success "环境变量文件已存在"
    fi

    # 安装依赖
    echo ""
    log_info "安装项目依赖..."
    
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --frozen-lockfile
    else
        pnpm install
    fi
    
    log_success "依赖安装完成"

    # 构建项目（如果需要）
    if [ ! -d ".next" ]; then
        log_info "开始构建项目..."
        pnpm build
        log_success "项目构建完成"
    else
        log_success "构建产物已存在，跳过构建"
    fi

    # 停止旧服务
    echo ""
    log_info "检查现有服务..."
    
    if pm2 list | grep -q "$PROJECT_NAME"; then
        log_info "停止现有服务..."
        pm2 stop $PROJECT_NAME
        pm2 delete $PROJECT_NAME
    fi

    # 创建 PM2 配置（如果不存在）
    if [ ! -f "ecosystem.config.js" ]; then
        log_info "创建 PM2 配置文件..."
        
        cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'PROJECT_NAME_PLACEHOLDER',
    script: 'pnpm',
    args: 'start',
    cwd: '/www/wwwroot/PROJECT_NAME_PLACEHOLDER',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/www/wwwroot/PROJECT_NAME_PLACEHOLDER/logs/error.log',
    out_file: '/www/wwwroot/PROJECT_NAME_PLACEHOLDER/logs/out.log',
    log_file: '/www/wwwroot/PROJECT_NAME_PLACEHOLDER/logs/combined.log',
    time: true
  }]
};
EOF
        
        # 替换项目名称
        sed -i "s/PROJECT_NAME_PLACEHOLDER/${PROJECT_NAME}/g" ecosystem.config.js
        sed -i "s|/www/wwwroot/PROJECT_NAME_PLACEHOLDER|${PROJECT_DIR}|g" ecosystem.config.js
        
        log_success "PM2 配置文件创建完成"
    fi

    # 创建日志目录
    mkdir -p ${PROJECT_DIR}/logs
    log_success "日志目录创建完成"

    # 启动服务
    echo ""
    log_info "启动应用服务..."
    
    pm2 start ecosystem.config.js --env production
    
    log_success "服务启动完成"

    # 保存 PM2 配置
    pm2 save
    
    log_success "PM2 配置已保存"

    # 检查服务状态
    echo ""
    log_info "检查服务状态..."
    sleep 3
    
    if pm2 list | grep -q "$PROJECT_NAME.*online"; then
        log_success "服务运行正常"
    else
        log_error "服务启动失败，请检查日志"
        pm2 logs $PROJECT_NAME --lines 20
        exit 1
    fi

    # 检查端口
    echo ""
    log_info "检查端口监听..."
    sleep 2
    
    if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${PORT} | grep -q "200\|304"; then
        log_success "端口 ${PORT} 响应正常"
    else
        log_warn "端口 ${PORT} 可能未正常响应，请检查应用日志"
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
    echo "  - 运行端口: ${PORT}"
    echo "  - 运行模式: production"
    echo ""
    echo "常用命令："
    echo "  - 查看状态: pm2 status"
    echo "  - 查看日志: pm2 logs ${PROJECT_NAME}"
    echo "  - 重启服务: pm2 restart ${PROJECT_NAME}"
    echo "  - 停止服务: pm2 stop ${PROJECT_NAME}"
    echo ""
    echo "Nginx 配置："
    echo "  - 请在宝塔面板中创建网站"
    echo "  - 配置反向代理到 http://127.0.0.1:${PORT}"
    echo ""
    log_success "部署脚本执行完毕"
}

# 执行主函数
main "$@"
