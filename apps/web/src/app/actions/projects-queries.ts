import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import type { Tables } from '@/lib/supabase/database.types'

/**
 * Response type for project tags query
 */
interface ProjectTagResponse {
  tag: Pick<Tables<'tags'>, 'id' | 'name' | 'slug' | 'color'>
}

/**
 * Lấy tất cả projects theo locale và filter options.
 * Get all projects by locale and filter options.
 * @param locale - Locale code (e.g., 'vi')
 * @param options - Filter options (status, featured)
 * @returns Projects with tags and cover media
 */
export const getProjects = cache(
  async (
    locale: string,
    options?: {
      status?: 'in_progress' | 'completed' | 'archived'
      featured?: boolean
    }
  ) => {
    const supabase = await createClient()

    let query = supabase
      .from('projects')
      .select(
        `
        *,
        cover_media:media!cover_media_id (
          public_id,
          alt_text,
          width,
          height
        ),
        project_tags (
          tag:tags (
            id,
            name,
            slug,
            color
          )
        ),
        project_tech_stack (
          name,
          category,
          icon,
          order_index
        )
      `
      )
      .eq('locale', locale)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    // Apply filters
    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }

    return data || []
  }
)

/**
 * Lấy một project theo slug và locale.
 * Get a single project by slug and locale.
 * @param slug - Project slug
 * @param locale - Locale code
 * @returns Project with full details
 */
export const getProjectBySlug = cache(
  async (slug: string, locale: string) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        cover_media:media!cover_media_id (
          public_id,
          alt_text,
          width,
          height
        ),
        og_media:media!og_media_id (
          public_id,
          alt_text,
          width,
          height
        ),
        project_tags (
          tag:tags (
            id,
            name,
            slug,
            color
          )
        ),
        project_tech_stack (
          name,
          category,
          icon,
          order_index
        ),
        project_media (
          order_index,
          caption,
          media:media!media_id (
            public_id,
            alt_text,
            width,
            height
          )
        )
      `
      )
      .eq('slug', slug)
      .eq('locale', locale)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    return data
  }
)

/**
 * Lấy all unique tags từ projects.
 * Get all unique tags from projects.
 * @param locale - Locale code
 * @returns Array of unique tags
 */
export const getProjectTags = cache(async (locale: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_tags')
    .select(
      `
      tag:tags (
        id,
        name,
        slug,
        color
      )
    `
    )
    .order('tag(name)')

  if (error) {
    console.error('Error fetching project tags:', error)
    return []
  }

  // Extract unique tags
  const uniqueTags = new Map<string, Pick<Tables<'tags'>, 'id' | 'name' | 'slug' | 'color'>>()
  data?.forEach((item: ProjectTagResponse) => {
    if (item.tag) {
      uniqueTags.set(item.tag.id, item.tag)
    }
  })

  return Array.from(uniqueTags.values())
})

/**
 * Lấy featured projects.
 * Get featured projects.
 * @param locale - Locale code
 * @param limit - Maximum number of projects
 * @returns Featured projects
 */
export const getFeaturedProjects = cache(
  async (locale: string, limit: number = 3) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        cover_media:media!cover_media_id (
          public_id,
          alt_text,
          width,
          height
        ),
        project_tags (
          tag:tags (
            id,
            name,
            slug,
            color
          )
        )
      `
      )
      .eq('locale', locale)
      .eq('featured', true)
      .eq('status', 'completed')
      .order('order_index', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured projects:', error)
      return []
    }

    return data || []
  }
)

/**
 * Đếm số lượng projects theo status.
 * Count projects by status.
 * @param locale - Locale code
 * @returns Project counts
 */
export const getProjectStats = cache(async (locale: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select('status')
    .eq('locale', locale)

  if (error) {
    console.error('Error fetching project stats:', error)
    return {
      total: 0,
      in_progress: 0,
      completed: 0,
      archived: 0,
    }
  }

  const stats = {
    total: data?.length || 0,
    in_progress: data?.filter((p) => p.status === 'in_progress').length || 0,
    completed: data?.filter((p) => p.status === 'completed').length || 0,
    archived: data?.filter((p) => p.status === 'archived').length || 0,
  }

  return stats
})
