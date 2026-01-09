/**
 * Media Library Page
 * Admin interface for managing media files
 */

import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getMediaList, getMediaStats } from '@/services/media-service'
import { MediaUploader, MediaPageClient } from '@/features/media'
import { AdminPagination } from '@/components/admin/shared/admin-pagination'
import type { MediaItem } from '@/components/admin/media/media-grid'

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
  const safePage = Number.isFinite(page) && page > 0 ? page : 1
  const limit = 20

  // Fetch media with filters
  const { data: media, count: total } = await getMediaList({
    search,
    resourceType: resourceType === 'all' ? undefined : resourceType,
    limit,
    offset: (safePage - 1) * limit,
  })

  // Get stats
  const stats = await getMediaStats()
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0

  const mediaItems: MediaItem[] = media.map(item => {
    const resourceType: MediaItem['resource_type'] =
      item.resource_type === 'image' ||
      item.resource_type === 'video' ||
      item.resource_type === 'raw'
        ? item.resource_type
        : 'raw'

    return {
      id: item.id,
      public_id: item.public_id,
      resource_type: resourceType,
      format: item.format,
      width: item.width,
      height: item.height,
      bytes: item.bytes,
      alt_text: item.alt_text,
      caption: item.caption,
      uploaded_at: item.uploaded_at,
      metadata: item.metadata,
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <MediaUploader />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalImages + stats.totalVideos}
            </div>
            <p className="text-xs text-muted-foreground">{t('media_files')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('images')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImages}</div>
            <p className="text-xs text-muted-foreground">{t('images_label')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('videos')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVideos}</div>
            <p className="text-xs text-muted-foreground">{t('videos_label')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('other')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">{t('other_label')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <MediaPageClient
        initialSearch={search}
        initialType={resourceType}
        media={mediaItems}
        total={total}
      />

      <AdminPagination
        nextAriaLabel={t('pagination.next')}
        nextLabel={t('pagination.next')}
        page={safePage}
        previousAriaLabel={t('pagination.previous')}
        previousLabel={t('pagination.previous')}
        totalPages={totalPages}
      />
    </div>
  )
}
