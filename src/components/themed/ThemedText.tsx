import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'accent';
  size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'title' | 'header';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  children?: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  variant = 'primary',
  size = 'm',
  weight = 'regular',
  style, 
  children,
  ...props 
}) => {
  const { theme } = useTheme();

  const getColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.colors.textSecondary;
      case 'tertiary':
        return theme.colors.textTertiary;
      case 'accent':
        return theme.colors.neonGreen;
      default:
        return theme.colors.text;
    }
  };

  return (
    <Text 
      style={[
        {
          color: getColor(),
          fontSize: theme.fontSizes[size],
          fontWeight: theme.fontWeights[weight],
        },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};

