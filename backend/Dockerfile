# Use a small official Python image as the base runtime for the Django backend.
# 使用官方 Python 轻量镜像，作为 Django 后端的基础运行环境。
FROM python:3.12-slim

# Prevent Python from writing .pyc cache files.
# 禁止 Python 生成 .pyc 缓存文件，避免容器里出现不必要的缓存文件。
ENV PYTHONDONTWRITEBYTECODE=1

# Force Python logs to print immediately instead of being buffered.
# 让 Python 日志立即输出到终端，方便在 Docker logs 中实时查看后端运行情况。
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container.
# 设置容器内部的工作目录，后面的命令都会在 /app 目录下执行。
WORKDIR /app

# Copy the dependency list first so Docker can cache the install layer.
# 先复制依赖清单 requirements.txt，这样依赖没变时 Docker 可以复用缓存，加快构建速度。
COPY requirements.txt .

# Install Python dependencies from requirements.txt.
# 根据 requirements.txt 安装 Django 后端需要的 Python 依赖包。
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project source code into the container.
# 把当前 backend 目录下的项目代码复制到容器的 /app 目录中。
COPY . .

# Document that the Django app listens on port 8000.
# 声明容器内后端服务使用 8000 端口。
EXPOSE 8000

# Apply database migrations, then start the Django app with Gunicorn.
# 容器启动时先执行数据库迁移，然后用 Gunicorn 启动 Django 后端服务。
CMD ["sh", "-c", "python manage.py migrate && gunicorn tasksphere.wsgi:application --bind 0.0.0.0:8000"]
