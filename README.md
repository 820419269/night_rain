# 羽毛球动作分析系统

一款专为羽毛球教学设计的视频分析软件，帮助教练和学员分析动作，提高训练效率。

## 功能特性

- **视频上传与管理**: 支持拖拽上传羽毛球训练视频
- **动作标注**: 手动标注关键动作（发球、正手、反手、扣杀、放网、网前）
- **智能分析**: 计算综合评分和动作成功率
- **数据统计**: 图表展示训练进展和动作分布
- **报告生成**: 导出训练分析报告

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Chart.js
- Zustand (状态管理)
- React Router

### 后端
- Spring Boot 3
- Java 17+
- MySQL Community
- Maven

## 项目结构

```
/workspace
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── services/          # API 服务
│   ├── stores/             # Zustand 状态管理
│   └── types/             # TypeScript 类型定义
├── api/                   # 后端源代码
│   ├── src/main/java/
│   │   └── com/badminton/
│   │       ├── controller/  # REST 控制器
│   │       ├── service/     # 业务逻辑
│   │       ├── repository/  # 数据访问层
│   │       ├── model/       # 实体类
│   │       └── config/      # 配置类
│   ├── src/main/resources/
│   │   └── application.yml  # 应用配置
│   └── database/
│       └── init.sql         # 数据库初始化脚本
└── uploads/                # 视频存储目录
```

## 快速开始

### 1. 环境要求

- Node.js 18+
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 数据库设置

```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化脚本
source api/database/init.sql
```

### 3. 后端启动

```bash
# 进入后端目录
cd api

# 构建项目
mvn clean install

# 启动应用
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 4. 前端启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

前端应用将在 http://localhost:5173 启动

### 5. 访问应用

打开浏览器访问 http://localhost:5173

## 使用说明

### 上传视频
1. 在首页点击上传区域或拖拽视频文件
2. 填写视频标题和描述
3. 点击"开始分析"按钮

### 标注动作
1. 进入视频分析页面
2. 使用视频播放器的控制按钮定位到关键动作帧
3. 点击"添加动作"按钮
4. 选择动作类型、设置评分和状态
5. 添加备注说明

### 查看分析
1. 系统自动计算综合评分和成功率
2. 在右侧面板查看分析结果
3. 填写训练总结
4. 点击"保存分析"按钮

### 数据统计
1. 点击顶部"数据统计"进入统计页面
2. 查看动作分布、成功率和评分趋势图表
3. 根据训练建议优化训练计划

## API 接口

### 视频管理
- `POST /api/videos/upload` - 上传视频
- `GET /api/videos` - 获取视频列表
- `GET /api/videos/:id` - 获取视频详情
- `DELETE /api/videos/:id` - 删除视频

### 分析管理
- `POST /api/analyses` - 创建分析
- `GET /api/analyses` - 获取分析列表
- `GET /api/analyses/:id` - 获取分析详情
- `PUT /api/analyses/:id` - 更新分析
- `GET /api/analyses/stats` - 获取统计数据

## 数据库配置

在 `api/src/main/resources/application.yml` 中配置数据库连接：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/badminton_analysis
    username: root
    password: your_password
```

## 注意事项

- 视频文件大小限制: 500MB
- 支持格式: MP4, AVI, MOV, MKV
- 建议视频时长: 30秒 - 2分钟
- 上传视频时建议包含正面和侧面视角

## License

MIT License
