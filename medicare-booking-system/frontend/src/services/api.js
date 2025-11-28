import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData)
};

// Doctors API
export const doctorsAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSpecializations: () => api.get('/doctors/specializations/list'),
  getStats: (id) => api.get(`/doctors/${id}/stats`),
  updateSchedule: (id, schedules) => api.post(`/doctors/${id}/schedule`, { schedules })
};

// Appointments API
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  getAvailableSlots: (doctorId, date) => api.get(`/appointments/available-slots/${doctorId}/${date}`),
  create: (appointmentData) => api.post('/appointments', appointmentData),
  updateStatus: (id, status, cancellationReason) => 
    api.patch(`/appointments/${id}/status`, { status, cancellationReason }),
  delete: (id) => api.delete(`/appointments/${id}`)
};

// Medical Records API
export const medicalRecordsAPI = {
  getAll: (params) => api.get('/medical-records', { params }),
  getById: (id) => api.get(`/medical-records/${id}`),
  create: (recordData) => api.post('/medical-records', recordData),
  update: (id, recordData) => api.put(`/medical-records/${id}`, recordData),
  delete: (id) => api.delete(`/medical-records/${id}`)
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAppointments: (params) => api.get('/admin/appointments', { params })
};

export default api;
