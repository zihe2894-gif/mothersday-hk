export function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: '文件大小超过限制 (最大 10MB)' });
  }

  if (err.message?.includes('mime type')) {
    return res.status(415).json({ error: '不支持的文件类型，请上传 mp3/wav/ogg' });
  }

  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误'
  });
}
