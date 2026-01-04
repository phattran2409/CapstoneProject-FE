import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

// Configure Google Sign-In (chỉ cần gọi 1 lần khi app start)
// Lấy webClientId từ environment variable
const getWebClientId = (): string => {
  // @ts-ignore - Expo environment variables
  return process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
};

// Configure Google Sign-In
const webClientId = getWebClientId();
if (!webClientId) {
  console.error('⚠️ EXPO_PUBLIC_GOOGLE_CLIENT_ID is not set in .env file!');
} else {
  console.log('✅ Google Sign-In configured with Web Client ID:', webClientId.substring(0, 30) + '...');
}

GoogleSignin.configure({
  webClientId: webClientId, // Web client ID từ Firebase (phải là Web Client ID, không phải Android)
  offlineAccess: true, // Nếu cần access token
  forceCodeForRefreshToken: true, // Android
  // Additional configuration for better error handling
  scopes: ['profile', 'email'], // Request profile and email scopes
});

/**
 * Sign in with Google using Firebase Native SDK (giống Flutter)
 * Returns Firebase user and ID token
 * 
 * Native UI sẽ hiển thị trong app, không mở browser
 * Không cần redirectUri vì dùng native SDK
 */
export const signInWithGoogle = async () => {
  try {
    const webClientId = getWebClientId();

    if (!webClientId) {
      throw new Error(
        'Google Client ID not configured. Please add EXPO_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.'
      );
    }

    // Check if device has Google Play Services (Android only)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Sign in - Native UI appears in-app (giống Flutter)
    const userInfo = await GoogleSignin.signIn();

    // Get ID token
    const idToken = userInfo.data?.idToken;
    if (!idToken) {
      throw new Error('No ID token received from Google');
    }

    // Create Firebase credential from Google ID token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in with Firebase Native SDK
    const userCredential = await auth().signInWithCredential(googleCredential);
    const firebaseUser = userCredential.user;

    // Get Firebase ID token (send to backend)
    const firebaseIdToken = await firebaseUser.getIdToken();

    console.log('Firebase ID Token', firebaseUser);
    return {
      success: true,
      firebaseUser,
      idToken: firebaseIdToken,
      user: {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
      },
    };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return {
        success: false,
        error: 'User cancelled Google Sign-In',
      };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return {
        success: false,
        error: 'Sign in already in progress',
      };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return {
        success: false,
        error: 'Google Play Services not available',
      };
    }

    console.error('Google Sign-In Error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during Google Sign-In',
    };
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

/**
 * Sign out from Google and Firebase
 */
export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    await auth().signOut();
  } catch (error) {
    console.error('Sign-Out Error:', error);
    throw error;
  }
};

/**
 * Check if user is signed in with Google
 */
export const isSignedIn = async (): Promise<boolean> => {
  try {
    const user = await GoogleSignin.getCurrentUser();
    return user !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Get current Google user info
 */
export const getCurrentGoogleUser = async () => {
  try {
    const userInfo = await GoogleSignin.getCurrentUser();
    return userInfo;
  } catch (error) {
    return null;
  }
};
