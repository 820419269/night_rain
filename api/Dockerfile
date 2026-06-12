# syntax=docker/dockerfile:1.4
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# 仅复制 pom.xml 以利用 Docker 缓存
COPY pom.xml .

# 使用 BuildKit 缓存 Maven 依赖，避免每次重新下载
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn dependency:go-offline -B

# 复制源代码
COPY src ./src

# 构建应用，同样使用缓存
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 复制构建好的 jar 包
COPY --from=builder /app/target/*.jar app.jar

# 创建上传目录
RUN mkdir -p /app/uploads/videos

EXPOSE 8080

# 使用 exec form 避免信号处理问题
ENTRYPOINT ["sh", "-c", "java -jar app.jar"]
