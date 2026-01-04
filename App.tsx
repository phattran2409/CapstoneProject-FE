import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './src/shared/theme';
import { StackNavigator } from './src/app/navigation';
import { useAppStore } from './src/store';
import { queryClient } from './src/shared/api/queryClient';
import { TabBarVisibilityProvider } from './src/shared/context/TabBarVisibilityContext';
import { AppToast } from './src/shared/toast';
import { ActiveRoomBanner } from './src/shared/components/ActiveRoomBanner';
import { useActiveRoomStore } from './src/features/rooms';
import i18n from './src/shared/i18n';

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

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
      <AppToast />
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <TabBarVisibilityProvider>
            <AppContent />
          </TabBarVisibilityProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;

