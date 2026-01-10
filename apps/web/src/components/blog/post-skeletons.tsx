import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PostCardSkeletonProps {
  className?: string
  withCoverImage?: boolean
}

/**
 * Skeleton for a single blog post card
 * Matches the structure from post-list.tsx
 */
export function PostCardSkeleton({
  className,
  withCoverImage = true,
}: PostCardSkeletonProps) {
  return (
    <Card aria-hidden="true" className={cn('overflow-hidden', className)}>
      {/* Cover Image */}
      {withCoverImage && (
        <div className="relative aspect-video overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      <CardHeader className="space-y-3">
        {/* Title placeholder */}
        <Skeleton className="h-8 w-3/4" />

        {/* Meta info placeholders */}
        <div className="flex items-center gap-4 text-sm">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Excerpt lines */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </CardContent>
    </Card>
  )
}

interface PostListSkeletonProps {
  count?: number
  className?: string
  withCoverImages?: boolean
}

/**
 * Skeleton for blog post list grid
 * Matches the grid structure from post-list.tsx
 */
export function PostListSkeleton({
  count = 6,
  className,
  withCoverImages = true,
}: PostListSkeletonProps) {
  // Generate stable unique IDs for skeleton items to avoid lint warnings
  const skeletonIds = Array.from(
    { length: count },
    () => `skeleton-${Math.random().toString(36).substring(2, 9)}`
  )

  return (
    <output
      aria-label="Đang tải danh sách bài viết..."
      aria-live="polite"
      className={cn(
        'grid gap-4 grid-cols-1',
        count >= 2 ? 'md:grid-cols-2' : 'md:grid-cols-1',
        className
      )}
    >
      {skeletonIds.map(id => (
        <PostCardSkeleton key={id} withCoverImage={withCoverImages} />
      ))}
    </output>
  )
}
