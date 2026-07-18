import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindwell_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const verifyOtp = (data) => api.post('/auth/verify-otp', data);
export const resendOtp = (data) => api.post('/auth/resend-otp', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const updatePreferences = (data) => api.put('/auth/preferences', data);
export const changePassword = (data) => api.put('/auth/password', data);
export const getActivityLog = () => api.get('/auth/activity');
export const deleteAccount = () => api.delete('/auth/account');

// Journal
export const getDailyPrompt = () => api.get('/journal/prompt');
export const createEntry = (data) => api.post('/journal', data);
export const getEntries = () => api.get('/journal');
export const getEntryById = (id) => api.get(`/journal/${id}`);
export const updateEntry = (id, data) => api.put(`/journal/${id}`, data);
export const deleteEntry = (id) => api.delete(`/journal/${id}`);
export const importEntries = (entries) => api.post('/journal/import', { entries });

// Mood / analytics
export const getMoodHistory = () => api.get('/mood/history');
export const getMoodDistribution = () => api.get('/mood/distribution');
export const getWeeklyAverage = () => api.get('/mood/weekly-average');
export const getMonthlyAverage = () => api.get('/mood/monthly-average');

// Export - blob downloads with auth headers
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadJsonExport = async () => {
  const res = await api.get('/export/json', { responseType: 'blob' });
  downloadBlob(res.data, 'mindwell-journal-export.json');
};

export const downloadPdfExport = async () => {
  const res = await api.get('/export/pdf', { responseType: 'blob' });
  downloadBlob(res.data, 'mindwell-journal-export.pdf');
};

export default api;
