import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { BlogPostList, BlogPagination, BlogFilters } from '@/features/blog'
import type { LocaleOptions } from '@/types/i18n'
import { getBlogPosts } from '@/services/blog-service'
import { absoluteUrl } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import { getTags } from '@/app/actions/tags'

interface BlogPageProps {
  params: Promise<{
    locale: LocaleOptions
  }>
  searchParams: Promise<{
    page?: string
    tag?: string
    search?: string
    sort?: string
    from?: string
    to?: string
  }>
}

const POSTS_PER_PAGE = 10

/**
 * Blog listing page với server-side pagination
 * Sử dụng searchParams để quản lý pagination state trong URL
 */
export default async function BlogPage(props: BlogPageProps) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ])

  const { locale } = params
  setRequestLocale(locale)

  // Parse và validate page number
  const pageParam = searchParams.page || '1'
  const page = Number.parseInt(pageParam, 10)

  const search = searchParams.search
  const sort = searchParams.sort
  const from = searchParams.from
  const to = searchParams.to

  // Validate page number
  if (!Number.isInteger(page) || page < 1) {
    const validParams = new URLSearchParams()
    validParams.set('page', '1')
    if (searchParams.tag) {
      validParams.set('tag', searchParams.tag)
    }
    redirect(`?${validParams.toString()}`)
  }

  // Get translations
  const t = await getTranslations()

  // Pre-check total items to normalize invalid pages when there are no posts
  const precheck = await getBlogPosts(
    locale,
    'published',
    {
      page: 1,
      pageSize: 1,
    },
    {
      search,
      sort:
        sort === 'newest' ||
        sort === 'oldest' ||
        sort === 'title' ||
        sort === 'views'
          ? sort
          : undefined,
      dateFrom: from,
      dateTo: to,
      tagSlug: searchParams.tag,
    }
  )

  const normalizedTotalPages =
    precheck.pagination.totalItems > 0
      ? Math.ceil(precheck.pagination.totalItems / POSTS_PER_PAGE)
      : 0

  // If there are no posts at all, force page=1 to avoid upstream range errors
  if (normalizedTotalPages === 0 && page > 1) {
    const validParams = new URLSearchParams()
    validParams.set('page', '1')
    if (searchParams.tag) {
      validParams.set('tag', searchParams.tag)
    }
    redirect(`?${validParams.toString()}`)
  }

  // Fetch paginated blog posts từ Supabase for the requested page
  const { data: postsData, pagination } = await getBlogPosts(
    locale,
    'published',
    {
      page,
      pageSize: POSTS_PER_PAGE,
    },
    {
      search,
      sort:
        sort === 'newest' ||
        sort === 'oldest' ||
        sort === 'title' ||
        sort === 'views'
          ? sort
          : undefined,
      dateFrom: from,
      dateTo: to,
      tagSlug: searchParams.tag,
    }
  )

  // Fetch tags for filter dropdown
  const tagsData = await getTags()

  // Nếu page > totalPages, redirect về page cuối cùng
  if (page > pagination.totalPages && pagination.totalPages > 0) {
    const validParams = new URLSearchParams()
    validParams.set('page', pagination.totalPages.toString())
    if (searchParams.tag) {
      validParams.set('tag', searchParams.tag)
    }
    redirect(`?${validParams.toString()}`)
  }

  return (
    <main className="relative max-w-[900px] mx-auto space-y-8 lg:space-y-10">
      <BlogFilters
        messages={{
          search_placeholder: t('blog.filters.search_placeholder'),
          sort_by: t('blog.filters.sort_by'),
          sort_newest: t('blog.filters.sort_newest'),
          sort_oldest: t('blog.filters.sort_oldest'),
          sort_title: t('blog.filters.sort_title'),
          sort_views: t('blog.filters.sort_views'),
          date_range: t('blog.filters.date_range'),
          date_from: t('blog.filters.date_from'),
          date_to: t('blog.filters.date_to'),
          clear_filters: t('blog.filters.clear_filters'),
          apply_filters: t('blog.filters.apply_filters'),
          filter_by_tag: t('blog.filters.filter_by_tag'),
          all_tags: t('blog.filters.all_tags'),
        }}
        tags={tagsData.map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          color: tag.color,
        }))}
      />

      <BlogPostList
        locale={locale}
        messages={{
          by: t('blog.by'),
          min_read: t('blog.min_read'),
          read_more: t('blog.read_more'),
        }}
        posts={postsData}
      />

      {pagination.totalPages > 1 && (
        <BlogPagination
          currentPage={pagination.page}
          messages={{
            next: t('blog.next'),
            previous: t('blog.previous'),
            go_to_next_page: t('blog.go_to_next_page'),
            go_to_previous_page: t('blog.go_to_previous_page'),
          }}
          searchParams={searchParams}
          totalPages={pagination.totalPages}
        />
      )}

      {postsData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('blog.no_posts_found')}</p>
        </div>
      )}
    </main>
  )
}

export async function generateMetadata(
  props: BlogPageProps
): Promise<Metadata> {
  const params = await props.params
  const { locale } = params

  const t = await getTranslations('site')

  const title = t('words.blog')
  const description = t('description')

  const ogImage = absoluteUrl('/blog-og/blog-listing-og.jpg')

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      type: 'website',
      url: absoluteUrl(`/${locale}/blog`),
      images: [
        {
          ...siteConfig.og.size,
          url: ogImage,
          alt: siteConfig.name,
        },
      ],
    },

    twitter: {
      title,
      description,
      images: [ogImage],
      card: 'summary_large_image',
      creator: siteConfig.links.twitter.username,
    },
  }
}
