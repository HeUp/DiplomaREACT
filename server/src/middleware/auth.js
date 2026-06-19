const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'stroikontrol-secret-key-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'stroikontrol-refresh-secret-2026';

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, jti: uuidv4() },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, jti: uuidv4() },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  const token = header.split(' ')[1];

  // Accept demo tokens (demo-token-{id}, sqlite-token-{id})
  const demoMatch = token.match(/^(?:demo|sqlite)-token-(\d+)$/);
  if (demoMatch) {
    const { getDb, prepare } = require('../db');
    getDb().then(() => {
      const user = prepare('SELECT id, email, role FROM users WHERE id = ?').get(Number(demoMatch[1]));
      if (user) {
        req.user = { id: user.id, email: user.email, role: user.role };
        return next();
      }
      res.status(401).json({ message: 'Пользователь не найден' });
    }).catch(() => res.status(500).json({ message: 'Ошибка БД' }));
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Токен истёк или недействителен' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Недостаточно прав' });
    }
    next();
  };
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  authenticate,
  authorize,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
};
