/**
 * Media query functions
 * Fetches media metadata from Supabase (actual files stored in Cloudinary)
 */

import { createClient } from '@/lib/supabase/server'

export interface MediaFilters {
  search?: string
  resourceType?: 'image' | 'video' | 'raw' | 'all'
  folder?: string
  limit?: number
  offset?: number
}

/**
 * Lấy danh sách media từ database
 * Get list of media from database
 */
export async function getMedia(filters: MediaFilters = {}) {
  const supabase = await createClient()

  let query = supabase
    .from('media')
    .select(
      `
      *,
      created_by_profile:profiles!created_by (
        id,
        full_name,
        email
      )
    `,
      { count: 'exact' }
    )
    .order('uploaded_at', { ascending: false })

  // Apply search filter
  if (filters.search) {
    query = query.or(
      `public_id.ilike.%${filters.search}%,alt_text.ilike.%${filters.search}%,caption.ilike.%${filters.search}%`
    )
  }

  // Apply resource type filter
  if (filters.resourceType && filters.resourceType !== 'all') {
    query = query.eq('resource_type', filters.resourceType)
  }

  // Apply folder filter
  if (filters.folder) {
    query = query.eq('folder', filters.folder)
  }

  // Apply pagination
  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  if (filters.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 10) - 1
    )
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching media:', error)
    throw error
  }

  return {
    media: data || [],
    total: count || 0,
  }
}

/**
 * Lấy một media item theo ID
 * Get a single media item by ID
 */
export async function getMediaById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('media')
    .select(
      `
      *,
      created_by_profile:profiles!created_by (
        id,
        full_name,
        email
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching media by ID:', error)
    throw error
  }

  return data
}

/**
 * Lấy danh sách folders có sẵn
 * Get list of available folders
 */
export async function getMediaFolders() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('media')
    .select('folder')
    .not('folder', 'is', null)
    .order('folder')

  if (error) {
    console.error('Error fetching folders:', error)
    throw error
  }

  // Get unique folders
  const folders = [...new Set(data?.map(item => item.folder).filter(Boolean))]

  return folders as string[]
}

/**
 * Đếm số lượng media theo resource type
 * Count media by resource type
 */
export async function getMediaStats() {
  const supabase = await createClient()

  const { data, error } = await supabase.from('media').select('resource_type')

  if (error) {
    console.error('Error fetching media stats:', error)
    throw error
  }

  const stats = {
    total: data?.length || 0,
    images: data?.filter(item => item.resource_type === 'image').length || 0,
    videos: data?.filter(item => item.resource_type === 'video').length || 0,
    raw: data?.filter(item => item.resource_type === 'raw').length || 0,
  }

  return stats
}
