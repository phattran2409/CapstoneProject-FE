// ==================== User Types ====================
export interface User {
  userId: string;
  fullName: string;
  email: string;
  role?: string;
  avatar?: string;
  position?: string;
  rating?: number;
  totalMatches?: number;
  createdAt?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  accessToken?: string;
  refreshToken?: string;
}

// ==================== Auth Request/Response Types ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  // success: boolean;
  // token: string;
  // user: User;
  // message?: string;
  isSuccess: boolean;
  data?: User;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse extends LoginResponse {}

export interface SendOTPRequest {
  userId: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  debug_otp?: string; // For testing
}

export interface VerifyOTPRequest {
  userId: string;
  otp: string;
}

export interface VerifyOTPResponse {
  isSuccess: boolean;
  data: {
    "userId": string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

// ==================== Auth State ====================
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

