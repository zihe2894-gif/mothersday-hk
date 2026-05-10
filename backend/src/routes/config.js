import { Router } from 'express';
import { getDB } from '../db/init.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDB();
  const result = db.exec("SELECT key, value FROM config");
  const configObj = {};
  if (result.length > 0) {
    for (const row of result[0].values) {
      configObj[row[0]] = row[1];
    }
  }

  // 如果有 active_music_id，构造 musicUrl
  let musicUrl = null;
  if (configObj.active_music_id) {
    const musicResult = db.exec(
      "SELECT filename FROM music_files WHERE id = ?",
      [parseInt(configObj.active_music_id)]
    );
    if (musicResult.length > 0 && musicResult[0].values.length > 0) {
      musicUrl = `/uploads/music/${musicResult[0].values[0][0]}`;
    }
  }

  res.json({
    siteName: configObj.site_name || '母亲节快乐',
    musicUrl
  });
});

export default router;
