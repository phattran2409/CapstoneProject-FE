import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedSafeAreaView, ThemedText, ThemedView } from '@/shared/components/themed';
import HorizontalScrollWithHint from '@/shared/components/HorizontalScrollWithHint';
import { useScrollToHideTabBar } from '@/shared/hooks/useScrollToHideTabBar';
import { RootStackParamList } from '@/app/navigation/types';
import { BaseNotification, NotificationType } from '../types/notification.types';
import { NotificationItem } from '../components';
import { usePaginatedNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks';
import { NotifyEventType } from '@tanstack/react-query';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingMoreIndicator } from '@/shared/components/LoadingMoreIndicator';
import { ListSkeleton } from '@/shared/components/ListSkeleton';
import { ErrorState } from '@/shared/components/ErrorState';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

interface NotificationsScreenProps {
  navigation: NotificationsScreenNavigationProp;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollHandler = useScrollToHideTabBar();
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');

  // Fetch notifications based on selected type
  const { notifications, loading, refreshing, loadingMore, error, hasMore, refresh, loadMore, setNotifications } = usePaginatedNotifications({
    pageSize: 20,
    type: selectedType === 'all' ? undefined : selectedType,
  });

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const handleNotificationPress = (notification: BaseNotification) => {
    // Mark as read nếu chưa đọc
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }

    // Navigate qua deepLink nếu có
    if (notification.deepLink) {
      Linking.openURL(notification.deepLink).catch(() => {});
    }
  };

  const notificationTypes: Array<{ key: NotificationType | 'all'; label: string }> = [
    { key: 'all', label: t('notifications.types.all', { defaultValue: 'Tất cả' }) },
    { key: 'MatchRoom', label: t('notifications.types.MatchRoom', { defaultValue: 'Trận đấu' }) },
    { key: 'Friendship', label: t('notifications.types.Friendship', { defaultValue: 'Bạn bè' }) },
    { key: 'Post', label: t('notifications.types.Post', { defaultValue: 'Bài viết' }) },
    { key: 'Announcement', label: t('notifications.types.Announcement', { defaultValue: 'Hệ thống' }) },
    { key: 'Chat', label: t('notifications.types.Chat', { defaultValue: 'Chat' }) },
  ];

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="notifications-outline"
        title={t("notifications.empty", { defaultValue: 'Không có thông báo' })}
        description={t("notifications.emptyDescription", { defaultValue: 'Bạn sẽ nhận được thông báo ở đây khi có hoạt động mới' })}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <LoadingMoreIndicator />;
  };

  return (
    <ThemedSafeAreaView>
      {/* Header */}
      <ThemedView
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            marginTop: theme.spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
        ]}
      > 
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold" variant="primary">
          {t('notifications.title', { defaultValue: 'Thông báo' })}     
        </ThemedText>
        <TouchableOpacity
          onPress={() => markAllAsRead()}
          disabled={!notifications || notifications.length === 0}
        >
          <Ionicons name="checkmark-circle" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </ThemedView>

      {/* Filter Tabs */}
      <ThemedView
        style={[
          styles.tabsContainer,
          {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <HorizontalScrollWithHint
          contentContainerStyle={styles.tabsScrollContent}
        >
          {notificationTypes.map((type) => {
            const isSelected = selectedType === type.key;
            return (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.neonGreen
                      : theme.colors.surface,
                    marginRight: theme.spacing.s,
                  },
                ]}
                onPress={() => setSelectedType(type.key)}
              >
                <ThemedText
                  weight="semiBold"
                  style={[
                    styles.tabText,
                    {
                      color: isSelected ? '#000' : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {type.label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </HorizontalScrollWithHint>
      </ThemedView>

      {loading && <ListSkeleton />}
      {error && <ErrorState error={error} onRetry={refresh} />}
      {/* Notifications List */}
      {!loading && !error && (
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notificationId}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: theme.spacing.l }}>
            <NotificationItem
              notification={item}
              onPress={() => handleNotificationPress(item)}
            />
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: theme.spacing.xxl * 2 },
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={refresh}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
      )}
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  tabsContainer: {
    borderBottomWidth: 1,
  },
  tabsScrollContent: {
    paddingRight: 16,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
  },
  listContent: {
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
});

export default NotificationsScreen;

