#!/bin/bash
# 低内存服务器优化脚本
# 为内存不足的服务器添加 swap 空间，加速构建

set -e

echo "🔧 低内存服务器优化脚本"
echo ""

# 检测当前内存
TOTAL_MEM=$(grep MemTotal /proc/meminfo | awk '{print $2}')
TOTAL_MEM_MB=$((TOTAL_MEM / 1024))

echo "📊 系统信息:"
echo "  总内存: ${TOTAL_MEM_MB}MB"
echo ""

# 检查是否已有 swap
SWAP_TOTAL=$(grep SwapTotal /proc/meminfo | awk '{print $2}')
SWAP_TOTAL_MB=$((SWAP_TOTAL / 1024))

if [ "$SWAP_TOTAL" -gt 100000 ]; then
  echo "✅ 已存在 swap 空间: ${SWAP_TOTAL_MB}MB"
  echo "   无需额外配置"
  exit 0
fi

echo "⚠️ 未检测到足够的 swap 空间"
echo ""

# 计算 swap 大小（建议 2GB）
SWAP_SIZE="2G"
SWAP_FILE="/swapfile"

echo "📝 将创建 ${SWAP_SIZE} 的 swap 文件"
echo "   文件位置: ${SWAP_FILE}"
echo ""

# 检查磁盘空间
DISK_AVAIL=$(df -k / | tail -1 | awk '{print $4}')
DISK_AVAIL_GB=$((DISK_AVAIL / 1024 / 1024))

if [ "$DISK_AVAIL_GB" -lt 3 ]; then
  echo "❌ 磁盘空间不足（需要至少3GB，当前${DISK_AVAIL_GB}GB可用）"
  echo "   跳过 swap 创建"
  exit 0
fi

echo "💾 磁盘可用空间: ${DISK_AVAIL_GB}GB"
echo ""

# 创建 swap 文件
echo "🔨 创建 swap 文件..."
sudo fallocate -l ${SWAP_SIZE} ${SWAP_FILE} 2>/dev/null || \
  sudo dd if=/dev/zero of=${SWAP_FILE} bs=1M count=2048 status=progress

# 设置权限
sudo chmod 600 ${SWAP_FILE}

# 格式化为 swap
sudo mkswap ${SWAP_FILE}

# 启用 swap
sudo swapon ${SWAP_FILE}

# 添加到 fstab（可选，重启后自动挂载）
if ! grep -q "${SWAP_FILE}" /etc/fstab; then
  echo "${SWAP_FILE} none swap sw 0 0" | sudo tee -a /etc/fstab
fi

echo ""
echo "✅ Swap 创建成功！"

# 显示新的内存状态
echo ""
echo "📊 新的内存状态:"
free -h

echo ""
echo "💡 提示："
echo "   - Swap 已添加，构建时会自动使用"
echo "   - 重启后 swap 会自动挂载"
echo "   - 如需删除 swap: sudo swapoff ${SWAP_FILE} && sudo rm ${SWAP_FILE}"
