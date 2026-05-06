// ✅ Feature-based exports
// Import screens from their respective features

// Auth Feature Screens
export { default as LoginScreen } from "../features/auth/screens/LoginScreen";
export { default as RegisterScreen } from "../features/auth/screens/RegisterScreen";
export { default as OTPVerificationScreen } from "../features/auth/screens/OTPVerificationScreen";
export { default as ChangePasswordScreen } from "../features/auth/screens/ChangePasswordScreen";

// Profile Feature Screens
export { default as ProfileScreen } from "../features/profile/screens/ProfileScreen";
export { default as PersonalPageScreen } from "../features/profile/screens/PersonalPageScreen";
export { default as ProfileDetailScreen } from "../features/profile/screens/ProfileDetailScreen";
export { default as AchievementsScreen } from "../features/profile/screens/AchievementsScreen";
export { default as AppAboutTermsScreen } from "../features/profile/screens/AppAboutTermsScreen";
export { default as BookingScheduleScreen } from "../features/profile/screens/BookingScheduleScreen";
export { default as PremiumUpgradeScreen } from "../features/profile/screens/PremiumUpgradeScreen";

// Rooms Feature Screens
export { default as RoomInformation } from "../features/rooms/screens/RoomInformation";
export { default as RoomDetailScreen } from "../features/rooms/screens/TeamScreen";
export { default as CreateRoomScreen } from "../features/rooms/screens/CreateRoomScreen";
export { default as MatchesScreen } from "../features/rooms/screens/MatchesScreen";

// Venues Feature Screens
export { default as VenueSelectionScreen } from "../features/venues/screens/VenueSelectionScreen";
export { default as VenueDetailScreen } from "../features/venues/screens/VenueDetailScreen";

// Friends Feature Screens
export { default as FriendsScreen } from "../features/friends/screens/FriendsScreen";
export { default as FriendRequestsScreen } from "../features/friends/screens/FriendRequestsScreen";

// Notification Feature Screens
export { default as NotificationsScreen } from "../features/notification/screens/NotificationsScreen";

// Post Feature Screens
export { default as PostDetailScreen } from "../features/post/screens/PostDetailScreen";
export { default as CreatePostScreen } from "../features/post/screens/CreatePostScreen";

// Chat Feature Screens
export { default as ChatListScreen } from "../features/chat/screens/ChatListScreen";
export { default as RoomChatScreen } from "../features/chat/screens/RoomChatScreen";
export { default as ChatScreen } from "../features/chat/screens/ChatScreen";

// Leaderboard Feature Screens
export { default as LeaderboardScreen } from "../features/leaderboard/screens/LeaderboardScreen";

// Breakdown / Elo Screens
export { default as EloBreakdownScreen } from "../features/breakdown/screens/EloBreakdownScreen";

// Onboarding Feature Screens
export {
  default as OnboardingScreen,
  checkOnboardingStatus,
} from "../features/onboarding/screens/OnboardingScreen";

// Feedback Feature Screens
export { default as FeedbackIntroScreen } from "../features/feedback/screens/FeedbackIntroScreen";
export { default as FeedbackMatchResultScreen } from "../features/feedback/screens/FeedbackMatchResultScreen";
export { default as FeedbackRatingScreen } from "../features/feedback/screens/FeedbackRatingScreen";
export { default as FeedbackCompleteScreen } from "../features/feedback/screens/FeedbackCompleteScreen";

// Shared Screens (not feature-specific)
export { default as HomeScreen } from "./HomeScreen";
export { default as SplashScreen } from "../features/splash/screens/SplashScreen";
