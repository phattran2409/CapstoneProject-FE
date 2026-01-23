/**
 * Auth Feature Public API
 */

// ============ Hooks ============
export {
  useLogin,
  useRegister,
  useSendOTP,
  useVerifyOTP,
  useLogout,
  useProfile,
  useUpdateProfile,
  useGoogleSignIn,
  useForgotPassword,
  useChangePassword,
} from './hooks';

// ============ Types ============
export type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  SendOTPRequest,
  OTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from './types/auth.types';

// ============ Store ============
export { useAuthStore } from './store/authStore';

// ============ Screens ============
// export * from './screens';

// Note: API functions and keys are internal, not exported

