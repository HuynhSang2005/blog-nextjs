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
          {filters.map(filter => {
            const isActive =
              filter.value === null
                ? currentStatus === null
                : currentStatus === filter.value

            return (
              <Button
                className="shrink-0"
                key={filter.value || 'all'}
                onClick={() => updateFilters('status', filter.value)}
                size="sm"
                variant={isActive ? 'default' : 'outline'}
              >
                {filter.label}
                <Badge
                  className={cn('ml-2', isActive && 'bg-primary-foreground/20')}
                  variant="secondary"
                >
                  {filter.count}
                </Badge>
              </Button>
            )
          })}

          {/* Featured Filter */}
          <Button
            className="shrink-0"
            onClick={() =>
              updateFilters(
                'featured',
                currentFeatured === 'true' ? null : 'true'
              )
            }
            size="sm"
            variant={currentFeatured === 'true' ? 'default' : 'outline'}
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
                <Badge className="gap-1" variant="secondary">
                  {filters.find(f => f.value === currentStatus)?.label}
                  <button
                    className="ml-1 hover:text-foreground"
                    onClick={() => updateFilters('status', null)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Xóa bộ lọc trạng thái</span>
                  </button>
                </Badge>
              )}
              {currentFeatured === 'true' && (
                <Badge className="gap-1" variant="secondary">
                  {t('filters.featured')}
                  <button
                    className="ml-1 hover:text-foreground"
                    onClick={() => updateFilters('featured', null)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Xóa bộ lọc nổi bật</span>
                  </button>
                </Badge>
              )}
            </div>
            <Button
              className="ml-auto"
              onClick={clearAllFilters}
              size="sm"
              variant="ghost"
            >
              {t('clear_filters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
