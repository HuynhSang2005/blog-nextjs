'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'
import { locales } from '@/config/i18n'

type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

/**
 * Tạo project mới.
 * Create a new project.
 */
export async function createProject(
  data: Omit<ProjectInsert, 'id' | 'created_at' | 'updated_at'>
) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session) {
    throw new Error('Unauthorized')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }

  const normalizedData: Omit<
    ProjectInsert,
    'id' | 'created_at' | 'updated_at'
  > = {
    ...data,
    start_date: data.start_date === '' ? null : data.start_date,
    end_date: data.end_date === '' ? null : data.end_date,
  }

  // Create project
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      ...normalizedData,
      locale: normalizedData.locale || 'vi',
      status: normalizedData.status || 'completed',
      featured: normalizedData.featured || false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw new Error('Failed to create project')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/projects`)
    revalidatePath(`/${locale}/projects`)
  }

  return project
}

/**
 * Cập nhật project.
 * Update a project.
 */
export async function updateProject(id: string, data: ProjectUpdate) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session) {
    throw new Error('Unauthorized')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }

  const normalizedData: ProjectUpdate = {
    ...data,
    start_date: data.start_date === '' ? null : data.start_date,
    end_date: data.end_date === '' ? null : data.end_date,
  }

  // Update project
  const { data: project, error } = await supabase
    .from('projects')
    .update({
      ...normalizedData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    throw new Error('Failed to update project')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/projects`)
    revalidatePath(`/${locale}/projects`)
  }
  revalidatePath(`/${project.locale}/projects/${project.slug}`)

  return project
}

/**
 * Xóa project.
 * Delete a project.
 */
export async function deleteProject(id: string) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session) {
    throw new Error('Unauthorized')
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }

  // Delete project tags first (foreign key constraint)
  await supabase.from('project_tags').delete().eq('project_id', id)

  // Delete project tech stack
  await supabase.from('project_tech_stack').delete().eq('project_id', id)

  // Delete project media associations
  await supabase.from('project_media').delete().eq('project_id', id)

  // Delete project
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    throw new Error('Failed to delete project')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/projects`)
    revalidatePath(`/${locale}/projects`)
  }
}

/**
 * Cập nhật project tags.
 * Update project tags (many-to-many).
 */
export async function updateProjectTags(projectId: string, tagIds: string[]) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session) {
    throw new Error('Unauthorized')
  }

  // Delete existing tags
  await supabase.from('project_tags').delete().eq('project_id', projectId)

  // Insert new tags
  if (tagIds.length > 0) {
    const { error } = await supabase.from('project_tags').insert(
      tagIds.map(tagId => ({
        project_id: projectId,
        tag_id: tagId,
      }))
    )

    if (error) {
      console.error('Error updating project tags:', error)
      throw new Error('Failed to update project tags')
    }
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/projects`)
  }
}

/**
 * Cập nhật project tech stack.
 * Update project technologies.
 */
export async function updateProjectTechStack(
  projectId: string,
  technologies: Array<{
    name: string
    category?:
      | 'frontend'
      | 'backend'
      | 'database'
      | 'devops'
      | 'tools'
      | 'other'
    icon?: string
    order_index?: number
  }>
) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession()
  if (authError || !session) {
    throw new Error('Unauthorized')
  }

  // Delete existing tech stack
  await supabase.from('project_tech_stack').delete().eq('project_id', projectId)

  // Insert new tech stack
  if (technologies.length > 0) {
    const { error } = await supabase.from('project_tech_stack').insert(
      technologies.map((tech, index) => ({
        project_id: projectId,
        name: tech.name,
        category: tech.category,
        icon: tech.icon,
        order_index: tech.order_index ?? index,
      }))
    )

    if (error) {
      console.error('Error updating project tech stack:', error)
      throw new Error('Failed to update project tech stack')
    }
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/projects`)
  }
}

/**
 * Thêm media vào project gallery.
 * Add media to project gallery.
 */
export async function addProjectMedia(
  projectId: string,
  mediaId: string,
  caption?: string,
  orderIndex?: number
) {
  const supabase = await createClient()

  const { error } = await supabase.from('project_media').insert({
    project_id: projectId,
    media_id: mediaId,
    caption,
    order_index: orderIndex ?? 0,
  })

  if (error) {
    console.error('Error adding project media:', error)
    throw new Error('Failed to add project media')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/projects`)
  }
}

/**
 * Xóa media khỏi project gallery.
 * Remove media from project gallery.
 */
export async function removeProjectMedia(projectMediaId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('project_media')
    .delete()
    .eq('id', projectMediaId)

  if (error) {
    console.error('Error removing project media:', error)
    throw new Error('Failed to remove project media')
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/admin/projects`)
  }
}
