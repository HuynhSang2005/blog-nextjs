import { Skeleton } from '@/components/ui/skeleton'

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and filter row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      {/* Table header */}
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        </div>

        {/* Table rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b p-4 last:border-b-0">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full max-w-[300px]" />
                <Skeleton className="h-3 w-full max-w-[400px]" />
              </div>
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-8 w-[80px]" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[100px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
    </div>
  )
}
