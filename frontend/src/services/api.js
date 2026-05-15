import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8083/api',
});

// Interceptor: Añade el token SOLO si la petición no trae ya uno propio
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Si hay token guardado Y la petición no lleva ya uno forzado en los headers
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;