import { createClient } from '@/lib/supabase/server'
import { loggers } from '@/lib/logger'
import type {
  MediaWithCreator,
  MediaResourceType,
  QueryResult,
  QueryListResult,
} from '../types-helpers'
import type { Tables, TablesInsert } from '../database.types'

/**
 * Lấy media theo ID
 * @param id - Media ID
 * @returns Media với creator info
 */
export async function getMedia(id: string): Promise<QueryResult<MediaWithCreator>> {
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
      `,
      )
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return { data: null, error: new Error('Media not found') }
      }
      throw error
    }

    return { data: data as MediaWithCreator, error: null }
  } catch (error) {
    loggers.media.error({ error, function: 'getMedia', id }, 'Failed to fetch media')
    return { data: null, error: error as Error }
  }
}

/**
 * Lấy media theo Cloudinary public_id
 * @param publicId - Cloudinary public_id
 * @returns Media record
 */
export async function getMediaByPublicId(
  publicId: string,
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
        // Not found
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
 * Lấy tất cả media theo resource type
 * @param resourceType - Resource type (image, video, raw)
 * @param limit - Maximum number of items (default: 50)
 * @returns Media list
 */
export async function getMediaByType(
  resourceType: MediaResourceType,
  limit = 50,
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
 * Lấy media theo folder
 * @param folder - Cloudinary folder path
 * @param limit - Maximum number of items (default: 50)
 * @returns Media list
 */
export async function getMediaByFolder(
  folder: string,
  limit = 50,
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
 * Tạo media record mới
 * @param mediaData - Media data to insert
 * @returns Created media record
 */
export async function createMedia(
  mediaData: TablesInsert<'media'>,
): Promise<QueryResult<Tables<'media'>>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from('media').insert(mediaData).select().single()

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
 * Cập nhật media record
 * @param id - Media ID
 * @param updates - Fields to update
 * @returns Updated media record
 */
export async function updateMedia(
  id: string,
  updates: Partial<TablesInsert<'media'>>,
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
 * Xóa media record
 * Note: Chỉ xóa metadata, không xóa file trên Cloudinary
 * @param id - Media ID
 * @returns Success status
 */
export async function deleteMedia(id: string): Promise<{ success: boolean; error: Error | null }> {
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
 * Tìm kiếm media theo alt_text hoặc caption
 * @param searchQuery - Search query
 * @param limit - Maximum number of items (default: 20)
 * @returns Media list
 */
export async function searchMedia(
  searchQuery: string,
  limit = 20,
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
 * Lấy recent uploaded media
 * @param limit - Maximum number of items (default: 20)
 * @returns Recent media list
 */
export async function getRecentMedia(limit = 20): Promise<QueryListResult<MediaWithCreator>> {
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
      `,
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
 * Lấy media statistics
 * @returns Media stats
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

    const totalSize = (sizeData || []).reduce((sum, item) => sum + (item.bytes || 0), 0)

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
