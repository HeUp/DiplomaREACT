import { TASK_STATUS, MATERIAL_REQUEST_STATUS } from '../types';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const mock = {
  tasks: [
    { id: 1, title: 'Устройство фундамента', description: 'Заливка фундамента для секции А', project_id: 1, projectName: 'ЖК Рассвет', objectName: 'ЖК Рассвет', objectAddress: 'ул. Строителей, 10', assignee_id: 3, assigneeName: 'Прораб Иванов', creator_id: 2, status: TASK_STATUS.IN_PROGRESS, priority: 'high', workType: 'Монолитные работы', planned_end_date: '2026-06-15T00:00:00.000Z', actual_end_date: null, parent_task_id: null, transitions: [{ toStatus: TASK_STATUS.ASSIGNED, timestamp: '2026-05-10T08:00:00Z', userName: 'Руководитель проекта', comment: 'Назначено' }, { toStatus: TASK_STATUS.ACCEPTED, timestamp: '2026-05-11T07:30:00Z', userName: 'Прораб Иванов', comment: 'Принято' }, { toStatus: TASK_STATUS.IN_PROGRESS, timestamp: '2026-05-12T09:00:00Z', userName: 'Прораб Иванов', comment: 'Начаты работы' }] },
    { id: 2, title: 'Монтаж перекрытий', description: 'Установка плит перекрытия этажи 1-3', project_id: 1, projectName: 'ЖК Рассвет', objectName: 'ЖК Рассвет', assignee_id: 3, assigneeName: 'Прораб Иванов', creator_id: 2, status: TASK_STATUS.ASSIGNED, priority: 'critical', workType: 'Монтажные работы', planned_end_date: '2026-06-30T00:00:00.000Z', parent_task_id: null, transitions: [{ toStatus: TASK_STATUS.ASSIGNED, timestamp: '2026-05-15T10:00:00Z', userName: 'Руководитель проекта', comment: 'Срочная задача' }] },
    { id: 3, title: 'Штукатурка стен', description: 'Внутренняя отделка помещений', project_id: 2, projectName: 'Бизнес-центр', objectName: 'Бизнес-центр', assignee_id: 3, assigneeName: 'Прораб Иванов', creator_id: 2, status: TASK_STATUS.COMPLETED, priority: 'medium', workType: 'Отделочные работы', planned_end_date: '2026-05-20T00:00:00.000Z', actual_end_date: '2026-05-18T16:00:00.000Z', parent_task_id: null, transitions: [{ toStatus: TASK_STATUS.ASSIGNED, timestamp: '2026-05-01T08:00:00Z', userName: 'Руководитель проекта', comment: '' }, { toStatus: TASK_STATUS.ACCEPTED, timestamp: '2026-05-02T07:00:00Z', userName: 'Прораб Иванов', comment: '' }, { toStatus: TASK_STATUS.IN_PROGRESS, timestamp: '2026-05-03T09:00:00Z', userName: 'Прораб Иванов', comment: '' }, { toStatus: TASK_STATUS.COMPLETED, timestamp: '2026-05-18T16:00:00Z', userName: 'Прораб Иванов', comment: 'Работы выполнены в срок' }] },
    { id: 4, title: 'Кровельные работы', description: 'Монтаж кровли основного корпуса', project_id: 2, projectName: 'Бизнес-центр', objectName: 'Бизнес-центр', assignee_id: 3, assigneeName: 'Прораб Иванов', creator_id: 2, status: TASK_STATUS.ON_HOLD, priority: 'high', workType: 'Кровельные работы', planned_end_date: '2026-06-10T00:00:00.000Z', parent_task_id: null, transitions: [{ toStatus: TASK_STATUS.ASSIGNED, timestamp: '2026-05-05T08:00:00Z', userName: 'Руководитель проекта', comment: '' }, { toStatus: TASK_STATUS.ACCEPTED, timestamp: '2026-05-06T07:00:00Z', userName: 'Прораб Иванов', comment: '' }, { toStatus: TASK_STATUS.IN_PROGRESS, timestamp: '2026-05-07T09:00:00Z', userName: 'Прораб Иванов', comment: '' }, { toStatus: TASK_STATUS.ON_HOLD, timestamp: '2026-05-14T12:00:00Z', userName: 'Прораб Иванов', comment: 'Приостановлено из-за погодных условий' }] },
    { id: 5, title: 'Установка окон', description: 'Остекление фасада', project_id: 1, projectName: 'ЖК Рассвет', objectName: 'ЖК Рассвет', assignee_id: 3, assigneeName: 'Прораб Иванов', creator_id: 2, status: TASK_STATUS.DRAFT, priority: 'low', workType: 'Фасадные работы', planned_end_date: '2026-07-01T00:00:00.000Z', parent_task_id: null, transitions: [] },
    { id: 6, title: 'Устройство стяжки (подзадача)', description: 'Стяжка пола в секции А', project_id: 1, projectName: 'ЖК Рассвет', objectName: 'ЖК Рассвет', assignee_id: 3, assigneeName: 'Прораб Иванов', creator_id: 2, status: TASK_STATUS.ASSIGNED, priority: 'medium', workType: 'Отделочные работы', planned_end_date: '2026-06-20T00:00:00.000Z', parent_task_id: 1, transitions: [{ toStatus: TASK_STATUS.ASSIGNED, timestamp: '2026-05-16T11:00:00Z', userName: 'Руководитель проекта', comment: 'Подзадача фундамента' }] },
  ],
  materials: [
    { id: 1, materialName: 'Бетон М300', quantity: 120, unit: 'м³', status: MATERIAL_REQUEST_STATUS.DELIVERED, objectName: 'ЖК Рассвет', taskTitle: 'Устройство фундамента', comment: 'Для фундамента секции А', createdAt: '2026-05-08T10:00:00Z' },
    { id: 2, materialName: 'Арматура 12мм', quantity: 5, unit: 'т', status: MATERIAL_REQUEST_STATUS.IN_STOCK, objectName: 'ЖК Рассвет', taskTitle: 'Устройство фундамента', comment: '', createdAt: '2026-05-09T14:00:00Z' },
    { id: 3, materialName: 'Плиты перекрытия ПК-63', quantity: 20, unit: 'шт', status: MATERIAL_REQUEST_STATUS.NEW, objectName: 'ЖК Рассвет', taskTitle: 'Монтаж перекрытий', comment: 'Срочно', createdAt: '2026-05-15T09:00:00Z' },
    { id: 4, materialName: 'Цемент М500', quantity: 2, unit: 'т', status: MATERIAL_REQUEST_STATUS.PROCESSING, objectName: 'Бизнес-центр', taskTitle: 'Штукатурка стен', comment: '', createdAt: '2026-05-12T11:00:00Z' },
  ],
  users: [
    { id: 1, full_name: 'Администратор', email: 'Sxnctified@gmail.com', role: 'admin', phone: '+7-900-111-11-11' },
    { id: 2, full_name: 'Руководитель проекта', email: 'manager@test.ru', role: 'manager', phone: '+7-900-222-22-22' },
    { id: 3, full_name: 'Прораб Иванов', email: 'foreman@test.ru', role: 'foreman', phone: '+7-900-333-33-33' },
    { id: 4, full_name: 'Снабженец Петров', email: 'supplier@test.ru', role: 'supplier', phone: '+7-900-444-44-44' },
  ],
  projects: [
    { id: 1, name: 'ЖК Рассвет', address: 'ул. Строителей, 10', start_date: '2026-01-15', end_date: '2026-12-31', status: 'in_progress', manager_id: 2 },
    { id: 2, name: 'Бизнес-центр', address: 'пр. Мира, 25', start_date: '2026-03-01', end_date: '2026-11-30', status: 'in_progress', manager_id: 2 },
  ],
  nextId: { tasks: 7, materials: 5, users: 5, projects: 3 },
};

