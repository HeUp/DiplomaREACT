export const ROLES = {
  FOREMAN: 'foreman',
  MANAGER: 'manager',
  SUPPLIER: 'supplier',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.FOREMAN]: 'Прораб',
  [ROLES.MANAGER]: 'Руководитель проекта',
  [ROLES.SUPPLIER]: 'Снабженец',
  [ROLES.ADMIN]: 'Администратор',
};

export const TASK_STATUS = {
  DRAFT: 'draft',
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  APPROVED: 'approved',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.DRAFT]: 'Черновик',
  [TASK_STATUS.ASSIGNED]: 'Назначена',
  [TASK_STATUS.ACCEPTED]: 'Принята к исполнению',
  [TASK_STATUS.IN_PROGRESS]: 'В работе',
  [TASK_STATUS.ON_HOLD]: 'Приостановлена',
  [TASK_STATUS.COMPLETED]: 'Завершена',
  [TASK_STATUS.APPROVED]: 'Принята',
};

export const TASK_STATUS_COLORS = {
  [TASK_STATUS.DRAFT]: 'default',
  [TASK_STATUS.ASSIGNED]: 'info',
  [TASK_STATUS.ACCEPTED]: 'primary',
  [TASK_STATUS.IN_PROGRESS]: 'warning',
  [TASK_STATUS.ON_HOLD]: 'error',
  [TASK_STATUS.COMPLETED]: 'success',
  [TASK_STATUS.APPROVED]: 'success',
};

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.PLANNING]: 'Проектирование',
  [PROJECT_STATUS.IN_PROGRESS]: 'Строительство',
  [PROJECT_STATUS.COMPLETED]: 'Завершён',
};

export const MATERIAL_REQUEST_STATUS = {
  NEW: 'new',
  PROCESSING: 'processing',
  ORDERED: 'ordered',
  IN_STOCK: 'in_stock',
  DELIVERED: 'delivered',
};

export const MATERIAL_REQUEST_STATUS_LABELS = {
  [MATERIAL_REQUEST_STATUS.NEW]: 'Новая',
  [MATERIAL_REQUEST_STATUS.PROCESSING]: 'Принята в обработку',
  [MATERIAL_REQUEST_STATUS.ORDERED]: 'Заказана у поставщика',
  [MATERIAL_REQUEST_STATUS.IN_STOCK]: 'Ожидается на складе',
  [MATERIAL_REQUEST_STATUS.DELIVERED]: 'Доставлена на объект',
};

export const MATERIAL_REQUEST_STATUS_COLORS = {
  [MATERIAL_REQUEST_STATUS.NEW]: 'error',
  [MATERIAL_REQUEST_STATUS.PROCESSING]: 'info',
  [MATERIAL_REQUEST_STATUS.ORDERED]: 'warning',
  [MATERIAL_REQUEST_STATUS.IN_STOCK]: 'primary',
  [MATERIAL_REQUEST_STATUS.DELIVERED]: 'success',
};
