/**
 * Auth Query Keys
 * For React Query cache management
 */
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

/**
 * Usage:
 * authKeys.all           => ['auth']
 * authKeys.user()        => ['auth', 'user']
 * authKeys.profile()     => ['auth', 'profile']
 */

