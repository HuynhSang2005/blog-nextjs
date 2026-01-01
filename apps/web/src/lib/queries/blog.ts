import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type BlogPost = Database['public']['Tables']['blog_posts']['Row'] & {
  cover_media?: Database['public']['Tables']['media']['Row'] | null
  author?: Database['public']['Tables']['profiles']['Row'] | null
  tags?: Array<Database['public']['Tables']['tags']['Row']>
}

type TagRow = Database['public']['Tables']['tags']['Row']

interface BlogPostTagJoinRow {
  tag: TagRow | null
}

/**
 * Get all blog posts with related data
 * @param locale - Optional locale filter (default: 'vi')
 * @returns Array of blog posts with media and author info
 */
export async function getBlogPosts(locale: string = 'vi'): Promise<BlogPost[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      cover_media:media!blog_posts_cover_media_id_fkey(*),
      author:profiles!blog_posts_author_id_fkey(*)
    `)
    .eq('locale', locale)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    throw error
  }

  return data as BlogPost[]
}

/**
 * Get single blog post by slug
 * @param slug - Post slug
 * @param locale - Locale (default: 'vi')
 * @returns Blog post with relations or null
 */
export async function getBlogPost(
  slug: string,
  locale: string = 'vi'
): Promise<BlogPost | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      cover_media:media!blog_posts_cover_media_id_fkey(*),
      author:profiles!blog_posts_author_id_fkey(*)
    `)
    .eq('slug', slug)
    .eq('locale', locale)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching blog post:', error)
    throw error
  }

  return data as BlogPost
}

/**
 * Get single blog post by ID (for admin editing)
 * @param id - Post UUID
 * @returns Blog post with relations or null
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
    console.error('Error fetching blog post by ID:', error)
    throw error
  }

  // Transform blog_post_tags to tags array
  const post = data as BlogPost & {
    blog_post_tags?: BlogPostTagJoinRow[] | null
  }
  const tags = (post.blog_post_tags || [])
    .map(bpt => bpt.tag)
    .filter((tag): tag is TagRow => tag !== null)
  const { blog_post_tags: _blogPostTags, ...rest } = post

  return { ...rest, tags } as BlogPost
}

/**
 * Get blog posts by status (for admin filtering)
 * @param status - draft | published | archived
 * @param locale - Locale (default: 'vi')
 * @returns Filtered blog posts
 */
export async function getBlogPostsByStatus(
  status: 'draft' | 'published' | 'archived',
  locale: string = 'vi'
): Promise<BlogPost[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      cover_media:media!blog_posts_cover_media_id_fkey(*),
      author:profiles!blog_posts_author_id_fkey(*)
    `)
    .eq('locale', locale)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts by status:', error)
    throw error
  }

  return data as BlogPost[]
}
