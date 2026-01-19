import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { Skeleton } from './Skeleton';
import { ThemedView } from './themed';


export const ListSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      {/* Search Bar */}
      <View style={{ paddingHorizontal: theme.spacing.l, marginBottom: 16 }}>
        <Skeleton width="100%" height={44} borderRadius={8} />
      </View>

      {/* Cards */}
      <View style={{ paddingHorizontal: theme.spacing.l }}>
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <View
            key={index}
            style={[
              styles.friendCard,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.m,
                padding: theme.spacing.m,
                marginBottom: 12,
              },
            ]}
          >
            <View style={styles.friendInfo}>
              {/* Avatar */}
              <Skeleton variant="circular" width={56} height={56} />

              {/* Info */}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Skeleton width="60%" height={18} style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height={14} style={{ marginBottom: 6 }} />
                <View style={styles.badgeRow}>
                  <Skeleton width={60} height={20} borderRadius={10} />
                  <Skeleton width={60} height={20} borderRadius={10} style={{ marginLeft: 8 }} />
                </View>
              </View>

              {/* Online Indicator */}
              <Skeleton variant="circular" width={12} height={12} />
            </View>

          </View>
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  friendCard: {
    overflow: 'hidden',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ListSkeleton;
