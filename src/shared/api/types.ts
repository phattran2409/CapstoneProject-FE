export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  isSuccess: boolean;
  data?: T;
  message?: string;
  error?: string;
}


