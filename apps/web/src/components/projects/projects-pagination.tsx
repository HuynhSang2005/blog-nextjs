'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProjectsPaginationProps {
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | string[] | undefined>
  messages: {
    next: string
    previous: string
    go_to_next_page: string
    go_to_previous_page: string
    go_to_page: string
    aria_label: string
  }
}

/**
 * Client Component - Projects pagination controls
 *
 * Sử dụng URL searchParams làm single source of truth
 * Preserve tất cả search params khác khi change page
 */
export function ProjectsPagination({
  currentPage,
  totalPages,
  searchParams,
  messages,
}: ProjectsPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return

    const params = new URLSearchParams()

    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value !== undefined) {
        const stringValue = Array.isArray(value) ? value[0] : value
        if (stringValue) {
          params.set(key, stringValue)
        }
      }
    })

    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  const pageNumbers = generatePageNumbers(currentPage, totalPages)
  let ellipsisIndex = 0

  return (
    <nav
      aria-label={messages.aria_label}
      className="mt-8 flex items-center justify-center gap-2"
    >
      <Button
        aria-label={messages.go_to_previous_page}
        disabled={!hasPrevious}
        onClick={() => goToPage(currentPage - 1)}
        size="sm"
        variant="outline"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        {messages.previous}
      </Button>

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
              aria-label={messages.go_to_page.replace(
                '{page}',
                page.toString()
              )}
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

      <Button
        aria-label={messages.go_to_next_page}
        disabled={!hasNext}
        onClick={() => goToPage(currentPage + 1)}
        size="sm"
        variant="outline"
      >
        {messages.next}
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </nav>
  )
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number
): Array<number | string> {
  const delta = 2
  const range: Array<number | string> = []
  const rangeWithDots: Array<number | string> = []
  let last: number | undefined

  range.push(1)

  for (let i = currentPage - delta; i <= currentPage + delta; i++) {
    if (i > 1 && i < totalPages) {
      range.push(i)
    }
  }

  if (totalPages > 1) {
    range.push(totalPages)
  }

  for (const i of range) {
    if (typeof i === 'number' && last !== undefined) {
      if (i - last === 2) {
        rangeWithDots.push(last + 1)
      } else if (i - last !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    if (typeof i === 'number') {
      last = i
    }
  }

  return rangeWithDots
}
