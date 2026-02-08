import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { ChangePasswordRequest } from '../types/auth.types';

/**
 * Hook to handle password change
 * Sends current password and new password to update
 * 
 * @example
 * const { mutate: changePassword, isPending, error } = useChangePassword();
 * 
 * changePassword(
 *   { email: 'user@example.com', currentPassword: 'old123', newPassword: 'new456' },
 *   {
 *     onSuccess: () => showSuccessToast('Password changed!'),
 *     onError: (error) => showErrorToast(error.message),
 *   }
 * );
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (request: ChangePasswordRequest) => authApi.changePassword(request),
  });
};

