import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { Skeleton } from './Skeleton';

export const MatchroomSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* My rooms section - horizontal third cards */}
      <View style={{ marginBottom: theme.spacing.xxl }}>
        <Skeleton width={200} height={28} style={{ marginBottom: 16, marginLeft: theme.spacing.l }} />
        <View style={[styles.row, { paddingHorizontal: theme.spacing.l }]}>
          {[1, 2].map((item) => (
            <View
              key={`third-${item}`}
              style={[
                styles.thirdCard,
                {
                  marginRight: item === 1 ? 16 : 0,
                  padding: 16,
                  borderRadius: 24,
                },
              ]}
            >
              <Skeleton width="70%" height={22} style={{ marginBottom: 12 }} />
              <Skeleton width="55%" height={16} style={{ marginBottom: 12 }} />
              <Skeleton width="100%" height={1} style={{ marginBottom: 12 }} />
              <Skeleton width="65%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="85%" height={16} style={{ marginBottom: 16 }} />
              <Skeleton width="100%" height={42} borderRadius={14} />
            </View>
          ))}
        </View>
      </View>

      {/* Featured section - horizontal image cards */}
      <View style={{ marginBottom: theme.spacing.xxl }}>
        <Skeleton width={180} height={28} style={{ marginBottom: 16, marginLeft: theme.spacing.l }} />
        <View style={[styles.row, { paddingHorizontal: theme.spacing.l }]}>
          {[1, 2].map((item) => (
            <View
              key={`card-${item}`}
              style={[
                styles.cardContainer,
                { marginRight: item === 1 ? 16 : 0, borderRadius: 24 },
              ]}
            >
              <Skeleton width="100%" height={160} borderRadius={0} />
              <View style={{ padding: 16 }}>
                <Skeleton width="80%" height={20} style={{ marginBottom: 10 }} />
                <Skeleton width="65%" height={14} style={{ marginBottom: 8 }} />
                <Skeleton width="45%" height={12} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent matches section - vertical list */}
      <View style={[styles.headerRow, { paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.m }]}>
        <Skeleton width={190} height={28} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      <View style={{ paddingHorizontal: theme.spacing.l }}>
        {[1, 2, 3].map((item) => (
          <View
            key={`list-${item}`}
            style={[
              styles.listItem,
              {
                marginBottom: 12,
                padding: 12,
                borderRadius: theme.radius.l,
              },
            ]}
          >
            <Skeleton width={80} height={80} borderRadius={12} />
            <View style={styles.listContent}>
              <Skeleton width="75%" height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="55%" height={14} style={{ marginBottom: 6 }} />
              <Skeleton width="40%" height={12} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
  },
  thirdCard: {
    width: 340,
    maxWidth: '100%',
  },
  cardContainer: {
    width: 280,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
    marginLeft: 16,
  },
});

export default MatchroomSkeleton;