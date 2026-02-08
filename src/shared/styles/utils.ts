import { ViewStyle, TextStyle } from 'react-native';
import { Theme } from '../theme';

/**
 * Style utility functions for creating dynamic styles
 * These functions help create styles based on theme and props
 */

/**
 * Create card style with theme and variant
 */
export const createCardStyle = (
  theme: Theme,
  variant: 'default' | 'outlined' | 'elevated' = 'default'
): ViewStyle => {
  const baseStyle: ViewStyle = {
    borderRadius: theme.radius.m,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
  };

  switch (variant) {
    case 'outlined':
      return {
        ...baseStyle,
        borderWidth: 1,
        borderColor: theme.colors.border,
      };
    case 'elevated':
      return {
        ...baseStyle,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      };
    default:
      return baseStyle;
  }
};

/**
 * Create button style with theme, variant and size
 */
export const createButtonStyle = (
  theme: Theme,
  variant: 'primary' | 'secondary' | 'outline' = 'primary',
  size: 'small' | 'medium' | 'large' = 'medium'
): ViewStyle => {
  const sizeMap = {
    small: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.m,
    },
    medium: {
      paddingVertical: theme.spacing.s,
      paddingHorizontal: theme.spacing.l,
    },
    large: {
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.xl,
    },
  };

  const baseStyle: ViewStyle = {
    borderRadius: theme.radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    ...sizeMap[size],
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.primary,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.secondary,
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary,
      };
    default:
      return baseStyle;
  }
};

/**
 * Create text style with theme, size and weight
 */
export const createTextStyle = (
  theme: Theme,
  size: keyof Theme['fontSizes'] = 'm',
  weight: keyof Theme['fontWeights'] = 'regular',
  variant: 'primary' | 'secondary' | 'tertiary' | 'accent' = 'primary'
): TextStyle => {
  const colorMap = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    accent: theme.colors.neonGreen,
  };

  return {
    fontSize: theme.fontSizes[size],
    fontWeight: theme.fontWeights[weight],
    color: colorMap[variant],
  };
};

/**
 * Create container style with theme and padding
 */
export const createContainerStyle = (
  theme: Theme,
  padding?: keyof Theme['spacing']
): ViewStyle => {
  return {
    flex: 1,
    ...(padding && { padding: theme.spacing[padding] }),
  };
};

