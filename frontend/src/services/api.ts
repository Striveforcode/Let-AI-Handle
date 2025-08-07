import axios from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register
  registerInit: async (phoneNumber: string, countryCode: string) => {
    const response = await api.post('/auth/register/init', {
      phoneNumber,
      countryCode,
    });
    return response.data;
  },

  registerVerify: async (phoneNumber: string, countryCode: string, otp: string) => {
    const response = await api.post('/auth/register/verify', {
      phoneNumber,
      countryCode,
      otp,
    });
    return response.data;
  },

  registerResend: async (phoneNumber: string, countryCode: string) => {
    const response = await api.post('/auth/register/resend', {
      phoneNumber,
      countryCode,
    });
    return response.data;
  },

  // Login
  loginInit: async (phoneNumber: string, countryCode: string) => {
    const response = await api.post('/auth/login/init', {
      phoneNumber,
      countryCode,
    });
    return response.data;
  },

  loginVerify: async (phoneNumber: string, countryCode: string, otp: string) => {
    const response = await api.post('/auth/login/verify', {
      phoneNumber,
      countryCode,
      otp,
    });
    return response.data;
  },

  // Token management
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/token/refresh', {
      refreshToken,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// User API functions
export const userAPI = {
  // Profile management
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (data: { name?: string; email?: string; phone?: string; countryCode?: string }) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  // Statistics
  getStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  // User data
  getDocuments: async () => {
    const response = await api.get('/user/documents');
    return response.data;
  },

  getChats: async () => {
    const response = await api.get('/user/chats');
    return response.data;
  },

  // Account management
  deleteAccount: async () => {
    const response = await api.delete('/user/account');
    return response.data;
  },
};

// Utility functions
export const authUtils = {
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  getTokens: () => {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  logout: () => {
    authUtils.clearTokens();
    window.location.href = '/login';
  },
};

export default api;
