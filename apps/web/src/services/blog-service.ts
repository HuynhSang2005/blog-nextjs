import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import type {
  BlogPostWithRelations,
  BlogPostListItem,
  BlogPostStatus,
  QueryResult,
  QueryListResult,
  PaginatedResponse,
  PaginationParams,
} from '@/types/supabase-helpers'

// --- Types ---

export type BlogPost = Database['public']['Tables']['blog_posts']['Row'] & {
  cover_media?: Database['public']['Tables']['media']['Row'] | null
  author?: Database['public']['Tables']['profiles']['Row'] | null
  tags?: Array<Database['public']['Tables']['tags']['Row']>
}

type TagRow = Database['public']['Tables']['tags']['Row']

type TagJoinRow<TTag> = {
  tag: TTag | null
}

export interface FilterParams {
  search?: string
  sort?: 'newest' | 'oldest' | 'title' | 'views'
  dateFrom?: string
  dateTo?: string
  tagSlug?: string
}

// --- Helpers ---

function flattenTags<TTag>(rows: Array<TagJoinRow<TTag>> | null | undefined) {
  return (rows || [])
    .map(row => row.tag)
    .filter((tag): tag is TTag => tag !== null)
}

function isoDayStart(date: string): string {
  return `${date}T00:00:00.000Z`
}

function isoNextDayStart(date: string): string {
  const dayStart = new Date(`${date}T00:00:00.000Z`)
  dayStart.setUTCDate(dayStart.getUTCDate() + 1)
  return dayStart.toISOString()
}

function applyOrDateFilter(params: {
  query: any
  dateFrom?: string
  dateTo?: string
  fields: [string, string]
}) {
  const { query, dateFrom, dateTo, fields } = params

  const start = dateFrom ? isoDayStart(dateFrom) : null
  const end = dateTo ? isoNextDayStart(dateTo) : null

  const [fieldA, fieldB] = fields

  if (start && end) {
    return query.or(
      `and(${fieldA}.gte.${start},${fieldA}.lt.${end}),and(${fieldB}.gte.${start},${fieldB}.lt.${end})`
    )
  }

  if (start) {
    return query.or(`${fieldA}.gte.${start},${fieldB}.gte.${start}`)
  }

  if (end) {
    return query.or(`${fieldA}.lt.${end},${fieldB}.lt.${end}`)
  }

  return query
}

// --- Public Queries ---

/**
 * Get all blog posts with pagination and filters (Public)
 */
export async function getBlogPosts(
  locale: string,
  status: BlogPostStatus | null = 'published',
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<PaginatedResponse<BlogPostListItem>> {
  try {
    const supabase = await createClient()

    // When filtering by tag, we must use an inner join
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

    if (status) {
      query = query.eq('status', status)
    }

    // Search (FTS)
    if (filters?.search) {
      const searchTerm = filters.search.trim()
      if (searchTerm) {
        query = query.textSearch('search_vector', searchTerm, {
          type: 'websearch',
          config: 'simple',
        })
      }
    }

    // Date filters
    // Admin requirement: date range should match both created_at and published_at.
    query = applyOrDateFilter({
      query,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
      fields: ['created_at', 'published_at'],
    })

    // Tag filter (via inner join above)
    if (filters?.tagSlug) {
      query = query.eq('tags.tag.slug', filters.tagSlug)
    }

    // Sorting
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

    // Pagination
    if (pagination) {
      const { page, pageSize } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) throw error

    const posts = (data || []).map(post => ({
      ...post,
      tags: flattenTags<BlogPostListItem['tags'][number]>(
        post.tags as unknown as Array<
          TagJoinRow<BlogPostListItem['tags'][number]>
        >
      ),
    })) as BlogPostListItem[]

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
 * Get single blog post by slug (Public)
 */
export const getBlogPost = cache(
  async (
    slug: string,
    locale: string
  ): Promise<QueryResult<BlogPostWithRelations>> => {
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
          return { data: null, error: new Error('Post not found') }
        }
        throw error
      }

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
)

/**
 * Get featured blog posts (Public)
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

    if (error) throw error

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
 * Get related blog posts (Public)
 */
export async function getRelatedBlogPosts(
  postId: string,
  locale: string,
  limit = 3
): Promise<QueryListResult<BlogPostListItem>> {
  try {
    const supabase = await createClient()

    const { data: currentPostTags } = await supabase
      .from('blog_post_tags')
      .select('tag_id')
      .eq('blog_post_id', postId)

    if (!currentPostTags || currentPostTags.length === 0) {
      return { data: [], error: null }
    }

    const tagIds = currentPostTags.map(t => t.tag_id)

    const { data: relatedPostIds } = await supabase
      .from('blog_post_tags')
      .select('blog_post_id')
      .in('tag_id', tagIds)
      .neq('blog_post_id', postId)

    if (!relatedPostIds || relatedPostIds.length === 0) {
      return { data: [], error: null }
    }

    const uniquePostIds = [...new Set(relatedPostIds.map(p => p.blog_post_id))]

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

    if (error) throw error

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

// --- Admin Queries ---

/**
 * Get single blog post by ID (Admin)
 */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      cover_media:media!blog_posts_cover_media_id_fkey(*),
      author:profiles!blog_posts_author_id_fkey(*),
      blog_post_tags(
        tag:tags(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching blog post by id:', error)
    throw error
  }

  // Transform tags for admin usage if needed, or keep as is
  // The admin form might expect a specific structure
  const post = {
    ...data,
    tags: data.blog_post_tags.map((t: any) => t.tag),
  }

  return post as unknown as BlogPost
}
