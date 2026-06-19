const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { getDb, prepare } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    await getDb();
    const users = prepare(
      'SELECT id, full_name, email, role, phone, profile_picture, created_at FROM users ORDER BY id'
    ).all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    await getDb();
    const { full_name, password, role, phone } = req.body;
    const email = (req.body.email || '').toLowerCase();

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Имя, email и пароль обязательны' });
    }

    const existing = prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = prepare(
      'INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)'
    ).run(full_name, email, hash, role || 'foreman', phone || '');

    const user = prepare(
      'SELECT id, full_name, email, role, phone, profile_picture, created_at FROM users WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await getDb();
    const id = Number(req.params.id);
    const existing = prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ message: 'Пользователь не найден' });

    if (req.body.email) req.body.email = req.body.email.toLowerCase();
    const allowed = ['full_name', 'email', 'role', 'phone'];
    const updates = [];
    const values = [];
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }
    if (req.body.password) {
      updates.push('password_hash = ?');
      values.push(bcrypt.hashSync(req.body.password, 10));
    }
    if (updates.length) {
      values.push(id);
      prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const user = prepare(
      'SELECT id, full_name, email, role, phone, profile_picture, created_at FROM users WHERE id = ?'
    ).get(id);

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await getDb();
    const id = Number(req.params.id);
    const existing = prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ message: 'Пользователь не найден' });

    if (id === req.user.id) {
      return res.status(400).json({ message: 'Нельзя удалить самого себя' });
    }

    prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
