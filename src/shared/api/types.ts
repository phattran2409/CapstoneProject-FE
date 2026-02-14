export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  /** Present when API returns 409 NotVerified (account not verified) */
  userId?: string;
}

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  data?: T;
  message?: string;
  error?: string;
}


