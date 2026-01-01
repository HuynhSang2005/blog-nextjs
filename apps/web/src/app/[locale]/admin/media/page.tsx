/**
 * Media Library Page
 * Admin interface for managing media files
 */

import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getMedia, getMediaStats } from '@/lib/queries/media'
import { MediaUploader } from '@/components/admin/media/media-uploader'
import { MediaPageClient } from '@/components/admin/media/media-page-client'

interface MediaPageProps {
  searchParams: Promise<{
    search?: string
    type?: 'image' | 'video' | 'raw' | 'all'
    page?: string
  }>
}

export default async function MediaPage({ searchParams }: MediaPageProps) {
  const _t = await getTranslations('admin.media')
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
        <MediaUploader />
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
      <MediaPageClient
        initialSearch={search}
        initialType={resourceType}
        media={media}
        total={total}
      />
    </div>
  )
}
