/**
 * Media Library Page
 * Admin interface for managing media files
 */

import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getMedia, getMediaStats } from '@/lib/queries/media'
import { MediaGrid } from '@/components/admin/media/media-grid'
import { MediaUploader } from '@/components/admin/media/media-uploader'

interface MediaPageProps {
  searchParams: Promise<{
    search?: string
    type?: 'image' | 'video' | 'raw' | 'all'
    page?: string
  }>
}

export default async function MediaPage({ searchParams }: MediaPageProps) {
  const t = await getTranslations('admin.media')
  const params = await searchParams

  const search = params.search || ''
  const resourceType = params.type || 'all'
  const page = parseInt(params.page || '1', 10)
  const limit = 20

  // Fetch media with filters
  const { media, total } = await getMedia({
    search,
    resourceType: resourceType === 'all' ? undefined : resourceType,
    limit,
    offset: (page - 1) * limit,
  })

  // Get stats
  const stats = await getMediaStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thư viện Media</h1>
          <p className="text-muted-foreground">
            Quản lý hình ảnh, video và file tải lên Cloudinary
          </p>
        </div>
        <MediaUploader
          onUploadSuccess={() => {
            // Refresh page after upload
            window.location.reload()
          }}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">media files</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hình ảnh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.images}</div>
            <p className="text-xs text-muted-foreground">images</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.videos}</div>
            <p className="text-xs text-muted-foreground">videos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khác</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.raw}</div>
            <p className="text-xs text-muted-foreground">other files</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Lọc & Tìm kiếm</CardTitle>
          <CardDescription>Tìm media theo tên file hoặc loại</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên file..."
                className="pl-9"
                defaultValue={search}
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  if (e.target.value) {
                    url.searchParams.set('search', e.target.value)
                  } else {
                    url.searchParams.delete('search')
                  }
                  window.history.pushState({}, '', url.toString())
                  window.location.reload()
                }}
              />
            </div>

            {/* Type Filter */}
            <Select
              defaultValue={resourceType}
              onValueChange={(value) => {
                const url = new URL(window.location.href)
                if (value === 'all') {
                  url.searchParams.delete('type')
                } else {
                  url.searchParams.set('type', value)
                }
                window.history.pushState({}, '', url.toString())
                window.location.reload()
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Loại file" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="image">Hình ảnh</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="raw">File khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            {total} media {search && `phù hợp với "${search}"`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<MediaGridSkeleton />}>
            <MediaGrid
              media={media}
              onRefresh={() => {
                window.location.reload()
              }}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function MediaGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}
