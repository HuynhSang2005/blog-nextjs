'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type TagInsert = Database['public']['Tables']['tags']['Insert']
type TagUpdate = Database['public']['Tables']['tags']['Update']

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
  return tags.map((tag) => ({
    ...tag,
    usageCount:
      (tag.blog_post_tags?.[0]?.count || 0) + (tag.project_tags?.[0]?.count || 0),
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

  revalidatePath('/admin/tags')
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

  revalidatePath('/admin/tags')
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

  if ((blogUsage && blogUsage.length > 0) || (projectUsage && projectUsage.length > 0)) {
    throw new Error('Không thể xóa thẻ đang được sử dụng')
  }

  const { error } = await supabase.from('tags').delete().eq('id', id)

  if (error) {
    console.error('Error deleting tag:', error)
    throw new Error('Không thể xóa thẻ')
  }

  revalidatePath('/admin/tags')
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
