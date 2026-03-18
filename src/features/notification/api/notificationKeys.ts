export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (type?: string, isRead?: boolean) => 
    [...notificationKeys.lists(), type, isRead] as const,
};

