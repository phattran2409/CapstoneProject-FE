import { Theme } from './types';

export const darkTheme: Theme = {
  colors: {
    // Main colors - Dark background with Neon Green accents
    primary: '#97FB57', // Neon Green - pops against dark
    secondary: '#B8FF6F', // Lighter neon for secondary actions
    background: '#121212', // Dark Black - main background
    surface: '#1E1E1E', // Slightly lighter for cards
    card: '#1E1E1E',
    
    // Text colors - Light on dark
    text: '#F6F2F2', // Soft White for main text
    textPrimary: '#97FB57', // Neon Green for primary text
    textSecondary: '#909090', // Medium Gray stays same
    textTertiary: '#6B6B6B', // Darker gray
    textMuted: '#eaeaea', // Medium Gray + 50% opacity
    
    // UI colors
    border: '#2C2C2C',
    divider: '#262626',
    shadow: '#000000',
    
    // Status colors - Adjusted for dark mode
    success: '#97FB57', // Neon green
    warning: '#FFB800', // Bright yellow-orange
    error: '#FF5252', // Slightly brighter red for dark
    info: '#00E5FF', // Brighter cyan
    
    // Brand colors
    neonGreen: '#97FB57',
    darkBlack: '#121212',
    mediumGray: '#909090',
    softWhite: '#F6F2F2',
    
    // Additional
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  
  radius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    round: 999,
  },
  
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  fontSizes: {
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 20,
    xxl: 24,
    title: 28,
    header: 32,
  },
  
  fontWeights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

