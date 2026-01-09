/**
 * Projects feature module
 *
 * Domain: Portfolio projects display and management
 * 
 * This module provides a centralized access point for all project-related UI components.
 * The actual component files remain in '@/components/projects/' for now.
 * Data fetching is done via services/project-service.ts (DB-first).
 */

// Re-export all project components from the centralized components location
export * from '@/components/projects/project-card'
export * from '@/components/projects/project-filters'
export * from '@/components/projects/project-gallery'
export * from '@/components/projects/project-header'
export * from '@/components/projects/project-info'
export * from '@/components/projects/projects-grid'
export * from '@/components/projects/projects-pagination'
