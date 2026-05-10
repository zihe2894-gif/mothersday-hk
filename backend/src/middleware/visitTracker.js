import { getDB, saveDB } from '../db/init.js';

export function visitTracker(req, res, next) {
  // 记录 API 访问
  const originalJson = res.json.bind(res);
  res.json = function(body) {
    // 在响应后记录
    process.nextTick(() => {
      try {
        const db = getDB();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        db.run(
          `INSERT INTO visits (ip, user_agent, referrer, page_url, created_at) VALUES (?, ?, ?, ?, ?)`,
          [
            req.ip || req.headers['x-forwarded-for'] || 'unknown',
            req.headers['user-agent'] || '',
            req.headers['referer'] || '',
            req.originalUrl
          ]
        );
        saveDB();
      } catch(e) { /* silent */ }
    });
    return originalJson(body);
  };
  next();
}
