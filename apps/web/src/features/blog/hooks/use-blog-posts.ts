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
import type {
  BlogPostStatus,
  PaginationParams,
  PaginatedResponse,
} from '@/types/supabase-helpers'
import type { FilterParams } from '@/services/blog-service'
import type { BlogPostListItem } from '@/types/supabase-helpers'

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
 * Create a new blog post with optimistic update
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
    // Optimistic update
    onMutate: async (newPost: BlogPostFormData) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: blogPostsKeys.lists() })

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<
        PaginatedResponse<BlogPostListItem>
      >(blogPostsKeys.lists())

      // Optimistically update to the new value
      // Create a temporary post object for the UI
      const tempPost = {
        id: `temp-${Date.now()}`,
        ...newPost,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reading_time_minutes: 1,
        locale: 'vi',
        featured: false,
        allow_comments: true,
      }

      if (previousPosts) {
        queryClient.setQueryData(blogPostsKeys.lists(), {
          ...previousPosts,
          data: [tempPost, ...previousPosts.data],
        })
      }

      // Return context with previous value for rollback (always return the object, even if undefined)
      return { previousPosts: previousPosts ?? null }
    },
    onError: (
      error: Error,
      _newPost: BlogPostFormData,
      context?: { previousPosts: PaginatedResponse<BlogPostListItem> | null }
    ) => {
      // Rollback to the previous value on error
      if (context?.previousPosts) {
        queryClient.setQueryData(blogPostsKeys.lists(), context.previousPosts)
      }
      console.error('Error creating blog post:', error)
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: blogPostsKeys.lists() })
    },
  })
}

/**
 * Update an existing blog post with optimistic update
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
    // Optimistic update
    onMutate: async (variables: { id: string; data: BlogPostFormData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: blogPostsKeys.lists() })
      await queryClient.cancelQueries({
        queryKey: blogPostsKeys.detail(variables.id),
      })

      // Snapshot previous values
      const previousPost = queryClient.getQueryData(
        blogPostsKeys.detail(variables.id)
      )
      const previousPosts = queryClient.getQueryData<
        PaginatedResponse<BlogPostListItem>
      >(blogPostsKeys.lists())

      // Optimistically update the specific post
      if (previousPost) {
        queryClient.setQueryData(blogPostsKeys.detail(variables.id), {
          ...previousPost,
          ...variables.data,
          updated_at: new Date().toISOString(),
        })
      }

      // Optimistically update in the list
      if (previousPosts) {
        queryClient.setQueryData(blogPostsKeys.lists(), {
          ...previousPosts,
          data: previousPosts.data.map(post =>
            post.id === variables.id
              ? {
                  ...post,
                  ...variables.data,
                  updated_at: new Date().toISOString(),
                }
              : post
          ),
        })
      }

      return { previousPost, previousPosts: previousPosts ?? null }
    },
    onError: (
      error: Error,
      variables: { id: string; data: BlogPostFormData },
      context?: {
        previousPost: unknown
        previousPosts: PaginatedResponse<BlogPostListItem> | null
      }
    ) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(
          blogPostsKeys.detail(variables.id),
          context.previousPost
        )
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(blogPostsKeys.lists(), context.previousPosts)
      }
      console.error('Error updating blog post:', error)
    },
    onSettled: (_data, _error, variables) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: blogPostsKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: blogPostsKeys.detail(variables.id),
      })
    },
  })
}

/**
 * Delete a blog post with optimistic update
 */
export function useDeleteBlogPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteBlogPost(id)
      return id
    },
    // Optimistic update
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: blogPostsKeys.lists() })
      await queryClient.cancelQueries({ queryKey: blogPostsKeys.detail(id) })

      // Snapshot previous values
      const previousPost = queryClient.getQueryData(blogPostsKeys.detail(id))
      const previousPosts = queryClient.getQueryData<
        PaginatedResponse<BlogPostListItem>
      >(blogPostsKeys.lists())

      // Optimistically remove from list
      if (previousPosts) {
        queryClient.setQueryData(blogPostsKeys.lists(), {
          ...previousPosts,
          data: previousPosts.data.filter(post => post.id !== id),
        })
      }

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: blogPostsKeys.detail(id) })

      return { previousPost, previousPosts: previousPosts ?? null }
    },
    onError: (
      error: Error,
      _id: string,
      context?: { previousPosts: PaginatedResponse<BlogPostListItem> | null }
    ) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(blogPostsKeys.lists(), context.previousPosts)
      }
      console.error('Error deleting blog post:', error)
    },
    onSettled: (_data, _error, id) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: blogPostsKeys.lists() })
      queryClient.removeQueries({ queryKey: blogPostsKeys.detail(id) })
    },
  })
}
