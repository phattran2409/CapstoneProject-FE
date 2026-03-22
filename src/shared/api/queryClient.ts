import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: How long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time: How long unused data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Retry failed requests
      retry: 2,
      
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
    },
  },
});

