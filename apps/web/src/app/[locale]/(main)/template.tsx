'use client'

import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { useMounted } from '@/lib/core/hooks/use-mounted'
import type { ComponentProps } from 'react'

/**
 * Template for main site (non-admin) routes
 * Includes SiteHeader, SiteFooter, and page animations
 */
export default function Template({ children }: ComponentProps<'div'>) {
  const isMounted = useMounted()

  if (!isMounted) {
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

  return (
    <div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <motion.main
          className="flex-1"
          animate={{ y: 0, opacity: 1 }}
          initial={{ y: 20, opacity: 0 }}
          transition={{ ease: 'easeInOut', duration: 0.7 }}
        >
          {children}
        </motion.main>
        <SiteFooter />
      </div>
      <div className="fixed left-0 top-0 size-full bg-gradient-to-b from-[#a277ff] via-transparent to-transparent opacity-10" />
    </div>
  )
}
