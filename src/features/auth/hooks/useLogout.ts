import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setAuthToken } from '@/shared/api/client';
import { useAuthStore } from '../store/authStore';
import { useFeedbackSessionStore } from '@/features/feedback/store/feedbackSessionStore';

/**
 * Hook to handle user logout
 * Clears all auth tokens and cache
 * 
 * @example
 * const { logout, isPending } = useLogout();
 * 
 * const handleLogout = () => {
 *   logout();
 *   navigation.navigate('Login');
 * };
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const reset = useAuthStore((state) => state.reset);

  const logout = useCallback(async () => {
    // Clear auth token from API client
    await setAuthToken(null);

    // Phiên feedback gắn với user cụ thể — tránh tài khoản sau dùng nhầm session cũ
    await useFeedbackSessionStore.getState().clearSession();

    // Reset auth store (clears user, token, isAuthenticated)
    reset();

    // Clear all React Query cache
    queryClient.clear();
  }, [reset, queryClient]);

  return { 
    mutate: logout,  // For backward compatibility
    logout,
    isPending: false 
  };
};

