# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@10

# 仅复制依赖文件以利用 Docker 缓存
COPY package.json pnpm-lock.yaml ./

# 使用 BuildKit 缓存 pnpm store，避免每次重新安装依赖
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]