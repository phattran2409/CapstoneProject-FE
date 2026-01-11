import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Notification, NotificationType } from '../types/notification.types';
import { ThemedText, ThemedView } from '@/shared/components/themed';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
  onMarkAsRead?: () => void;
}

const getNotificationIcon = (type: NotificationType, action?: string): string => {
  switch (type) {
    case 'match':
      switch (action) {
        case 'invited':
          return 'mail-outline';
        case 'joined':
          return 'person-add-outline';
        case 'started':
          return 'play-outline';
        case 'finished':
          return 'checkmark-circle-outline';
        default:
          return 'football-outline';
      }
    case 'friend':
      switch (action) {
        case 'request':
          return 'person-add-outline';
        case 'accepted':
          return 'checkmark-circle-outline';
        case 'followed':
          return 'people-outline';
        default:
          return 'people-outline';
      }
    case 'post':
      switch (action) {
        case 'liked':
          return 'heart-outline';
        case 'commented':
          return 'chatbubble-outline';
        case 'shared':
          return 'share-outline';
        default:
          return 'document-text-outline';
      }
    case 'system':
      return 'notifications-outline';
    default:
      return 'notifications-outline';
  }
};

const getNotificationColor = (type: NotificationType, theme: any): string => {
  switch (type) {
    case 'match':
      return theme.colors.neonGreen;
    case 'friend':
      return '#4A90E2';
    case 'post':
      return '#FF6B6B';
    case 'system':
      return theme.colors.textSecondary;
    default:
      return theme.colors.textSecondary;
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const iconName = getNotificationIcon(notification.type, (notification as any).action);
  const iconColor = getNotificationColor(notification.type, theme);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: notification.isRead 
            ? theme.colors.surface 
            : theme.colors.surface,
          borderLeftWidth: notification.isRead ? 0 : 3,
          borderLeftColor: iconColor,
          opacity: notification.isRead ? 0.6 : 1,
        },
      ]}
    >
      <ThemedView style={styles.content}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${iconColor}20`,
            },
          ]}
        >
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <ThemedText
            variant="primary"
            size="m"
            weight={notification.isRead ? "regular" : "semiBold"}
            style={styles.title}
          >
            {notification.title}
          </ThemedText>
          <ThemedText
            variant="secondary"
            size="s"
            style={styles.message}
            numberOfLines={2}
          >
            {notification.message}
          </ThemedText>
          <ThemedText variant="secondary" size="xs" style={styles.timestamp}>
            {notification.timestamp}
          </ThemedText>
        </View>

        {/* Unread indicator */}
        {!notification.isRead && (
          <View
            style={[
              styles.unreadIndicator,
              {
                backgroundColor: theme.colors.neonGreen,
              },
            ]}
          />
        )}
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  message: {
    marginBottom: 8,
    lineHeight: 18,
  },
  timestamp: {
    marginTop: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  
});

