import axiosClient from './axiosClient';
import { dbApi } from '../db/sqliteDb';
import { withFallback } from './withFallback';

export const taskApi = {
  getAll: withFallback(
    (params) => axiosClient.get('/tasks', { params }).then(r => r.data),
    (...a) => dbApi.tasks.getAll(...a)
  ),
  getById: withFallback(
    (id) => axiosClient.get(`/tasks/${id}`).then(r => r.data),
    (...a) => dbApi.tasks.getById(...a)
  ),
  create: withFallback(
    (d) => axiosClient.post('/tasks', d).then(r => r.data),
    (...a) => dbApi.tasks.create(...a)
  ),
  update: withFallback(
    (id, d) => axiosClient.patch(`/tasks/${id}`, d).then(r => r.data),
    (...a) => dbApi.tasks.update(...a)
  ),
  transitionStatus: withFallback(
    (id, t) => axiosClient.post(`/tasks/${id}/transition`, t).then(r => r.data),
    (...a) => dbApi.tasks.transitionStatus(...a)
  ),
  uploadPhoto: withFallback(
    (id, fd) => axiosClient.post(`/tasks/${id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
    (...a) => dbApi.tasks.uploadPhoto(...a)
  ),
  remove: (id) => axiosClient.delete(`/tasks/${id}`).then(r => r.data),
};
