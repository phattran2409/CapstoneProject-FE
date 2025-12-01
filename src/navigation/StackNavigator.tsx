import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  LoginScreen, 
  RegisterScreen, 
  OTPVerificationScreen, 
  LeaderboardScreen,
  CreateRoomScreen,
  VenueSelectionScreen,
  PersonalPageScreen,
  ChatListScreen,
  ChatScreen,
  ProfileScreen,
} from '../screens';
import TabNavigator from './TabNavigator';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
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
            name="PersonalPage" 
            component={PersonalPageScreen}
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
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;

