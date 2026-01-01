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

type TagJoinRow<TTag> = {
  tag: TTag | null
}

function flattenTags<TTag>(rows: Array<TagJoinRow<TTag>> | null | undefined) {
  return (rows || [])
    .map(row => row.tag)
    .filter((tag): tag is TTag => tag !== null)
}

/**
 * Filter parameters cho blog posts query
 */
export interface FilterParams {
  search?: string
  sort?: 'newest' | 'oldest' | 'title' | 'views'
  dateFrom?: string
  dateTo?: string
  tagSlug?: string
}

function isoDayStart(date: string): string {
  return `${date}T00:00:00.000Z`
}

function isoNextDayStart(date: string): string {
  const dayStart = new Date(`${date}T00:00:00.000Z`)
  dayStart.setUTCDate(dayStart.getUTCDate() + 1)
  return dayStart.toISOString()
}

/**
 * Lấy tất cả blog posts với pagination và filters
 * @param locale - Locale code (e.g., 'vi', 'en')
 * @param status - Post status filter (optional)
 * @param pagination - Pagination parameters (optional)
 * @param filters - Filter parameters (search, sort, date range, tag)
 * @returns Paginated blog posts
 */
export async function getBlogPosts(
  locale: string,
  status?: BlogPostStatus,
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<PaginatedResponse<BlogPostListItem>> {
  try {
    const supabase = await createClient()

    // When filtering by tag, we must use an inner join so PostgREST can
    // restrict blog_posts rows based on the related tag.
    const tagsSelect = filters?.tagSlug
      ? `tags:blog_post_tags!inner(
          tag:tags!inner(
            id,
            name,
            slug,
            color
          )
        )`
      : `tags:blog_post_tags(
          tag:tags(
            id,
            name,
            slug,
            color
          )
        )`

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
        ${tagsSelect}
      `,
        { count: 'exact' }
      )
      .eq('locale', locale)

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    } else {
      // Default: only published posts for public access
      query = query.eq('status', 'published')
    }

    // Apply search filter (title + excerpt)
    if (filters?.search) {
      const searchTerm = filters.search.trim()
      query = query.or(
        `title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`
      )
    }

    // Apply date range filters (inclusive)
    if (filters?.dateFrom) {
      query = query.gte('published_at', isoDayStart(filters.dateFrom))
    }
    if (filters?.dateTo) {
      query = query.lt('published_at', isoNextDayStart(filters.dateTo))
    }

    // Apply tag filter
    if (filters?.tagSlug) {
      // Filter through embedded relation
      query = query.eq('tags.tag.slug', filters.tagSlug)
    }

    // Apply sorting
    const sortOption = filters?.sort || 'newest'
    switch (sortOption) {
      case 'newest':
        query = query.order('published_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('published_at', { ascending: true })
        break
      case 'title':
        query = query.order('title', { ascending: true })
        break
      case 'views':
        query = query.order('view_count', {
          ascending: false,
          nullsFirst: false,
        })
        break
      default:
        query = query.order('published_at', { ascending: false })
    }

    // Apply pagination
    if (pagination) {
      const { page, pageSize } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    // Transform tags structure (flatten nested array)
    const posts = (data || []).map(post => ({
      ...post,
      tags: flattenTags<BlogPostListItem['tags'][number]>(
        post.tags as unknown as Array<
          TagJoinRow<BlogPostListItem['tags'][number]>
        >
      ),
    })) as BlogPostListItem[]

    // Calculate pagination
    const totalItems = count || 0
    const currentPage = pagination?.page || 1
    const currentPageSize = pagination?.pageSize || posts.length
    const totalPages =
      currentPageSize > 0 ? Math.ceil(totalItems / currentPageSize) : 0

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
  locale: string
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
      `
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
      tags: flattenTags<BlogPostWithRelations['tags'][number]>(
        data.tags as unknown as Array<
          TagJoinRow<BlogPostWithRelations['tags'][number]>
        >
      ),
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
  pagination?: PaginationParams
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
      `
      )
      .in(
        'id',
        postIds.map(p => p.blog_post_id)
      )
      .eq('locale', locale)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (postsError) {
      throw postsError
    }

    // Transform tags structure
    const transformedPosts = (posts || []).map(post => ({
      ...post,
      tags: flattenTags<BlogPostListItem['tags'][number]>(
        post.tags as unknown as Array<
          TagJoinRow<BlogPostListItem['tags'][number]>
        >
      ),
    })) as BlogPostListItem[]

    // Calculate pagination
    const totalItems = count || 0
    const currentPage = pagination?.page || 1
    const currentPageSize = pagination?.pageSize || transformedPosts.length
    const totalPages =
      currentPageSize > 0 ? Math.ceil(totalItems / currentPageSize) : 0

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
  limit = 3
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
      `
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
    const posts = (data || []).map(post => ({
      ...post,
      tags: flattenTags<BlogPostListItem['tags'][number]>(
        post.tags as unknown as Array<
          TagJoinRow<BlogPostListItem['tags'][number]>
        >
      ),
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
  limit = 3
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

    const tagIds = currentPostTags.map(t => t.tag_id)

    // Get posts with same tags
    const { data: relatedPostIds } = await supabase
      .from('blog_post_tags')
      .select('blog_post_id')
      .in('tag_id', tagIds)
      .neq('blog_post_id', postId)

    if (!relatedPostIds || relatedPostIds.length === 0) {
      return { data: [], error: null }
    }

    const uniquePostIds = [...new Set(relatedPostIds.map(p => p.blog_post_id))]

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
      `
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
    const posts = (data || []).map(post => ({
      ...post,
      tags: flattenTags<BlogPostListItem['tags'][number]>(
        post.tags as unknown as Array<
          TagJoinRow<BlogPostListItem['tags'][number]>
        >
      ),
    })) as BlogPostListItem[]

    return { data: posts, error: null }
  } catch (error) {
    console.error('Error fetching related blog posts:', error)
    return { data: [], error: error as Error }
  }
}
