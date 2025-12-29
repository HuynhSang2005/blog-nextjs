/**
 * Media Library Page
 * Admin interface for managing media files
 */

import { getTranslations } from 'next-intl/server'

import { getMedia, getMediaStats } from '@/lib/queries/media'
import { MediaPageClient } from '@/components/admin/media/media-page-client'

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
    <MediaPageClient
      media={media}
      stats={stats}
      total={total}
      page={page}
      limit={limit}
      search={search}
      resourceType={resourceType}
      translations={{
        title: t('title'),
        description: t('description'),
        stats: {
          total: t('total'),
          images: t('images'),
          videos: t('videos'),
          other: t('other'),
        },
        filtersTitle: 'Lọc & Tìm kiếm',
        filtersDescription: 'Tìm media theo tên file hoặc loại',
        searchPlaceholder: t('search_placeholder'),
        filterLabel: t('filter_type'),
        allTypes: t('all_types'),
        imageLabel: t('images'),
        videoLabel: t('videos'),
        rawLabel: t('other'),
        resultsLabel: 'media',
      }}
    />
  )
}
