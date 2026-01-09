import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

import type {
  ProjectWithRelations,
  ProjectListItem,
  ProjectStatus,
  QueryResult,
  QueryListResult,
  PaginatedResponse,
  PaginationParams,
} from '@/types/supabase-helpers'

// --- Types ---

type TagJoinRow<TTag> = {
  tag: TTag | null
}

export interface ProjectFilterParams {
  search?: string
  featured?: boolean
  tagSlug?: string
  dateFrom?: string
  dateTo?: string
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
  // biome-ignore lint/suspicious/noExplicitAny: Supabase query builder type is complex
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

// --- Helpers ---

function flattenTags<TTag>(rows: Array<TagJoinRow<TTag>> | null | undefined) {
  return (rows || [])
    .map(row => row.tag)
    .filter((tag): tag is TTag => tag !== null)
}

// --- Public Queries ---

/**
 * Get all projects with pagination and filters (Public)
 */
export async function getProjects(
  locale: string,
  status: ProjectStatus | null = 'completed', // Default to completed/in_progress usually, but let's say 'completed' or null for all
  pagination?: PaginationParams,
  filters?: ProjectFilterParams
): Promise<PaginatedResponse<ProjectListItem>> {
  try {
    const supabase = await createClient()

    const tagsSelect = filters?.tagSlug
      ? `tags:project_tags!inner(
          tag:tags!inner(
            id,
            name,
            slug,
            color
          )
        )`
      : `tags:project_tags(
          tag:tags(
            id,
            name,
            slug,
            color
          )
        )`

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
        ${tagsSelect}
      `,
        { count: 'exact' }
      )
      .eq('locale', locale)

    if (status) {
      query = query.eq('status', status)
    } else {
      // If status is null/undefined, maybe we want visible ones?
      // Or if explicitly null, we want all (admin).
      // Let's assume if status is passed as null, we want all.
      // If undefined (default), we might want public ones.
      // But I set default to 'completed'.
    }

    if (filters?.search) {
      const searchTerm = filters.search.trim()
      if (searchTerm) {
        query = query.textSearch('search_vector', searchTerm, {
          type: 'websearch',
          config: 'simple',
        })
      }
    }

    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters?.tagSlug) {
      query = query.eq('tags.tag.slug', filters.tagSlug)
    }

    // Date filters (admin requirement: match created_at OR updated_at)
    query = applyOrDateFilter({
      query,
      dateFrom: filters?.dateFrom,
      dateTo: filters?.dateTo,
      fields: ['created_at', 'updated_at'],
    })

    // Default sort
    query = query.order('order_index', { ascending: true })
    query = query.order('created_at', { ascending: false })

    if (pagination) {
      const { page, pageSize } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) throw error

    const projects = (data || []).map(project => ({
      ...project,
      tags: flattenTags<ProjectListItem['tags'][number]>(
        project.tags as unknown as Array<
          TagJoinRow<ProjectListItem['tags'][number]>
        >
      ),
    })) as ProjectListItem[]

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
 * Get single project by slug (Public)
 */
export const getProject = cache(
  async (
    slug: string,
    locale: string
  ): Promise<QueryResult<ProjectWithRelations>> => {
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
        tech_stack:project_tech_stack(
          tech:tags(*)
        )
      `
        )
        .eq('slug', slug)
        .eq('locale', locale)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: new Error('Project not found') }
        }
        throw error
      }

      const project = {
        ...data,
        tags: flattenTags<ProjectWithRelations['tags'][number]>(
          data.tags as unknown as Array<
            TagJoinRow<ProjectWithRelations['tags'][number]>
          >
        ),
        tech_stack: flattenTags<ProjectWithRelations['tech_stack'][number]>(
          data.tech_stack as unknown as Array<
            TagJoinRow<ProjectWithRelations['tech_stack'][number]>
          >
        ),
      } as ProjectWithRelations

      return { data: project, error: null }
    } catch (error) {
      console.error('Error fetching project:', error)
      return { data: null, error: error as Error }
    }
  }
)

/**
 * Get featured projects (Public)
 */
export async function getFeaturedProjects(
  locale: string,
  limit = 3
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
      .order('order_index', { ascending: true })
      .limit(limit)

    if (error) throw error

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

// --- Admin Queries ---

/**
 * Get single project by ID (Admin)
 */
export async function getProjectById(
  id: string
): Promise<ProjectWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      cover_media:media!cover_media_id(*),
      og_media:media!og_media_id(*),
      project_tags(
        tag:tags(*)
      ),
      project_tech_stack(
        tech:tags(*)
      ),
      gallery:project_media(
        id,
        order_index,
        caption,
        media:media(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching project by id:', error)
    throw error
  }

  // Transform for admin usage
  const project: ProjectWithRelations = {
    ...data,
    // biome-ignore lint/suspicious/noExplicitAny: complex join structure
    tags: (data.project_tags as any[]).map(t => t.tag),
    // biome-ignore lint/suspicious/noExplicitAny: complex join structure
    tech_stack: (data.project_tech_stack as any[]).map(t => t.tech),
    // biome-ignore lint/suspicious/noExplicitAny: complex join structure
    gallery: (data.gallery as any[]).map(g => ({
      ...g,
      media: g.media,
    })),
  }

  return project
}
