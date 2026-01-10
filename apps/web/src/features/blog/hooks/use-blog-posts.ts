'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBlogPosts } from '@/services/blog-service'
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  updateBlogPostTags,
} from '@/app/actions/blog'
import type { BlogPostFormData } from '@/schemas/blog'
import type { BlogPostStatus, PaginationParams } from '@/types/supabase-helpers'
import type { FilterParams } from '@/services/blog-service'

// Query Keys
export const blogPostsKeys = {
  all: ['blog-posts'] as const,
  lists: () => [...blogPostsKeys.all, 'list'] as const,
  list: (
    locale: string,
    status: BlogPostStatus | null,
    pagination?: PaginationParams,
    filters?: FilterParams
  ) => [...blogPostsKeys.lists(), locale, status, pagination, filters] as const,
  details: () => [...blogPostsKeys.all, 'detail'] as const,
  detail: (id: string) => [...blogPostsKeys.details(), id] as const,
}

/**
 * Fetch blog posts with optional filters and pagination
 */
export function useBlogPosts(
  locale: string,
  status: BlogPostStatus | null = 'published',
  pagination?: PaginationParams,
  filters?: FilterParams
) {
  return useQuery({
    queryKey: blogPostsKeys.list(locale, status, pagination, filters),
    queryFn: async () => {
      const result = await getBlogPosts(locale, status, pagination, filters)
      return result
    },
    staleTime: 60 * 1000, // 1 minute - data is fresh for 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes - cache garbage collection time
  })
}

/**
 * Create a new blog post
 */
export function useCreateBlogPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      // Separate tag_ids from main data (handled separately)
      const { tag_ids, series_id, series_order, ...postData } = data
      const result = await createBlogPost(postData)

      // Update tags after post is created
      if (tag_ids && tag_ids.length > 0) {
        await updateBlogPostTags(result.id, tag_ids)
      }

      // Handle series
      if (series_id) {
        // TODO: Update series order if needed
      }

      return result
    },
    onSuccess: () => {
      // Invalidate and refetch blog posts
      queryClient.invalidateQueries({ queryKey: blogPostsKeys.lists() })
    },
    onError: (error: Error) => {
      console.error('Error creating blog post:', error)
    },
  })
}

/**
 * Update an existing blog post
 */
export function useUpdateBlogPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: BlogPostFormData
    }) => {
      // Separate tag_ids from main data (handled separately)
      const { tag_ids, series_id, series_order, ...postData } = data
      const result = await updateBlogPost(id, postData)

      // Update tags after post is updated
      if (tag_ids) {
        await updateBlogPostTags(id, tag_ids)
      }

      return result
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch blog posts
      queryClient.invalidateQueries({ queryKey: blogPostsKeys.lists() })
      // Invalidate the specific post
      queryClient.invalidateQueries({
        queryKey: blogPostsKeys.detail(variables.id),
      })
    },
    onError: (error: Error) => {
      console.error('Error updating blog post:', error)
    },
  })
}

/**
 * Delete a blog post
 */
export function useDeleteBlogPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteBlogPost(id)
      return id
    },
    onSuccess: id => {
      // Invalidate and refetch blog posts
      queryClient.invalidateQueries({ queryKey: blogPostsKeys.lists() })
      // Remove the specific post from cache
      queryClient.removeQueries({ queryKey: blogPostsKeys.detail(id) })
    },
    onError: (error: Error) => {
      console.error('Error deleting blog post:', error)
    },
  })
}
