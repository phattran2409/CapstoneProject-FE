import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { Skeleton } from './Skeleton';
import { ThemedView } from './themed';

export const ProfileSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      {/* Profile Header */}
      <View style={{ paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.m }}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Skeleton variant="circular" width={100} height={100} />
        </View>

        {/* Name and Bio */}
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 16 }}>
          <Skeleton width={150} height={24} style={{ marginBottom: 8 }} />
          <Skeleton width={200} height={16} style={{ marginBottom: 8 }} />
          <Skeleton width={100} height={32} borderRadius={16} />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Skeleton width={60} height={28} style={{ marginBottom: 4 }} />
            <Skeleton width={80} height={14} />
          </View>
          <View style={styles.statItem}>
            <Skeleton width={60} height={28} style={{ marginBottom: 4 }} />
            <Skeleton width={80} height={14} />
          </View>
          <View style={styles.statItem}>
            <Skeleton width={60} height={28} style={{ marginBottom: 4 }} />
            <Skeleton width={80} height={14} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <Skeleton width="48%" height={40} borderRadius={8} />
          <Skeleton width="48%" height={40} borderRadius={8} />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { paddingHorizontal: theme.spacing.l, marginTop: 16 }]}>
        <Skeleton width={80} height={36} />
        <Skeleton width={80} height={36} />
        <Skeleton width={80} height={36} />
      </View>

      {/* Content - Post Items */}
      <View style={{ paddingTop: theme.spacing.m }}>
        {[1, 2].map((index) => (
          <View
            key={index}
            style={[
              styles.postItem,
              {
                paddingHorizontal: theme.spacing.l,
                paddingVertical: theme.spacing.m,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            {/* Post Header */}
            <View style={styles.postHeader}>
              <Skeleton variant="circular" width={48} height={48} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height={14} />
              </View>
            </View>

            {/* Post Content */}
            <View style={{ marginTop: 12 }}>
              <Skeleton width="80%" height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
              <Skeleton width="90%" height={14} />
            </View>

            {/* Post Actions */}
            <View style={[styles.actionsRow, { marginTop: 12 }]}>
              <Skeleton width={50} height={20} />
              <Skeleton width={50} height={20} />
              <Skeleton width={50} height={20} />
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
  avatarSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  postItem: {
    marginBottom: 0,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ProfileSkeleton;
