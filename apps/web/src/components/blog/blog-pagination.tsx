'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | string[] | undefined>
  messages: {
    next: string
    previous: string
    go_to_next_page: string
    go_to_previous_page: string
  }
}

/**
 * Client Component - Blog pagination controls
 *
 * Sử dụng URL searchParams làm single source of truth
 * Preserve tất cả search params khác khi change page
 */
export function BlogPagination({
  currentPage,
  totalPages,
  searchParams,
  messages,
}: BlogPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()

  /**
   * Navigate to specific page
   * Merge với existing searchParams để preserve filters
   */
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return

    const params = new URLSearchParams()

    // Preserve existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value !== undefined) {
        const stringValue = Array.isArray(value) ? value[0] : value
        if (stringValue) {
          params.set(key, stringValue)
        }
      }
    })

    // Set new page
    params.set('page', page.toString())

    // Navigate
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  // Generate page numbers to display
  const pageNumbers = generatePageNumbers(currentPage, totalPages)
  let ellipsisIndex = 0

  return (
    <nav
      aria-label="Phân trang blog"
      className="flex items-center justify-center gap-2 mt-8"
    >
      {/* Previous button */}
      <Button
        aria-label={messages.go_to_previous_page}
        disabled={!hasPrevious}
        onClick={() => goToPage(currentPage - 1)}
        size="sm"
        variant="outline"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {messages.previous}
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map(pageNum => {
          if (pageNum === '...') {
            ellipsisIndex += 1
            return (
              <span
                className="px-2 text-muted-foreground"
                key={`ellipsis-${ellipsisIndex}`}
              >
                ...
              </span>
            )
          }

          const page = Number(pageNum)
          const isActive = page === currentPage

          return (
            <Button
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Đi đến trang ${page}`}
              className={cn('min-w-[40px]', isActive && 'pointer-events-none')}
              disabled={isActive}
              key={page}
              onClick={() => goToPage(page)}
              size="sm"
              variant={isActive ? 'default' : 'ghost'}
            >
              {page}
            </Button>
          )
        })}
      </div>

      {/* Next button */}
      <Button
        aria-label={messages.go_to_next_page}
        disabled={!hasNext}
        onClick={() => goToPage(currentPage + 1)}
        size="sm"
        variant="outline"
      >
        {messages.next}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </nav>
  )
}

/**
 * Generate page numbers array với ellipsis
 * Hiển thị: 1 ... 4 5 6 ... 10
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number
): Array<number | string> {
  const delta = 2 // Number of pages to show around current page
  const range: Array<number | string> = []
  const rangeWithDots: Array<number | string> = []
  let l: number | undefined

  // Always show first page
  range.push(1)

  // Add pages around current page
  for (let i = currentPage - delta; i <= currentPage + delta; i++) {
    if (i > 1 && i < totalPages) {
      range.push(i)
    }
  }

  // Always show last page
  if (totalPages > 1) {
    range.push(totalPages)
  }

  // Add ellipsis where needed
  for (const i of range) {
    if (typeof i === 'number' && l !== undefined) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    if (typeof i === 'number') {
      l = i
    }
  }

  return rangeWithDots
}
