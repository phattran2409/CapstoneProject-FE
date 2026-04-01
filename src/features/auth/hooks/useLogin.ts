import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { setAuthToken, setRefreshToken } from '@/shared/api/client';
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
  const { setUser, setToken, setPendingLoginSuccessToast } = useAuthStore();

  return useMutation({
    mutationFn: (request: LoginRequest) => authApi.login(request),
    
    onSuccess: async (response) => {
      // Set token for API calls
      console.log('✅ Login successful, response:', response.data);
      const accessToken = response.data?.accessToken || null;
      const refreshTokenValue = response.data?.refreshToken || null;
      
      await setAuthToken(accessToken);
      await setRefreshToken(refreshTokenValue);
      
      // Update auth store
      const userData = response.data || null;
      setUser(userData);
      setToken(accessToken);
      if (userData?.isEmailVerified) {
        // Toast shown on Home after stack switches (Login unmounts immediately)
        setPendingLoginSuccessToast(true);
      }
    },
    
    onError: async (error) => {
      // Clear auth on error
      await setAuthToken(null);
      setUser(null);
      setToken(null);
    },
  });
};

