import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedView, ThemedText, ThemedIcon } from '@/shared/components/themed';
import { useTheme } from '@/shared/theme';
import type { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type TextSize = 'xs' | 's' | 'm' | 'l' | 'xl';
type TextWeight = 'regular' | 'medium' | 'semiBold' | 'bold';

interface RoomInfoCardProps {
  icon: IconName;
  label: string;
  value: React.ReactNode;
  valueSize?: TextSize;
  valueWeight?: TextWeight;
  subValue?: React.ReactNode;
  subtitle?: React.ReactNode;
  style?: ViewStyle;
}

export const RoomInfoCard: React.FC<RoomInfoCardProps> = ({
  icon,
  label,
  value,
  valueSize = 'l',
  valueWeight = 'semiBold',
  subValue,
  subtitle,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <ThemedView
      style={[
        styles.infoCard,
        { backgroundColor: theme.colors.surface },
        style,
      ]}
    >
      <View
        style={[
          styles.infoIconContainer,
          { backgroundColor: theme.colors.neonGreen + '20' },
        ]}
      >
        <ThemedIcon name={icon} size={24} variant="accent" />
      </View>
      <View style={styles.infoContent}>
        <ThemedText variant="secondary" size="xs" style={styles.infoLabel}>
          {label}
        </ThemedText>
        <ThemedText variant="primary" size={valueSize} weight={valueWeight}>
          {value}
        </ThemedText>
        {subValue != null && (
          <ThemedText variant="secondary" size="s">
            {subValue}
          </ThemedText>
        )}
        {subtitle != null && (
          <ThemedText variant="secondary" size="xs">
            {subtitle}
          </ThemedText>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    marginBottom: 4,
  },
});
