import { Theme } from './types';

export const lightTheme: Theme = {
  colors: {
    // Main colors - Neon Green for energy, Soft White for calm
    primary: '#97FB57', // Neon Green - vibrant, energetic
    secondary: '#121212', // Dark Black for contrast
    background: '#F6F2F2', // Soft White - main background
    surface: '#FFFFFF', // Pure white for cards/surfaces
    card: '#FFFFFF',
    
    // Text colors - Dark on light
    text: '#121212', // Dark Black for main text
    textSecondary: '#909090', // Medium Gray for secondary text
    textTertiary: '#B5B5B5', // Lighter gray
    
    // UI colors
    border: '#E0E0E0',
    divider: '#EEEEEE',
    shadow: '#000000',
    
    // Status colors - Vibrant and clear
    success: '#97FB57', // Using neon green for success
    warning: '#FFB800', // Bright yellow-orange
    error: '#FF3B3B', // Bright red
    info: '#00B8D4', // Cyan
    
    // Brand colors
    neonGreen: '#97FB57',
    darkBlack: '#121212',
    mediumGray: '#909090',
    softWhite: '#F6F2F2',
    
    // Additional
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.5)',
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

