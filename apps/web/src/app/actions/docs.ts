'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { precomputeArtifacts } from '@/lib/mdx/precompute'

type DocInsert = Database['public']['Tables']['docs']['Insert']
type DocUpdate = Database['public']['Tables']['docs']['Update']

function getPublicDocsPath(locale: string, slug: string | null) {
  if (!slug || slug === 'index') return `/${locale}/docs`
  return `/${locale}/docs/${slug}`
}

export async function createDoc(data: DocInsert) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('createDoc unauthorized:', {
      hasUser: Boolean(user),
      userError: userError ?? null,
    })
    throw new Error('Unauthorized')
  }

  // Precompute MDX artifacts if content is provided
  const artifacts = data.content
    ? await precomputeArtifacts(data.content, { computeToc: true })
    : null

  const { data: doc, error } = await supabase
    .from('docs')
    .insert({
      ...data,
      locale: data.locale || 'vi',
      show_toc: data.show_toc ?? true,
      // Add precomputed artifacts
      ...(artifacts && {
        toc: artifacts.toc,
        reading_time_minutes: artifacts.reading_time_minutes,
        search_text: artifacts.search_text,
        content_hash: artifacts.content_hash,
      }),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating doc:', error)
    throw new Error('Không thể tạo tài liệu')
  }

  const locale = doc.locale || 'vi'
  revalidatePath(`/${locale}/admin/docs`)
  revalidatePath(`/${locale}/admin/docs/${doc.id}`)
  revalidatePath(`/${locale}/docs`)
  revalidatePath(getPublicDocsPath(locale, doc.slug))

  return doc
}

export async function updateDoc(id: string, data: DocUpdate) {
  const supabase = await createClient()

  // Precompute MDX artifacts if content is being updated
  const artifacts = data.content
    ? await precomputeArtifacts(data.content, { computeToc: true })
    : null

  const { data: doc, error } = await supabase
    .from('docs')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
      // Add precomputed artifacts
      ...(artifacts && {
        toc: artifacts.toc,
        reading_time_minutes: artifacts.reading_time_minutes,
        search_text: artifacts.search_text,
        content_hash: artifacts.content_hash,
      }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating doc:', error)
    throw new Error('Không thể cập nhật tài liệu')
  }

  const locale = doc.locale || 'vi'
  revalidatePath(`/${locale}/admin/docs`)
  revalidatePath(`/${locale}/admin/docs/${id}`)
  revalidatePath(`/${locale}/docs`)
  revalidatePath(getPublicDocsPath(locale, doc.slug))

  return doc
}

export async function deleteDoc(id: string) {
  const supabase = await createClient()

  const { data: deleted, error } = await supabase
    .from('docs')
    .delete()
    .eq('id', id)
    .select('id, slug, locale')
    .single()

  if (error) {
    console.error('Error deleting doc:', error)
    throw new Error('Không thể xóa tài liệu')
  }

  const locale = deleted.locale || 'vi'
  revalidatePath(`/${locale}/admin/docs`)
  revalidatePath(`/${locale}/docs`)
  revalidatePath(getPublicDocsPath(locale, deleted.slug))

  return { success: true }
}
