'use client'

import { useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function buildPageItems(currentPage: number, totalPages: number) {
  const page = clamp(currentPage, 1, Math.max(totalPages, 1))

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => ({
      type: 'page' as const,
      page: i + 1,
    }))
  }

  const items: Array<
    | { type: 'page'; page: number }
    | { type: 'ellipsis'; key: string }
  > = []

  const left = Math.max(2, page - 1)
  const right = Math.min(totalPages - 1, page + 1)

  items.push({ type: 'page', page: 1 })

  if (left > 2) items.push({ type: 'ellipsis', key: 'left' })

  for (let p = left; p <= right; p += 1) {
    items.push({ type: 'page', page: p })
  }

  if (right < totalPages - 1) items.push({ type: 'ellipsis', key: 'right' })

  items.push({ type: 'page', page: totalPages })

  return items
}

export interface AdminPaginationProps {
  page: number
  totalPages: number
  previousLabel: string
  nextLabel: string
  previousAriaLabel: string
  nextAriaLabel: string
}

export function AdminPagination({
  page,
  totalPages,
  previousLabel,
  nextLabel,
  previousAriaLabel,
  nextAriaLabel,
}: AdminPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const canGoPrevious = page > 1
  const canGoNext = page < totalPages

  const items = useMemo(() => buildPageItems(page, totalPages), [page, totalPages])

  const buildHref = (targetPage: number) => {
    const next = new URLSearchParams(searchParams)
    if (targetPage <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(targetPage))
    }

    const qs = next.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  if (totalPages <= 1) return null

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-label={previousAriaLabel}
            className={!canGoPrevious ? 'pointer-events-none opacity-50' : undefined}
            href={buildHref(page - 1)}
          >
            {previousLabel}
          </PaginationPrevious>
        </PaginationItem>

        {items.map(item => {
          if (item.type === 'ellipsis') {
            return (
              <PaginationItem key={item.key}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          const isActive = item.page === page

          return (
            <PaginationItem key={item.page}>
              <PaginationLink href={buildHref(item.page)} isActive={isActive}>
                {item.page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext
            aria-label={nextAriaLabel}
            className={!canGoNext ? 'pointer-events-none opacity-50' : undefined}
            href={buildHref(page + 1)}
          >
            {nextLabel}
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
