import { Router } from 'express';
import { nanoid } from 'nanoid';
import { getDB, saveDB } from '../db/init.js';

const router = Router();

// 创建分享链接
router.post('/', (req, res) => {
  const { expiresInHours } = req.body;
  const code = nanoid(8);
  const db = getDB();

  let expiresAt = null;
  if (expiresInHours) {
    const date = new Date();
    date.setHours(date.getHours() + expiresInHours);
    expiresAt = date.toISOString().replace('T', ' ').substring(0, 19);
  }

  db.run(
    "INSERT INTO share_links (code, expires_at) VALUES (?, ?)",
    [code, expiresAt]
  );
  saveDB();

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({
    code,
    url: `${baseUrl}/?share=${code}`
  });
});

// 访问分享链接 (重定向)
router.get('/:code', (req, res) => {
  const db = getDB();
  const result = db.exec(
    "SELECT * FROM share_links WHERE code = ?",
    [req.params.code]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(404).json({ error: '分享链接不存在' });
  }

  const row = result[0].values[0];
  const cols = result[0].columns;
  const link = {};
  cols.forEach((col, i) => { link[col] = row[i]; });

  // 检查过期
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return res.status(410).json({ error: '分享链接已过期' });
  }

  // 增加访问计数
  db.run("UPDATE share_links SET visit_count = visit_count + 1 WHERE code = ?", [req.params.code]);
  saveDB();

  // 重定向到首页
  res.redirect('/');
});

export default router;
