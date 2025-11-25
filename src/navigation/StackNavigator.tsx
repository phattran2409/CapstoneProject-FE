import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens';
import TabNavigator from './TabNavigator';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />
      ) : (
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator}
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;

