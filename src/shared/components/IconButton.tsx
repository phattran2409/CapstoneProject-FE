import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
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
  /** Hiện chấm đỏ nhỏ ở góc trên phải khi có nội dung mới */
  showDot?: boolean;
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
  showDot = false,
  style,
  testID,
}) => {
  const { theme } = useTheme();

  const sizeConfig = {
    small: { container: 32, iconSize: 18 },
    medium: { container: 40, iconSize: 23 },
    large: { container: 48, iconSize: 28 },
  };

  const config = sizeConfig[size];
  const finalIconSize = iconSize || config.iconSize;
  const containerSize = config.container;

  const finalColor = active
    ? (activeColor || theme.colors.neonGreen)
    : (color || theme.colors.neonGreen);

  const finalBackgroundColor = active
    ? (activeBackgroundColor || theme.colors.surface)
    : (backgroundColor || theme.colors.surface);

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
          <ActivityIndicator size="small" color={finalColor} />
        ) : (
          <>
            <Ionicons name={icon} size={finalIconSize} color={finalColor} />
            {showDot && (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: theme.colors.error },
                ]}
              />
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
  dot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default IconButton;

