import { useRef, useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';

const SCROLL_THRESHOLD = 10; // Minimum scroll distance to trigger hide/show

/**
 * Hook to automatically hide/show tab bar based on scroll direction
 * 
 * @example
 * const scrollHandler = useScrollToHideTabBar();
 * 
 * <ScrollView
 *   onScroll={scrollHandler}
 *   scrollEventThrottle={16}
 * >
 */
export const useScrollToHideTabBar = () => {
  const { setIsVisible } = useTabBarVisibility();
  const lastScrollY = useRef(0);
  const scrollOffset = useRef(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const scrollDifference = currentScrollY - lastScrollY.current;

      // Only update if scroll difference is significant
      if (Math.abs(scrollDifference) < SCROLL_THRESHOLD) {
        return;
      }

      // Scrolling down - hide tab bar
      if (scrollDifference > 0 && currentScrollY > SCROLL_THRESHOLD) {
        setIsVisible(false);
      }
      // Scrolling up - show tab bar
      else if (scrollDifference < 0) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
      scrollOffset.current = currentScrollY;
    },
    [setIsVisible]
  );

  return handleScroll;
};




