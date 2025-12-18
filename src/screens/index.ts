// ✅ Feature-based exports
// Import screens from their respective features

// Auth Feature Screens
export { default as LoginScreen } from '../features/auth/screens/LoginScreen';
export { default as RegisterScreen } from '../features/auth/screens/RegisterScreen';
export { default as OTPVerificationScreen } from '../features/auth/screens/OTPVerificationScreen';

// Profile Feature Screens
export { default as ProfileScreen } from '../features/profile/screens/ProfileScreen';
export { default as PersonalPageScreen } from '../features/profile/screens/PersonalPageScreen';

// Rooms Feature Screens
export { default as RoomInformation } from '../features/rooms/screens/RoomInformation';
export { default as RoomDetailScreen } from '../features/rooms/screens/RoomDetailScreen';
export { default as CreateRoomScreen } from '../features/rooms/screens/CreateRoomScreen';
export { default as MatchesScreen } from '../features/rooms/screens/MatchesScreen';

// Venues Feature Screens
export { default as VenueSelectionScreen } from '../features/venues/screens/VenueSelectionScreen';

// Chat Feature Screens
export { default as ChatListScreen } from '../features/chat/screens/ChatListScreen';
export { default as ChatScreen } from '../features/chat/screens/ChatScreen';

// Leaderboard Feature Screens
export { default as LeaderboardScreen } from '../features/leaderboard/screens/LeaderboardScreen';

// Onboarding Feature Screens
export { default as OnboardingScreen, checkOnboardingStatus } from '../features/onboarding/screens/OnboardingScreen';

// Shared Screens (not feature-specific)
export { default as HomeScreen } from './HomeScreen';
export { default as SplashScreen } from '../features/splash/screens/SplashScreen';  