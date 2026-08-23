// Dynamic API Base URL detection: uses current hostname (e.g., localhost or local network IP)
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for sending/receiving HTTP-Only cookies
});

// Request Interceptor: Attach token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent refresh on 401 (token expired)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is due to authentication and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Exchange refresh token (cookie) for new access token
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true
        });
        
        const { accessToken } = refreshResponse.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Update header and process queued requests
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        isRefreshing = false;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed -> Force logout
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Dispatch custom event to notify AuthContext
        window.dispatchEvent(new Event('auth_logout'));
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const getMediaUrl = (path) => {
  if (!path) return '';
  if (typeof path !== 'string') return path;
  const trimmed = path.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${BACKEND_URL}${cleanPath}`;
};

const forgotPasswordApi = (identifier) => {
  return api.post('/auth/forgot-password', { identifier });
};

export default api;
export { API_BASE_URL, BACKEND_URL, getMediaUrl, forgotPasswordApi };
