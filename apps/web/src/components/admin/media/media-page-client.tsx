'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Filter, Search } from 'lucide-react'

import { MediaGrid } from '@/components/admin/media/media-grid'
import { MediaUploader } from '@/components/admin/media/media-uploader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MediaItem {
  id: string
  public_id: string
  resource_type: 'image' | 'video' | 'raw'
  format: string | null
  width: number | null
  height: number | null
  bytes: number | null
  alt_text: string | null
  caption: string | null
  uploaded_at: string
  metadata: Record<string, any> | null
}

interface MediaStats {
  total: number
  images: number
  videos: number
  raw: number
}

interface MediaTranslations {
  title: string
  description: string
  stats: {
    total: string
    images: string
    videos: string
    other: string
  }
  filtersTitle: string
  filtersDescription: string
  searchPlaceholder: string
  filterLabel: string
  allTypes: string
  imageLabel: string
  videoLabel: string
  rawLabel: string
  resultsLabel: string
}

interface MediaPageClientProps {
  media: MediaItem[]
  stats: MediaStats
  total: number
  page: number
  limit: number
  search: string
  resourceType: 'image' | 'video' | 'raw' | 'all'
  translations: MediaTranslations
}

export function MediaPageClient({
  media,
  stats,
  total,
  page,
  limit,
  search,
  resourceType,
  translations,
}: MediaPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParams = (updates: { search?: string | null; type?: string | null; page?: number }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (updates.search !== undefined) {
      if (updates.search) params.set('search', updates.search)
      else params.delete('search')
    }

    if (updates.type !== undefined) {
      if (updates.type && updates.type !== 'all') params.set('type', updates.type)
      else params.delete('type')
    }

    if (updates.page !== undefined) {
      params.set('page', updates.page.toString())
    }

    const query = params.toString()
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname)
      router.refresh()
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value || null, page: 1 })
    }, 450)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{translations.title}</h1>
          <p className="text-muted-foreground">{translations.description}</p>
        </div>
        <MediaUploader
          onUploadSuccess={() => {
            startTransition(() => router.refresh())
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{translations.resultsLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.stats.images}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.images}</div>
            <p className="text-xs text-muted-foreground">{translations.stats.images}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.stats.videos}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.videos}</div>
            <p className="text-xs text-muted-foreground">{translations.stats.videos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{translations.stats.other}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.raw}</div>
            <p className="text-xs text-muted-foreground">{translations.stats.other}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{translations.filtersTitle}</CardTitle>
          <CardDescription>{translations.filtersDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={translations.searchPlaceholder}
                className="pl-9"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <Select
              defaultValue={resourceType}
              onValueChange={(value) => updateParams({ type: value, page: 1 })}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={translations.filterLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{translations.allTypes}</SelectItem>
                <SelectItem value="image">{translations.imageLabel}</SelectItem>
                <SelectItem value="video">{translations.videoLabel}</SelectItem>
                <SelectItem value="raw">{translations.rawLabel}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {total} {translations.resultsLabel}
            {search ? ` (phù hợp với "${search}")` : ''}
          </CardTitle>
          <CardDescription>
            Trang {page} · {limit} mục/trang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MediaGrid
            media={media}
            onRefresh={() => startTransition(() => router.refresh())}
          />
        </CardContent>
      </Card>
    </div>
  )
}
