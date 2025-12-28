import { createClient } from '@/lib/supabase/server'
import type {
  BlogPostWithRelations,
  BlogPostListItem,
  BlogPostStatus,
  QueryResult,
  QueryListResult,
  PaginatedResponse,
  PaginationParams,
} from '../types-helpers'

/**
 * Lấy tất cả blog posts với pagination và filters
 * @param locale - Locale code (e.g., 'vi', 'en')
 * @param status - Post status filter (optional)
 * @param pagination - Pagination parameters (optional)
 * @returns Paginated blog posts
 */
export async function getBlogPosts(
  locale: string,
  status?: BlogPostStatus,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<BlogPostListItem>> {
  try {
    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('blog_posts')
      .select(
        `
        *,
        author:profiles!author_id (
          id,
          full_name
        ),
        cover_media:media!cover_media_id (
          id,
          public_id,
          alt_text
        ),
        tags:blog_post_tags(
          tag:tags(
            id,
            name,
            slug,
            color
          )
        )
      `,
        { count: 'exact' },
      )
      .eq('locale', locale)

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    } else {
      // Default: only published posts for public access
      query = query.eq('status', 'published')
    }

    // Apply pagination
    if (pagination) {
      const { page, pageSize } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    // Order by published date
    query = query.order('published_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    // Transform tags structure (flatten nested array)
    const posts = (data || []).map((post) => ({
      ...post,
      tags: post.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    })) as BlogPostListItem[]

    // Calculate pagination
    const totalItems = count || 0
    const currentPage = pagination?.page || 1
    const currentPageSize = pagination?.pageSize || posts.length
    const totalPages = currentPageSize > 0 ? Math.ceil(totalItems / currentPageSize) : 0

    return {
      data: posts,
      pagination: {
        page: currentPage,
        pageSize: currentPageSize,
        totalItems,
        totalPages,
        hasMore: currentPage < totalPages,
      },
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    throw error
  }
}

/**
 * Lấy một blog post theo slug
 * @param slug - Post slug
 * @param locale - Locale code
 * @returns Blog post với full relations
 */
export async function getBlogPost(
  slug: string,
  locale: string,
): Promise<QueryResult<BlogPostWithRelations>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        `
        *,
        author:profiles!author_id (*),
        cover_media:media!cover_media_id (*),
        og_media:media!og_media_id (*),
        tags:blog_post_tags(
          tag:tags(*)
        )
      `,
      )
      .eq('slug', slug)
      .eq('locale', locale)
      .eq('status', 'published')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return { data: null, error: new Error('Post not found') }
      }
      throw error
    }

    // Transform tags structure
    const post = {
      ...data,
      tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    } as BlogPostWithRelations

    return { data: post, error: null }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Lấy blog posts theo tag
 * @param tagSlug - Tag slug
 * @param locale - Locale code
 * @param pagination - Pagination parameters (optional)
 * @returns Paginated blog posts
 */
