import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import Constants from 'expo-constants';

/**
 * Web OAuth client (client_type 3 trong google-services.json).
 * - Ưu tiên EXPO_PUBLIC_GOOGLE_CLIENT_ID (.env local)
 * - Fallback: expo.extra.googleWebClientId (app.json) — bắt buộc cho EAS build vì .env không lên cloud
 */
const getWebClientId = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID as string | undefined;
  const fromExtra = Constants.expoConfig?.extra?.googleWebClientId as string | undefined;
  const id = (fromEnv?.trim() || fromExtra?.trim() || '').trim();
  return id;
};

let didConfigureGoogleSignIn = false;

/**
 * offlineAccess + forceCodeForRefreshToken:true đôi khi gây DEVELOPER_ERROR trên Android
 * khi không cần server auth code. Firebase chỉ cần idToken → giữ đơn giản.
 */
const ensureGoogleSignInConfigured = () => {
  const webClientId = getWebClientId();
  if (!webClientId) {
    return;
  }
  if (didConfigureGoogleSignIn) return;
  didConfigureGoogleSignIn = true;
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
    scopes: ['profile', 'email'],
  });
};

/**
 * Sign in with Google using Firebase Native SDK (giống Flutter)
 * Returns Firebase user and ID token
 * 
 * Native UI sẽ hiển thị trong app, không mở browser
 * Không cần redirectUri vì dùng native SDK
 */
export const signInWithGoogle = async () => {
  try {
    ensureGoogleSignInConfigured();
    const webClientId = getWebClientId();
    if (!webClientId) {
      throw new Error(
        'Google Client ID not configured. Add EXPO_PUBLIC_GOOGLE_CLIENT_ID to .env or googleWebClientId in app.json extra.',
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
    ensureGoogleSignInConfigured();
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
    ensureGoogleSignInConfigured();
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
    ensureGoogleSignInConfigured();
    const userInfo = await GoogleSignin.getCurrentUser();
    return userInfo;
  } catch (error) {
    return null;
  }
};
