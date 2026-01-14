'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Calendar as CalendarIcon } from 'lucide-react'
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
    filter_by_tag: string
    all_tags: string
    filters?: string
    show_filters?: string
    hide_filters?: string
  }
  tags?: Array<{
    id: string
    name: string
    slug: string
    color?: string | null
  }>
}

/**
 * Client Component - Blog advanced filters với mobile-first design
 * Search, sort, date range, and tag filtering for blog posts
 * - Touch targets ≥ 44px
 * - Collapsible on mobile
 * - Responsive grid layout
 */
export function BlogFilters({ messages, tags = [] }: BlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Mobile filters visibility state
  const [showMobileFilters, setShowMobileFilters] = React.useState(false)

  // Filter states
  const [search, setSearch] = React.useState(searchParams.get('search') || '')
  const [sort, setSort] = React.useState(searchParams.get('sort') || 'newest')
  const [selectedTag, setSelectedTag] = React.useState(
    searchParams.get('tag') || ''
  )
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

    // Tag filter
    if (selectedTag !== '') {
      params.set('tag', selectedTag)
    } else {
      params.delete('tag')
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

    // Close mobile filters after applying
    setShowMobileFilters(false)

    router.push(`?${params.toString()}`)
  }, [search, sort, selectedTag, dateRange, searchParams, router])

  // Check if any filters are active
  const hasActiveFilters =
    search.trim() !== '' ||
    sort !== 'newest' ||
    selectedTag !== '' ||
    dateRange !== undefined

  // Get optional messages with defaults
  const filtersLabel = messages.filters || 'Bộ lọc'
  const hideFiltersLabel = messages.hide_filters || 'Ẩn bộ lọc'

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Mobile: Filter toggle button */}
      <div className="lg:hidden">
        <Button
          className={cn(
            'w-full justify-between h-11', // 44px minimum touch target
            hasActiveFilters && 'border-primary'
          )}
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          variant="outline"
        >
          <span>{showMobileFilters ? hideFiltersLabel : filtersLabel}</span>
          <Search className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Filters container - collapsible on mobile */}
      <div
        className={cn(
          'grid gap-4',
          // Mobile: collapsible with smooth transition
          showMobileFilters ? 'grid-cols-1' : 'hidden',
          // Tablet: 2 columns
          'md:grid-cols-2',
          // Desktop: 2 rows - Search 3 cols, then Sort + Tag + Date + Apply button
          // Use items-end to align Apply button with other inputs (no label)
          'lg:grid lg:grid-cols-4 lg:grid-rows-2 lg:items-end',
          // Animation
          'transition-all duration-200'
        )}
      >
        {/* Search - Full width on first row */}
        <div className="flex flex-col gap-2 lg:col-span-4">
          <Label className="text-sm" htmlFor="search">
            {messages.search_placeholder}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 h-11" // 44px minimum touch target
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
            <SelectTrigger className="h-11" id="sort">
              {' '}
              {/* 44px minimum */}
              <SelectValue placeholder={messages.sort_newest} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{messages.sort_newest}</SelectItem>
              <SelectItem value="oldest">{messages.sort_oldest}</SelectItem>
              <SelectItem value="title">{messages.sort_title}</SelectItem>
              <SelectItem value="views">{messages.sort_views}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tag filter */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm" htmlFor="tag">
            {messages.filter_by_tag}
          </Label>
          <Select onValueChange={setSelectedTag} value={selectedTag}>
            <SelectTrigger className="h-11" id="tag">
              <SelectValue placeholder={messages.all_tags} />
            </SelectTrigger>
            <SelectContent>
              {tags.map(tag => (
                <SelectItem key={tag.id} value={tag.slug}>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
                    <span className="text-foreground">{tag.name}</span>
                  </span>
                </SelectItem>
              ))}
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
                  'h-11 justify-start text-left font-normal w-full',
                  !dateRange?.from && 'text-muted-foreground'
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

        {/* Apply button - No label, aligned to bottom with items-end on parent grid */}
        <div className="flex flex-col gap-2">
          <Button className="h-11 w-full" onClick={applyFilters}>
            {messages.apply_filters}
          </Button>

          {/* Clear filters button - only show when filters are active */}
          {hasActiveFilters && (
            <Button
              className="h-9 w-full text-muted-foreground hover:text-destructive"
              onClick={() => {
                setSearch('')
                setSort('newest')
                setSelectedTag('')
                setDateRange(undefined)
                applyFilters()
              }}
              variant="ghost"
            >
              {messages.clear_filters}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
