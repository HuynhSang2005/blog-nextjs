import { createClient } from '@/lib/supabase/server'
import type {
  MediaWithCreator,
  MediaResourceType,
  QueryResult,
  QueryListResult,
} from '@/types/supabase-helpers'
import type { Tables, TablesInsert } from '@/types/database'

export interface MediaFilters {
  search?: string
  resourceType?: 'image' | 'video' | 'raw' | 'all'
  folder?: string
  limit?: number
  offset?: number
}

/**
 * Get media by ID
 */
export async function getMediaById(
  id: string
): Promise<QueryResult<MediaWithCreator>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media')
      .select(
        `
        *,
        creator:profiles!created_by (
          id,
          full_name,
          email
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: new Error('Media not found') }
      }
      throw error
    }

    return { data: data as MediaWithCreator, error: null }
  } catch (error) {
    console.error('Error fetching media:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get list of media with filters
 */
export async function getMediaList(filters: MediaFilters = {}) {
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
    console.error('Error fetching media list:', error)
    throw error
  }

  return {
    data: data as MediaWithCreator[],
    count: count || 0,
    error: null,
  }
}

/**
 * Get media by Cloudinary public_id
 */
export async function getMediaByPublicId(
  publicId: string
): Promise<QueryResult<Tables<'media'>>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('public_id', publicId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: new Error('Media not found') }
      }
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching media by public_id:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Get all media by resource type
 */
export async function getMediaByType(
  resourceType: MediaResourceType,
  limit = 50
): Promise<QueryListResult<Tables<'media'>>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('resource_type', resourceType)
      .order('uploaded_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching media by type:', error)
    return { data: [], error: error as Error }
  }
}

/**
 * Get media by folder
 */
export async function getMediaByFolder(
  folder: string,
  limit = 50
): Promise<QueryListResult<Tables<'media'>>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('folder', folder)
      .order('uploaded_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching media by folder:', error)
    return { data: [], error: error as Error }
  }
}

/**
 * Create new media record
 */
export async function createMedia(
  mediaData: TablesInsert<'media'>
): Promise<QueryResult<Tables<'media'>>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media')
      .insert(mediaData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error creating media:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Update media record
 */
export async function updateMedia(
  id: string,
  updates: Partial<TablesInsert<'media'>>
): Promise<QueryResult<Tables<'media'>>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error updating media:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Delete media record
 */
export async function deleteMedia(
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('media').delete().eq('id', id)

    if (error) {
      throw error
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting media:', error)
    return { success: false, error: error as Error }
  }
}

/**
 * Search media by alt_text or caption
 */
export async function searchMedia(
  searchQuery: string,
  limit = 20
): Promise<QueryListResult<Tables<'media'>>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .or(`alt_text.ilike.%${searchQuery}%,caption.ilike.%${searchQuery}%`)
      .order('uploaded_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error searching media:', error)
    return { data: [], error: error as Error }
  }
}

/**
 * Get recent uploaded media
 */
export async function getRecentMedia(
  limit = 20
): Promise<QueryListResult<MediaWithCreator>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media')
      .select(
        `
        *,
        creator:profiles!created_by (
          id,
          full_name,
          email
        )
      `
      )
      .order('uploaded_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return { data: (data || []) as MediaWithCreator[], error: null }
  } catch (error) {
    console.error('Error fetching recent media:', error)
    return { data: [], error: error as Error }
  }
}

/**
 * Get media statistics
 */
export async function getMediaStats(): Promise<{
  totalImages: number
  totalVideos: number
  totalSize: number
  error: Error | null
}> {
  try {
    const supabase = await createClient()

    // Count images
    const { count: imageCount } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true })
      .eq('resource_type', 'image')

    // Count videos
    const { count: videoCount } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true })
      .eq('resource_type', 'video')

    // Get total size (sum of bytes)
    const { data: sizeData } = await supabase.from('media').select('bytes')

    const totalSize = (sizeData || []).reduce(
      (sum, item) => sum + (item.bytes || 0),
      0
    )

    return {
      totalImages: imageCount || 0,
      totalVideos: videoCount || 0,
      totalSize,
      error: null,
    }
  } catch (error) {
    console.error('Error fetching media stats:', error)
    return {
      totalImages: 0,
      totalVideos: 0,
      totalSize: 0,
      error: error as Error,
    }
  }
}
