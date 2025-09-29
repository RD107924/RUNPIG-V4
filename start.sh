#!/bin/bash
echo "��� 啟動小跑豬海運系統..."

# 檢查 node_modules
if [ ! -d "node_modules" ]; then
  echo "��� 安裝依賴..."
  npm install
fi

# 檢查資料庫
if [ ! -f "prisma/dev.db" ]; then
  echo "���️ 初始化資料庫..."
  npx prisma generate
  npx prisma db push
fi

# 啟動系統
echo "✅ 系統啟動中..."
npm run dev
