import axiosClient from './axiosClient';
import { dbApi } from '../db/sqliteDb';
import { withFallback } from './withFallback';

export const projectApi = {
  getAll: withFallback(
    (p) => axiosClient.get('/projects', { params: p }).then(r => r.data),
    (...a) => dbApi.projects.getAll(...a)
  ),
  getById: withFallback(
    (id) => axiosClient.get(`/projects/${id}`).then(r => r.data),
    (...a) => dbApi.projects.getById(...a)
  ),
  create: withFallback(
    (d) => axiosClient.post('/projects', d).then(r => r.data),
    (...a) => dbApi.projects.create(...a)
  ),
  update: withFallback(
    (id, d) => axiosClient.patch(`/projects/${id}`, d).then(r => r.data),
    (...a) => dbApi.projects.update(...a)
  ),
};
