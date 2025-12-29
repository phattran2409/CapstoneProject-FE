export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  detail: (userId: string) => [...profileKeys.all, 'detail', userId] as const,
  stats: (userId: string) => [...profileKeys.all, 'stats', userId] as const,
  matchHistory: (userId: string) => [...profileKeys.all, 'matchHistory', userId] as const,
  preferences: () => [...profileKeys.all, 'preferences'] as const,
};

