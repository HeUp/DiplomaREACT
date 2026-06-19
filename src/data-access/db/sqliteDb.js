const DB_KEY = 'stroikontrol_db_v2';
let db = null;
let SQL = null;
let ready = false;
let initPromise = null;

const esc = (v) => (v || '').replace(/'/g, "''");
const delay = (ms = 15) => new Promise(r => setTimeout(r, ms));

export const initDB = async () => {
  if (ready && db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const initSqlJs = await import('sql.js');
      SQL = await initSqlJs.default({ locateFile: f => `${process.env.PUBLIC_URL || ''}/${f}` });
    } catch (e) {
      console.warn('[DB] sql.js init failed, trying CDN...', e?.message);
      SQL = await import(/* webpackIgnore: true */ 'https://sql.js.org/dist/sql-wasm.js').then(m => m.default ? m.default() : m());
      if (typeof SQL === 'function') SQL = await SQL({ locateFile: () => 'https://sql.js.org/dist/sql-wasm.wasm' });
    }

    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const arr = new Uint8Array(JSON.parse(saved));
        db = new SQL.Database(arr);
        // verify it has our tables
        const r = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
        if (r.length) { ready = true; return db; }
      } catch { /* corrupted - recreate */ }
    }

    db = new SQL.Database();
    createSchema();
    seedData();
    saveDb();
    ready = true;
    return db;
  })();

  return initPromise;
};

function createSchema() {
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, full_name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT 'foreman', phone TEXT DEFAULT '', profile_picture TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')))`);
  try { db.run("ALTER TABLE users ADD COLUMN profile_picture TEXT DEFAULT ''"); } catch {}
  db.run(`CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, address TEXT DEFAULT '', start_date TEXT, end_date TEXT, status TEXT DEFAULT 'planning', manager_id INTEGER REFERENCES users(id))`);
  db.run(`CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT DEFAULT '', project_id INTEGER REFERENCES projects(id), assignee_id INTEGER REFERENCES users(id), creator_id INTEGER REFERENCES users(id), parent_task_id INTEGER REFERENCES tasks(id), status TEXT DEFAULT 'draft', priority TEXT DEFAULT 'medium', work_type TEXT DEFAULT '', planned_end_date TEXT, actual_end_date TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS task_files (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id INTEGER NOT NULL REFERENCES tasks(id), file_name TEXT NOT NULL, file_path TEXT NOT NULL, uploaded_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS task_status_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id INTEGER NOT NULL REFERENCES tasks(id), old_status TEXT, new_status TEXT NOT NULL, changed_by INTEGER REFERENCES users(id), changed_at TEXT DEFAULT (datetime('now')), comment TEXT DEFAULT '')`);
  db.run(`CREATE TABLE IF NOT EXISTS materials (id INTEGER PRIMARY KEY AUTOINCREMENT, material_name TEXT NOT NULL, quantity REAL NOT NULL DEFAULT 1, unit TEXT DEFAULT 'шт.', status TEXT DEFAULT 'new', object_name TEXT DEFAULT '', task_title TEXT DEFAULT '', comment TEXT DEFAULT '', created_by INTEGER REFERENCES users(id), created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS ref_work_types (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)`);
  db.run(`CREATE TABLE IF NOT EXISTS ref_task_templates (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)`);
}

