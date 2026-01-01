import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { cache } from 'react'
import type { LocaleOptions, LocalizedRecord } from '@/lib/core/types/i18n'
import type { SidebarNavItem } from '@/lib/core/types/nav'

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

export async function getPublicDocBySlug(params: {
  locale: string
  slugParts?: string[]
}): Promise<Doc | null> {
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
