const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'stroikontrol.db');
let db = null;
let SQL = null;

async function getDb() {
  if (db) return db;

  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function q(sql, params = []) {
  if (!db) throw new Error('DB not ready');
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function exec(sql, params = []) {
  if (!db) throw new Error('DB not ready');
  if (params.length) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
  saveDb();
}

function lastInsertId() {
  const r = db.exec("SELECT last_insert_rowid() as id");
  return r[0].values[0][0];
}

function prepare(sql) {
  return {
    run(...params) {
      const stmt = db.prepare(sql);
      if (params.length) stmt.bind(params);
      stmt.step();
      stmt.free();
      const info = db.exec("SELECT changes() as changes, last_insert_rowid() as id");
      saveDb();
      return {
        lastInsertRowid: info[0].values[0][1],
        changes: info[0].values[0][0],
      };
    },
    get(...params) {
      const rows = q(sql, params);
      return rows[0] || null;
    },
    all(...params) {
      return q(sql, params);
    },
  };
}

async function migrate() {
  const db = await getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'foreman',
      phone TEXT DEFAULT '',
      profile_picture TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  try { db.run("ALTER TABLE users ADD COLUMN profile_picture TEXT DEFAULT ''"); } catch {}

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT DEFAULT '',
      start_date TEXT,
      end_date TEXT,
      status TEXT DEFAULT 'planning',
      manager_id INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      project_id INTEGER REFERENCES projects(id),
      assignee_id INTEGER REFERENCES users(id),
      creator_id INTEGER REFERENCES users(id),
      parent_task_id INTEGER REFERENCES tasks(id),
      status TEXT DEFAULT 'draft',
      priority TEXT DEFAULT 'medium',
      work_type TEXT DEFAULT '',
      planned_end_date TEXT,
      actual_end_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS task_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id),
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS task_status_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL REFERENCES tasks(id),
      old_status TEXT,
      new_status TEXT NOT NULL,
      changed_by INTEGER REFERENCES users(id),
      changed_at TEXT DEFAULT (datetime('now')),
      comment TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_name TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1,
      unit TEXT DEFAULT 'шт.',
      status TEXT DEFAULT 'new',
      object_name TEXT DEFAULT '',
      task_title TEXT DEFAULT '',
      comment TEXT DEFAULT '',
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const count = q('SELECT COUNT(*) as c FROM users')[0];
  if (count.c === 0) {
    await seed();
  }

  saveDb();
}

async function seed() {
  const bcrypt = require('bcryptjs');
  const hash = (pwd) => bcrypt.hashSync(pwd, 10);

  exec('INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Администратор', 'Sxnctified@gmail.com', hash('Sxnctified'), 'admin', '+7-900-111-11-11']);
  exec('INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Руководитель проекта', 'manager@test.ru', hash('123456'), 'manager', '+7-900-222-22-22']);
  exec('INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Прораб Иванов', 'foreman@test.ru', hash('123456'), 'foreman', '+7-900-333-33-33']);
  exec('INSERT INTO users (full_name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
    ['Снабженец Петров', 'supplier@test.ru', hash('123456'), 'supplier', '+7-900-444-44-44']);

  exec('INSERT INTO projects (name, address, start_date, end_date, status, manager_id) VALUES (?, ?, ?, ?, ?, ?)',
    ['ЖК Рассвет', 'ул. Строителей, 10', '2026-01-15', '2026-12-31', 'in_progress', 2]);
  exec('INSERT INTO projects (name, address, start_date, end_date, status, manager_id) VALUES (?, ?, ?, ?, ?, ?)',
    ['Бизнес-центр', 'пр. Мира, 25', '2026-03-01', '2026-11-30', 'in_progress', 2]);

  exec('INSERT INTO tasks (title, description, project_id, assignee_id, creator_id, status, priority, work_type, planned_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['Устройство фундамента', 'Заливка фундамента для секции А', 1, 3, 2, 'in_progress', 'high', 'Монолитные работы', '2026-06-15']);
  exec('INSERT INTO tasks (title, description, project_id, assignee_id, creator_id, status, priority, work_type, planned_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['Монтаж перекрытий', 'Установка плит перекрытия этажи 1-3', 1, 3, 2, 'assigned', 'critical', 'Монтажные работы', '2026-06-30']);
  exec('INSERT INTO tasks (title, description, project_id, assignee_id, creator_id, status, priority, work_type, planned_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['Штукатурка стен', 'Внутренняя отделка помещений', 2, 3, 2, 'completed', 'medium', 'Отделочные работы', '2026-05-20']);
  exec('INSERT INTO tasks (title, description, project_id, assignee_id, creator_id, status, priority, work_type, planned_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['Кровельные работы', 'Монтаж кровли основного корпуса', 2, 3, 2, 'on_hold', 'high', 'Кровельные работы', '2026-06-10']);
  exec('INSERT INTO tasks (title, description, project_id, assignee_id, creator_id, status, priority, work_type, planned_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['Установка окон', 'Остекление фасада', 1, null, 2, 'draft', 'low', 'Фасадные работы', '2026-07-01']);
  exec('INSERT INTO tasks (title, description, project_id, assignee_id, creator_id, status, priority, work_type, planned_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['Устройство стяжки (подзадача)', 'Стяжка пола в секции А', 1, 3, 2, 'assigned', 'medium', 'Отделочные работы', '2026-06-20']);

  exec('UPDATE tasks SET parent_task_id = 1 WHERE id = 6');

  exec('INSERT INTO materials (material_name, quantity, unit, status, object_name, task_title, comment) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Бетон М300', 120, 'м³', 'delivered', 'ЖК Рассвет', 'Устройство фундамента', 'Для фундамента секции А']);
  exec('INSERT INTO materials (material_name, quantity, unit, status, object_name, task_title, comment) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Арматура 12мм', 5, 'т', 'in_stock', 'ЖК Рассвет', 'Устройство фундамента', '']);
  exec('INSERT INTO materials (material_name, quantity, unit, status, object_name, task_title, comment) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Плиты перекрытия ПК-63', 20, 'шт', 'new', 'ЖК Рассвет', 'Монтаж перекрытий', 'Срочно']);
  exec('INSERT INTO materials (material_name, quantity, unit, status, object_name, task_title, comment) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Цемент М500', 2, 'т', 'processing', 'Бизнес-центр', 'Штукатурка стен', '']);

  const logs = [
    [1, 'draft', 'assigned', 2, 'Назначено'],
    [1, 'assigned', 'accepted', 3, 'Принято'],
    [1, 'accepted', 'in_progress', 3, 'Начаты работы'],
    [2, 'draft', 'assigned', 2, 'Срочная задача'],
    [3, 'draft', 'assigned', 2, ''],
    [3, 'assigned', 'accepted', 3, ''],
    [3, 'accepted', 'in_progress', 3, ''],
    [3, 'in_progress', 'completed', 3, 'Работы выполнены в срок'],
    [4, 'draft', 'assigned', 2, ''],
    [4, 'assigned', 'accepted', 3, ''],
    [4, 'accepted', 'in_progress', 3, ''],
    [4, 'in_progress', 'on_hold', 3, 'Приостановлено из-за погодных условий'],
    [6, 'draft', 'assigned', 2, 'Подзадача фундамента'],
  ];
  for (const [taskId, oldSt, newSt, changedBy, comment] of logs) {
    exec(
      'INSERT INTO task_status_logs (task_id, old_status, new_status, changed_by, comment) VALUES (?, ?, ?, ?, ?)',
      [taskId, oldSt, newSt, changedBy, comment]
    );
  }
}

module.exports = { getDb, migrate, prepare, q, exec };
