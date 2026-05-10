import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

export async function initDB() {
  const SQL = await initSqlJs();
  const dbPath = path.resolve(config.dbPath);
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // 执行 schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.run(schema);

  // 种子数据
  const existing = db.exec("SELECT key FROM config WHERE key = 'site_name'");
  if (existing.length === 0) {
    db.run("INSERT INTO config (key, value) VALUES (?, ?)", ['site_name', '母亲节快乐']);
    db.run("INSERT INTO config (key, value) VALUES (?, ?)", ['active_music_id', '']);
  }

  saveDB();
  return db;
}

export function getDB() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(config.dbPath, buffer);
}
