import type { Tables } from '@/types/database'

/**
 * Helper types for common database queries với relations
 */

// Blog Post với relations
export type BlogPostWithRelations = Tables<'blog_posts'> & {
  author: Tables<'profiles'> | null
  cover_media: Tables<'media'> | null
  og_media: Tables<'media'> | null
  tags: Tables<'tags'>[]
}

// Blog Post với minimal author info
export type BlogPostWithAuthor = Tables<'blog_posts'> & {
  author: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'email'> | null
}

// Blog Post cho listing (không cần full content)
export type BlogPostListItem = Omit<Tables<'blog_posts'>, 'content'> & {
  author: Pick<Tables<'profiles'>, 'id' | 'full_name'> | null
  cover_media: Pick<Tables<'media'>, 'id' | 'public_id' | 'alt_text'> | null
  tags: Pick<Tables<'tags'>, 'id' | 'name' | 'slug' | 'color'>[]
}

// Project với relations
export type ProjectWithRelations = Tables<'projects'> & {
  cover_media: Tables<'media'> | null
  og_media: Tables<'media'> | null
  tags: Tables<'tags'>[]
  tech_stack: Tables<'project_tech_stack'>[]
  gallery: Array<
    Tables<'project_media'> & {
      media: Tables<'media'>
    }
  >
}

// Project cho listing
export type ProjectListItem = Tables<'projects'> & {
  cover_media: Pick<Tables<'media'>, 'id' | 'public_id' | 'alt_text'> | null
  tags: Pick<Tables<'tags'>, 'id' | 'name' | 'slug' | 'color'>[]
}

// Media với creator info
export type MediaWithCreator = Tables<'media'> & {
  creator: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'email'> | null
}

// Profile với avatar
export type ProfileWithAvatar = Tables<'profiles'> & {
  avatar: Tables<'media'> | null
}

// Timeline Event với media
export type TimelineEventWithMedia = Tables<'timeline_events'> & {
  media: Tables<'media'> | null
}

// About Section type
export type AboutSection = Tables<'about_sections'>

// Tag với usage count (sẽ dùng cho admin dashboard)
export type TagWithCount = Tables<'tags'> & {
  blog_posts_count: number
  projects_count: number
}

// Skill type
export type Skill = Tables<'skills'>

// Docs Topic type
export type DocsTopic = Tables<'docs_topics'>

/**
 * Status enums (matching database constraints)
 */
export type BlogPostStatus = 'draft' | 'published' | 'archived'
export type ProjectStatus =
  | 'planning'
  | 'in_progress'
  | 'completed'
  | 'archived'
export type EventType = 'work' | 'education' | 'project' | 'achievement'
export type UserRole = 'admin' | 'author' | 'viewer' | 'guest'
export type MediaResourceType = 'image' | 'video' | 'raw'
export type SkillCategory =
  | 'frontend'
  | 'backend'
  | 'devops'
  | 'database'
  | 'tools'
  | 'other'

/**
 * Pagination helpers
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * Query result wrapper
 */
export interface QueryResult<T> {
  data: T | null
  error: Error | null
}

export interface QueryListResult<T> {
  data: T[]
  error: Error | null
}
