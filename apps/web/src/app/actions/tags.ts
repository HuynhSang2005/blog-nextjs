'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { locales } from '@/config/i18n'
import type { PaginatedResponse, PaginationParams } from '@/types/supabase-helpers'

type TagInsert = Database['public']['Tables']['tags']['Insert']
type TagUpdate = Database['public']['Tables']['tags']['Update']

type TagRow = Database['public']['Tables']['tags']['Row'] & {
  usageCount?: number
}

function isoDayStart(date: string): string {
  return `${date}T00:00:00.000Z`
}

function isoNextDayStart(date: string): string {
  const dayStart = new Date(`${date}T00:00:00.000Z`)
  dayStart.setUTCDate(dayStart.getUTCDate() + 1)
  return dayStart.toISOString()
}

export interface TagsAdminFilters {
  slug?: string
  dateFrom?: string
  dateTo?: string
}

/**
 * Get tags with usage counts (Admin) - supports pagination and filters.
 */
export async function getTagsAdminList(params: {
  pagination?: PaginationParams
  filters?: TagsAdminFilters
}): Promise<PaginatedResponse<TagRow>> {
  const supabase = await createClient()

  let query = supabase
    .from('tags')
    .select(
      `
      *,
      blog_post_tags(count),
      project_tags(count)
    `,
      { count: 'exact' }
    )
    .order('name')

  const { filters, pagination } = params

  if (filters?.slug) {
    const slugTerm = filters.slug.trim()
    if (slugTerm) {
      query = query.ilike('slug', `%${slugTerm}%`)
    }
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', isoDayStart(filters.dateFrom))
  }
  if (filters?.dateTo) {
    query = query.lt('created_at', isoNextDayStart(filters.dateTo))
  }

  if (pagination) {
    const from = (pagination.page - 1) * pagination.pageSize
    const to = from + pagination.pageSize - 1
    query = query.range(from, to)
  }

  const { data: tags, error, count } = await query

  if (error) {
    console.error('Error fetching tags (admin paginated):', error)
    throw new Error('Không thể tải danh sách thẻ')
  }

  const rows = (tags || []).map(tag => ({
    ...tag,
    usageCount:
      (tag.blog_post_tags?.[0]?.count || 0) +
      (tag.project_tags?.[0]?.count || 0),
  })) as TagRow[]

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

/**
 * Get all tags with post counts
 */
export async function getTags() {
  const supabase = await createClient()

  const { data: tags, error } = await supabase
    .from('tags')
    .select(
      `
      *,
      blog_post_tags(count),
      project_tags(count)
    `
    )
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    throw new Error('Không thể tải danh sách thẻ')
  }

  // Calculate total usage count for each tag
  return tags.map(tag => ({
    ...tag,
    usageCount:
      (tag.blog_post_tags?.[0]?.count || 0) +
      (tag.project_tags?.[0]?.count || 0),
  }))
}

/**
 * Create a new tag
 */
export async function createTag(data: TagInsert) {
  const supabase = await createClient()

  // Generate slug from name if not provided
  const slug = data.slug || generateSlug(data.name)

  const { data: tag, error } = await supabase
    .from('tags')
    .insert({ ...data, slug })
    .select()
    .single()

  if (error) {
    console.error('Error creating tag:', error)
    if (error.code === '23505') {
      // Unique violation
      throw new Error('Thẻ với tên hoặc slug này đã tồn tại')
    }
    throw new Error('Không thể tạo thẻ')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/tags`)
  }
  return tag
}

/**
 * Update an existing tag
 */
export async function updateTag(id: string, data: TagUpdate) {
  const supabase = await createClient()

  // Generate slug if name changed but slug not provided
  if (data.name && !data.slug) {
    data.slug = generateSlug(data.name)
  }

  const { data: tag, error } = await supabase
    .from('tags')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating tag:', error)
    if (error.code === '23505') {
      throw new Error('Thẻ với tên hoặc slug này đã tồn tại')
    }
    throw new Error('Không thể cập nhật thẻ')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/tags`)
  }
  return tag
}

/**
 * Delete a tag
 */
export async function deleteTag(id: string) {
  const supabase = await createClient()

  // Check if tag is in use
  const { data: blogUsage } = await supabase
    .from('blog_post_tags')
    .select('blog_post_id')
    .eq('tag_id', id)
    .limit(1)

  const { data: projectUsage } = await supabase
    .from('project_tags')
    .select('project_id')
    .eq('tag_id', id)
    .limit(1)

  if (
    (blogUsage && blogUsage.length > 0) ||
    (projectUsage && projectUsage.length > 0)
  ) {
    throw new Error('Không thể xóa thẻ đang được sử dụng')
  }

  const { error } = await supabase.from('tags').delete().eq('id', id)

  if (error) {
    console.error('Error deleting tag:', error)
    throw new Error('Không thể xóa thẻ')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/tags`)
  }
}

/**
 * Generate URL-friendly slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/đ/g, 'd') // Vietnamese đ
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '') // Trim dashes
}
