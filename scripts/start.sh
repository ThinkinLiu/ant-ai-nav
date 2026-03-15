#!/bin/bash

# 蚂蚁AI导航 - 生产环境启动脚本

PORT=${PORT:-3000}

echo "🚀 Starting production server on port $PORT..."

pnpm start
