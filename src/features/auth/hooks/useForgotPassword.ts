import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { ForgotPasswordRequest } from '../types/auth.types';

/**
 * Hook to handle forgot password request
 * Sends email with reset password link
 * 
 * @example
 * const { mutate: forgotPassword, isPending, error } = useForgotPassword();
 * 
 * forgotPassword(
 *   { email: 'user@example.com' },
 *   {
 *     onSuccess: () => showSuccessToast('Email sent!'),
 *     onError: (error) => showErrorToast(error.message),
 *   }
 * );
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (request: ForgotPasswordRequest) => authApi.forgotPassword(request),
  });
};

