import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../constants/api';
import { storage } from '../utils/storage';
import type { ApiError } from './types';
import { useFeedbackSessionStore } from '@/features/feedback/store/feedbackSessionStore';
import { useAppStore } from '@/store/appStore';

// ─── Bilingual HTTP status error messages ────────────────────────────────────

const HTTP_ERROR_MESSAGES: Record<number, { vi: string; en: string }> = {
  400: {
    vi: 'Yêu cầu không hợp lệ.',
    en: 'Bad request.',
  },
  403: {
    vi: 'Bạn không có quyền thực hiện thao tác này.',
    en: 'You do not have permission to perform this action.',
  },
  404: {
    vi: 'Không tìm thấy dữ liệu.',
    en: 'Data not found.',
  },
  408: {
    vi: 'Yêu cầu hết thời gian. Vui lòng thử lại.',
    en: 'Request timeout. Please try again.',
  },
  429: {
    vi: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    en: 'Too many requests. Please try again later.',
  },
  500: {
    vi: 'Lỗi máy chủ. Vui lòng thử lại sau.',
    en: 'Server error. Please try again later.',
  },
  502: {
    vi: 'Máy chủ tạm thời không phản hồi. Vui lòng thử lại sau.',
    en: 'Bad gateway. Please try again later.',
  },
  503: {
    vi: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
    en: 'Service unavailable. Please try again later.',
  },
  504: {
    vi: 'Máy chủ không phản hồi kịp thời. Vui lòng thử lại sau.',
    en: 'Gateway timeout. Please try again later.',
  },
};

/** Trả về message lỗi HTTP theo ngôn ngữ hiện tại, hoặc null nếu không có entry. */
const getHttpStatusMessage = (status: number): string | null => {
  const lang = useAppStore.getState().language;
  const entry = HTTP_ERROR_MESSAGES[status];
  if (!entry) return null;
  return lang === 'en' ? entry.en : entry.vi;
};

const getSessionExpiredMessage = (): string => {
  const lang = useAppStore.getState().language;
  return lang === 'en'
    ? 'Session expired. Please log in again.'
    : 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
};

const getNetworkErrorMessage = (): string => {
  const lang = useAppStore.getState().language;
  return lang === 'en'
    ? 'Unable to connect to server. Please check your internet connection.'
    : 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.';
};

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
let refreshToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setAuthToken = async (token: string | null) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    try {
      await storage.setItem('auth_token', token);
      console.log('✅ Access token saved to storage');
    } catch (error) {
      console.error('❌ Error saving access token to storage:', error);
    }
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    try {
      await storage.removeItem('auth_token');
      console.log('✅ Access token removed from storage');
    } catch (error) {
      console.error('❌ Error removing access token from storage:', error);
    }
  }
};

