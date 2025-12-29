import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { useTheme } from '../../theme';

interface ThemedScrollViewProps extends ScrollViewProps {
  variant?: 'default' | 'card' | 'surface' | 'transparent';
  children?: React.ReactNode;
}

export const ThemedScrollView: React.FC<ThemedScrollViewProps> = ({ 
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
    <ScrollView 
      style={[
        { backgroundColor: getBackgroundColor() },
        style
      ]} 
      {...props}
    >
      {children}
    </ScrollView>
  );
};

