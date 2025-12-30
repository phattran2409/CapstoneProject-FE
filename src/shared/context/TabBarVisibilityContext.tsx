import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import type Animated from 'react-native-reanimated';

interface TabBarVisibilityContextType {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  translateY: Animated.SharedValue<number>;
  animatedStyle: any;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType | undefined>(undefined);

export const TabBarVisibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = translateY.value === 0 ? 1 : 0;
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity,
    };
  });

  const handleSetVisible = (visible: boolean) => {
    setIsVisible(visible);
    translateY.value = withTiming(visible ? 0 : 100, {
      duration: 300,
    });
  };

  return (
    <TabBarVisibilityContext.Provider
      value={{
        isVisible,
        setIsVisible: handleSetVisible,
        translateY,
        animatedStyle,
      }}
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

export const useTabBarVisibility = () => {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    throw new Error('useTabBarVisibility must be used within TabBarVisibilityProvider');
  }
  return context;
};

