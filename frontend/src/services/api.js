import axios from 'axios';

// Creamos una instancia de Axios apuntando a tu puerto de Docker (8083)
const api = axios.create({
  baseURL: 'http://localhost:8083/api',
});

export default api;