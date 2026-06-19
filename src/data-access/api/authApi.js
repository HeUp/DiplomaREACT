import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) =>
    axiosClient.post('/auth/login', credentials).then((r) => r.data),

  refresh: (refreshToken) =>
    axiosClient.post('/auth/refresh', { refreshToken }).then((r) => r.data),

  me: () => axiosClient.get('/auth/me').then((r) => r.data),

  updateProfile: (data) =>
    axiosClient.patch('/auth/profile', data).then((r) => r.data),

  uploadProfilePhoto: (formData) =>
    axiosClient.post('/auth/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
};
