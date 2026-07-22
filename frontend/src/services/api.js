import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://mindwell-5wq5.onrender.com/api';

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
export const getVapidPublicKey = () => api.get('/auth/vapid-public-key');
export const savePushSubscription = (subscription) => api.post('/auth/push-subscribe', { subscription });
export const removePushSubscription = () => api.delete('/auth/push-subscribe');
export const sendTestPush = () => api.post('/auth/push-test');

// Journal
export const getDailyPrompt = () => api.get('/journal/prompt');
export const createEntry = (data) => api.post('/journal', data);
export const getEntries = () => api.get('/journal');
export const getEntryById = (id) => api.get(`/journal/${id}`);
export const updateEntry = (id, data) => api.put(`/journal/${id}`, data);
export const deleteEntry = (id) => api.delete(`/journal/${id}`);
export const importEntries = (entries) => api.post('/journal/import', { entries });
export const getTemplates = () => api.get('/journal/templates');
export const shareEntryApi = (id) => api.post(`/journal/${id}/share`);
export const revokeShareApi = (id) => api.delete(`/journal/${id}/share`);
export const getSharedEntry = (token) => api.get(`/journal/shared/${token}`);
export const getAiReflection = (id) => api.post(`/journal/${id}/reflect`);
export const sendDigestNow = () => api.post('/journal/digest/send-now');

// Mood / analytics
export const getMoodHistory = () => api.get('/mood/history');
export const getMoodDistribution = () => api.get('/mood/distribution');
export const getMoodInsights = () => api.get('/mood/insights');
export const getWeeklyAverage = () => api.get('/mood/weekly-average');
export const getMonthlyAverage = () => api.get('/mood/monthly-average');

export const getThemes = () => api.get('/themes');
export const createTheme = (data) => api.post('/themes', data);
export const applyTheme = (themeId) => api.post('/themes/apply', { themeId });
export const deleteTheme = (themeId) => api.delete(`/themes/${themeId}`);
export const toggleLikeTheme = (themeId) => api.post(`/themes/${themeId}/like`);

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
