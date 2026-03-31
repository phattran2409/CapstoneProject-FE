import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/app/navigation/types";
import { ThemedText } from "@/shared/components/themed";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  LoadingMoreIndicator,
} from "@/shared/components";
import { useDebounce } from "@/shared/hooks";
import { usePaginatedPlayers } from "@/features/friends/hooks";
import { usePaginatedPosts } from "@/features/post/hooks";
import { SearchTabFilter, SearchResultItem } from "../components";
import {
  SearchFilter,
  SearchFilterType,
  SearchResultItem as SearchResultItemType,
} from "../types/search.types";
import {
  transformPlayersToSearchResult,
  transformPostToSearchResult,
} from "../utils/transformers";

type SearchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Search"
>;

interface SearchScreenProps {
  navigation: SearchScreenNavigationProp;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchFilterType>("all");

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Search filters configuration
  const searchFilters: SearchFilter[] = [
    {
      key: "all",
      label: t("search.all", { defaultValue: "Tất cả" }),
      icon: "",
    },
    {
      key: "players",
      label: t("search.players", { defaultValue: "Mọi người" }),
      icon: "people",
    },
    {
      key: "posts",
      label: t("search.posts", { defaultValue: "Bài viết" }),
      icon: "document-text",
    },
  ];

  // Fetch players 
  const {
    users,
    loading: loadingPlayers,
    loadingMore: loadingMorePlayers,
    hasMore: hasMorePlayers,
    loadMore: loadMorePlayers,
    refresh: refreshPlayers,
    refreshing: refreshingPlayers,
    error: errorPlayers,
  } = usePaginatedPlayers({
    pageSize: 10,
    searchTerm: debouncedSearchQuery,
    enabled: activeFilter === "all" || activeFilter === "players",
  });

  // Fetch posts
  const {
    posts,
    loading: loadingPosts,
    loadingMore: loadingMorePosts,
    hasMore: hasMorePosts,
    loadMore: loadMorePosts,
    refresh: refreshPosts,
    refreshing: refreshingPosts,
    error: errorPosts,
  } = usePaginatedPosts({
    pageSize: 10,
    searchTerm: debouncedSearchQuery,
    enabled: activeFilter === "all" || activeFilter === "posts",
  });

  // Combine and filter results based on active filter
  const searchResults: SearchResultItemType[] = useMemo(() => {
    let results: SearchResultItemType[] = [];

    if (activeFilter === "all" || activeFilter === "players") {
      const playerResults = users.map(transformPlayersToSearchResult);
      results = [...results, ...playerResults];
    }

    if (activeFilter === "all" || activeFilter === "posts") {
      const postResults = posts.map(transformPostToSearchResult);
      results = [...results, ...postResults];
    }

    // Sort by type if showing all
    if (activeFilter === "all") {
      results.sort((a, b) => {
        if (a.type === b.type) return 0;
        return a.type === "players" ? -1 : 1;
      });
    }

    return results;
  }, [users, posts, activeFilter]);

  // Loading states
  const loading = loadingPlayers || loadingPosts;
  const loadingMore = loadingMorePlayers || loadingMorePosts;
  const refreshing = refreshingPlayers || refreshingPosts;

  // Error states
  const error = errorPlayers || errorPosts;

  // Handle item press
  const handleItemPress = (item: SearchResultItemType) => {
    if (item.type === "players") {
      navigation.navigate("PersonalPage", { userId: item.id });
    } else if (item.type === "posts") {
      navigation.navigate("PostDetail", { postId: item.id });
    }
  };

  // Handle load more — only call if that source still has more pages
  const handleLoadMore = () => {
    if (activeFilter === "all") {
      if (hasMorePlayers && !loadingMorePlayers) loadMorePlayers();
      if (hasMorePosts && !loadingMorePosts) loadMorePosts();
    } else if (activeFilter === "players") {
      if (hasMorePlayers && !loadingMorePlayers) loadMorePlayers();
    } else if (activeFilter === "posts") {
      if (hasMorePosts && !loadingMorePosts) loadMorePosts();
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (activeFilter === "all") {
      refreshPlayers();
      refreshPosts();
    } else if (activeFilter === "players") {
      refreshPlayers();
    } else if (activeFilter === "posts") {
      refreshPosts();
    }
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) return null;

    if (!searchQuery.trim()) {
      return (
        <EmptyState
          icon="search-outline"
          title={t("search.emptyTitle", {
            defaultValue: "Tìm kiếm",
          })}
          description={t("search.emptyDescription", {
            defaultValue: "Nhập từ khóa để tìm kiếm người chơi hoặc bài viết",
          })}
        />
      );
    }

    return (
      <EmptyState
        icon="search-outline"
        title={t("search.noResults", {
          defaultValue: "Không tìm thấy kết quả",
        })}
        description={t("search.tryDifferent", {
          defaultValue: "Thử tìm kiếm với từ khóa khác",
        })}
      />
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    return <LoadingMoreIndicator />;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {/* Header with Search Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.m,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder={t("search.placeholder", {
              defaultValue: "Tìm kiếm...",
            })}
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Filters */}
      <SearchTabFilter
        filters={searchFilters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Error State */}
      {error && <ErrorState error={error} onRetry={handleRefresh} />}

      {/* Results List */}
      {!error && (<FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <SearchResultItem item={item} onPress={handleItemPress} />
        )}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          searchResults.length === 0 && styles.emptyListContent,
        ]}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyListContent: {
    flex: 1,
  },
});
