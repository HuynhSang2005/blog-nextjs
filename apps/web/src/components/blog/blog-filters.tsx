'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface BlogFiltersProps {
  messages: {
    search_placeholder: string
    sort_by: string
    sort_newest: string
    sort_oldest: string
    sort_title: string
    sort_views: string
    date_range: string
    date_from: string
    date_to: string
    clear_filters: string
    apply_filters: string
  }
}

/**
 * Client Component - Blog advanced filters
 * Search, sort, and date range filtering for blog posts
 */
export function BlogFilters({ messages }: BlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Filter states
  const [search, setSearch] = React.useState(searchParams.get('search') || '')
  const [sort, setSort] = React.useState(searchParams.get('sort') || 'newest')
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      const from = searchParams.get('from')
      const to = searchParams.get('to')
      if (from && to) {
        return {
          from: new Date(from),
          to: new Date(to),
        }
      }
      return undefined
    }
  )

  // Apply filters to URL
  const applyFilters = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    // Search
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }

    // Sort
    if (sort !== 'newest') {
      params.set('sort', sort)
    } else {
      params.delete('sort')
    }

    // Date range
    if (dateRange?.from) {
      params.set('from', format(dateRange.from, 'yyyy-MM-dd'))
    } else {
      params.delete('from')
    }

    if (dateRange?.to) {
      params.set('to', format(dateRange.to, 'yyyy-MM-dd'))
    } else {
      params.delete('to')
    }

    // Reset to page 1 when filters change
    params.set('page', '1')

    router.push(`?${params.toString()}`)
  }, [search, sort, dateRange, searchParams, router])

  // Clear all filters
  const clearFilters = React.useCallback(() => {
    setSearch('')
    setSort('newest')
    setDateRange(undefined)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    params.delete('sort')
    params.delete('from')
    params.delete('to')
    params.set('page', '1')

    router.push(`?${params.toString()}`)
  }, [searchParams, router])

  // Check if any filters are active
  const hasActiveFilters =
    search.trim() !== '' || sort !== 'newest' || dateRange !== undefined

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Search */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm" htmlFor="search">
          {messages.search_placeholder}
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            id="search"
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                applyFilters()
              }
            }}
            placeholder={messages.search_placeholder}
            value={search}
          />
        </div>
      </div>

      {/* Sort */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm" htmlFor="sort">
          {messages.sort_by}
        </Label>
        <Select onValueChange={setSort} value={sort}>
          <SelectTrigger id="sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{messages.sort_newest}</SelectItem>
            <SelectItem value="oldest">{messages.sort_oldest}</SelectItem>
            <SelectItem value="title">{messages.sort_title}</SelectItem>
            <SelectItem value="views">{messages.sort_views}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date range picker */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm">{messages.date_range}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                'justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
              variant="outline"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                    {format(dateRange.to, 'dd/MM/yyyy')}
                  </>
                ) : (
                  format(dateRange.from, 'dd/MM/yyyy')
                )
              ) : (
                <span>{messages.date_range}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              initialFocus
              mode="range"
              numberOfMonths={2}
              onSelect={setDateRange}
              selected={dateRange}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <div className="h-5" />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={applyFilters}>
            {messages.apply_filters}
          </Button>
          {hasActiveFilters && (
            <Button
              aria-label={messages.clear_filters}
              onClick={clearFilters}
              size="icon"
              title={messages.clear_filters}
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
