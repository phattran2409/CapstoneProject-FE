import { apiClient } from '@/shared/api/client';
import { BaseNotification } from '../types/notification.types';
import { ApiResponse } from '@/shared/api';

export const getNotifications = async (
  page: number = 1,
  pageSize: number = 20,
  type?: string,
  isRead?: boolean,
): Promise<{
  notifications: BaseNotification[];
  totalPages: number;
  totalCount: number,
}> => {
  try {
    let url = `/notifications?page=${page}&pageSize=${pageSize}`;
    if (type) {
      url += `&type=${type}`;
    }
    const response = (await apiClient.get(url)) as {
      isSuccess: boolean;
      data: {
        notifications: BaseNotification[];
        totalPages: number;
        total: number;
      };
    };
    if (response.isSuccess && response.data) {
      return{
        notifications: response.data.notifications,
        totalPages: response.data.totalPages,
        totalCount: response.data.total,
      }
    }
    throw new Error("Failed to fetch notifications");
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markAsRead = async (notificationId: string): Promise<ApiResponse> => {
  try {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllAsRead = async (): Promise<ApiResponse> => {
  try {
    const response = await apiClient.patch(`/notifications/read-all`);
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

