'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectFiltersProps {
  stats: {
    total: number
    in_progress: number
    completed: number
    archived: number
  }
}

export function ProjectFilters({ stats }: ProjectFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('projects')

  const currentStatus = searchParams.get('status') as
    | 'in_progress'
    | 'completed'
    | 'archived'
    | null
  const currentFeatured = searchParams.get('featured')

  const filters = [
    {
      label: t('filters.all'),
      value: null,
      count: stats.total,
    },
    {
      label: t('filters.in_progress'),
      value: 'in_progress',
      count: stats.in_progress,
    },
    {
      label: t('filters.completed'),
      value: 'completed',
      count: stats.completed,
    },
    {
      label: t('filters.archived'),
      value: 'archived',
      count: stats.archived,
    },
  ]

  function updateFilters(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function clearAllFilters() {
    router.push(pathname, { scroll: false })
  }

  const hasActiveFilters = currentStatus !== null || currentFeatured !== null

  return (
    <div className="sticky top-16 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="container py-4">
        {/* Status Filters */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => {
            const isActive =
              filter.value === null
                ? currentStatus === null
                : currentStatus === filter.value

            return (
              <Button
                key={filter.value || 'all'}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="shrink-0"
                onClick={() => updateFilters('status', filter.value)}
              >
                {filter.label}
                <Badge
                  variant="secondary"
                  className={cn(
                    'ml-2',
                    isActive && 'bg-primary-foreground/20'
                  )}
                >
                  {filter.count}
                </Badge>
              </Button>
            )
          })}

          {/* Featured Filter */}
          <Button
            variant={currentFeatured === 'true' ? 'default' : 'outline'}
            size="sm"
            className="shrink-0"
            onClick={() =>
              updateFilters('featured', currentFeatured === 'true' ? null : 'true')
            }
          >
            {t('filters.featured')}
          </Button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Bộ lọc đang áp dụng:
            </span>
            <div className="flex flex-wrap gap-2">
              {currentStatus && (
                <Badge variant="secondary" className="gap-1">
                  {filters.find((f) => f.value === currentStatus)?.label}
                  <button
                    onClick={() => updateFilters('status', null)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {currentFeatured === 'true' && (
                <Badge variant="secondary" className="gap-1">
                  {t('filters.featured')}
                  <button
                    onClick={() => updateFilters('featured', null)}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="ml-auto"
            >
              {t('clear_filters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
