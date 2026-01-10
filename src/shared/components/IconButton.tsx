import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import Ionicons from '@expo/vector-icons/Ionicons';

type IconButtonSize = 'small' | 'medium' | 'large';

export interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: IconButtonSize;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  activeColor?: string;
  activeBackgroundColor?: string;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  notificationCount?: number;
  showNotificationDot?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 'medium',
  iconSize,
  color,
  backgroundColor,
  activeColor,
  activeBackgroundColor,
  disabled = false,
  loading = false,
  active = false,
  notificationCount,
  showNotificationDot = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      container: 32,
      iconSize: 18,
    },
    medium: {
      container: 40,
      iconSize: 23,
    },
    large: {
      container: 48,
      iconSize: 28,
    },
  };

  const config = sizeConfig[size];
  const finalIconSize = iconSize || config.iconSize;
  const containerSize = config.container;

  // Determine colors
  const finalColor = active 
    ? (activeColor || theme.colors.neonGreen)
    : (color || theme.colors.neonGreen);
  
  const finalBackgroundColor = active
    ? (activeBackgroundColor || theme.colors.surface)
    : (backgroundColor || theme.colors.surface);

  // Check if notification should be shown
  const hasNotification = notificationCount !== undefined && notificationCount > 0;
  const showBadge = hasNotification || showNotificationDot;

  const buttonStyles: ViewStyle[] = [
    styles.button,
    {
      width: containerSize,
      height: containerSize,
      borderRadius: containerSize / 2,
      backgroundColor: finalBackgroundColor,
      opacity: disabled ? 0.5 : 1,
    },
    style || {},
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={finalColor} 
          />
        ) : (
          <>
            <Ionicons
              name={icon}
              size={finalIconSize}
              color={finalColor}
            />
            {showBadge && (
              <View
                style={[
                  styles.notificationBadge,
                  {
                    backgroundColor: theme.colors.error,
                    right: hasNotification ? -6 : -2,
                    top: hasNotification ? -6 : -2,
                    minWidth: hasNotification ? 18 : 8,
                    height: hasNotification ? 18 : 8,
                    borderRadius: hasNotification ? 9 : 4,
                    borderWidth: hasNotification ? 2 : 0,
                    borderColor: finalBackgroundColor,
                  },
                ]}
              >
                {hasNotification && (
                  <Text
                    style={[
                      styles.notificationText,
                      {
                        fontSize: notificationCount && notificationCount > 99 ? 8 : 10,
                        color: theme.colors.white,
                      },
                    ]}
                  >
                    {notificationCount && notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  notificationText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default IconButton;