export const setRefreshToken = async (token: string | null) => {
  refreshToken = token;

  console.log('🔄 Setting refresh token:', token ? 'Token exists' : 'Token is null');
  try {
    if (token) {
      await storage.setItem('refresh_token', token);
      console.log('✅ Refresh token saved to storage');
    } else {
      await storage.removeItem('refresh_token');
      console.log('✅ Refresh token removed from storage');
    }
  } catch (error) {
    console.error('❌ Error saving refresh token to storage:', error);
    throw error;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  if (authToken) return authToken;
  
  try {
    const token = await storage.getItem('auth_token');
    if (token) {
      await setAuthToken(token);
      return token;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  
  return null;
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (refreshToken) {
    console.log('🔄 Using cached refresh token');
    return refreshToken;
  }
  
  try {
    const token = await storage.getItem('refresh_token');
    console.log('🔄 Retrieved refresh token from storage:', token ? 'Token exists' : 'No token found');
    if (token) {
      refreshToken = token;
      return token;
    }
  } catch (error) {
    console.error('❌ Error getting refresh token from storage:', error);
  }
  
  return null;
};

export const clearAllTokens = async () => {
  await setAuthToken(null);
  await setRefreshToken(null);
  await useFeedbackSessionStore.getState().clearSession();
};

// Create a separate axios instance for refresh token calls to avoid interceptor loops
const refreshAxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh token API call
const refreshAccessToken = async (): Promise<string | null> => {
  const currentRefreshToken = await getRefreshToken();
  
  if (!currentRefreshToken) {
    console.error('❌ No refresh token available');
    return null;
  }
  
  console.log('🔄 Attempting to refresh access token...');
  
  try {
    // Try the endpoint from API_CONFIG first
    let response;
    try {
      response = await refreshAxiosInstance.post(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
        { refreshToken: currentRefreshToken }
      );
      console.log('✅ Refresh token API response:', response.data);
    } catch (firstError: any) {
      // If that fails, try the alternative endpoint
      console.log('⚠️ First refresh endpoint failed, trying alternative...');
      response = await refreshAxiosInstance.get(
        `${API_CONFIG.BASE_URL}/auth/login-with-refresh-token`,
        {
          params: { refreshToken: currentRefreshToken },
        }
      );
      console.log('✅ Refresh token API response (alternative):', response.data);
    }
    
    // Handle different response structures
    let newAccessToken: string | null = null;
    let newRefreshToken: string | null = null;
    
    const responseData = response.data;
    
    // Check if response has nested data structure (like LoginResponse)
    if (responseData?.data) {
      // Structure: { isSuccess: boolean, data: { accessToken, refreshToken } }
      newAccessToken = responseData.data?.accessToken || responseData.data?.token || null;
      newRefreshToken = responseData.data?.refreshToken || null;
    }
    
    console.log('🔑 Extracted tokens:', {
      accessToken: newAccessToken ? 'Exists' : 'Missing',
      refreshToken: newRefreshToken ? 'Exists' : 'Missing',
    });
    
    if (newAccessToken) {
      await setAuthToken(newAccessToken);
      console.log('✅ New access token set');
    } else {
      console.error('❌ No access token in refresh response');
    }
    
    if (newRefreshToken) {
      await setRefreshToken(newRefreshToken);
      console.log('✅ New refresh token set');
    } else {
      console.warn('⚠️ No new refresh token in response, keeping current one');
    }
    
    return newAccessToken;
  } catch (error: any) {
    console.error('❌ Refresh token failed:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    await clearAllTokens();
    return null;
  }
};

// Initialize tokens on app start
const initializeTokens = async () => {
  await getAuthToken();
  await getRefreshToken();
};

if (process.env.NODE_ENV !== 'test') {
  initializeTokens();
}

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

// Response interceptor with token refresh handling
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('📥 API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          processQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } else {
          // Refresh failed, clear tokens and reject
          console.error('❌ Token refresh failed - no new token received');
          processQueue(error, null);
          await clearAllTokens();
          const apiError: ApiError = {
            message: getSessionExpiredMessage(),
            status: 401,
          };
          return Promise.reject(apiError);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh error:', refreshError);
        processQueue(refreshError, null);
        await clearAllTokens();
        const apiError: ApiError = {
          message: getSessionExpiredMessage(),
          status: 401,
        };
        return Promise.reject(apiError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      message: 'An error occurred',
      status: error.response?.status,
    };

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      apiError.message = data?.detail || data?.message || data?.error || error.message;
      apiError.code = data?.title || data?.code;
      apiError.details = data;
      if (data?.userId != null) apiError.userId = String(data.userId);
      
      console.log('🔍 API Error:', data);

      if (__DEV__) {
        console.error('📥 API Error:', status, error.config?.url, apiError.message);
      }

      // Override with fixed bilingual message for known server/client error codes.
      // For other status codes (e.g. 400, 409, 422) the backend message is kept
      // so that getTranslatedError() in UI layers can translate it.
      const fixedMsg = getHttpStatusMessage(status);
      if (fixedMsg && [400, 403, 404, 408, 429, 500, 502, 503, 504].includes(status)) {
        apiError.message = fixedMsg;
      }
    } else if (error.request) {
      apiError.message = getNetworkErrorMessage();
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

