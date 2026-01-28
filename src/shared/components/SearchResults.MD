import React, { useCallback } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";
import { useTheme } from "@/shared/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText } from "./themed";

// ============= Base Interface =============
export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: any;
  rightLabel?: string; // "Match", "Post", etc.
  rightIcon?: keyof typeof Ionicons.glyphMap;
}

// ============= Type-Specific Interfaces =============
export interface PlayerSearchData {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  email?: string;
  createdAt: string;
}

export interface PostSearchData {
  postId: string;
  content: string;
  userFullName: string;
  media?: Array<{
    mediaId: string;
    publicUrl: string;
    mediaType: 0 | 1;
  }>;
  createdAt: string;
}

export interface MatchSearchData {
  roomId: string;
  roomName: string;
  image?: string;
  createdAt: string;
  location?: string;
  status?: string;
}

// ============= Helper Functions =============
const DEFAULT_AVATAR = require("@/assets/images/icon.png");
const DEFAULT_POST_IMAGE = require("@/assets/images/icon.png");
const DEFAULT_MATCH_IMAGE = require("@/assets/images/icon.png");

/**
 * Transform Player data to SearchResultItem
 */
export const transformPlayerToSearchResult = (
  player: PlayerSearchData,
): SearchResultItem => {
  return {
    id: player.userId,
    title: player.fullName,
    subtitle: player.email || new Date(player.createdAt).toLocaleDateString(),
    image: player.avatarUrl ? { uri: player.avatarUrl } : DEFAULT_AVATAR,
    rightLabel: "Player",
  };
};

/**
 * Transform Post data to SearchResultItem
 */
export const transformPostToSearchResult = (
  post: PostSearchData,
): SearchResultItem => {
  const firstImage = post.media?.find((m) => m.mediaType === 0);
  const imageSource = firstImage
    ? { uri: firstImage.publicUrl }
    : DEFAULT_POST_IMAGE;

  const subtitle = post.content
    ? post.content.substring(0, 50) + (post.content.length > 50 ? "..." : "")
    : new Date(post.createdAt).toLocaleDateString();

  return {
    id: post.postId,
    title: post.userFullName || "Post",
    subtitle,
    image: imageSource,
    rightLabel: "Post",
  };
};

/**
 * Transform Match data to SearchResultItem
 */
export const transformMatchToSearchResult = (
  match: MatchSearchData,
): SearchResultItem => {
  const subtitle = [
    match.location,
    match.status,
    new Date(match.createdAt).toLocaleDateString(),
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    id: match.roomId,
    title: match.roomName,
    subtitle: subtitle || new Date(match.createdAt).toLocaleDateString(),
    image: match.image ? { uri: match.image } : DEFAULT_MATCH_IMAGE,
    rightLabel: "Match",
  };
};

// ============= Component Props =============
interface SearchResultsListProps<T extends SearchResultItem> {
  data: T[];
  loading?: boolean;
  loadingMore?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onItemPress?: (item: T) => void;
  renderEmpty?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  ListHeaderComponent?: React.ReactElement | null;
}

// ============= Main Component =============
export function SearchResultsList<T extends SearchResultItem>({
  data,
  loading,
  loadingMore,
  refreshing,
  onRefresh,
  onLoadMore,
  onItemPress,
  renderEmpty,
  renderFooter,
  ListHeaderComponent,
}: SearchResultsListProps<T>) {
  const { theme } = useTheme();

  const renderItem = useCallback(
    ({ item }: { item: T }) => (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
        onPress={() => onItemPress?.(item)}
        activeOpacity={0.7}
      >
        {/* Left: Image/Avatar */}
        <View
          style={[
            styles.imageContainer,
            {
              backgroundColor: theme.colors.border,
            },
          ]}
        >
          {item.image ? (
            <Image source={item.image} style={styles.image} />
          ) : (
            <Ionicons
              name="image-outline"
              size={24}
              color={theme.colors.textSecondary}
            />
          )}
        </View>

        {/* Middle: Title & Subtitle */}
        <View style={styles.contentContainer}>
          <ThemedText size="m" weight="semiBold" numberOfLines={1}>
            {item.title}
          </ThemedText>
          {item.subtitle && (
            <ThemedText
              variant="secondary"
              size="s"
              numberOfLines={1}
              style={{ marginTop: 2 }}
            >
              {item.subtitle}
            </ThemedText>
          )}
        </View>

        {/* Right: Label or Icon */}
        {(item.rightLabel || item.rightIcon) && (
          <View style={styles.rightContainer}>
            {item.rightIcon ? (
              <Ionicons
                name={item.rightIcon}
                size={20}
                color={theme.colors.textSecondary}
              />
            ) : (
              <Text
                style={[
                  styles.rightLabel,
                  {
                    color: theme.colors.textSecondary,
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                {item.rightLabel}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    ),
    [theme, onItemPress],
  );

  const defaultRenderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerContainer}>
        <ThemedText variant="secondary" size="s">
          Đang tải thêm...
        </ThemedText>
      </View>
    );
  }, [loadingMore]);

  const defaultRenderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="search-outline"
          size={48}
          color={theme.colors.textSecondary}
        />
        <ThemedText
          variant="secondary"
          size="m"
          style={{ marginTop: theme.spacing.m }}
        >
          Không tìm thấy kết quả
        </ThemedText>
      </View>
    );
  }, [loading, theme]);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={defaultRenderEmpty}
      ListFooterComponent={defaultRenderFooter}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={[
        styles.listContent,
        data.length === 0 && styles.emptyListContent,
      ]}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={15}
    />
  );
}


const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  rightContainer: {
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  rightLabel: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  footerContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
});
