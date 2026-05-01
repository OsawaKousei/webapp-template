#!/bin/sh

# 所有権を固定 (nodeユーザー)
UID_GID="1000:1000"
PROJECT_NAME="webapp-template" # docker-composeのプロジェクト名に合わせて調整

echo "初期化します..."

echo "ボリュームの権限を修正中..."
docker run --rm -v ${PROJECT_NAME}_api-node-modules:/v alpine chown -R $UID_GID /v
docker run --rm -v ${PROJECT_NAME}_frontend-node-modules:/v alpine chown -R $UID_GID /v

echo "ソースコードの権限を修正中..."
docker run --rm -v "$(pwd):/mnt" alpine chown -R $UID_GID /mnt

echo "Backend (API) の依存関係をインストール中..."
docker run --rm \
  -u $UID_GID \
  -v "${PROJECT_NAME}_api-node-modules:/home/node/app/node_modules" \
  -v "$(pwd)/backend/api/app:/home/node/app" \
  -v "$(pwd)/shared/types:/home/node/app/shared/types" \
  -w /home/node/app \
  node:22-slim \
  npm install

echo "Frontend の依存関係をインストール中..."
docker run --rm \
  -u $UID_GID \
  -v "${PROJECT_NAME}_frontend-node-modules:/home/node/app/node_modules" \
  -v "$(pwd)/frontend/app:/home/node/app" \
  -v "$(pwd)/shared/types:/home/node/app/shared/types" \
  -w /home/node/app \
  node:22-slim \
  npm install

echo "コンテナを起動します..."
docker compose up --build

echo "完了！"