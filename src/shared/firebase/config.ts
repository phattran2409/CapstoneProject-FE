import auth from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

/**
 * Firebase Native SDK Configuration
 * 
 * Với Firebase Native SDK (@react-native-firebase):
 * - KHÔNG cần firebaseConfig từ .env
 * - Tự động đọc config từ google-services.json (Android) và GoogleService-Info.plist (iOS)
 * - Config được tự động load khi app khởi động
 * 
 * Lưu ý:
 * - google-services.json phải có trong android/app/
 * - GoogleService-Info.plist phải có trong ios/ (nếu build iOS)
 * - Vẫn cần EXPO_PUBLIC_GOOGLE_CLIENT_ID trong .env cho Google Sign-In
 */

// Firebase Native SDK tự động initialize từ google-services.json
// Không cần manual initialization như JS SDK

/**
 * Get Firebase Auth instance
 * Native SDK tự động initialize, chỉ cần gọi auth()
 */
export const getAuth = () => auth();

/**
 * Get current Firebase user
 */
export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

// Export auth instance for backward compatibility
export { auth };
export default auth;

