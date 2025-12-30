'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import type { Tables } from '@/lib/supabase/database.types'

/**
 * Lấy tất cả dữ liệu About Page từ database
 * Fetches all about page data from database
 * 
 * @param locale - Locale code (e.g., 'vi')
 * @returns About sections, timeline events, skills
 */
export const getAboutData = cache(async (locale: string) => {
  const supabase = await createClient()

  // Fetch về sections (bio, contact, etc.)
  const { data: sections, error: sectionsError } = await supabase
    .from('about_sections')
    .select('*')
    .eq('locale', locale)
    .eq('visible', true)
    .order('order_index')

  if (sectionsError) {
    console.error('Error fetching about sections:', sectionsError)
  }

  // Fetch timeline events với media
  const { data: timeline, error: timelineError } = await supabase
    .from('timeline_events')
    .select(`
      *,
      media:media_id (
        public_id,
        alt_text,
        width,
        height
      )
    `)
    .eq('locale', locale)
    .order('start_date', { ascending: false })

  if (timelineError) {
    console.error('Error fetching timeline events:', timelineError)
  }

  // Fetch skills grouped by category
  const { data: skills, error: skillsError } = await supabase
    .from('skills')
    .select('*')
    .order('category, order_index')

  if (skillsError) {
    console.error('Error fetching skills:', skillsError)
  }

  // Fetch profile info với avatar
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      avatar_media:avatar_media_id (
        public_id,
        alt_text,
        width,
        height
      )
    `)
    .limit(1)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  return {
    sections: sections || [],
    timeline: timeline || [],
    skills: skills || [],
    profile: profile || null,
  }
})

/**
 * Lấy bio section từ about_sections
 * Gets bio section from about_sections table
 * 
 * @param locale - Locale code
 * @returns Bio section content (MDX)
 */
export async function getBioSection(locale: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .eq('locale', locale)
    .eq('section_key', 'bio')
    .eq('visible', true)
    .single()

  if (error) {
    console.error('Error fetching bio section:', error)
    return null
  }

  return data
}

/**
 * Lấy timeline events theo locale
 * Gets timeline events by locale
 * 
 * @param locale - Locale code
 * @returns Timeline events array
 */
export async function getTimelineEvents(locale: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('timeline_events')
    .select(`
      *,
      media:media_id (
        public_id,
        alt_text,
        width,
        height
      )
    `)
    .eq('locale', locale)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching timeline events:', error)
    return []
  }

  return data || []
}

/**
 * Lấy skills grouped by category
 * Gets skills grouped by category
 * 
 * @returns Skills array
 */
export async function getSkills() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category, order_index')

  if (error) {
    console.error('Error fetching skills:', error)
    return []
  }

  return data || []
}

/**
 * Group skills by category
 * Helper function để group skills theo category
 * 
 * @param skills - Skills array
 * @returns Object with skills grouped by category
 */
export async function groupSkillsByCategory(skills: Tables<'skills'>[]) {
  return skills.reduce((acc, skill) => {
    const category = skill.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {} as Record<string, Tables<'skills'>[]>)
}
