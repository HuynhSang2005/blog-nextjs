'use client'

import { useQuery } from '@tanstack/react-query'

export interface AdminStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalProjects: number
  completedProjects: number
  inProgressProjects: number
  totalTags: number
  totalDocs: number
  recentPosts: Array<{
    id: string
    title: string
    status: string
    published_at: string | null
  }>
}

/**
 * Fetch admin dashboard statistics
 */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats')
      }
      return response.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Data is stale after 10 seconds
  })
}

/**
 * Prefetch admin stats (useful when navigating to admin dashboard)
 */
export async function prefetchAdminStats(
  queryClient: ReturnType<typeof import('@tanstack/react-query').useQueryClient>
) {
  await queryClient.prefetchQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats')
      }
      return response.json()
    },
  })
}
