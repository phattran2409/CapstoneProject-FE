import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface ThemedCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
  children?: React.ReactNode;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({ 
  variant = 'default',
  padding,
  style, 
  children,
  ...props 
}) => {
  const { theme } = useTheme();

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.m,
      padding: padding ?? theme.spacing.m,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <View 
      style={[getCardStyle(), style]} 
      {...props}
    >
      {children}
    </View>
  );
};

