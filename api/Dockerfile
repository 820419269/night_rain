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

# 复制构建好的 jar 包
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]