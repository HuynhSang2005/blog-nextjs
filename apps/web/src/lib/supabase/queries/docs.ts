import { createClient } from '@/lib/supabase/server'
import type { Tables, TablesInsert, TablesUpdate } from '../database.types'
import type { QueryResult, PaginatedResponse, PaginationParams } from '../types-helpers'

/**
 * Helper types for documentation queries
 */

// Doc with full relations
export type DocWithRelations = Tables<'docs'> & {
  topic: Tables<'docs_topics'>
  parent: Tables<'docs'> | null
  children: Tables<'docs'>[]
}

// Doc for listing (without full content)
export type DocListItem = Omit<Tables<'docs'>, 'content'> & {
  topic: Pick<Tables<'docs_topics'>, 'id' | 'name' | 'slug' | 'icon'>
  parent: Pick<Tables<'docs'>, 'id' | 'title' | 'slug'> | null
}

function normalizeDocList(rows: Array<Record<string, unknown>>): DocListItem[] {
  return rows.map((row) => {
    const topic = Array.isArray((row as any).topic)
      ? (row as any).topic[0]
      : (row as any).topic

    const parent = Array.isArray((row as any).parent)
      ? (row as any).parent[0] ?? null
      : (row as any).parent ?? null

    return {
      ...(row as Tables<'docs'>),
      topic,
      parent,
    }
  })
}

/**
 * Filter parameters for docs query
 */
export interface DocsFilterParams {
  search?: string
  topicSlug?: string
  parentId?: string | null
  showToc?: boolean
}

/**
 * Lấy tất cả topics
 * Get all documentation topics
 * @returns List of topics ordered by order_index
 */
export async function getDocTopics(): Promise<QueryResult<Tables<'docs_topics'>[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('docs_topics')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('[getDocTopics] Error:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('[getDocTopics] Exception:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to fetch doc topics'),
    }
  }
}

/**
 * Lấy danh sách docs theo topic
 * Get docs by topic slug with optional filters
 * @param topicSlug - Topic slug
 * @param locale - Locale code (e.g., 'vi', 'en')
 * @param filters - Optional filters (search, parentId, showToc)
 * @param pagination - Optional pagination
 * @returns Paginated docs list
 */
export async function getDocsByTopic(
  topicSlug: string,
  locale: string,
  filters?: DocsFilterParams,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<DocListItem>> {
  try {
    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('docs')
      .select(
        `
        id,
        topic_id,
        title,
        slug,
        description,
        locale,
        order_index,
        parent_id,
        show_toc,
        created_at,
        updated_at,
        topic:docs_topics!topic_id (
          id,
          name,
          slug,
          icon
        ),
        parent:docs!parent_id (
          id,
          title,
          slug
        )
      `,
        { count: 'exact' },
      )
      .eq('locale', locale)
      .eq('topic.slug', topicSlug)

    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters.search.trim()
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    // Filter by parent (null for top-level docs)
    if (filters?.parentId !== undefined) {
      if (filters.parentId === null) {
        query = query.is('parent_id', null)
      } else {
        query = query.eq('parent_id', filters.parentId)
      }
    }

    // Filter by show_toc
    if (filters?.showToc !== undefined) {
      query = query.eq('show_toc', filters.showToc)
    }

    // Order by order_index then title
    query = query.order('order_index', { ascending: true }).order('title', { ascending: true })

    // Apply pagination
    if (pagination) {
      const { page, pageSize } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[getDocsByTopic] Error:', error)
      return {
        data: [],
        pagination: {
          page: pagination?.page || 1,
          pageSize: pagination?.pageSize || 50,
          totalItems: 0,
          totalPages: 0,
          hasMore: false,
        },
      }
    }

    const totalItems = count || 0
    const pageSize = pagination?.pageSize || 50
    const currentPage = pagination?.page || 1
    const totalPages = Math.ceil(totalItems / pageSize)

    return {
      data: normalizeDocList(data || []),
      pagination: {
        page: currentPage,
        pageSize,
        totalItems,
        totalPages,
        hasMore: currentPage < totalPages,
      },
    }
  } catch (err) {
    console.error('[getDocsByTopic] Exception:', err)
    return {
      data: [],
      pagination: {
        page: pagination?.page || 1,
        pageSize: pagination?.pageSize || 50,
        totalItems: 0,
        totalPages: 0,
        hasMore: false,
      },
    }
  }
}

/**
 * Lấy một doc theo topic slug và doc slug
 * Get single doc by topic slug and doc slug
 * @param topicSlug - Topic slug
 * @param docSlug - Doc slug
 * @param locale - Locale code
 * @returns Doc with full content and relations
 */
export async function getDocBySlug(
  topicSlug: string,
  docSlug: string,
  locale: string,
): Promise<QueryResult<DocWithRelations>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('docs')
      .select(
        `
        *,
        topic:docs_topics!topic_id (
          id,
          name,
          slug,
          icon,
          description
        ),
        parent:docs!parent_id (
          id,
          title,
          slug,
          description
        ),
        children:docs!parent_id (
          id,
          title,
          slug,
          description,
          order_index
        )
      `,
      )
      .eq('slug', docSlug)
      .eq('locale', locale)
      .eq('topic.slug', topicSlug)
      .order('order_index', { ascending: true, referencedTable: 'children' })
      .maybeSingle()

    if (error) {
      console.error('[getDocBySlug] Error:', error)
      return { data: null, error: new Error(error.message) }
    }

    if (!data) {
      return { data: null, error: new Error('Doc not found') }
    }

    return { data: data as DocWithRelations, error: null }
  } catch (err) {
    console.error('[getDocBySlug] Exception:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to fetch doc'),
    }
  }
}

