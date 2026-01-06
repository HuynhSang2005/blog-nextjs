import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type Media = Database['public']['Tables']['media']['Row']
type ProjectWithRelations = Project & {
  cover_media: Media | null
  og_media: Media | null
  project_tags?: Array<{ tag_id: string }>
}

/**
 * Lấy tất cả projects theo locale.
 * Get all projects by locale with cover media.
 */
export async function getProjects(
  locale: string = 'vi'
): Promise<ProjectWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      cover_media:media!cover_media_id (*)
    `)
    .eq('locale', locale)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    throw error
  }

  return data as ProjectWithRelations[]
}

/**
 * Lấy một project theo slug và locale.
 * Get a single project by slug and locale.
 */
export const getProject = cache(
  async (
    slug: string,
    locale: string = 'vi'
  ): Promise<ProjectWithRelations | null> => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select(`
      *,
      cover_media:media!cover_media_id (*),
      og_media:media!og_media_id (*),
      project_tags (
        tag_id
      )
    `)
      .eq('slug', slug)
      .eq('locale', locale)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      console.error('Error fetching project:', error)
      throw error
    }

    return data as ProjectWithRelations
  }
)

/**
 * Lấy một project theo ID (cho editing).
 * Get a single project by ID for editing.
 */
export async function getProjectById(
  id: string
): Promise<ProjectWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      cover_media:media!cover_media_id (*),
      og_media:media!og_media_id (*),
      project_tags (
        tag_id
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching project by ID:', error)
    throw error
  }

  return data as ProjectWithRelations
}

/**
 * Lấy projects theo status và locale.
 * Get projects by status and locale.
 */
export async function getProjectsByStatus(
  status: 'in_progress' | 'completed' | 'archived',
  locale: string = 'vi'
): Promise<ProjectWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      cover_media:media!cover_media_id (*)
    `)
    .eq('status', status)
    .eq('locale', locale)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects by status:', error)
    throw error
  }

  return data as ProjectWithRelations[]
}

/**
 * Lấy featured projects theo locale.
 * Get featured projects by locale.
 */
export async function getFeaturedProjects(
  locale: string = 'vi'
): Promise<ProjectWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      cover_media:media!cover_media_id (*)
    `)
    .eq('featured', true)
    .eq('locale', locale)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching featured projects:', error)
    throw error
  }

  return data as ProjectWithRelations[]
}

/**
 * Lấy project tech stack.
 * Get project technologies.
 */
export async function getProjectTechStack(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_tech_stack')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching project tech stack:', error)
    throw error
  }

  return data
}

/**
 * Lấy project gallery media.
 * Get project gallery images.
 */
export async function getProjectMedia(projectId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('project_media')
    .select(`
      *,
      media (*)
    `)
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching project media:', error)
    throw error
  }

  return data
}
