import { apiClient } from '@/shared/api/client';
import { Notification } from '../types/notification.types';
import { mockNotifications } from '../data/mockNotifications';

// Get all notifications
export const getNotifications = async (filters?: { 
  type?: string; 
  isRead?: boolean;
}): Promise<Notification[]> => {
  // TODO: Replace with real API call when backend is ready
  // const params = new URLSearchParams();
  // if (filters?.type) params.append('type', filters.type);
  // if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
  // const response = await apiClient.get<Notification[]>(`/notifications?${params.toString()}`);
  // return response.data;

  // Mock data - filter locally
  let filtered = [...mockNotifications];
  
  if (filters?.type) {
    filtered = filtered.filter(n => n.type === filters.type);
  }
  
  if (filters?.isRead !== undefined) {
    filtered = filtered.filter(n => n.isRead === filters.isRead);
  }
  
  // Sort by id (newest first - id 1 is newer than id 20)
  return filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
};

// Mark notification as read
export const markNotificationAsRead = async (id: string): Promise<Notification> => {
  // TODO: Replace with real API call when backend is ready
  // const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
  // return response.data;

  // Mock data - find and mark as read
  const notification = mockNotifications.find(n => n.id === id);
  if (notification) {
    notification.isRead = true;
    return { ...notification };
  }
  throw new Error('Notification not found');
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};

// Delete notification
export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};

// Get unread count
export const getUnreadCount = async (): Promise<number> => {
  // TODO: Replace with real API call when backend is ready
  // const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
  // return response.data.count;

  // Mock data - count unread notifications
  return mockNotifications.filter(n => !n.isRead).length;
};

