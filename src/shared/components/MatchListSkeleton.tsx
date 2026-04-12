import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/shared/theme";
import { Skeleton } from "./Skeleton";

export interface MatchListSkeletonProps {
  /** Số hàng placeholder (mặc định 4) */
  count?: number;
  style?: object;
}

/**
 * Skeleton cho danh sách match dạng list (ảnh trái + text phải), khớp layout MatchItem variant list.
 */
export const MatchListSkeleton: React.FC<MatchListSkeletonProps> = ({
  count = 4,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.wrapper, { paddingHorizontal: 20 }, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.row,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.l,
            },
          ]}
        >
          <Skeleton
            width={80}
            height={80}
            borderRadius={12}
            style={styles.thumb}
          />
          <View style={styles.body}>
            <Skeleton width="75%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="55%" height={14} style={{ marginBottom: 8 }} />
            <View style={styles.metaRow}>
              <Skeleton width={48} height={22} borderRadius={8} />
              <Skeleton width={64} height={14} style={{ marginLeft: 8 }} />
            </View>
          </View>
          <Skeleton variant="circular" width={28} height={28} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
  },
  thumb: {},
  body: {
    flex: 1,
    marginLeft: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default MatchListSkeleton;
