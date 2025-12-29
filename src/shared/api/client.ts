import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '../constants/api';
import { storage } from '../utils/storage';
import type { ApiError } from './types';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    storage.setItem('auth_token', token);
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    storage.removeItem('auth_token');
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (authToken) return authToken;
  
  try {
    const token = await storage.getItem('auth_token');
    if (token) {
      setAuthToken(token);
      return token;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  
  return null;
};

// Initialize token on app start
getAuthToken();

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (__DEV__) {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('📤 Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('📥 API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    
    return response.data;
  },
  async (error: AxiosError) => {
    const apiError: ApiError = {
      message: 'An error occurred',
      status: error.response?.status,
    };

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      apiError.message = data?.message || data?.error || error.message;
      apiError.details = data;

      if (__DEV__) {
        console.error('📥 API Error:', status, error.config?.url, apiError.message);
      }

      switch (status) {
        case 401:
          setAuthToken(null);
          apiError.message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          break;
        case 403:
          apiError.message = 'Bạn không có quyền thực hiện thao tác này.';
          break;
        case 404:
          apiError.message = 'Không tìm thấy dữ liệu.';
          break;
        case 500:
          apiError.message = 'Lỗi máy chủ. Vui lòng thử lại sau.';
          break;
      }
    } else if (error.request) {
      apiError.message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.';
      if (__DEV__) {
        console.error('📥 Network Error:', error.request);
      }
    } else {
      apiError.message = error.message;
      if (__DEV__) {
        console.error('📥 Error:', error.message);
      }
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;

