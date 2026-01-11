import React, {useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  LoginScreen, 
  RegisterScreen, 
  OTPVerificationScreen, 
  LeaderboardScreen,
  CreateRoomScreen,
  VenueSelectionScreen,
  RoomDetailScreen,
  PersonalPageScreen,
  ProfileDetailScreen,
  ChatListScreen,
  ChatScreen,
  ProfileScreen,
  RoomInformation,
  FriendRequestsScreen,
  NotificationsScreen,
  PostDetailScreen,
  SplashScreen,
  OnboardingScreen,
  checkOnboardingStatus,
} from '@/screens';
import TabNavigator from './TabNavigator';
import { useAuthStore } from '@/features/auth/store/authStore';
import { RootStackParamList } from './types';
import { ActiveRoomBanner } from '@/shared/components/ActiveRoomBanner';
import { View, StyleSheet } from 'react-native';


const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() =>{
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
              animation: 'slide_from_right',
              
            }}
            
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="OTPVerification" 
            component={OTPVerificationScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
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
              animation: 'none',
            }}
          />
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="CreateRoom" 
            component={CreateRoomScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen 
            name="VenueSelection" 
            component={VenueSelectionScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="RoomInformation" 
            component={RoomInformation}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="RoomDetail" 
            component={RoomDetailScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="ChatList" 
            component={ChatListScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="PersonalPage" 
            component={PersonalPageScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="ProfileDetail" 
            component={ProfileDetailScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="FriendRequests" 
            component={FriendRequestsScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen 
            name="PostDetail" 
            component={PostDetailScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </>
      )}
      </Stack.Navigator>
      {isAuthenticated && <ActiveRoomBanner />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default StackNavigator;

