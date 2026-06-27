const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { migrate } = require('./db');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const materialRoutes = require('./routes/materials');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : undefined;
app.use(cors({
  origin: allowedOrigins || true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/users', userRoutes);

const BUILD_DIR = path.join(__dirname, '..', '..', 'build');
if (fs.existsSync(BUILD_DIR)) {
  app.use(express.static(BUILD_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
    res.sendFile(path.join(BUILD_DIR, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('[Error]', err);
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

migrate().then(() => {
  console.log('[DB] Migrated and ready');
  app.listen(PORT, () => {
    console.log(`[Server] СтройКонтроль backend запущен на http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('[DB] Migration failed:', err);
  process.exit(1);
});
