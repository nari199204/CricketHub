import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_URL || '/api';
export const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
