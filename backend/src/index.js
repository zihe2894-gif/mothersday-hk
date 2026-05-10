import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';
import { config } from './config.js';
import { initDB } from './db/init.js';
import { visitTracker } from './middleware/visitTracker.js';
import { errorHandler } from './middleware/errorHandler.js';
import configRouter from './routes/config.js';
import musicRouter from './routes/music.js';
import shareRouter from './routes/share.js';
import statsRouter from './routes/stats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const COS_BASE = 'https://mothersday-1388989467.cos.accelerate.myqcloud.com';

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

// COS 代理 - 解决浏览器跨域问题
app.get('/api/cos/*', (req, res) => {
  const cosPath = req.path.replace('/api/cos/', '');
  const cosUrl = `${COS_BASE}/${cosPath}`;
  https.get(cosUrl, (cosRes) => {
    if (cosRes.statusCode !== 200) {
      res.status(cosRes.statusCode).json({ error: 'COS proxy failed' });
      return;
    }
    res.set('Content-Type', cosRes.headers['content-type'] || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000');
    cosRes.pipe(res);
  }).on('error', (err) => {
    res.status(502).json({ error: 'COS proxy error' });
  });
});

// SPA fallback - 前端路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 错误处理
app.use(errorHandler);

// SCF 入口
export const main_handler = serverless(app);

// 本地开发启动
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

// 非 SCF 环境直接启动
if (!process.env.SCF_FUNCTION_NAME) {
  start();
}
