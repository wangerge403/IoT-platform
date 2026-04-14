# IoT-platform

IoT 智慧物联网云平台，基于 Vue 3 + Element Plus 前端 和 Node.js + Express 后端的全栈项目。

## 技术栈

- 前端：Vue 3 + Vue Router + Element Plus + ECharts + Axios
- 后端：Node.js + Express（内存 Mock 数据）
- 构建工具：Vite

## 功能模块

- 用户登录 / 注册 / 密码重置
- 设备管理（增删查）
- 报警信息（分级展示、处理标记）
- 数据分析（在线趋势、能耗统计、设备分布）
- 系统设置（个人信息、系统配置、修改密码）
- 通知消息（实时报警推送面板）

## 快速开始

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..

# 启动后端服务（端口 8082）
cd server && node app.js

# 启动前端开发服务器（新终端）
npm run dev
```

默认账号：`admin` / `123456`

## 项目结构

```
├── src/                  # 前端源码
│   ├── views/            # 页面组件
│   ├── router/           # 路由配置
│   ├── assets/           # 静态资源
│   └── main.js           # 入口文件
├── server/               # 后端服务
│   ├── app.js            # Express 入口
│   ├── routes/           # API 路由
│   └── store/            # 内存数据存储
├── index.html
├── vite.config.js
└── package.json
```

## License

MIT
