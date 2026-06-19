const { Router } = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { getDb, prepare } = require('../db');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  authenticate,
} = require('../middleware/auth');

const profileStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, `profile_${req.user.id}${path.extname(file.originalname)}`);
  },
});
const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения (jpg, jpeg, png, gif, webp)'));
    }
  },
});

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').toLowerCase();
    const password = req.body.password;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    await getDb();
    const user = prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    prepare("DELETE FROM refresh_tokens WHERE user_id = ? OR expires_at < datetime('now')").run(user.id);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(
      user.id, refreshToken, expiresAt
    );

    const { password_hash, ...safe } = user;
    res.json({ accessToken, refreshToken, user: safe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token обязателен' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    await getDb();

    const stored = prepare(
      'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?'
    ).get(refreshToken, decoded.id);

    if (!stored) {
      return res.status(401).json({ message: 'Refresh token недействителен' });
    }

    prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);

    const user = prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    prepare('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(
      user.id, newRefreshToken, expiresAt
    );

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    return res.status(401).json({ message: 'Refresh token истёк или недействителен' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    await getDb();
    const user = prepare('SELECT id, full_name, email, role, phone, profile_picture, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/profile', authenticate, async (req, res) => {
  try {
    await getDb();
    const { full_name, currentPassword, newPassword } = req.body;
    const email = (req.body.email || '').toLowerCase() || undefined;
    const user = prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    if (email && email !== user.email) {
      const existing = prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) return res.status(409).json({ message: 'Этот email уже используется' });
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Введите текущий пароль' });
      if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
        return res.status(400).json({ message: 'Неверный текущий пароль' });
      }
      if (newPassword.length < 4) return res.status(400).json({ message: 'Новый пароль должен быть минимум 4 символа' });
    }

    const updates = [];
    const values = [];
    if (full_name !== undefined) { updates.push('full_name = ?'); values.push(full_name); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (newPassword) { updates.push('password_hash = ?'); values.push(bcrypt.hashSync(newPassword, 10)); }

    if (updates.length) {
      values.push(user.id);
      prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = prepare('SELECT id, full_name, email, role, phone, profile_picture, created_at FROM users WHERE id = ?').get(user.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/profile/photo', authenticate, profileUpload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Файл не загружен' });

    await getDb();
    prepare('UPDATE users SET profile_picture = ? WHERE id = ?').run(req.file.filename, req.user.id);
    res.json({ profile_picture: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
