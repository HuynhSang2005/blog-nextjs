/**
 * Media server actions
 * Handles media metadata CRUD (actual files stored in Cloudinary)
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for creating media
const createMediaSchema = z.object({
  public_id: z.string().min(1, 'Public ID is required'),
  version: z.number().int().optional(),
  resource_type: z.enum(['image', 'video', 'raw']),
  format: z.string().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  bytes: z.number().int().optional(),
  duration: z.number().optional(),
  alt_text: z.string().optional(),
  caption: z.string().optional(),
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Validation schema for updating media
const updateMediaSchema = z.object({
  alt_text: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateMediaInput = z.infer<typeof createMediaSchema>
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>

/**
 * Tạo media metadata mới sau khi upload lên Cloudinary
 * Create new media metadata after uploading to Cloudinary
 */
export async function createMedia(data: CreateMediaInput) {
  try {
    const supabase = await createClient()

    // Validate input
    const validatedData = createMediaSchema.parse(data)

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Vui lòng đăng nhập để thực hiện thao tác này',
      }
    }

    // Insert media metadata
    const { data: media, error } = await supabase
      .from('media')
      .insert({
        ...validatedData,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating media:', error)
      return {
        success: false,
        error: 'Không thể lưu thông tin media',
      }
    }

    // Revalidate media pages
    revalidatePath('/[locale]/admin/media', 'page')

    return {
      success: true,
      data: media,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Đã xảy ra lỗi validation',
      }
    }

    console.error('Error in createMedia:', error)
    return {
      success: false,
      error: 'Đã xảy ra lỗi khi tạo media',
    }
  }
}

/**
 * Cập nhật media metadata (alt text, caption, tags)
 * Update media metadata (alt text, caption, tags)
 */
export async function updateMedia(id: string, data: UpdateMediaInput) {
  try {
    const supabase = await createClient()

    // Validate input
    const validatedData = updateMediaSchema.parse(data)

    // Check if media exists
    const { data: existingMedia, error: fetchError } = await supabase
      .from('media')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError || !existingMedia) {
      return {
        success: false,
        error: 'Không tìm thấy media',
      }
    }

    // Update media
    const { data: media, error } = await supabase
      .from('media')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating media:', error)
      return {
        success: false,
        error: 'Không thể cập nhật media',
      }
    }

    // Revalidate media pages
    revalidatePath('/[locale]/admin/media', 'page')

    return {
      success: true,
      data: media,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Đã xảy ra lỗi validation',
      }
    }

    console.error('Error in updateMedia:', error)
    return {
      success: false,
      error: 'Đã xảy ra lỗi khi cập nhật media',
    }
  }
}

/**
 * Xóa media metadata từ database
 * Delete media metadata from database
 * Note: This does NOT delete from Cloudinary, only from Supabase
 */
export async function deleteMedia(id: string) {
  try {
    const supabase = await createClient()

    // Check if media is being used
    const [
      { count: blogPostsCount },
      { count: projectsCount },
      { count: projectMediaCount },
      { count: profilesCount },
    ] = await Promise.all([
      supabase.from('blog_posts').select('id', { count: 'exact', head: true }).or(
        `cover_media_id.eq.${id},og_media_id.eq.${id}`
      ),
      supabase.from('projects').select('id', { count: 'exact', head: true }).or(
        `cover_media_id.eq.${id},og_media_id.eq.${id}`
      ),
      supabase
        .from('project_media')
        .select('id', { count: 'exact', head: true })
        .eq('media_id', id),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('avatar_media_id', id),
    ])

    const totalUsage =
      (blogPostsCount || 0) +
      (projectsCount || 0) +
      (projectMediaCount || 0) +
      (profilesCount || 0)

    if (totalUsage > 0) {
      return {
        success: false,
        error: `Media này đang được sử dụng ở ${totalUsage} nơi. Vui lòng xóa các tham chiếu trước.`,
      }
    }

    // Delete media
    const { error } = await supabase.from('media').delete().eq('id', id)

    if (error) {
      console.error('Error deleting media:', error)
      return {
        success: false,
        error: 'Không thể xóa media',
      }
    }

    // Revalidate media pages
    revalidatePath('/[locale]/admin/media', 'page')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error in deleteMedia:', error)
    return {
      success: false,
      error: 'Đã xảy ra lỗi khi xóa media',
    }
  }
}

/**
 * Xóa nhiều media cùng lúc
 * Delete multiple media at once
 */
export async function deleteMultipleMedia(ids: string[]) {
  try {
    const supabase = await createClient()

    // Check if any media is being used
    for (const id of ids) {
      const result = await deleteMedia(id)
      if (!result.success) {
        return result
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error in deleteMultipleMedia:', error)
    return {
      success: false,
      error: 'Đã xảy ra lỗi khi xóa media',
    }
  }
}
