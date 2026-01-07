import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { cache } from 'react'
import type { LocaleOptions, LocalizedRecord } from '@/types/i18n'
import type { SidebarNavItem } from '@/types/nav'
import type { PaginatedResponse, PaginationParams } from '@/types/supabase-helpers'

export type DocsTopic = Database['public']['Tables']['docs_topics']['Row']
export type Doc = Database['public']['Tables']['docs']['Row'] & {
  topic?: DocsTopic | null
  parent?: Pick<
    Database['public']['Tables']['docs']['Row'],
    'id' | 'title' | 'slug'
  > | null
}

export interface DocPathParams {
  locale: string
  topicSlug?: string
  docSlug?: string
}

export interface DocWithNavigation {
  doc: Doc
  topic: DocsTopic
  prevDoc: Pick<Doc, 'id' | 'title' | 'slug'> | null
  nextDoc: Pick<Doc, 'id' | 'title' | 'slug'> | null
}

export async function getDocsTopics(): Promise<DocsTopic[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('docs_topics')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching docs topics:', error)
    throw error
  }

  return data as DocsTopic[]
}

export async function getDocsTopicBySlug(
  topicSlug: string
): Promise<DocsTopic | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('docs_topics')
    .select('*')
    .eq('slug', topicSlug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching docs topic by slug:', error)
    throw error
  }

  return data as DocsTopic
}

export async function getDocsByTopicId(params: {
  topicId: string
  locale: string
}): Promise<Doc[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('docs')
    .select('*')
    .eq('topic_id', params.topicId)
    .eq('locale', params.locale)
    .order('order_index', { ascending: true })
    .order('title', { ascending: true })

  if (error) {
    console.error('Error fetching docs by topic:', error)
    throw error
  }

  return data as Doc[]
}

export async function getDocById(id: string): Promise<Doc | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('docs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Error fetching doc by id:', error)
    throw error
  }

  return data as Doc
}

export async function getDocsAdminList(): Promise<Doc[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('docs')
    .select(`
      *,
      topic:docs_topics!docs_topic_id_fkey(*)
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching docs admin list:', error)
    throw error
  }

  return data as Doc[]
}

export interface DocsAdminFilters {
  search?: string
  topicSlug?: string
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

export async function getDocsAdminListPaginated(params: {
  pagination?: PaginationParams
  filters?: DocsAdminFilters
}): Promise<PaginatedResponse<Doc>> {
  const supabase = await createClient()

  let query = supabase
    .from('docs')
    .select(
      `
      *,
      topic:docs_topics!docs_topic_id_fkey(*)
    `,
      { count: 'exact' }
    )
    .order('updated_at', { ascending: false })

  const { filters, pagination } = params

  if (filters?.search) {
    const term = filters.search.trim()
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,slug.ilike.%${term}%`
      )
    }
  }

  if (filters?.topicSlug) {
    query = query.eq('topic.slug', filters.topicSlug)
  }

  query = applyOrDateFilter({
    query,
    dateFrom: filters?.dateFrom,
    dateTo: filters?.dateTo,
    fields: ['created_at', 'updated_at'],
  })

  if (pagination) {
    const from = (pagination.page - 1) * pagination.pageSize
    const to = from + pagination.pageSize - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching docs admin list (paginated):', error)
    throw error
  }

  const rows = (data || []) as Doc[]
  const totalItems = count || 0
  const currentPage = pagination?.page || 1
  const currentPageSize = pagination?.pageSize || rows.length
  const totalPages =
    currentPageSize > 0 ? Math.ceil(totalItems / currentPageSize) : 0

  return {
    data: rows,
    pagination: {
      page: currentPage,
      pageSize: currentPageSize,
      totalItems,
      totalPages,
      hasMore: currentPage < totalPages,
    },
  }
}

