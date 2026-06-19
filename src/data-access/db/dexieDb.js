import Dexie from 'dexie';

const db = new Dexie('ConstructionTasksDB');

db.version(1).stores({
  tasks: 'id, status, assignedTo, objectId, createdAt',
  materials: 'id, status, createdBy, taskId',
  offlineActions: '++id, type, entityType, entityId, createdAt, synced',
});

export const saveOfflineAction = async (action) => {
  return db.offlineActions.add({
    ...action,
    createdAt: new Date().toISOString(),
    synced: false,
  });
};

export const getUnsyncedActions = async () => {
  return db.offlineActions
    .where('synced')
    .equals(false)
    .toArray();
};

export const markActionSynced = async (id) => {
  return db.offlineActions.update(id, { synced: true });
};

export const cacheTasks = async (tasks) => {
  await db.tasks.bulkPut(tasks);
};

export const getCachedTasks = async () => {
  return db.tasks.toArray();
};

export const cacheMaterials = async (materials) => {
  await db.materials.bulkPut(materials);
};

export const getCachedMaterials = async () => {
  return db.materials.toArray();
};

export default db;