function seedData() {
  const i = (sql) => { try { db.run(sql); } catch {} };
  i("INSERT OR IGNORE INTO users (id,full_name,email,password_hash,role,phone) VALUES (1,'Администратор','Sxnctified@gmail.com','Sxnctified','admin','+7-900-111-11-11')");
  i("INSERT OR IGNORE INTO users (id,full_name,email,password_hash,role,phone) VALUES (2,'Руководитель проекта','manager@test.ru','123456','manager','+7-900-222-22-22')");
  i("INSERT OR IGNORE INTO users (id,full_name,email,password_hash,role,phone) VALUES (3,'Прораб Иванов','foreman@test.ru','123456','foreman','+7-900-333-33-33')");
  i("INSERT OR IGNORE INTO users (id,full_name,email,password_hash,role,phone) VALUES (4,'Снабженец Петров','supplier@test.ru','123456','supplier','+7-900-444-44-44')");
  i("INSERT OR IGNORE INTO projects (id,name,address,start_date,end_date,status,manager_id) VALUES (1,'ЖК Рассвет','ул. Строителей, 10','2026-01-15','2026-12-31','in_progress',2)");
  i("INSERT OR IGNORE INTO projects (id,name,address,start_date,end_date,status,manager_id) VALUES (2,'Бизнес-центр','пр. Мира, 25','2026-03-01','2026-11-30','in_progress',2)");
  i("INSERT OR IGNORE INTO tasks (id,title,description,project_id,assignee_id,creator_id,status,priority,work_type,planned_end_date) VALUES (1,'Устройство фундамента','Заливка фундамента для секции А',1,3,2,'in_progress','high','Монолитные работы','2026-06-15')");
  i("INSERT OR IGNORE INTO tasks (id,title,description,project_id,assignee_id,creator_id,status,priority,work_type,planned_end_date) VALUES (2,'Монтаж перекрытий','Установка плит перекрытия этажи 1-3',1,3,2,'assigned','critical','Монтажные работы','2026-06-30')");
  i("INSERT OR IGNORE INTO tasks (id,title,description,project_id,assignee_id,creator_id,status,priority,work_type,planned_end_date) VALUES (3,'Штукатурка стен','Внутренняя отделка помещений',2,3,2,'completed','medium','Отделочные работы','2026-05-20')");
  i("INSERT OR IGNORE INTO tasks (id,title,description,project_id,assignee_id,creator_id,status,priority,work_type,planned_end_date) VALUES (4,'Кровельные работы','Монтаж кровли основного корпуса',2,3,2,'on_hold','high','Кровельные работы','2026-06-10')");
  i("INSERT OR IGNORE INTO tasks (id,title,description,project_id,assignee_id,creator_id,status,priority,work_type,planned_end_date) VALUES (5,'Установка окон','Остекление фасада',1,null,2,'draft','low','Фасадные работы','2026-07-01')");
  i("INSERT OR IGNORE INTO tasks (id,title,description,project_id,assignee_id,creator_id,status,priority,work_type,planned_end_date) VALUES (6,'Устройство стяжки (подзадача)','Стяжка пола в секции А',1,3,2,'assigned','medium','Отделочные работы','2026-06-20')");
  i("UPDATE tasks SET parent_task_id=1 WHERE id=6");
  i("INSERT OR IGNORE INTO materials (id,material_name,quantity,unit,status,object_name,task_title,comment) VALUES (1,'Бетон М300',120,'м³','delivered','ЖК Рассвет','Устройство фундамента','Для фундамента секции А')");
  i("INSERT OR IGNORE INTO materials (id,material_name,quantity,unit,status,object_name,task_title,comment) VALUES (2,'Арматура 12мм',5,'т','in_stock','ЖК Рассвет','Устройство фундамента','')");
  i("INSERT OR IGNORE INTO materials (id,material_name,quantity,unit,status,object_name,task_title,comment) VALUES (3,'Плиты перекрытия ПК-63',20,'шт','new','ЖК Рассвет','Монтаж перекрытий','Срочно')");
  i("INSERT OR IGNORE INTO materials (id,material_name,quantity,unit,status,object_name,task_title,comment) VALUES (4,'Цемент М500',2,'т','processing','Бизнес-центр','Штукатурка стен','')");
  i("INSERT OR IGNORE INTO ref_work_types (id,name) VALUES (1,'Монолитные работы'),(2,'Кирпичная кладка'),(3,'Отделочные работы'),(4,'Кровельные работы'),(5,'Фасадные работы'),(6,'Инженерные сети'),(7,'Электромонтажные работы')");
  i("INSERT OR IGNORE INTO ref_task_templates (id,name) VALUES (1,'Устройство фундамента'),(2,'Монтаж перекрытий'),(3,'Отделка помещений')");
  const logs = [
    [1,1,'draft','assigned',2,'Назначено'],[2,1,'assigned','accepted',3,'Принято'],[3,1,'accepted','in_progress',3,'Начаты работы'],
    [4,2,'draft','assigned',2,'Срочная задача'],[5,3,'draft','assigned',2,''],[6,3,'assigned','accepted',3,''],
    [7,3,'accepted','in_progress',3,''],[8,3,'in_progress','completed',3,'Работы выполнены в срок'],
    [9,4,'draft','assigned',2,''],[10,4,'assigned','accepted',3,''],[11,4,'accepted','in_progress',3,''],
    [12,4,'in_progress','on_hold',3,'Приостановлено из-за погодных условий'],[13,6,'draft','assigned',2,'Подзадача фундамента'],
  ];
  for (const l of logs) {
    i(`INSERT OR IGNORE INTO task_status_logs (id,task_id,old_status,new_status,changed_by,comment) VALUES (${l[0]},${l[1]},'${l[2]}','${l[3]}',${l[4]},'${l[5]}')`);
  }
}

function saveDb() {
  if (!db) return;
  try { localStorage.setItem(DB_KEY, JSON.stringify(Array.from(db.export()))); } catch {}
}

