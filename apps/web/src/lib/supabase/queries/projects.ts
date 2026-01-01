import { createClient } from '@/lib/supabase/server'
import type {
  ProjectWithRelations,
  ProjectListItem,
  ProjectStatus,
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

function byOrderIndexAsc(
  a: { order_index: number | null },
  b: { order_index: number | null }
) {
  return (a.order_index ?? 0) - (b.order_index ?? 0)
}

/**
 * Lấy tất cả projects với pagination và filters
 * @param locale - Locale code (e.g., 'vi', 'en')
 * @param status - Project status filter (optional)
 * @param pagination - Pagination parameters (optional)
 * @returns Paginated projects
 */
export async function getProjects(
  locale: string,
  status?: ProjectStatus,
  pagination?: PaginationParams
): Promise<PaginatedResponse<ProjectListItem>> {
  try {
    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('projects')
      .select(
        `
        *,
        cover_media:media!cover_media_id (
          id,
          public_id,
          alt_text
        ),
        tags:project_tags(
          tag:tags(
            id,
            name,
            slug,
            color
          )
        )
      `,
        { count: 'exact' }
      )
      .eq('locale', locale)

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Apply pagination
    if (pagination) {
      const { page, pageSize } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    // Order by order_index, then start_date
    query = query.order('order_index', { ascending: true, nullsFirst: false })
    query = query.order('start_date', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    // Transform tags structure
    const projects = (data || []).map(project => ({
      ...project,
      tags: flattenTags<ProjectListItem['tags'][number]>(
        project.tags as unknown as Array<
          TagJoinRow<ProjectListItem['tags'][number]>
        >
      ),
    })) as ProjectListItem[]

    // Calculate pagination
    const totalItems = count || 0
    const currentPage = pagination?.page || 1
    const currentPageSize = pagination?.pageSize || projects.length
    const totalPages =
      currentPageSize > 0 ? Math.ceil(totalItems / currentPageSize) : 0

    return {
      data: projects,
      pagination: {
        page: currentPage,
        pageSize: currentPageSize,
        totalItems,
        totalPages,
        hasMore: currentPage < totalPages,
      },
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

/**
 * Lấy một project theo slug
 * @param slug - Project slug
 * @param locale - Locale code
 * @returns Project với full relations
 */
export async function getProject(
  slug: string,
  locale: string
): Promise<QueryResult<ProjectWithRelations>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        cover_media:media!cover_media_id (*),
        og_media:media!og_media_id (*),
        tags:project_tags(
          tag:tags(*)
        ),
        tech_stack:project_tech_stack(*),
        gallery:project_media(
          *,
          media:media(*)
        )
      `
      )
      .eq('slug', slug)
      .eq('locale', locale)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return { data: null, error: new Error('Project not found') }
      }
      throw error
    }

    // Transform nested structures
    const project = {
      ...data,
      tags: flattenTags<ProjectWithRelations['tags'][number]>(
        data.tags as unknown as Array<
          TagJoinRow<ProjectWithRelations['tags'][number]>
        >
      ),
      tech_stack: (
        (data.tech_stack || []) as unknown as ProjectWithRelations['tech_stack']
      ).sort(byOrderIndexAsc),
      gallery: (
        (data.gallery || []) as unknown as ProjectWithRelations['gallery']
      ).sort(byOrderIndexAsc),
    } as ProjectWithRelations

    return { data: project, error: null }
  } catch (error) {
    console.error('Error fetching project:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Lấy featured projects
 * @param locale - Locale code
 * @param limit - Maximum number of projects (default: 6)
 * @returns Featured projects
 */
export async function getFeaturedProjects(
  locale: string,
  limit = 6
): Promise<QueryListResult<ProjectListItem>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        cover_media:media!cover_media_id (
          id,
          public_id,
          alt_text
        ),
        tags:project_tags(
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
      .eq('featured', true)
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('start_date', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Transform tags structure
    const projects = (data || []).map(project => ({
      ...project,
      tags: flattenTags<ProjectListItem['tags'][number]>(
        project.tags as unknown as Array<
          TagJoinRow<ProjectListItem['tags'][number]>
        >
      ),
    })) as ProjectListItem[]

    return { data: projects, error: null }
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    return { data: [], error: error as Error }
  }
}

/**
 * Lấy projects theo tag
 * @param tagSlug - Tag slug
 * @param locale - Locale code
 * @param pagination - Pagination parameters (optional)
 * @returns Paginated projects
 */
export async function getProjectsByTag(
  tagSlug: string,
  locale: string,
  pagination?: PaginationParams
): Promise<PaginatedResponse<ProjectListItem>> {
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

    // Get project IDs with this tag
    let tagQuery = supabase
      .from('project_tags')
      .select('project_id', { count: 'exact' })
      .eq('tag_id', tag.id)

    // Apply pagination to tag query
    if (pagination) {
      const { page, pageSize } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      tagQuery = tagQuery.range(from, to)
    }

    const { data: projectIds, error: tagError, count } = await tagQuery

    if (tagError) {
      throw tagError
    }

    if (!projectIds || projectIds.length === 0) {
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

    // Get full projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(
        `
        *,
        cover_media:media!cover_media_id (
          id,
          public_id,
          alt_text
        ),
        tags:project_tags(
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
        projectIds.map(p => p.project_id)
      )
      .eq('locale', locale)
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('start_date', { ascending: false })

    if (projectsError) {
      throw projectsError
    }

    // Transform tags structure
    const transformedProjects = (projects || []).map(project => ({
      ...project,
      tags: flattenTags<ProjectListItem['tags'][number]>(
        project.tags as unknown as Array<
          TagJoinRow<ProjectListItem['tags'][number]>
        >
      ),
    })) as ProjectListItem[]

    // Calculate pagination
    const totalItems = count || 0
    const currentPage = pagination?.page || 1
    const currentPageSize = pagination?.pageSize || transformedProjects.length
    const totalPages =
      currentPageSize > 0 ? Math.ceil(totalItems / currentPageSize) : 0

    return {
      data: transformedProjects,
      pagination: {
        page: currentPage,
        pageSize: currentPageSize,
        totalItems,
        totalPages,
        hasMore: currentPage < totalPages,
      },
    }
  } catch (error) {
    console.error('Error fetching projects by tag:', error)
    throw error
  }
}

/**
 * Lấy projects theo status
 * @param status - Project status
 * @param locale - Locale code
 * @returns Projects with specific status
 */
export async function getProjectsByStatus(
  status: ProjectStatus,
  locale: string
): Promise<QueryListResult<ProjectListItem>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        cover_media:media!cover_media_id (
          id,
          public_id,
          alt_text
        ),
        tags:project_tags(
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
      .eq('status', status)
      .order('order_index', { ascending: true, nullsFirst: false })
      .order('start_date', { ascending: false })

    if (error) {
      throw error
    }

    // Transform tags structure
    const projects = (data || []).map(project => ({
      ...project,
      tags: flattenTags<ProjectListItem['tags'][number]>(
        project.tags as unknown as Array<
          TagJoinRow<ProjectListItem['tags'][number]>
        >
      ),
    })) as ProjectListItem[]

    return { data: projects, error: null }
  } catch (error) {
    console.error('Error fetching projects by status:', error)
    return { data: [], error: error as Error }
  }
}
