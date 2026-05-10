export const config = {
  port: parseInt(process.env.PORT || '3000'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  dbPath: process.env.DB_PATH || './data/database.sqlite',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
};
