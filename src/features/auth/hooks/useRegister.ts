import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { setAuthToken } from '@/shared/api/client';
import { useAuthStore } from '../store/authStore';
import type { RegisterRequest } from '../types/auth.types';

/**
 * Hook to handle user registration
 * Automatically logs in user after successful registration
 * 
 * @example
 * const { mutate: register, isPending } = useRegister();
 * 
 * register(
 *   {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     password: 'password123',
 *     phone: '+84909123456',
 *   },
 *   {
 *     onSuccess: () => navigation.navigate('Home'),
 *   }
 * );
 */
export const useRegister = () => {
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (request: RegisterRequest) => authApi.register(request),
    
    onSuccess: (response) => {
      // Set token for API calls
      setAuthToken(response.token);
      
      // Update auth store (auto-login after register)
      setUser(response.user);
      setToken(response.token);
    },
    
    onError: () => {
      // Clear auth on error
      setAuthToken(null);
      setUser(null);
      setToken(null);
    },
  });
};

