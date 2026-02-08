import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedSafeAreaView, ThemedScrollView, ThemedText, ThemedView } from '@/shared/components/themed';
import { useScrollToHideTabBar } from '@/shared/hooks/useScrollToHideTabBar';
import { RootStackParamList } from '@/app/navigation/types';
import { Notification, NotificationType } from '../types/notification.types';
import { NotificationItem } from '../components';
import { useNotifications, useMarkNotificationAsRead } from '../hooks';

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
  const { data: notifications = [], isLoading, refetch } = useNotifications(
    selectedType === 'all' ? undefined : { type: selectedType }
  );
  
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markAsRead(notification.id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: `${theme.colors.neonGreen}15` },
        ]}
      >
        <Ionicons
          name="notifications-outline"
          size={48}
          color={theme.colors.neonGreen}
        />
      </View>
      <ThemedText variant="primary" size="l" weight="bold" style={styles.emptyTitle}>
        {t('notifications.empty', { defaultValue: 'Không có thông báo' })}
      </ThemedText>
      <ThemedText variant="secondary" size="s" style={styles.emptySubtitle}>
        {t('notifications.emptyDescription', { defaultValue: 'Bạn sẽ nhận được thông báo ở đây khi có hoạt động mới' })}
      </ThemedText>
    </View>
  );

  const notificationTypes: Array<{ key: NotificationType | 'all'; label: string }> = [
    { key: 'all', label: t('notifications.types.all', { defaultValue: 'Tất cả' }) },
    { key: 'match', label: t('notifications.types.match', { defaultValue: 'Trận đấu' }) },
    { key: 'friend', label: t('notifications.types.friend', { defaultValue: 'Bạn bè' }) },
    { key: 'post', label: t('notifications.types.post', { defaultValue: 'Bài viết' }) },
    { key: 'system', label: t('notifications.types.system', { defaultValue: 'Hệ thống' }) },
  ];

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
        <View style={{ width: 24 }} />
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
        <ThemedScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
        </ThemedScrollView>
      </ThemedView>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
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
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      />
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

