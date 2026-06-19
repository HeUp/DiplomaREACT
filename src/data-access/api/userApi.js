import axiosClient from './axiosClient';
import { dbApi } from '../db/sqliteDb';
import { withFallback } from './withFallback';

export const userApi = {
  getAll: withFallback(
    (p) => axiosClient.get('/users', { params: p }).then(r => r.data),
    (...a) => dbApi.users.getAll(...a)
  ),
  create: withFallback(
    (d) => axiosClient.post('/users', d).then(r => r.data),
    (...a) => dbApi.users.create(...a)
  ),
  update: withFallback(
    (id, d) => axiosClient.patch(`/users/${id}`, d).then(r => r.data),
    (...a) => dbApi.users.update(...a)
  ),
  delete: withFallback(
    (id) => axiosClient.delete(`/users/${id}`).then(r => r.data),
    (...a) => dbApi.users.delete(...a)
  ),
};
