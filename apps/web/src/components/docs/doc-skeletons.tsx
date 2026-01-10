'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface TocSkeletonProps {
  className?: string
}

/**
 * Skeleton for Table of Contents
 * Matches the structure from toc.tsx
 */
export function TocSkeleton({ className }: TocSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('space-y-4 w-64 hidden lg:block', className)}
    >
      {/* Title */}
      <Skeleton className="h-5 w-24" />

      <Separator />

      {/* TOC items */}
      <div className="space-y-3">
        {/* Parent item */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12 ml-4" />
        <Skeleton className="h-4 w-10/12 ml-4" />

        {/* Another parent item */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 ml-4" />
        <Skeleton className="h-4 w-4/5 ml-4" />
        <Skeleton className="h-4 w-5/6 ml-4" />

        {/* Nested items */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 ml-4" />
      </div>
    </div>
  )
}

interface DocContentSkeletonProps {
  className?: string
}

/**
 * Skeleton for doc content area
 * Matches typical doc content structure
 */
export function DocContentSkeleton({ className }: DocContentSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('prose prose-neutral max-w-none space-y-4', className)}
    >
      {/* Title */}
      <Skeleton className="h-10 w-3/4" />

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      <Separator />

      {/* Content paragraphs */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-4/5" />

        {/* Code block placeholder */}
        <Skeleton className="h-32 w-full rounded-lg" />

        {/* More paragraphs */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-full" />
      </div>

      {/* Sections */}
      <div className="space-y-4 mt-8">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-full" />

        {/* Another section */}
        <Skeleton className="h-7 w-1/3 mt-6" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-11/12" />
      </div>
    </div>
  )
}

interface DocsPageSkeletonProps {
  className?: string
}

/**
 * Combined skeleton for full docs page
 */
export function DocsPageSkeleton({ className }: DocsPageSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('container py-10 space-y-8', className)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          <DocContentSkeleton />
        </div>

        {/* TOC sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <TocSkeleton />
        </div>
      </div>
    </div>
  )
}
