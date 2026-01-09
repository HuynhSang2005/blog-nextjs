/**
 * Admin feature module
 *
 * Domain: Admin dashboard and management interfaces
 * 
 * This module provides a centralized access point for all admin-related UI components.
 * The actual component files remain in '@/components/admin/' for now.
 * Auth/gating is handled at the proxy and layout level (do not change behavior).
 */

// Re-export all admin components from the centralized components location
// Layout components
export { AdminSidebar } from '@/components/admin/layout/admin-sidebar'
export { NavGroup } from '@/components/admin/layout/nav-group'
export { NavUser } from '@/components/admin/layout/nav-user'
export { getAdminSidebarData } from '@/components/admin/layout/sidebar-data'

// Shared admin components
export * from '@/components/admin/shared/admin-pagination'
export * from '@/components/admin/shared/admin-date-range-picker'
export * from '@/components/admin/shared/mdx-editor'
