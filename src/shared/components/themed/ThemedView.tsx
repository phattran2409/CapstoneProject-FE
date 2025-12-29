import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'card' | 'surface' | 'transparent';
  children?: React.ReactNode;
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  variant = 'default', 
  style, 
  children,
  ...props 
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'card':
        return theme.colors.card;
      case 'surface':
        return theme.colors.surface;
      case 'transparent':
        return 'transparent';
      default:
        return theme.colors.background;
    }
  };

  return (
    <View 
      style={[
        { backgroundColor: getBackgroundColor() },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

