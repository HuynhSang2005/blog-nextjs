'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { locales } from '@/config/i18n'
import { precomputeArtifacts } from '@/lib/mdx/precompute'

type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

/**
 * Create a new blog post
 * @param data - Blog post data
 * @returns Created blog post or error
 */
export async function createBlogPost(data: BlogPostInsert) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Precompute MDX artifacts if content is provided (no TOC for blog)
  const artifacts = data.content
    ? await precomputeArtifacts(data.content, { computeToc: false })
    : null

  // Set author_id to current user
  const postData = {
    ...data,
    author_id: user.id,
    // Add precomputed artifacts
    ...(artifacts && {
      reading_time_minutes: artifacts.reading_time_minutes,
      search_text: artifacts.search_text,
      content_hash: artifacts.content_hash,
    }),
  }

  const { data: post, error } = await supabase
    .from('blog_posts')
    .insert(postData)
    .select()
    .single()

  if (error) {
    console.error('Error creating blog post:', error)
    throw new Error('Không thể tạo bài viết')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/blog`)
    revalidatePath(`/${locale}/blog`)
  }

  return post
}

/**
 * Update an existing blog post
 * @param id - Post UUID
 * @param data - Update data
 * @returns Updated blog post or error
 */
export async function updateBlogPost(id: string, data: BlogPostUpdate) {
  const supabase = await createClient()

  // Precompute MDX artifacts if content is being updated (no TOC for blog)
  const artifacts = data.content
    ? await precomputeArtifacts(data.content, { computeToc: false })
    : null

  const { data: post, error } = await supabase
    .from('blog_posts')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
      // Add precomputed artifacts
      ...(artifacts && {
        reading_time_minutes: artifacts.reading_time_minutes,
        search_text: artifacts.search_text,
        content_hash: artifacts.content_hash,
      }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating blog post:', error)
    throw new Error('Không thể cập nhật bài viết')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/blog`)
    revalidatePath(`/${locale}/admin/blog/${id}`)
    revalidatePath(`/${locale}/blog`)
  }
  revalidatePath(`/${post.locale}/blog/${post.slug}`)

  return post
}

/**
 * Delete a blog post
 * @param id - Post UUID
 * @returns Success or error
 */
export async function deleteBlogPost(id: string) {
  const supabase = await createClient()

  // First, delete associated tags
  const { error: tagsError } = await supabase
    .from('blog_post_tags')
    .delete()
    .eq('blog_post_id', id)

  if (tagsError) {
    console.error('Error deleting blog post tags:', tagsError)
  }

  // Then delete the post
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)

  if (error) {
    console.error('Error deleting blog post:', error)
    throw new Error('Không thể xóa bài viết')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/blog`)
    revalidatePath(`/${locale}/blog`)
  }

  return { success: true }
}

/**
 * Update blog post tags
 * @param postId - Post UUID
 * @param tagIds - Array of tag UUIDs
 * @returns Success or error
 */
export async function updateBlogPostTags(postId: string, tagIds: string[]) {
  const supabase = await createClient()

  // Delete existing tags
  const { error: deleteError } = await supabase
    .from('blog_post_tags')
    .delete()
    .eq('blog_post_id', postId)

  if (deleteError) {
    console.error('Error deleting blog post tags:', deleteError)
    throw new Error('Không thể xóa thẻ cũ')
  }

  // Insert new tags
  if (tagIds.length > 0) {
    const { error: insertError } = await supabase
      .from('blog_post_tags')
      .insert(tagIds.map(tagId => ({ blog_post_id: postId, tag_id: tagId })))

    if (insertError) {
      console.error('Error inserting blog post tags:', insertError)
      throw new Error('Không thể thêm thẻ mới')
    }
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/blog`)
    revalidatePath(`/${locale}/admin/blog/${postId}`)
  }

  return { success: true }
}

/**
 * Publish a blog post (set status to published and set published_at)
 * @param id - Post UUID
 * @returns Updated post or error
 */
export async function publishBlogPost(id: string) {
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error publishing blog post:', error)
    throw new Error('Không thể xuất bản bài viết')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/blog`)
    revalidatePath(`/${locale}/admin/blog/${id}`)
    revalidatePath(`/${locale}/blog`)
  }

  return post
}

/**
 * Unpublish a blog post (set status to draft)
 * @param id - Post UUID
 * @returns Updated post or error
 */
export async function unpublishBlogPost(id: string) {
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .update({
      status: 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error unpublishing blog post:', error)
    throw new Error('Không thể hủy xuất bản bài viết')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/blog`)
    revalidatePath(`/${locale}/admin/blog/${id}`)
    revalidatePath(`/${locale}/blog`)
  }

  return post
}
