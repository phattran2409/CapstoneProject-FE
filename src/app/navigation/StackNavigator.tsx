import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  LoginScreen,
  RegisterScreen,
  OTPVerificationScreen,
  ChangePasswordScreen,
  LeaderboardScreen,
  CreateRoomScreen,
  VenueSelectionScreen,
  VenueDetailScreen,
  RoomDetailScreen,
  PersonalPageScreen,
  ProfileDetailScreen,
  AchievementsScreen,
  ChatListScreen,
  ChatScreen,
  RoomChatScreen,
  ProfileScreen,
  RoomInformation,
  FriendRequestsScreen,
  NotificationsScreen,
  PostDetailScreen,
  SplashScreen,
  OnboardingScreen,
  checkOnboardingStatus,
} from "@/screens";
import { CreatePostScreen } from "@/features/post/screens";
import TabNavigator from "./TabNavigator";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useActiveRoomStore } from "@/features/rooms/store/activeRoomStore";
import { RootStackParamList } from "./types";
import { View, StyleSheet } from "react-native";
import { WalletScreen, WalletTopUpScreen } from "@/features/wallet";
import { PaymentSuccessScreen } from "@/features/payment";
import { SearchScreen } from "@/features/search";
import TeamScreen from "@/features/rooms/screens/TeamScreen";
import {
  FeedbackIntroScreen,
  FeedbackRatingScreen,
  FeedbackCompleteScreen,
  EloBreakdownScreen,
} from "@/screens";
import FeedbackMatchResultScreen from "@/features/feedback/screens/FeedbackMatchResultScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loadActiveRoom = useActiveRoomStore((state) => state.loadActiveRoom);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkInitialState = async () => {
      const hasSeenOnboarding = await checkOnboardingStatus();
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 2500);
    };
    checkInitialState();
  }, []);

  // Restore active room from storage when user is logged in → ActiveRoomBannerV2 can show again
  useEffect(() => {
    if (isAuthenticated) {
      loadActiveRoom();
    }
  }, [isAuthenticated, loadActiveRoom]);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="OTPVerification"
              component={OTPVerificationScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
            <Stack.Screen
              name="Leaderboard"
              component={LeaderboardScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="EloBreakdown"
              component={EloBreakdownScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="CreateRoom"
              component={CreateRoomScreen}
              options={{
                headerShown: false,
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="VenueSelection"
              component={VenueSelectionScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="VenueDetail"
              component={VenueDetailScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="RoomInformation"
              component={RoomInformation}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="Team"
              component={TeamScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="ChatList"
              component={ChatListScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />

            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="PersonalPage"
              component={PersonalPageScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="ProfileDetail"
              component={ProfileDetailScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="Achievements"
              component={AchievementsScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="FriendRequests"
              component={FriendRequestsScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="CreatePost"
              component={CreatePostScreen}
              options={{
                headerShown: false,
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="PaymentSuccess"
              component={PaymentSuccessScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="Wallet"
              component={WalletScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="WalletTopUp"
              component={WalletTopUpScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="RoomChat"
              component={RoomChatScreen}
              options={{
                headerShown: false,
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="FeedbackIntro"
              component={FeedbackIntroScreen}
              options={{
                headerShown: false,
                animation: "slide_from_bottom",
              }}
            />
            <Stack.Screen
              name="FeedbackMatchResult"
              component={FeedbackMatchResultScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="FeedbackRating"
              component={FeedbackRatingScreen}
              options={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
            <Stack.Screen
              name="FeedbackComplete"
              component={FeedbackCompleteScreen}
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StackNavigator;
