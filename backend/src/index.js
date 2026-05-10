import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initDB } from './db/init.js';
import { visitTracker } from './middleware/visitTracker.js';
import { errorHandler } from './middleware/errorHandler.js';
import configRouter from './routes/config.js';
import musicRouter from './routes/music.js';
import shareRouter from './routes/share.js';
import statsRouter from './routes/stats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// 中间件
app.use(cors({ origin: config.corsOrigin }));
app.use(morgan('dev'));
app.use(express.json());

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: '请求过于频繁，请稍后再试' }
});
app.use('/api/', limiter);

// 访问统计 (仅 API)
app.use('/api', visitTracker);

// 静态文件 - 前端构建产物
app.use(express.static(path.join(__dirname, '..', 'public')));

// 上传文件访问
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// API 路由
app.use('/api/config', configRouter);
app.use('/api/music', musicRouter);
app.use('/api/share', shareRouter);
app.use('/api/stats', statsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// SPA fallback - 前端路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 错误处理
app.use(errorHandler);

// 启动
async function start() {
  try {
    await initDB();
    console.log('Database initialized');

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`CORS origin: ${config.corsOrigin}`);
    });
  } catch (err) {
    console.error('Failed to start:', err);
    process.exit(1);
  }
}

start();
