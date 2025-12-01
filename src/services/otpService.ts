import api from './api';

export interface SendOTPRequest {
  email: string;
  username: string;
  password: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
  token?: string;
}

/**
 * Send OTP code to email for verification
 */
export const sendOTP = async (data: SendOTPRequest): Promise<OTPResponse> => {
  try {
    const response = await api.post<OTPResponse>('/auth/send-otp', data);
    return response.data;
  } catch (error) {
    console.error('Send OTP error:', error);
    throw error;
  }
};

/**
 * Verify OTP code and complete registration
 */
export const verifyOTP = async (
  data: VerifyOTPRequest & Pick<SendOTPRequest, 'username' | 'password'>
): Promise<RegisterResponse> => {
  try {
    const response = await api.post<RegisterResponse>('/auth/verify-otp', data);
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

/**
 * Resend OTP code to email
 */
export const resendOTP = async (email: string): Promise<OTPResponse> => {
  try {
    const response = await api.post<OTPResponse>('/auth/resend-otp', { email });
    return response.data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error;
  }
};





