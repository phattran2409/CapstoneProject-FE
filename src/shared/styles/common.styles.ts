import { StyleSheet } from 'react-native';

/**
 * Common styles used across the application
 * These are reusable styles that don't depend on theme
 */

export const commonStyles = StyleSheet.create({
  // Layout
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  alignCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  
  // Common containers
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Common spacing
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  paddingVertical: {
    paddingVertical: 16,
  },
  
  // Common text
  textCenter: {
    textAlign: 'center',
  },
  textBold: {
    fontWeight: '700',
  },
  
  // Common shadows
  shadow: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowLarge: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

