import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { setAuthToken } from '@/shared/api/client';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest } from '../types/auth.types';

/**
 * Hook to handle user login
 * Automatically sets user and token in store on success
 * 
 * @example
 * const { mutate: login, isPending, error } = useLogin();
 * 
 * login(
 *   { email: 'user@example.com', password: 'password123' },
 *   {
 *     onSuccess: () => navigation.navigate('Home'),
 *     onError: (error) => Alert.alert('Error', error.message),
 *   }
 * );
 */
export const useLogin = () => {
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (request: LoginRequest) => authApi.login(request),
    
    onSuccess: (response) => {
      // Set token for API calls
      setAuthToken(response.data?.accessToken || null);

      // Update auth store
      setUser(response.data || null);
      setToken(response.data?.accessToken || null);
    },
    
    onError: (error) => {
      // Clear auth on error
      setAuthToken(null);
      setUser(null);
      setToken(null);
    },
  });
};

