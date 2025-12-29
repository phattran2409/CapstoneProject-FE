// ==================== User Types ====================
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  position?: string;
  rating?: number;
  totalMatches?: number;
  createdAt?: string;
}

// ==================== Auth Request/Response Types ====================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RegisterResponse extends LoginResponse {}

export interface OTPRequest {
  phone: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  debug_otp?: string; // For testing
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
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

