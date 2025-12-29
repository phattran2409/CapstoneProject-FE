import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { setAuthToken } from '@/shared/api/client';
import { useAuthStore } from '../store/authStore';

/**
 * Hook to handle user logout
 * Clears all auth data and cache
 * 
 * @example
 * const { mutate: logout, isPending } = useLogout();
 * 
 * logout(undefined, {
 *   onSuccess: () => navigation.navigate('Login'),
 * });
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    
    onSuccess: () => {
      // Clear auth token
      setAuthToken(null);
      
      // Clear auth store
      setUser(null);
      setToken(null);
      
      // Clear all React Query cache
      queryClient.clear();
    },
    
    onError: () => {
      // Even on error, clear local auth
      setAuthToken(null);
      setUser(null);
      setToken(null);
      queryClient.clear();
    },
  });
};

