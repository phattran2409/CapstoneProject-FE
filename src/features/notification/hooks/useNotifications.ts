import { notificationKeys, getNotifications, markAsRead, markAllAsRead } from '../api';
import { usePagination } from '@/shared/hooks/usePagination';
import { BaseNotification } from '../types/notification.types';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/shared/api';

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


export const useMarkAsRead = () => {
  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(),
      });
    },
  });
};

export const useMarkAllAsRead = () => {
  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(),
      });
    },
  });
};
