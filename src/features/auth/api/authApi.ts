import { apiClient } from '@/shared/api/client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SendOTPRequest,
  OTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  User,
} from '../types/auth.types';
import { API_CONFIG } from '@/shared/constants/api';

/**
 * Auth API functions
 * Pure API calls without React Query logic
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { email: request.email, password: request.password });
    return data;
  },

  /**
   * Register new user
   */
  register: async (request: RegisterRequest): Promise<RegisterResponse> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, request);
    return data;
  },

  /**
   * Send/Resend OTP to email
   */
  sendOTP: async (request: SendOTPRequest): Promise<OTPResponse> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, request);
    return data;
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (request: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    console.log(request);
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, request);
    return data;
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Refresh access token
   */
  refreshToken: async (request: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const data = await apiClient.post('/auth/refresh', request);
    return data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const data = await apiClient.get('/auth/profile');
    return data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const data = await apiClient.patch('/auth/profile', updates);
    return data;
  },

  /**
   * Login/Register with Google
   * Backend will verify the ID token and create/login user
   */
  googleLogin: async (request: { uid: string }): Promise<LoginResponse> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN, { uid: request.uid });
    return data;
  },

  /**
   * Send forgot password email
   */
  forgotPassword: async (request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, request);
    return data;
  },

  /**
   * Change user password
   */
  changePassword: async (request: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    console.log('request change password :', request);
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, request);
    return data;
  },
};

