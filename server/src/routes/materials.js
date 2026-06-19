const { Router } = require('express');
const { getDb, prepare } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    await getDb();
    const materials = prepare(`
      SELECT id, material_name as materialName, quantity, unit, status,
             object_name as objectName, task_title as taskTitle, comment,
             created_by, created_at
      FROM materials ORDER BY id
    `).all();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/summary', authenticate, async (req, res) => {
  try {
    await getDb();
    const materials = prepare(`
      SELECT material_name as materialName, object_name as objectName,
             quantity, unit, status
      FROM materials ORDER BY object_name, material_name
    `).all();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('foreman', 'manager', 'admin', 'supplier'), async (req, res) => {
  try {
    await getDb();
    const { materialName, quantity, unit, objectName, taskTitle, comment } = req.body;

    if (!materialName) {
      return res.status(400).json({ message: 'Название материала обязательно' });
    }

    const result = prepare(`
      INSERT INTO materials (material_name, quantity, unit, status, object_name, task_title, comment, created_by)
      VALUES (?, ?, ?, 'new', ?, ?, ?, ?)
    `).run(
      materialName, quantity || 1, unit || 'шт.',
      objectName || '', taskTitle || '', comment || '',
      req.user.id
    );

    const material = prepare('SELECT * FROM materials WHERE id = ?').get(result.lastInsertRowid);
    material.materialName = material.material_name;
    material.objectName = material.object_name;
    material.taskTitle = material.task_title;

    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/status', authenticate, authorize('supplier', 'manager', 'admin'), async (req, res) => {
  try {
    await getDb();
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: 'Статус обязателен' });

    const existing = prepare('SELECT * FROM materials WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ message: 'Заявка на материал не найдена' });

    prepare('UPDATE materials SET status = ? WHERE id = ?').run(status, id);

    const material = prepare(`
      SELECT id, material_name as materialName, quantity, unit, status,
             object_name as objectName, task_title as taskTitle, comment,
             created_by, created_at
      FROM materials WHERE id = ?
    `).get(id);

    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
