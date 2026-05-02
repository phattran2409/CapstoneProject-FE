export interface Theme {
  colors: {
    // Main colors
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    card: string;
    
    // Text colors
    text: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textMuted: string;
    
    // UI colors
    border: string;
    divider: string;
    shadow: string;
    
    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Special
    neonGreen: string;
    darkBlack: string;
    mediumGray: string;
    softWhite: string;
    blueSky: string;
    
    // Additional
    white: string;
    black: string;
    transparent: string;
    overlay: string;
  };
  
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  
  radius: {
    s: number;
    m: number;
    l: number;
    xl: number;
    round: number;
  };
  
  fonts: {
    regular: string;
    medium: string;
    bold: string;
  };
  
  fontSizes: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
    title: number;
    header: number;
  };
  
  fontWeights: {
    regular: '400';
    medium: '500';
    semiBold: '600';
    bold: '700';
  };
}

export type ThemeMode = 'light' | 'dark';

