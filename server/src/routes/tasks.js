const { Router } = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { getDb, prepare } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения (jpg, jpeg, png, gif, webp, bmp)'));
    }
  },
});

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    await getDb();
    let sql = `
      SELECT t.*, p.name as projectName, p.name as objectName, p.address as objectAddress,
             u.full_name as assigneeName
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (req.query.assignee_id) {
      sql += ' AND t.assignee_id = ?';
      params.push(Number(req.query.assignee_id));
    }
    if (req.query.status) {
      sql += ' AND t.status = ?';
      params.push(req.query.status);
    }

    if (req.query.summary) {
      sql += ' ORDER BY t.id';
      const tasks = prepare(sql).all(...params);
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed' || t.status === 'approved').length;
      const onHold = tasks.filter(t => t.status === 'on_hold').length;
      const criticalDeviations = tasks.filter(
        t => t.priority === 'critical' && t.status !== 'completed' && t.status !== 'approved'
      ).length;
      return res.json({ total, completed, onHold, criticalDeviations });
    }

    sql += ' ORDER BY t.id';
    const tasks = prepare(sql).all(...params);

    for (const task of tasks) {
      task.transitions = prepare(`
        SELECT l.*, u.full_name as userName
        FROM task_status_logs l
        LEFT JOIN users u ON l.changed_by = u.id
        WHERE l.task_id = ?
        ORDER BY l.changed_at
      `).all(task.id);
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    await getDb();
    const task = prepare(`
      SELECT t.*, p.name as projectName, p.name as objectName, p.address as objectAddress,
             u.full_name as assigneeName
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `).get(Number(req.params.id));

    if (!task) return res.status(404).json({ message: 'Задача не найдена' });

    task.transitions = prepare(`
      SELECT l.*, u.full_name as userName
      FROM task_status_logs l
      LEFT JOIN users u ON l.changed_by = u.id
      WHERE l.task_id = ?
      ORDER BY l.changed_at
    `).all(task.id);

    task.photos = prepare('SELECT * FROM task_files WHERE task_id = ?').all(task.id);

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticate, authorize('manager', 'admin', 'foreman'), async (req, res) => {
  try {
    await getDb();
    const {
      title, description, project_id, assignee_id, creator_id,
      parent_task_id, status, priority, work_type, planned_end_date, workType
    } = req.body;

    if (!title) return res.status(400).json({ message: 'Название задачи обязательно' });

    const result = prepare(`
      INSERT INTO tasks (title, description, project_id, assignee_id, creator_id, parent_task_id, status, priority, work_type, planned_end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, description || '', project_id || null, assignee_id || null,
      creator_id || null, parent_task_id || null,
      status || 'draft', priority || 'medium', workType || work_type || '',
      planned_end_date || ''
    );

    const task = prepare(`
      SELECT t.*, p.name as projectName, u.full_name as assigneeName
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);

    task.transitions = [];
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', authenticate, authorize('manager', 'admin', 'foreman'), async (req, res) => {
  try {
    await getDb();
    const id = Number(req.params.id);
    const existing = prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ message: 'Задача не найдена' });

    const allowed = [
      'title', 'description', 'project_id', 'assignee_id', 'status',
      'priority', 'work_type', 'planned_end_date', 'actual_end_date', 'parent_task_id'
    ];
    const updates = [];
    const values = [];
    for (const field of allowed) {
      const v = req.body[field];
      if (v !== undefined) {
        updates.push(`${field} = ?`);
        values.push(v);
      }
    }
    if (updates.length) {
      values.push(id);
      prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const task = prepare(`
      SELECT t.*, p.name as projectName, p.name as objectName, p.address as objectAddress,
             u.full_name as assigneeName
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `).get(id);

    task.transitions = prepare(`
      SELECT l.*, u.full_name as userName
      FROM task_status_logs l
      LEFT JOIN users u ON l.changed_by = u.id
      WHERE l.task_id = ?
      ORDER BY l.changed_at
    `).all(id);

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/transition', authenticate, async (req, res) => {
  try {
    await getDb();
    const id = Number(req.params.id);
    const { to, comment } = req.body;

    if (!to) return res.status(400).json({ message: 'Целевой статус обязателен' });

    const task = prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ message: 'Задача не найдена' });

    const oldStatus = task.status;
    prepare('UPDATE tasks SET status = ?, actual_end_date = CASE WHEN ? = ? THEN datetime(\'now\') ELSE actual_end_date END WHERE id = ?')
      .run(to, to, 'completed', id);

    prepare(
      'INSERT INTO task_status_logs (task_id, old_status, new_status, changed_by, comment) VALUES (?, ?, ?, ?, ?)'
    ).run(id, oldStatus, to, req.user.id, (comment || '').slice(0, 500));

    const updated = prepare(`
      SELECT t.*, p.name as projectName, p.name as objectName, p.address as objectAddress,
             u.full_name as assigneeName
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = ?
    `).get(id);

    updated.transitions = prepare(`
      SELECT l.*, u.full_name as userName
      FROM task_status_logs l
      LEFT JOIN users u ON l.changed_by = u.id
      WHERE l.task_id = ?
      ORDER BY l.changed_at
    `).all(id);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticate, authorize('manager', 'admin'), async (req, res) => {
  try {
    await getDb();
    const id = Number(req.params.id);
    const existing = prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ message: 'Задача не найдена' });

    prepare('DELETE FROM task_files WHERE task_id = ?').run(id);
    prepare('DELETE FROM task_status_logs WHERE task_id = ?').run(id);
    prepare('DELETE FROM tasks WHERE id = ?').run(id);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/photos', authenticate, upload.array('photos', 10), async (req, res) => {
  try {
    await getDb();
    const id = Number(req.params.id);
    const task = prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) return res.status(404).json({ message: 'Задача не найдена' });

    if (!req.files || !req.files.length) return res.status(400).json({ message: 'Файлы не загружены' });

    const files = [];
    for (const file of req.files) {
      prepare(
        'INSERT INTO task_files (task_id, file_name, file_path) VALUES (?, ?, ?)'
      ).run(id, file.filename, file.path);
      files.push(file.filename);
    }

    res.json({ ok: true, files });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
