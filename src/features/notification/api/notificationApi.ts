import { apiClient } from '@/shared/api/client';
import { BaseNotification } from '../types/notification.types';

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

