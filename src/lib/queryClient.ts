import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized settings for high-concurrency scenarios
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for real-time data
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect to avoid unnecessary requests
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  // Cafe related queries
  cafes: ['cafes'] as const,
  cafe: (id: string) => ['cafes', id] as const,
  cafeMenu: (cafeId: string) => ['cafes', cafeId, 'menu'] as const,
  
  // Order related queries
  orders: ['orders'] as const,
  userOrders: (userId: string) => ['orders', 'user', userId] as const,
  cafeOrders: (cafeId: string) => ['orders', 'cafe', cafeId] as const,
  order: (orderId: string) => ['orders', orderId] as const,
  
  // User related queries
  profile: (userId: string) => ['profile', userId] as const,
  
  // Notifications
  notifications: (userId: string) => ['notifications', userId] as const,
} as const;
