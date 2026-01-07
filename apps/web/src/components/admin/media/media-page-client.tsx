'use client'

import { useCallback, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Filter, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaGrid, type MediaItem } from '@/components/admin/media/media-grid'

interface MediaPageClientProps {
  media: MediaItem[]
  total: number
  initialSearch: string
  initialType: 'image' | 'video' | 'raw' | 'all'
}

export function MediaPageClient({
  media,
  total,
  initialSearch,
  initialType,
}: MediaPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const t = useTranslations('admin.media')

  const updateQueryParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams)
      if (!value) {
        next.delete(key)
      } else {
        next.set(key, value)
      }

      // Reset pagination when filters change
      next.delete('page')

      startTransition(() => {
        const qs = next.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname)
        router.refresh()
      })
    },
    [pathname, router, searchParams]
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                defaultValue={initialSearch}
                onChange={e => {
                  updateQueryParam('search', e.target.value || null)
                }}
                placeholder={t('search_placeholder')}
              />
            </div>

            <Select
              defaultValue={initialType}
              onValueChange={value => {
                updateQueryParam('type', value === 'all' ? null : value)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('filter_type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all_types')}</SelectItem>
                <SelectItem value="image">{t('images')}</SelectItem>
                <SelectItem value="video">{t('videos')}</SelectItem>
                <SelectItem value="raw">{t('other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t('total')}: {total}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MediaGrid
            media={media}
            onRefresh={() => {
              router.refresh()
            }}
          />
        </CardContent>
      </Card>
    </>
  )
}
