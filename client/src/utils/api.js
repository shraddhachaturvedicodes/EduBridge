// client/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/', // relative so dev proxy works
});

// attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

export default api;
