'use client'

import { usePathname } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

/**
 * Admin Header - Breadcrumb navigation and sidebar toggle
 */
export function AdminHeader() {
  const pathname = usePathname()

  // Generate breadcrumb from pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const adminIndex = segments.indexOf('admin')

    if (adminIndex === -1) return []

    // Remove locale and admin from segments
    const routeSegments = segments.slice(adminIndex + 1)

    const breadcrumbs = [
      { label: 'Dashboard', href: '/vi/admin' },
    ]

    // Map route segments to readable names
    const routeNameMap: Record<string, string> = {
      blog: 'Blog Posts',
      docs: 'Docs',
      projects: 'Projects',
      about: 'About',
      tags: 'Tags',
      media: 'Media',
      settings: 'Settings',
      help: 'Help',
      new: 'New',
    }

    let currentPath = '/vi/admin'
    for (const segment of routeSegments) {
      currentPath += `/${segment}`
      breadcrumbs.push({
        label: routeNameMap[segment] || segment,
        href: currentPath,
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()
  const isRoot = breadcrumbs.length === 1

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem className="hidden md:block">
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
