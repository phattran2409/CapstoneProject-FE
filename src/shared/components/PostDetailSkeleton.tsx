import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { Skeleton } from './Skeleton';
import { ThemedView } from './themed';

export const PostDetailSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      {/* Post Header */}
      <View style={[styles.postHeader, { paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.m }]}>
        <View style={styles.authorSection}>
          <Skeleton variant="circular" width={48} height={48} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
            <Skeleton width="40%" height={14} />
          </View>
        </View>
      </View>

      {/* Post Type Badge */}
      <View style={{ paddingHorizontal: theme.spacing.l, marginBottom: 12 }}>
        <Skeleton width={100} height={24} borderRadius={20} />
      </View>

      {/* Post Title and Content */}
      <View style={{ paddingHorizontal: theme.spacing.l, marginBottom: 12 }}>
        <Skeleton width="90%" height={20} style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height={16} style={{ marginBottom: 4 }} />
        <Skeleton width="100%" height={16} style={{ marginBottom: 4 }} />
        <Skeleton width="70%" height={16} />
      </View>

      {/* Post Image */}
      <View style={{ paddingHorizontal: theme.spacing.l, marginBottom: 12 }}>
        <Skeleton width="100%" height={300} borderRadius={8} />
      </View>

      {/* Post Actions */}
      <View style={[styles.actionsRow, { paddingHorizontal: theme.spacing.l, marginBottom: 16 }]}>
        <Skeleton width={60} height={20} />
        <Skeleton width={60} height={20} />
        <Skeleton width={60} height={20} />
      </View>

      {/* Comments Section Title */}
      <View style={{ paddingHorizontal: theme.spacing.l, marginBottom: 12 }}>
        <Skeleton width={150} height={20} />
      </View>

      {/* Comment Items */}
      {[1, 2, 3].map((index) => (
        <View
          key={index}
          style={[
            styles.commentItem,
            { paddingHorizontal: theme.spacing.l, marginBottom: 16 },
          ]}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Skeleton width="40%" height={14} style={{ marginBottom: 6 }} />
            <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
            <Skeleton width="80%" height={14} />
          </View>
        </View>
      ))}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postHeader: {
    marginBottom: 12,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

export default PostDetailSkeleton;
