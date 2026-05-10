import { Router } from 'express';
import { getDB } from '../db/init.js';

const router = Router();

router.get('/visits', (req, res) => {
  const db = getDB();
  const days = parseInt(req.query.days || '7');

  // 总访问量
  const totalResult = db.exec("SELECT COUNT(*) as total FROM visits");
  const total = totalResult[0].values[0][0];

  // 独立 IP 数
  const uniqueResult = db.exec("SELECT COUNT(DISTINCT ip) as unique_count FROM visits");
  const uniqueCount = uniqueResult[0].values[0][0];

  // 每日访问量
  const dailyResult = db.exec(`
    SELECT DATE(created_at) as day, COUNT(*) as count
    FROM visits
    WHERE created_at >= DATE('now', '-${days} days')
    GROUP BY DATE(created_at)
    ORDER BY day DESC
  `);

  const daily = dailyResult.length > 0
    ? dailyResult[0].values.map(row => ({ day: row[0], count: row[1] }))
    : [];

  res.json({ total, unique: uniqueCount, daily });
});

router.get('/shares', (req, res) => {
  const db = getDB();
  const result = db.exec(`
    SELECT code, created_at, visit_count, expires_at
    FROM share_links
    ORDER BY created_at DESC
    LIMIT 50
  `);

  const shares = result.length > 0
    ? result[0].values.map(row => ({
        code: row[0],
        createdAt: row[1],
        visitCount: row[2],
        expiresAt: row[3]
      }))
    : [];

  res.json(shares);
});

export default router;
