import { notificationKeys, getNotifications } from '../api';
import { usePagination } from '@/shared/hooks/usePagination';
import { BaseNotification } from '../types/notification.types';

interface UsePaginatedNotificationsOptions {
  pageSize?: number,
  enabled?: boolean,
  type?: string,
  isRead?: boolean,
}

export const usePaginatedNotifications = ({
  pageSize = 20,
  enabled = true,
  type,
}: UsePaginatedNotificationsOptions = {}) => {
  const pagination = usePagination<BaseNotification>({
    queryKey: [...notificationKeys.list(type)],
    fetchFunction: async (page, size) => {
      const result = await getNotifications(page, size, type);
      return {
        data: result.notifications,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error("Error fetching notifications:", error);
    },
  });
  return {
    notifications: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setNotifications: pagination.setData,
  };
};



