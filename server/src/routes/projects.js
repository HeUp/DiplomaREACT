const { Router } = require('express');
const { getDb, prepare } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    await getDb();
    const projects = prepare('SELECT * FROM projects ORDER BY id').all();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    await getDb();
    const project = prepare('SELECT * FROM projects WHERE id = ?').get(Number(req.params.id));
    if (!project) return res.status(404).json({ message: 'Проект не найден' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    await getDb();
    const { name, address, start_date, end_date, status, manager_id } = req.body;
    if (!name) return res.status(400).json({ message: 'Название проекта обязательно' });

    const result = prepare(
      'INSERT INTO projects (name, address, start_date, end_date, status, manager_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, address || '', start_date || '', end_date || '', status || 'planning', manager_id || null);

    const project = prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    await getDb();
    const id = Number(req.params.id);
    const existing = prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ message: 'Проект не найден' });

    const allowed = ['name', 'address', 'start_date', 'end_date', 'status', 'manager_id'];
    const updates = [];
    const values = [];
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }
    if (updates.length) {
      values.push(id);
      prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const project = prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
