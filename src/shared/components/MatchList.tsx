/**
 * MatchList Component
 * Component có thể tái sử dụng để hiển thị danh sách matches với FlatList
 */

import React from 'react';
import { View, FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed';
import MatchItem, { MatchItemData, MatchItemProps } from './MatchItem';
import { truncate } from '../utils/formatters';

export interface MatchListProps {
  /** Danh sách matches */
  matches: MatchItemData[];
  /** Tiêu đề section */
  title?: string;
  /** Variant hiển thị: horizontal (scroll ngang), vertical (scroll dọc), grid (lưới) */
  variant?: 'horizontal' | 'vertical' | 'grid';
  /** Variant của MatchItem */
  itemVariant?: MatchItemProps['variant'];
  /** Callback khi press vào một match */
  onMatchPress?: (matchId: string) => void;
  /** Hiển thị status icon */
  showStatus?: boolean;
  /** Số cột (chỉ dùng cho grid variant) */
  numColumns?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom style cho container */
  containerStyle?: any;
  /** Custom style cho list */
  listStyle?: any;
  /** Callback khi scroll đến cuối danh sách */
  onEndReachedCallback?: () => void;
}

const MatchList: React.FC<MatchListProps> = ({
  matches,
  title,
  variant = 'vertical',
  itemVariant = 'list',
  onMatchPress,
  showStatus = true,
  numColumns = 2,
  emptyMessage,
  containerStyle,
  listStyle,
  onEndReachedCallback,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const resolvedEmptyMessage =
    emptyMessage ?? t('matches.emptyListDefault');

  const renderItem: ListRenderItem<MatchItemData> = ({ item }) => (
    <MatchItem
      match={item}
      variant={itemVariant}
      onPress={onMatchPress}
      showStatus={showStatus}
    />
  );

  const renderHorizontalItem = ({ item }: { item: MatchItemData }) => (
    <View style={styles.horizontalItem}>
      <MatchItem
        match={item}
        variant={itemVariant}
        onPress={onMatchPress}
        showStatus={showStatus}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText variant="secondary" size="m">
        {resolvedEmptyMessage}
      </ThemedText>
    </View>
  );

  if (variant === 'horizontal') {
    return (
      <View style={[styles.container, containerStyle]}>
        {title && (
          <ThemedText
            size="xl"
            weight="bold"
            style={[styles.title, { color: theme.colors.neonGreen }]}
          >
            {title}
          </ThemedText>
        )}
        <FlatList
          data={matches}
          renderItem={renderHorizontalItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.horizontalContent,
            listStyle,
            { paddingHorizontal: theme.spacing.l }
          ]}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    );
  }

  if (variant === 'grid') {
    return (
      <View style={[styles.container, containerStyle]}>
        {title && (
          <ThemedText
            size="xl"
            weight="bold"
            style={[styles.title, { color: theme.colors.neonGreen }]}
          >
            {title}
          </ThemedText>
        )}
        <FlatList
          data={matches}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[styles.gridContent, listStyle]}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    );
  }

  // Default: vertical variant
  return (
    <View style={[styles.container, containerStyle]}>
      {title && (
        <ThemedText
          size="xl"
          weight="bold"
          style={[styles.title, { color: theme.colors.neonGreen }]}
        >
          {title}
        </ThemedText>
      )}
      <FlatList
        data={matches}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={[styles.verticalContent, listStyle]}
        onEndReached={onEndReachedCallback}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  horizontalContent: {
    paddingVertical: 8,
  },
  horizontalItem: {
    marginRight: 16,
  },
  verticalContent: {
    paddingHorizontal: 20,
  },
  gridContent: {
    paddingHorizontal: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MatchList;














