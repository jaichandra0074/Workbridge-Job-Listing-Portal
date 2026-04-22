import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('wb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('wb_token');
      localStorage.removeItem('wb_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────
export const registerUser  = (data)          => API.post('/auth/register', data);
export const loginUser     = (data)          => API.post('/auth/login', data);
export const getMe         = ()              => API.get('/auth/me');
export const updatePassword= (data)          => API.put('/auth/update-password', data);

// ── Jobs ──────────────────────────────────────────
export const fetchJobs     = (params)        => API.get('/jobs', { params });
export const fetchJob      = (id)            => API.get(`/jobs/${id}`);
export const createJob     = (data)          => API.post('/jobs', data);
export const updateJob     = (id, data)      => API.put(`/jobs/${id}`, data);
export const deleteJob     = (id)            => API.delete(`/jobs/${id}`);
export const fetchMyJobs   = ()              => API.get('/jobs/employer/my');

// ── Applications ──────────────────────────────────
export const applyToJob    = (jobId, data)   => API.post(`/applications/${jobId}`, data);
export const fetchMyApps   = ()              => API.get('/applications/my');
export const fetchJobApps  = (jobId)         => API.get(`/applications/job/${jobId}`);
export const updateAppStatus=(id, data)      => API.put(`/applications/${id}/status`, data);
export const withdrawApp   = (id)            => API.delete(`/applications/${id}`);

// ── Users ─────────────────────────────────────────
export const getProfile    = ()              => API.get('/users/profile');
export const updateProfile = (data)          => API.put('/users/profile', data);
export const toggleSaveJob = (jobId)         => API.post(`/users/save/${jobId}`);

export default API;