const find = (arr) => ({ byId: (id) => arr.find((x) => x.id === Number(id)), filter: (fn) => arr.filter(fn) });

export const mockApi = {
  tasks: {
    getAll: async (params = {}) => {
      await delay();
      let result = [...mock.tasks];
      if (params.assignee_id) result = result.filter((t) => t.assignee_id === Number(params.assignee_id));
      if (params.status) result = result.filter((t) => t.status === params.status);
      if (params.summary) {
        const total = result.length;
        const completed = result.filter((t) => t.status === 'completed' || t.status === 'approved').length;
        const onHold = result.filter((t) => t.status === 'on_hold').length;
        return { total, completed, onHold, criticalDeviations: result.filter((t) => t.priority === 'critical' && t.status !== 'completed' && t.status !== 'approved').length };
      }
      return result.map((t) => ({ ...t, ...(params.assignee_id ? {} : {}) }));
    },
    getById: async (id) => { await delay(); const t = find(mock.tasks).byId(id); if (!t) throw new Error('Not found'); return t; },
    create: async (data) => { await delay(); const t = { id: mock.nextId.tasks++, ...data, transitions: [], status: data.status || TASK_STATUS.DRAFT }; mock.tasks.push(t); return t; },
    update: async (id, data) => { await delay(); const idx = mock.tasks.findIndex((t) => t.id === Number(id)); if (idx === -1) throw new Error('Not found'); Object.assign(mock.tasks[idx], data); return mock.tasks[idx]; },
    transitionStatus: async (id, { to, comment }) => { await delay(); const t = find(mock.tasks).byId(id); if (!t) throw new Error('Not found'); const old = t.status; t.status = to; if (to === TASK_STATUS.COMPLETED) t.actual_end_date = new Date().toISOString(); if (!t.transitions) t.transitions = []; t.transitions.push({ toStatus: to, oldStatus: old, timestamp: new Date().toISOString(), userName: 'Пользователь', comment: comment || '' }); return t; },
    uploadPhoto: async () => { await delay(); return { ok: true }; },
  },
  materials: {
    getAll: async () => { await delay(); return [...mock.materials]; },
    create: async (data) => { await delay(); const m = { id: mock.nextId.materials++, ...data, status: MATERIAL_REQUEST_STATUS.NEW, createdAt: new Date().toISOString() }; mock.materials.push(m); return m; },
    updateStatus: async (id, status) => { await delay(); const idx = mock.materials.findIndex((m) => m.id === Number(id)); if (idx === -1) throw new Error('Not found'); mock.materials[idx].status = status; return mock.materials[idx]; },
    getSummary: async () => { await delay(); return mock.materials.map((m) => ({ ...m, id: undefined })); },
  },
  users: {
    getAll: async () => { await delay(); return [...mock.users]; },
    create: async (data) => { await delay(); const u = { id: mock.nextId.users++, ...data }; mock.users.push(u); return u; },
    update: async (id, data) => { await delay(); const idx = mock.users.findIndex((u) => u.id === Number(id)); if (idx === -1) throw new Error('Not found'); Object.assign(mock.users[idx], data); return mock.users[idx]; },
    delete: async (id) => { await delay(); const idx = mock.users.findIndex((u) => u.id === Number(id)); if (idx === -1) throw new Error('Not found'); mock.users.splice(idx, 1); return { ok: true }; },
  },
  projects: {
    getAll: async () => { await delay(); return [...mock.projects]; },
    getById: async (id) => { await delay(); return find(mock.projects).byId(id); },
    create: async (data) => { await delay(); const p = { id: mock.nextId.projects++, ...data }; mock.projects.push(p); return p; },
    update: async (id, data) => { await delay(); const idx = mock.projects.findIndex((p) => p.id === Number(id)); if (idx === -1) throw new Error('Not found'); Object.assign(mock.projects[idx], data); return mock.projects[idx]; },
  },
};
