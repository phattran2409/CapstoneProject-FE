import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { authKeys } from '../api/authKeys';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/auth.types';

/**
 * Hook to fetch current user profile
 * 
 * @example
 * const { data: profile, isLoading, error, refetch } = useProfile();
 */
export const useProfile = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => authApi.getProfile(),
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to update user profile
 * 
 * @example
 * const { mutate: updateProfile, isPending } = useUpdateProfile();
 * 
 * updateProfile(
 *   { name: 'New Name', avatar: 'https://...' },
 *   {
 *     onSuccess: () => Alert.alert('Success', 'Profile updated!'),
 *   }
 * );
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (updates: Partial<User>) => authApi.updateProfile(updates),
    
    onSuccess: (updatedUser) => {
      // Update auth store
      setUser(updatedUser);
      
      // Invalidate profile query
      queryClient.invalidateQueries({ 
        queryKey: authKeys.profile() 
      });
    },
  });
};