/**
 * Lấy một doc theo ID
 * Get doc by ID (for admin editing)
 * @param id - Doc UUID
 * @returns Doc with relations
 */
export async function getDocById(id: string): Promise<QueryResult<DocWithRelations>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('docs')
      .select(
        `
        *,
        topic:docs_topics!topic_id (*),
        parent:docs!parent_id (
          id,
          title,
          slug
        ),
        children:docs!parent_id (
          id,
          title,
          slug,
          order_index
        )
      `,
      )
      .eq('id', id)
      .order('order_index', { ascending: true, referencedTable: 'children' })
      .maybeSingle()

    if (error) {
      console.error('[getDocById] Error:', error)
      return { data: null, error: new Error(error.message) }
    }

    if (!data) {
      return { data: null, error: new Error('Doc not found') }
    }

    return { data: data as DocWithRelations, error: null }
  } catch (err) {
    console.error('[getDocById] Exception:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to fetch doc'),
    }
  }
}

/**
 * Tạo doc mới
 * Create new doc
 * @param docData - Doc insert data
 * @returns Newly created doc
 */
export async function createDoc(
  docData: TablesInsert<'docs'>,
): Promise<QueryResult<Tables<'docs'>>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('docs')
      .insert(docData)
      .select()
      .single()

    if (error) {
      console.error('[createDoc] Error:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (err) {
    console.error('[createDoc] Exception:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to create doc'),
    }
  }
}

/**
 * Cập nhật doc
 * Update doc
 * @param id - Doc UUID
 * @param updates - Doc update data
 * @returns Updated doc
 */
export async function updateDoc(
  id: string,
  updates: TablesUpdate<'docs'>,
): Promise<QueryResult<Tables<'docs'>>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('docs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[updateDoc] Error:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data, error: null }
  } catch (err) {
    console.error('[updateDoc] Exception:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to update doc'),
    }
  }
}

/**
 * Xóa doc
 * Delete doc (hard delete, cascade to children via FK)
 * @param id - Doc UUID
 * @returns Success status
 */
export async function deleteDoc(id: string): Promise<QueryResult<boolean>> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('docs').delete().eq('id', id)

    if (error) {
      console.error('[deleteDoc] Error:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: true, error: null }
  } catch (err) {
    console.error('[deleteDoc] Exception:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to delete doc'),
    }
  }
}

/**
 * Lấy tất cả docs (for admin listing)
 * Get all docs with filters
 * @param locale - Locale code
 * @param filters - Optional filters
 * @param pagination - Optional pagination
 * @returns Paginated docs list
 */
export async function getAllDocs(
  locale: string,
  filters?: DocsFilterParams,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<DocListItem>> {
  try {
    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('docs')
      .select(
        `
        id,
        topic_id,
        title,
        slug,
        description,
        locale,
        order_index,
        parent_id,
        show_toc,
        created_at,
        updated_at,
        topic:docs_topics!topic_id (
          id,
          name,
          slug,
          icon
        ),
        parent:docs!parent_id (
          id,
          title,
          slug
        )
      `,
        { count: 'exact' },
      )
      .eq('locale', locale)

    // Apply filters
    if (filters?.search) {
      const searchTerm = filters.search.trim()
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }

    if (filters?.topicSlug) {
      query = query.eq('topic.slug', filters.topicSlug)
    }

    if (filters?.parentId !== undefined) {
      if (filters.parentId === null) {
        query = query.is('parent_id', null)
      } else {
        query = query.eq('parent_id', filters.parentId)
      }
    }

    // Order by topic, then order_index, then title
    query = query
      .order('topic_id', { ascending: true })
      .order('order_index', { ascending: true })
      .order('title', { ascending: true })

    // Apply pagination
    if (pagination) {
      const { page, pageSize } = pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[getAllDocs] Error:', error)
      return {
        data: [],
        pagination: {
          page: pagination?.page || 1,
          pageSize: pagination?.pageSize || 50,
          totalItems: 0,
          totalPages: 0,
          hasMore: false,
        },
      }
    }

    const totalItems = count || 0
    const pageSize = pagination?.pageSize || 50
    const currentPage = pagination?.page || 1
    const totalPages = Math.ceil(totalItems / pageSize)

    return {
      data: normalizeDocList(data || []),
      pagination: {
        page: currentPage,
        pageSize,
        totalItems,
        totalPages,
        hasMore: currentPage < totalPages,
      },
    }
  } catch (err) {
    console.error('[getAllDocs] Exception:', err)
    return {
      data: [],
      pagination: {
        page: pagination?.page || 1,
        pageSize: pagination?.pageSize || 50,
        totalItems: 0,
        totalPages: 0,
        hasMore: false,
      },
    }
  }
}

/**
 * Reorder docs within same parent
 * @param docIds - Array of doc IDs in desired order
 * @returns Success status
 */
export async function reorderDocs(docIds: string[]): Promise<QueryResult<boolean>> {
  try {
    const supabase = await createClient()

    // Update each doc's order_index
    const updates = docIds.map((id, index) =>
      supabase.from('docs').update({ order_index: index }).eq('id', id),
    )

    const results = await Promise.all(updates)

    // Check for any errors
    const hasError = results.some((result) => result.error)
    if (hasError) {
      console.error('[reorderDocs] Error updating order')
      return { data: null, error: new Error('Failed to reorder docs') }
    }

    return { data: true, error: null }
  } catch (err) {
    console.error('[reorderDocs] Exception:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Failed to reorder docs'),
    }
  }
}
