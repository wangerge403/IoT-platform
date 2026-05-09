import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import deviceRouter from './routes/device.js';
import emailRouter from './routes/email.js';
import permissionRouter from './routes/permission.js';

const app = express();

// CORS 中间件 - 允许来自前端开发服务器的跨域请求
app.use(cors({ origin: true }));

// JSON 请求体解析
app.use(express.json());

// 挂载路由
app.use(authRouter);
app.use(deviceRouter);
app.use(emailRouter);
app.use(permissionRouter);

// 启动服务
app.listen(8082, () => {
  console.log('IoT 后端服务已启动，监听端口 8082');
});

export default app;
