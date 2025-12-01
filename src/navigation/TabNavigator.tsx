import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen, MatchesScreen, ProfileScreen } from '../screens';
import { useTheme } from '../theme';
import { TabParamList } from './types';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.darkBlack,
        },
        tabBarActiveTintColor: theme.colors.neonGreen,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Matches" 
        component={MatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen 
        name="Create" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Create',
          tabBarIcon: ({ color, size, focused }) => (
            <View 
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: focused ? color : color,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -20,
              }}
            >
              <Ionicons name="add" size={32} color="#000" />
            </View>
          ),
          tabBarButton: (props) => (
            <View {...props} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {props.children}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            // Handle create action - can open modal or navigate to create screen
          },
        })}
      /> */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

