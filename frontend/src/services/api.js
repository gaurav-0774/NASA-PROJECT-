// services/api.js — Single API service layer for all AstroVitals backend calls
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  getHealthSummary: () => API.get('/health/summary'),
  getHealthHistory: (days = 30) => API.get(`/health/history?days=${days}`),
  logHealth: (data) => API.post('/health/log', data),
  getIndicators: () => API.get('/indicators'),
  getBodyPart: (id) => API.get(`/body-parts/${id}`),
  getAlerts: () => API.get('/alerts'),
  dismissAlert: (id) => API.delete(`/alerts/${id}`),
  getTasks: () => API.get('/tasks'),
  completeTask: (id) => API.post(`/tasks/${id}/complete`),
  seedDemo: () => API.post('/demo/seed'),
  submitMood: (data) => API.post('/mood', data),
};

export default api;
