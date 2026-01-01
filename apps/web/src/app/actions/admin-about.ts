'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type AboutSectionInsert =
  Database['public']['Tables']['about_sections']['Insert']
type AboutSectionUpdate =
  Database['public']['Tables']['about_sections']['Update']

type TimelineEventInsert =
  Database['public']['Tables']['timeline_events']['Insert']
type TimelineEventUpdate =
  Database['public']['Tables']['timeline_events']['Update']

type SkillInsert = Database['public']['Tables']['skills']['Insert']
type SkillUpdate = Database['public']['Tables']['skills']['Update']

function revalidateAbout(locale: string) {
  revalidatePath(`/${locale}/admin/about`)
  revalidatePath(`/${locale}/about`)
}

export async function createAboutSection(
  locale: string,
  data: AboutSectionInsert
) {
  const supabase = await createClient()

  const { data: section, error } = await supabase
    .from('about_sections')
    .insert({
      ...data,
      locale: data.locale || locale,
      visible: data.visible ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating about section:', error)
    throw new Error('Không thể tạo nội dung About')
  }

  revalidateAbout(section.locale || locale)
  return section
}

export async function updateAboutSection(
  locale: string,
  id: string,
  data: AboutSectionUpdate
) {
  const supabase = await createClient()

  const { data: section, error } = await supabase
    .from('about_sections')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating about section:', error)
    throw new Error('Không thể cập nhật nội dung About')
  }

  revalidateAbout(section.locale || locale)
  return section
}

export async function deleteAboutSection(locale: string, id: string) {
  const supabase = await createClient()

  const { data: deleted, error } = await supabase
    .from('about_sections')
    .delete()
    .eq('id', id)
    .select('id, locale')
    .single()

  if (error) {
    console.error('Error deleting about section:', error)
    throw new Error('Không thể xóa nội dung About')
  }

  revalidateAbout(deleted.locale || locale)
  return { success: true }
}

export async function createTimelineEvent(
  locale: string,
  data: TimelineEventInsert
) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('timeline_events')
    .insert({
      ...data,
      locale: data.locale || locale,
      is_current: data.is_current ?? false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating timeline event:', error)
    throw new Error('Không thể tạo timeline event')
  }

  revalidateAbout(event.locale || locale)
  return event
}

export async function updateTimelineEvent(
  locale: string,
  id: string,
  data: TimelineEventUpdate
) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('timeline_events')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating timeline event:', error)
    throw new Error('Không thể cập nhật timeline event')
  }

  revalidateAbout(event.locale || locale)
  return event
}

export async function deleteTimelineEvent(locale: string, id: string) {
  const supabase = await createClient()

  const { data: deleted, error } = await supabase
    .from('timeline_events')
    .delete()
    .eq('id', id)
    .select('id, locale')
    .single()

  if (error) {
    console.error('Error deleting timeline event:', error)
    throw new Error('Không thể xóa timeline event')
  }

  revalidateAbout(deleted.locale || locale)
  return { success: true }
}

export async function createSkill(locale: string, data: SkillInsert) {
  const supabase = await createClient()

  const { data: skill, error } = await supabase
    .from('skills')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating skill:', error)
    throw new Error('Không thể tạo skill')
  }

  revalidateAbout(locale)
  return skill
}

export async function updateSkill(
  locale: string,
  id: string,
  data: SkillUpdate
) {
  const supabase = await createClient()

  const { data: skill, error } = await supabase
    .from('skills')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating skill:', error)
    throw new Error('Không thể cập nhật skill')
  }

  revalidateAbout(locale)
  return skill
}

export async function deleteSkill(locale: string, id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('skills').delete().eq('id', id)

  if (error) {
    console.error('Error deleting skill:', error)
    throw new Error('Không thể xóa skill')
  }

  revalidateAbout(locale)
  return { success: true }
}
