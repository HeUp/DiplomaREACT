import axios from 'axios';

const apiBase = process.env.REACT_APP_API_URL || '/api';
const axiosClient = axios.create({
  baseURL: apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isRealJwt(token) {
  return token && token.split('.').length === 3;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const token = localStorage.getItem('accessToken');

    if (error.response?.status === 401 && !originalRequest._retry && isRealJwt(token)) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
