import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/shared/theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'rectangular' | 'circular' | 'text';
}


export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  variant = 'rectangular',
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getVariantStyle = () => {
    switch (variant) {
      case 'circular':
        return {
          width: typeof width === 'number' ? width : 40,
          height: typeof height === 'number' ? height : 40,
          borderRadius: typeof width === 'number' ? width / 2 : 20,
        };
      case 'text':
        return {
          height: 16,
          borderRadius: 4,
        };
      default:
        return {
          borderRadius,
        };
    }
  };

  const baseStyle: ViewStyle = {
    width: width as any,
    height: height as any,
    backgroundColor: theme.colors.border,
    ...getVariantStyle(),
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        baseStyle,
        style,
        {
          opacity,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});

export default Skeleton;
