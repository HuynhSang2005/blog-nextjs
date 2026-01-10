import { QueryClient } from '@tanstack/react-query'

/**
 * TanStack Query Client configuration
 *
 * Centralized QueryClient configuration for consistent caching behavior
 * across the application.
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/reference/QueryClient
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Data is considered fresh for 1 minute
       * Reduces unnecessary refetches for frequently accessed data
       */
      staleTime: 60 * 1000,

      /**
       * Cache garbage collection time: 5 minutes
       * Inactive queries are removed after this duration
       */
      gcTime: 5 * 60 * 1000,

      /**
       * Prevent duplicate requests within 5 seconds
       * Uses queryKey hash to deduplicate identical requests
       * Note: dedupingInterval was replaced in v5 by queryKey deduplication
       */
      // dedupingInterval: 5000, // Removed in v5 - handled automatically by queryKey

      /**
       * Refresh data when window regains focus
       * Ensures data is up-to-date after user returns to the tab
       */
      refetchOnWindowFocus: true,

      /**
       * Retry failed requests once
       * Helps with transient network issues
       */
      retry: 1,

      /**
       * Don't refetch on reconnect by default
       * Prevents unnecessary refetches when network recovers
       */
      refetchOnReconnect: 'always',
    },
    mutations: {
      /**
       * Don't retry mutations
       * Mutations typically represent intentional user actions
       */
      retry: 0,
    },
  },
})
