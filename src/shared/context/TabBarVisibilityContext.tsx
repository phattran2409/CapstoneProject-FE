import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
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
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  const handleSetVisible = (visible: boolean) => {
    setIsVisible(visible);
    const animationConfig = {
      duration: 350,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Smooth ease-in-out curve
    };
    
    translateY.value = withTiming(visible ? 0 : 100, animationConfig);
    opacity.value = withTiming(visible ? 1 : 0, animationConfig);
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

