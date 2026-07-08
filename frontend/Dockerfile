# Use a small official Node.js image to build the React frontend.
# 使用官方 Node.js 轻量镜像来构建 React 前端项目。
FROM node:20-alpine AS build

# Set the working directory inside the build container.
# 设置构建阶段容器内部的工作目录，后面的命令都会在 /app 目录下执行。
WORKDIR /app

# Copy npm dependency files first so Docker can cache the install layer.
# 先复制 package.json 和 package-lock.json，这样依赖没变时 Docker 可以复用缓存。
COPY package*.json ./

# Install frontend dependencies exactly from package-lock.json.
# 根据 package-lock.json 精确安装前端依赖，适合 Docker 和 CI 环境。
RUN npm ci

# Copy the rest of the React source code into the build container.
# 把前端项目源码复制到构建容器中。
COPY . .

# Build the React app into static production files.
# 执行前端生产构建，生成 dist 静态文件目录。
RUN npm run build

# Use a fresh Node.js image to serve the built frontend files.
# 使用一个新的 Node.js 轻量镜像来运行已经构建好的前端静态文件。
FROM node:20-alpine

# Set the working directory inside the runtime container.
# 设置运行阶段容器内部的工作目录。
WORKDIR /app

# Install a simple static file server.
# 安装 serve，用来提供 React build 后生成的静态文件。
RUN npm install -g serve

# Copy the built dist folder from the build stage into the runtime image.
# 从构建阶段复制 dist 静态文件到运行阶段镜像中。
COPY --from=build /app/dist ./dist

# Document that the frontend server listens on port 4173.
# 声明容器内前端服务使用 4173 端口。
EXPOSE 4173

# Start the static frontend server.
# 容器启动时使用 serve 运行 dist 目录中的前端页面。
CMD ["serve", "-s", "dist", "-l", "4173"]
