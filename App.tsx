import 'react-native-reanimated';
import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './src/shared/theme';
import { StackNavigator } from './src/app/navigation';
import { linking } from './src/app/navigation/linking';
import { useAppStore } from './src/store';
import { queryClient } from './src/shared/api/queryClient';
import { TabBarVisibilityProvider } from './src/shared/context/TabBarVisibilityContext';
import { AppToast } from './src/shared/toast';
import { useActiveRoomStore } from './src/features/rooms';
import i18n from './src/shared/i18n';
import *  as Notifications from 'expo-notifications';


const AppContent: React.FC = () => {
  const { isDark } = useTheme();
  const language = useAppStore((state) => state.language);
  const { loadActiveRoom } = useActiveRoomStore();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  // Load active room when app starts
  useEffect(() => {
    loadActiveRoom();
  }, []);

  // Setup notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
    }),
  });

  // Setup Android notification channel (quan trọng cho Android 8+)
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        showBadge: true,
      });
    }
  }, []);

  useEffect(() => {
  const sub = Notifications.addNotificationReceivedListener((notification) => {
    console.log('📩 Notification received in app:', notification);
  });

  const clickSub = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('🖱 Notification clicked:', response);
  });

  return () => {
    sub.remove();
    clickSub.remove();
  };
}, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer linking={linking}>
        <StackNavigator />
      </NavigationContainer>
      <AppToast />
    </>
  );
};

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <Text style={styles.errorStack}>
            {this.state.error?.stack}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorStack: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <TabBarVisibilityProvider>
              <AppContent />
            </TabBarVisibilityProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

