#!/usr/bin/env bash
# 固定端口 3000，重启前结束占用该端口的进程
PORT=3000
echo "结束端口 $PORT 上的进程..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
sleep 1
echo "启动 read 开发服务 (http://localhost:$PORT)..."
cd "$(dirname "$0")/.."
PORT=$PORT npm run dev
