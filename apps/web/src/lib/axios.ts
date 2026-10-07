import axios from 'axios';

const api = axios.create({
  // Let Vite proxy development requests from the current browser origin.
  // Production continues to use the configured public API URL.
  baseURL: import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api'),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthAction = /^\/auth\/(login|register|logout)(?:\?|$)/.test(error.config?.url || '');
    if (error.response?.status === 401 && !isAuthAction && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