export const getPublicDocBySlug = cache(
  async (params: {
    locale: string
    slugParts?: string[]
  }): Promise<Doc | null> => {
    const supabase = await createClient()

    const slugPath = params.slugParts?.join('/') || ''
    const normalizedSlug = slugPath === '' ? 'index' : slugPath

    const { data, error } = await supabase
      .from('docs')
      .select(`
      *,
      topic:docs_topics!docs_topic_id_fkey(*)
    `)
      .eq('locale', params.locale)
      .eq('slug', normalizedSlug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        if (slugPath === '') {
          const { data: firstDoc, error: firstError } = await supabase
            .from('docs')
            .select(
              `
              *,
              topic:docs_topics!docs_topic_id_fkey(*)
            `
            )
            .eq('locale', params.locale)
            .order('order_index', { ascending: true })
            .order('title', { ascending: true })
            .limit(1)
            .maybeSingle()

          if (firstError) {
            console.error('Error fetching first doc for /docs:', firstError)
            throw firstError
          }

          return firstDoc as Doc | null
        }

        return null
      }

      console.error('Error fetching public doc by slug:', error)
      throw error
    }

    return data as Doc
  }
)

export async function getDocByPath(
  params: DocPathParams
): Promise<DocWithNavigation | null> {
  const locale = params.locale || 'vi'
  const topicSlug = params.topicSlug

  if (!topicSlug) {
    const topics = await getDocsTopics()
    const firstTopic = topics[0]
    if (!firstTopic) return null
    return getDocByPath({ locale, topicSlug: firstTopic.slug })
  }

  const topic = await getDocsTopicBySlug(topicSlug)
  if (!topic) return null

  const docs = await getDocsByTopicId({ topicId: topic.id, locale })
  if (docs.length === 0) return null

  const docSlug = params.docSlug ?? ''
  const doc = docSlug
    ? docs.find(d => d.slug === docSlug)
    : (docs.find(d => d.parent_id === null) ?? docs[0])

  if (!doc) return null

  const currentIndex = docs.findIndex(d => d.id === doc.id)
  const prevDoc = currentIndex > 0 ? docs[currentIndex - 1] : null
  const nextDoc =
    currentIndex >= 0 && currentIndex < docs.length - 1
      ? docs[currentIndex + 1]
      : null

  return {
    doc,
    topic,
    prevDoc: prevDoc
      ? { id: prevDoc.id, title: prevDoc.title, slug: prevDoc.slug }
      : null,
    nextDoc: nextDoc
      ? { id: nextDoc.id, title: nextDoc.title, slug: nextDoc.slug }
      : null,
  }
}

function toLocalizedRecord(
  value: string,
  locale: LocaleOptions
): LocalizedRecord {
  return { [locale]: value } as LocalizedRecord
}

/**
 * Build Docs sidebar navigation from Supabase.
 *
 * Lý do: `/docs` public sidebar trước đây lấy từ config tĩnh, nên docs tạo trong admin
 * không tự động xuất hiện. Hàm này map docs_topics + docs (theo locale) → SidebarNavItem[].
 */
export const getDocsSidebarNav = cache(
  async (locale: LocaleOptions): Promise<SidebarNavItem[]> => {
    const supabase = await createClient()

    const [
      { data: topics, error: topicsError },
      { data: docs, error: docsError },
    ] = await Promise.all([
      supabase
        .from('docs_topics')
        .select('id,name,order_index')
        .order('order_index', { ascending: true }),
      supabase
        .from('docs')
        .select('id,title,slug,topic_id,order_index')
        .eq('locale', locale)
        .order('order_index', { ascending: true })
        .order('title', { ascending: true }),
    ])

    if (topicsError) {
      console.error('Error fetching docs topics for sidebar:', topicsError)
      throw topicsError
    }

    if (docsError) {
      console.error('Error fetching docs for sidebar:', docsError)
      throw docsError
    }

    const docsByTopic = new Map<
      string,
      Array<{ title: string; slug: string }>
    >()
    for (const doc of docs ?? []) {
      if (!doc.topic_id) continue
      const list = docsByTopic.get(doc.topic_id) ?? []
      list.push({ title: doc.title, slug: doc.slug })
      docsByTopic.set(doc.topic_id, list)
    }

    return (topics ?? [])
      .map(topic => {
        const topicDocs = docsByTopic.get(topic.id) ?? []

        return {
          title: toLocalizedRecord(topic.name, locale),
          items: topicDocs.map(doc => ({
            title: toLocalizedRecord(doc.title, locale),
            href: doc.slug === 'index' ? '/docs' : `/docs/${doc.slug}`,
            items: [],
          })),
        } satisfies SidebarNavItem
      })
      .filter(topic => topic.items.length > 0)
  }
)
