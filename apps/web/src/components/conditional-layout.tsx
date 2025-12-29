'use client'

import { usePathname } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import type { ReactNode } from 'react'

/**
 * Conditional layout wrapper
 * Hides SiteHeader and SiteFooter for admin routes
 */
export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.includes('/admin')

  if (isAdmin) {
    // Admin routes: No main site header/footer
    return <>{children}</>
  }

  // Main site routes: With header, footer, and gradient
  return (
    <div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
      <div className="fixed left-0 top-0 size-full bg-gradient-to-b from-[#a277ff] via-transparent to-transparent opacity-10" />
    </div>
  )
}
