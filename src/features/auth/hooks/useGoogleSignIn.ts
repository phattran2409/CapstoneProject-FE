import { useMutation } from '@tanstack/react-query';
import { signInWithGoogle } from '../services/googleAuth';
import { authApi } from '../api/authApi';
import { setAuthToken } from '@/shared/api/client';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/auth.types';

interface GoogleLoginRequest {
  idToken: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Hook to handle Google Sign-In with Firebase
 * 
 * Flow:
 * 1. User clicks Google Sign-In button
 * 2. Google OAuth flow starts (via expo-auth-session)
 * 3. Get ID token from Google
 * 4. Sign in with Firebase using Google credential
 * 5. Get Firebase ID token
 * 6. Send Firebase ID token to backend to create/login user
 * 7. Backend returns JWT token
 * 8. Store token and user info
 * 
 * @example
 * const { mutate: signInWithGoogle, isPending } = useGoogleSignIn();
 * 
 * signInWithGoogle(undefined, {
 *   onSuccess: () => navigation.navigate('Home'),
 *   onError: (error) => Alert.alert('Error', error.message),
 * });
 */
export const useGoogleSignIn = () => {
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      // Step 1: Sign in with Google and Firebase
      const googleResult = await signInWithGoogle();

      if (!googleResult.success || !googleResult.idToken || !googleResult.user) {
        throw new Error(googleResult.error || 'Google Sign-In failed');
      }

      console.log('Google Result', googleResult);

      // Step 2: Send Firebase ID token to backend
      // Backend will verify the token with Firebase Admin SDK and return JWT
      const loginRequest: GoogleLoginRequest = {
        idToken: googleResult.idToken, // Firebase ID token
        email: googleResult.user.email,
        name: googleResult.user.displayName,
        picture: googleResult.user.photoURL,
      };

      // Call backend API to login/register with Firebase token
      const response = await authApi.googleLogin(loginRequest);

      return {
        ...response,
        firebaseUser: googleResult.firebaseUser,
      };
    },

    onSuccess: (response) => {
      // Set token for API calls
      setAuthToken(response.token);

      // Update auth store
      setUser(response.user);
      setToken(response.token);
    },

    onError: (error: any) => {
      // Clear auth on error
      setAuthToken(null);
      setUser(null);
      setToken(null);
      
      console.error('Google Sign-In Error:', error);
    },
  });
};

