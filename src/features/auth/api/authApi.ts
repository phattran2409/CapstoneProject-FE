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
  ReSendOTPRequest,
} from '../types/auth.types';
import { API_CONFIG } from '@/shared/constants/api';
import type { ApiResponse } from '@/shared/api/types';

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
    return data as unknown as LoginResponse;
  },

  /**
   * Register new user
   */
  register: async (request: RegisterRequest): Promise<RegisterResponse> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, request);
    return data as unknown as RegisterResponse;
  },

  /**
   * Send/Resend OTP to email
   */
  sendOTP: async (request: SendOTPRequest): Promise<OTPResponse> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, request);
    return data as unknown as OTPResponse;
  },

  reSendOTP: async (request: ReSendOTPRequest): Promise<OTPResponse> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESEND_OTP, request);
    return data as unknown as OTPResponse;
  },
   
  /**
   * Verify OTP
   */
  verifyOTP: async (request: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
    console.log(request);
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, request);
    return data as unknown as VerifyOTPResponse;
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
    return data as unknown as RefreshTokenResponse;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const data = await apiClient.get('/auth/profile');
    return data as unknown as User;
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const data = await apiClient.patch('/auth/profile', updates);
    return data as unknown as User;
  },

  /**
   * Login/Register with Google
   * Backend will verify the ID token and create/login user
   */
  googleLogin: async (request: { uid: string }): Promise<LoginResponse> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN, { uid: request.uid });
    return data as unknown as LoginResponse;
  },

  /**
   * Send forgot password email
   */
  forgotPassword: async (request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, request);
    return data as unknown as ForgotPasswordResponse;
  },

  /**
   * Change user password
   */
  changePassword: async (request: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    console.log('request change password :', request);
    const data = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, request);
    return data as unknown as ChangePasswordResponse;
  },

  /**
   * Update FCM token for push notifications
   */
  updateFcmToken: async (fcmToken: string): Promise<ApiResponse<void>> => {
    const data = await apiClient.put(API_CONFIG.ENDPOINTS.USERS.FCM_TOKEN, {
      fcmToken,
    });
    return data as unknown as ApiResponse<void>;
  },
};

