/**
 * Blog feature module
 *
 * Domain: Public blog listing and post pages
 *
 * This module provides a centralized access point for all blog-related UI components.
 * The actual component files remain in '@/components/blog/' for now (physical migration can happen in later phases).
 * Data fetching is done via services/blog-service.ts (DB-first).
 */

// Re-export all blog components from the centralized components location
// This establishes the feature module pattern while maintaining the current file structure
export * from '@/components/blog/post-list'
export * from '@/components/blog/blog-pagination'
export * from '@/components/blog/blog-filters'
export * from '@/components/blog/rss-toggle'
export * from '@/components/blog/read-time'
export * from '@/components/blog/post-tags'
export * from '@/components/blog/post-item-tags'
export * from '@/components/blog/breadcrumb'
export * from '@/components/blog/heading'
export * from '@/components/blog/pagination'
export * from '@/components/blog/series-badge'
