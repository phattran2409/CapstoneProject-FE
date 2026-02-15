import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed/ThemedText';
import Ionicons from '@expo/vector-icons/Ionicons';

interface CaptainBadgeProps {
  compact?: boolean;
}

const CaptainBadge: React.FC<CaptainBadgeProps> = ({ compact = false }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors.neonGreen + '25',
          borderColor: theme.colors.neonGreen,
        },
        compact && styles.compactBadge,
      ]}
    >
      <Ionicons
        name="star"
        size={compact ? 10 : 12}
        color={theme.colors.neonGreen}
        style={styles.icon}
      />
      {!compact && (
        <ThemedText
          size="xs"
          weight="bold"
          style={[styles.text, { color: theme.colors.neonGreen }]}
        >
          Captain
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  compactBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  icon: {
    marginRight: 2,
  },
  text: {
    textTransform: 'uppercase',
  },
});

export { CaptainBadge };