export async function getBlogPostsByTag(
  tagSlug: string,
  locale: string,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<BlogPostListItem>> {
  try {
    const supabase = await createClient()

    // First, get the tag ID
    const { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug)
      .single()

    if (!tag) {
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize: 0,
          totalItems: 0,
          totalPages: 0,
          hasMore: false,
        },
      }
    }

    // Get post IDs with this tag
    let tagQuery = supabase
      .from('blog_post_tags')
      .select('blog_post_id', { count: 'exact' })
      .eq('tag_id', tag.id)

    // Apply pagination to tag query
    if (pagination) {
      const { page, pageSize } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      tagQuery = tagQuery.range(from, to)
    }

    const { data: postIds, error: tagError, count } = await tagQuery

    if (tagError) {
      throw tagError
    }

    if (!postIds || postIds.length === 0) {
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize: 0,
          totalItems: 0,
          totalPages: 0,
          hasMore: false,
        },
      }
    }

    // Get full posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select(
        `
        *,
        author:profiles!author_id (
          id,
          full_name
        ),
        cover_media:media!cover_media_id (
          id,
          public_id,
          alt_text
        ),
        tags:blog_post_tags(
          tag:tags(
            id,
            name,
            slug,
            color
          )
        )
      `,
      )
      .in(
        'id',
        postIds.map((p) => p.blog_post_id),
      )
      .eq('locale', locale)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (postsError) {
      throw postsError
    }

    // Transform tags structure
    const transformedPosts = (posts || []).map((post) => ({
      ...post,
      tags: post.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    })) as BlogPostListItem[]

    // Calculate pagination
    const totalItems = count || 0
    const currentPage = pagination?.page || 1
    const currentPageSize = pagination?.pageSize || transformedPosts.length
    const totalPages = currentPageSize > 0 ? Math.ceil(totalItems / currentPageSize) : 0

    return {
      data: transformedPosts,
      pagination: {
        page: currentPage,
        pageSize: currentPageSize,
        totalItems,
        totalPages,
        hasMore: currentPage < totalPages,
      },
    }
  } catch (error) {
    console.error('Error fetching blog posts by tag:', error)
    throw error
  }
}

/**
 * Lấy featured blog posts
 * @param locale - Locale code
 * @param limit - Maximum number of posts (default: 3)
 * @returns Featured blog posts
 */
export async function getFeaturedBlogPosts(
  locale: string,
  limit = 3,
): Promise<QueryListResult<BlogPostListItem>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        `
        *,
        author:profiles!author_id (
          id,
          full_name
        ),
        cover_media:media!cover_media_id (
          id,
          public_id,
          alt_text
        ),
        tags:blog_post_tags(
          tag:tags(
            id,
            name,
            slug,
            color
          )
        )
      `,
      )
      .eq('locale', locale)
      .eq('status', 'published')
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Transform tags structure
    const posts = (data || []).map((post) => ({
      ...post,
      tags: post.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    })) as BlogPostListItem[]

    return { data: posts, error: null }
  } catch (error) {
    console.error('Error fetching featured blog posts:', error)
    return { data: [], error: error as Error }
  }
}

/**
 * Lấy related blog posts (same tags)
 * @param postId - Current post ID
 * @param locale - Locale code
 * @param limit - Maximum number of posts (default: 3)
 * @returns Related blog posts
 */
export async function getRelatedBlogPosts(
  postId: string,
  locale: string,
  limit = 3,
): Promise<QueryListResult<BlogPostListItem>> {
  try {
    const supabase = await createClient()

    // Get tags of current post
    const { data: currentPostTags } = await supabase
      .from('blog_post_tags')
      .select('tag_id')
      .eq('blog_post_id', postId)

    if (!currentPostTags || currentPostTags.length === 0) {
      return { data: [], error: null }
    }

    const tagIds = currentPostTags.map((t) => t.tag_id)

    // Get posts with same tags
    const { data: relatedPostIds } = await supabase
      .from('blog_post_tags')
      .select('blog_post_id')
      .in('tag_id', tagIds)
      .neq('blog_post_id', postId)

    if (!relatedPostIds || relatedPostIds.length === 0) {
      return { data: [], error: null }
    }

    const uniquePostIds = [...new Set(relatedPostIds.map((p) => p.blog_post_id))]

    // Get full posts
    const { data, error } = await supabase
      .from('blog_posts')
      .select(
        `
        *,
        author:profiles!author_id (
          id,
          full_name
        ),
        cover_media:media!cover_media_id (
          id,
          public_id,
          alt_text
        ),
        tags:blog_post_tags(
          tag:tags(
            id,
            name,
            slug,
            color
          )
        )
      `,
      )
      .in('id', uniquePostIds)
      .eq('locale', locale)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Transform tags structure
    const posts = (data || []).map((post) => ({
      ...post,
      tags: post.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    })) as BlogPostListItem[]

    return { data: posts, error: null }
  } catch (error) {
    console.error('Error fetching related blog posts:', error)
    return { data: [], error: error as Error }
  }
}
