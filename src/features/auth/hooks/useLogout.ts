import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setAuthToken } from '@/shared/api/client';
import { useAuthStore } from '../store/authStore';

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

