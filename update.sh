#!/bin/bash

#############################################################
# 蚂蚁AI导航 - 项目更新脚本
# 
# 使用方法：
#   chmod +x update.sh
#   ./update.sh [项目目录名]
#
# 示例：
#   ./update.sh
#   ./update.sh ant-ai-nav
#############################################################

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

# 默认项目名称
PROJECT_NAME="${1:-ant-ai-nav}"
PROJECT_DIR="/www/wwwroot/${PROJECT_NAME}"
LOG_FILE="${PROJECT_DIR}/logs/update.log"

# 创建日志目录
mkdir -p ${PROJECT_DIR}/logs

echo ""
echo "=========================================="
echo "  蚂蚁AI导航 - 项目更新脚本"
echo "=========================================="
echo ""

log_info "项目名称: ${PROJECT_NAME}"
log_info "项目目录: ${PROJECT_DIR}"
log_info "日志文件: ${LOG_FILE}"
echo ""

# 检查目录
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "项目目录不存在: ${PROJECT_DIR}"
    exit 1
fi

cd $PROJECT_DIR

# 记录开始时间
START_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "[${START_TIME}] 开始更新..." >> $LOG_FILE

# 备份当前版本（可选）
log_info "备份当前版本..."
BACKUP_DIR="/www/backup/${PROJECT_NAME}_$(date '+%Y%m%d_%H%M%S')"
if [ -d ".next" ]; then
    mkdir -p $BACKUP_DIR
    cp -r .next $BACKUP_DIR/
    cp package.json $BACKUP_DIR/
    log_success "备份完成: ${BACKUP_DIR}"
fi

# 拉取最新代码
echo ""
log_info "拉取最新代码..."

if [ -d ".git" ]; then
    # Git 方式
    git fetch origin >> $LOG_FILE 2>&1
    
    # 显示更新内容
    log_info "更新日志:"
    git log --oneline HEAD..origin/main 2>/dev/null | head -5 || true
    
    git pull origin main >> $LOG_FILE 2>&1
    log_success "代码更新完成"
else
    log_warn "非 Git 仓库，跳过代码拉取"
    log_warn "请手动上传最新代码后重新执行"
fi

# 安装依赖
echo ""
log_info "检查依赖更新..."

if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --frozen-lockfile >> $LOG_FILE 2>&1
else
    pnpm install >> $LOG_FILE 2>&1
fi

log_success "依赖安装完成"

# 检查是否需要重新构建
REBUILD=false

# 检查是否有代码变更
if [ -d ".git" ]; then
    CHANGED_FILES=$(git diff --name-only HEAD@{1} HEAD 2>/dev/null || echo "")
    
    if echo "$CHANGED_FILES" | grep -qE "\.(tsx?|jsx?|css|scss|json)$|^(next\.config|tailwind\.config|tsconfig)"; then
        REBUILD=true
        log_info "检测到源码变更，需要重新构建"
    fi
fi

# 如果没有构建产物，也需要构建
if [ ! -d ".next" ]; then
    REBUILD=true
    log_info "缺少构建产物，需要构建"
fi

# 构建项目
if [ "$REBUILD" = true ]; then
    echo ""
    log_info "开始构建项目..."
    
    pnpm build >> $LOG_FILE 2>&1
    
    if [ $? -eq 0 ]; then
        log_success "项目构建完成"
    else
        log_error "项目构建失败，请检查日志"
        tail -n 20 $LOG_FILE
        exit 1
    fi
else
    log_success "无需重新构建"
fi

# 重启服务
echo ""
log_info "重启应用服务..."

pm2 restart $PROJECT_NAME >> $LOG_FILE 2>&1

if [ $? -eq 0 ]; then
    log_success "服务重启完成"
else
    log_error "服务重启失败，请检查日志"
    pm2 logs $PROJECT_NAME --lines 20
    exit 1
fi

# 健康检查
echo ""
log_info "执行健康检查..."
sleep 5

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    log_success "健康检查通过 (HTTP ${HTTP_CODE})"
else
    log_warn "健康检查异常 (HTTP ${HTTP_CODE})，请检查应用状态"
fi

# 清理旧备份
echo ""
log_info "清理旧备份文件..."

# 保留最近 5 个备份
BACKUP_COUNT=$(ls -d /www/backup/${PROJECT_NAME}_* 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 5 ]; then
    ls -dt /www/backup/${PROJECT_NAME}_* | tail -n +6 | xargs rm -rf
    log_success "已清理旧备份，保留最近 5 个"
else
    log_info "当前备份数量: ${BACKUP_COUNT}，无需清理"
fi

# 记录结束时间
END_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "[${END_TIME}] 更新完成" >> $LOG_FILE

# 输出部署信息
echo ""
echo "=========================================="
echo "  更新完成！"
echo "=========================================="
echo ""
echo "更新信息："
echo "  - 开始时间: ${START_TIME}"
echo "  - 结束时间: ${END_TIME}"
echo "  - 项目目录: ${PROJECT_DIR}"
echo "  - 是否重建: ${REBUILD}"
echo ""
echo "查看日志："
echo "  pm2 logs ${PROJECT_NAME}"
echo ""