function q(sql, params = {}) {
  if (!db) throw new Error('DB not ready');
  const stmt = db.prepare(sql);
  if (Object.keys(params).length) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function exec(sql) {
  if (!db) throw new Error('DB not ready');
  db.run(sql);
  saveDb();
}

function lastInsertId() {
  return db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
}

// ═══════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════

export const dbApi = {
  query: async (sql, params = {}) => { await delay(); await initDB(); return q(sql, params); },
  execute: async (sql) => { await delay(); await initDB(); exec(sql); },

  users: {
    getAll: async () => { await delay(); await initDB(); return q("SELECT * FROM users ORDER BY id"); },
    getById: async (id) => { await delay(); await initDB(); const r = q("SELECT * FROM users WHERE id=?", {1: Number(id)}); return r[0]; },
    create: async (d) => { await delay(); await initDB(); exec(`INSERT INTO users (full_name,email,password_hash,role,phone) VALUES ('${esc(d.full_name)}','${esc(d.email)}','${esc(d.password||'')}','${esc(d.role||'foreman')}','${esc(d.phone||'')}')`); return q("SELECT * FROM users WHERE id=?", {1: lastInsertId()})[0]; },
    update: async (id, d) => { await delay(); await initDB(); const sets = Object.entries(d).filter(([k]) => !['id','password'].includes(k)).map(([k,v]) => `${k}='${esc(v)}'`).join(','); if (sets) exec(`UPDATE users SET ${sets} WHERE id=${Number(id)}`); return q("SELECT * FROM users WHERE id=?", {1: Number(id)})[0]; },
    delete: async (id) => { await delay(); await initDB(); exec(`DELETE FROM users WHERE id=${Number(id)}`); return {ok:true}; },
  },

  tasks: {
    getAll: async (params = {}) => {
      await delay(); await initDB();
      let sql = "SELECT t.*, p.name as objectName, p.name as projectName, p.address as objectAddress, u.full_name as assignedToName, u.full_name as assigneeName FROM tasks t LEFT JOIN projects p ON t.project_id=p.id LEFT JOIN users u ON t.assignee_id=u.id WHERE 1=1";
      if (params.assignee_id) sql += ` AND t.assignee_id=${Number(params.assignee_id)}`;
      if (params.status) sql += ` AND t.status='${params.status}'`;
      sql += " ORDER BY t.id";
      const tasks = q(sql);
      if (params.summary) {
        const total=tasks.length, comp=tasks.filter(t=>t.status==='completed'||t.status==='approved').length;
        return {total,completed:comp,onHold:tasks.filter(t=>t.status==='on_hold').length,criticalDeviations:tasks.filter(t=>t.priority==='critical'&&t.status!=='completed'&&t.status!=='approved').length};
      }
      for (const t of tasks) {
        t.transitions = q(`SELECT l.*, u.full_name as userName FROM task_status_logs l LEFT JOIN users u ON l.changed_by=u.id WHERE l.task_id=${t.id} ORDER BY l.changed_at`);
      }
      return tasks;
    },
    getById: async (id) => { const all = await dbApi.tasks.getAll(); return all.find(t => t.id === Number(id)); },
    create: async (d) => { await delay(); await initDB(); exec(`INSERT INTO tasks (title,description,project_id,assignee_id,creator_id,parent_task_id,status,priority,work_type,planned_end_date) VALUES ('${esc(d.title)}','${esc(d.description||'')}',${d.project_id||null},${d.assignee_id||null},${d.creator_id||null},${d.parent_task_id||null},'${esc(d.status||'draft')}','${esc(d.priority||'medium')}','${esc(d.workType||'')}','${esc(d.planned_end_date||'')}')`); return q("SELECT * FROM tasks WHERE id=?", {1: lastInsertId()})[0]; },
    update: async (id, d) => { await delay(); await initDB(); const allowed=['title','description','project_id','assignee_id','status','priority','work_type','planned_end_date','actual_end_date','parent_task_id']; const sets = Object.entries(d).filter(([k]) => allowed.includes(k)).map(([k,v]) => `${k}=${v === null ? 'NULL' : `'${esc(v)}'`}`).join(','); if (sets) exec(`UPDATE tasks SET ${sets} WHERE id=${Number(id)}`); return dbApi.tasks.getById(id); },
    transitionStatus: async (id, {to, comment}) => {
      await delay(); await initDB();
      const t = q(`SELECT * FROM tasks WHERE id=${Number(id)}`)[0];
      if (!t) throw new Error('Not found');
      exec(`UPDATE tasks SET status='${to}'${to==='completed'?",actual_end_date=datetime('now')":''} WHERE id=${Number(id)}`);
      exec(`INSERT INTO task_status_logs (task_id,old_status,new_status,changed_by,comment) VALUES (${Number(id)},'${t.status}','${to}',3,'${(comment||'').replace(/'/g,"''")}')`);
      return dbApi.tasks.getById(id);
    },
    uploadPhoto: async () => true,
  },

  materials: {
    getAll: async () => { await delay(); await initDB(); return q("SELECT id, material_name as materialName, quantity, unit, status, object_name as objectName, task_title as taskTitle, comment, created_by, created_at FROM materials ORDER BY id"); },
    create: async (d) => { await delay(); await initDB(); exec(`INSERT INTO materials (material_name,quantity,unit,status,object_name,task_title,comment) VALUES ('${esc(d.materialName)}',${d.quantity},'${esc(d.unit||'шт.')}','new','${esc(d.objectName||'')}','${esc(d.taskTitle||'')}','${esc(d.comment||'')}')`); return q("SELECT * FROM materials WHERE id=?", {1: lastInsertId()})[0]; },
    updateStatus: async (id, st) => { await delay(); await initDB(); exec(`UPDATE materials SET status='${esc(st)}' WHERE id=${Number(id)}`); return q("SELECT * FROM materials WHERE id=?", {1: Number(id)})[0]; },
    getSummary: async () => { await delay(); await initDB(); return q("SELECT material_name as materialName, object_name as objectName, quantity, unit, status FROM materials ORDER BY object_name, material_name"); },
  },

  projects: {
    getAll: async () => { await delay(); await initDB(); return q("SELECT * FROM projects ORDER BY id"); },
    getById: async (id) => { await delay(); await initDB(); const r = q("SELECT * FROM projects WHERE id=?", {1: Number(id)}); return r[0]; },
    create: async (d) => { await delay(); await initDB(); exec(`INSERT INTO projects (name,address,start_date,end_date,status,manager_id) VALUES ('${esc(d.name)}','${esc(d.address||'')}','${esc(d.start_date||'')}','${esc(d.end_date||'')}','${esc(d.status||'planning')}',${d.manager_id||null})`); return q("SELECT * FROM projects WHERE id=?", {1: lastInsertId()})[0]; },
    update: async (id, d) => { await delay(); await initDB(); const allowed=['name','address','start_date','end_date','status','manager_id']; const sets = Object.entries(d).filter(([k]) => allowed.includes(k)).map(([k,v]) => `${k}=${v === null ? 'NULL' : `'${esc(v)}'`}`).join(','); if (sets) exec(`UPDATE projects SET ${sets} WHERE id=${Number(id)}`); return q("SELECT * FROM projects WHERE id=?", {1: Number(id)})[0]; },
  },

  references: {
    getWorkTypes: async () => { await delay(); await initDB(); return q("SELECT * FROM ref_work_types ORDER BY id"); },
    addWorkType: async (name) => { await delay(); await initDB(); try { exec(`INSERT INTO ref_work_types (name) VALUES ('${esc(name)}')`); return true; } catch { return false; } },
    deleteWorkType: async (id) => { await delay(); await initDB(); exec(`DELETE FROM ref_work_types WHERE id=${Number(id)}`); },
    getTemplates: async () => { await delay(); await initDB(); return q("SELECT * FROM ref_task_templates ORDER BY id"); },
    addTemplate: async (name) => { await delay(); await initDB(); try { exec(`INSERT INTO ref_task_templates (name) VALUES ('${esc(name)}')`); return true; } catch { return false; } },
    deleteTemplate: async (id) => { await delay(); await initDB(); exec(`DELETE FROM ref_task_templates WHERE id=${Number(id)}`); },
  },

  exportDB: async () => { await initDB(); saveDb(); if (!db) return null; return new Uint8Array(db.export()); },

  importDB: async (file) => {
    const buf = await file.arrayBuffer();
    const arr = new Uint8Array(buf);
    localStorage.setItem(DB_KEY, JSON.stringify(Array.from(arr)));
    db = null; ready = false; initPromise = null;
    await initDB();
  },

  resetDB: async () => {
    localStorage.removeItem(DB_KEY);
    db = null; ready = false; initPromise = null;
    await initDB();
  },

  getStats: () => {
    if (!db) return { users: 0, projects: 0, tasks: 0, materials: 0 };
    const tables = ['users','projects','tasks','materials'];
    const s = {};
    tables.forEach(t => { const r = db.exec(`SELECT COUNT(*) FROM ${t}`); s[t] = r[0]?.values[0][0] || 0; });
    return s;
  },
};

export default dbApi;
