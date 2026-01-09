/**
 * Media feature module
 *
 * Domain: Media library and asset management (admin only)
 * 
 * This module provides a centralized access point for all media-related UI components.
 * The actual component files remain in '@/components/admin/media/' for now.
 * Data fetching is done via services/media-service.ts (DB-first).
 */

// Re-export all media components from the admin components location
export * from '@/components/admin/media/media-grid'
export * from '@/components/admin/media/media-page-client'
export * from '@/components/admin/media/media-picker'
export * from '@/components/admin/media/media-uploader'
