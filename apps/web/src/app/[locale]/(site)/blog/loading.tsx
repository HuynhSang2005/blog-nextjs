import { PostListSkeleton } from '@/components/blog/post-skeletons'

/**
 * Loading skeleton for blog listing page
 * Shown during client-side navigation (e.g., pagination, filter changes)
 * Provides immediate visual feedback while data fetches
 */
export default function BlogLoading() {
  return (
    <main className="relative max-w-[900px] mx-auto space-y-8 lg:space-y-10">
      {/* Filters skeleton - matches blog-filters.tsx structure */}
      <div
        aria-hidden="true"
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2"
      >
        {/* Search input */}
        <div className="flex flex-col gap-2 lg:col-span-4">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-11 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Sort select */}
        <div className="flex flex-col gap-2">
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
          <div className="h-11 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Tag select */}
        <div className="flex flex-col gap-2">
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          <div className="h-11 w-full bg-muted rounded animate-pulse" />
        </div>

        {/* Date picker & Apply button */}
        <div className="flex flex-col gap-2">
          <div className="h-5 w-28 bg-muted rounded animate-pulse" />
          <div className="h-11 w-full bg-muted rounded animate-pulse" />
        </div>
      </div>

      {/* Post list skeleton - matches post-list.tsx structure */}
      <div aria-hidden="true" className="flex flex-col gap-6 lg:gap-8">
        {/* Render 3 skeleton cards to show during loading */}
        <PostListSkeleton count={3} withCoverImages={true} />
      </div>

      {/* Pagination skeleton */}
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-2 py-4"
      >
        <div className="h-9 w-20 bg-muted rounded animate-pulse" />
        <div className="h-9 w-9 bg-muted rounded animate-pulse" />
        <div className="h-9 w-9 bg-muted rounded animate-pulse" />
        <div className="h-9 w-9 bg-muted rounded animate-pulse" />
        <div className="h-9 w-20 bg-muted rounded animate-pulse" />
      </div>
    </main>
  )
}
