import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type Tag = Database['public']['Tables']['tags']['Row']

/**
 * Lấy tất cả tags từ database
 * Get all tags from database
 * @returns Array of tags sorted by name
 */
export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('tags').select('*').order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    throw error
  }

  return data
}

/**
 * Lấy tag theo ID
 * Get tag by ID
 * @param id - Tag UUID
 * @returns Tag or null
 */
export async function getTagById(id: string): Promise<Tag | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    console.error('Error fetching tag:', error)
    throw error
  }

  return data
}

/**
 * Tạo tag mới
 * Create new tag
 * @param tag - Tag data
 * @returns Created tag
 */
export async function createTag(
  tag: Database['public']['Tables']['tags']['Insert']
): Promise<Tag> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .insert(tag)
    .select()
    .single()

  if (error) {
    console.error('Error creating tag:', error)
    throw error
  }

  return data
}
