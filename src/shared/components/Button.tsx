import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const buttonStyles: ViewStyle[] = [
    styles.button,
    {
      borderRadius: theme.radius.m,
      backgroundColor: variant === 'primary' ? theme.colors.primary : 
                      variant === 'secondary' ? theme.colors.secondary : 
                      'transparent',
      borderWidth: variant === 'outline' ? 2 : 0,
      borderColor: variant === 'outline' ? theme.colors.primary : 'transparent',
      paddingVertical: size === 'small' ? theme.spacing.xs : 
                       size === 'medium' ? theme.spacing.s : 
                       theme.spacing.m,
      paddingHorizontal: size === 'small' ? theme.spacing.m : 
                         size === 'medium' ? theme.spacing.l : 
                         theme.spacing.xl,
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ];

  const textStyles: TextStyle[] = [
    {
      fontSize: size === 'small' ? theme.fontSizes.s : 
                size === 'medium' ? theme.fontSizes.m : 
                theme.fontSizes.l,
      color: variant === 'outline' ? theme.colors.primary : 
             variant === 'primary' ? theme.colors.darkBlack :
             theme.colors.softWhite,
      fontWeight: '700',
    },
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : theme.colors.darkBlack} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;

