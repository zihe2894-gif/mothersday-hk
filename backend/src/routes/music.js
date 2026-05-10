import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config.js';
import { getDB, saveDB } from '../db/init.js';

// 确保上传目录存在
const musicDir = path.resolve(config.uploadDir, 'music');
if (!fs.existsSync(musicDir)) {
  fs.mkdirSync(musicDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, musicDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp3';
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (req, file, cb) => {
    if (config.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`不支持的文件类型: ${file.mimetype}`));
    }
  }
});

const router = Router();

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传文件' });
  }

  const db = getDB();
  db.run(
    `INSERT INTO music_files (filename, original_name, mime_type, file_size) VALUES (?, ?, ?, ?)`,
    [req.file.filename, req.file.originalname, req.file.mimetype, req.file.size]
  );

  const result = db.exec("SELECT last_insert_rowid() as id");
  const id = result[0].values[0][0];

  // 自动设为活动音乐
  db.run("UPDATE config SET value = ? WHERE key = 'active_music_id'", [String(id)]);
  saveDB();

  res.json({
    id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: `/uploads/music/${req.file.filename}`
  });
});

router.get('/:id', (req, res) => {
  const db = getDB();
  const result = db.exec(
    "SELECT * FROM music_files WHERE id = ?",
    [parseInt(req.params.id)]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return res.status(404).json({ error: '音乐文件不存在' });
  }

  const row = result[0].values[0];
  const cols = result[0].columns;
  const file = {};
  cols.forEach((col, i) => { file[col] = row[i]; });

  res.json(file);
});

export default router;
