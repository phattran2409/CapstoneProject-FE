import api from './api';
import { API_CONFIG } from '../constants';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      return response as LoginResponse;
    } catch (error) {
      throw error;
    }
  },

  // Register
  register: async (userData: RegisterData): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
      return response as LoginResponse;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      throw error;
    }
  },

  // Refresh Token
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    try {
      const response = await api.post<{ token: string }>(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refreshToken,
      });
      return response as { token: string };
    } catch (error) {
      throw error;
    }
  },
};

