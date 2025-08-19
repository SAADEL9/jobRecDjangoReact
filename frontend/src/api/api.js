import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:8000/api',  // Django backend URL
  withCredentials: true,  // Important for sending cookies with requests
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    
    // If error is 401 and we haven't tried to refresh yet
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            'http://localhost:8000/api/auth/token/refresh/',
            { refresh: refreshToken }
          );
          
          const { access, refresh } = response.data;
          localStorage.setItem('access_token', access);
          if (refresh) {
            localStorage.setItem('refresh_token', refresh);
          }
          
          // Update the authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getCurrentUser: () => api.get('/auth/profile/'),
  updateProfile: (userData) => api.put('/auth/profile/update/', userData),
};

export const jobAPI = {
  getJobs: (params) => api.get('/jobs/', { params }),
  getJob: (id) => api.get(`/jobs/${id}/`),
  createJob: (jobData) => api.post('/jobs/', jobData),
  updateJob: (id, jobData) => api.patch(`/jobs/${id}/`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}/`),
  applyToJob: (jobId, applicationData = {}) => api.post(`/jobs/applications/`, { job_id: jobId, ...applicationData }),
  getMyApplications: () => api.get('/jobs/applications/'),
  getApplication: (id) => api.get(`/jobs/applications/${id}/`),
  updateApplication: (id, data) => {
    const payload = typeof data === 'object' ? data : { status: data };
    return api.patch(`/jobs/applications/${id}/`, payload);
  },
  saveJob: (jobId) => api.post('/jobs/saved/', { job_id: jobId }),
  getSavedJobs: () => api.get('/jobs/saved/'),
  removeSavedJob: (jobId) => api.delete(`/jobs/saved/${jobId}/`),
};

export default api;
