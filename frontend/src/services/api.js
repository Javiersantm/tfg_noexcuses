import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8083/api',
});

// Interceptor: Antes de cada petición, comprueba si hay un token guardado y lo añade
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;