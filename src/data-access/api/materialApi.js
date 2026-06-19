import axiosClient from './axiosClient';
import { dbApi } from '../db/sqliteDb';
import { withFallback } from './withFallback';

export const materialApi = {
  getAll: withFallback(
    (p) => axiosClient.get('/materials', { params: p }).then(r => r.data),
    (...a) => dbApi.materials.getAll(...a)
  ),
  create: withFallback(
    (d) => axiosClient.post('/materials', d).then(r => r.data),
    (...a) => dbApi.materials.create(...a)
  ),
  updateStatus: withFallback(
    (id, s) => axiosClient.patch(`/materials/${id}/status`, { status: s }).then(r => r.data),
    (...a) => dbApi.materials.updateStatus(...a)
  ),
  getSummary: withFallback(
    () => axiosClient.get('/materials/summary').then(r => r.data),
    (...a) => dbApi.materials.getSummary(...a)
  ),
};
