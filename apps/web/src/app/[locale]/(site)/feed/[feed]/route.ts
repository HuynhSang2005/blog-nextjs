import { NextResponse } from 'next/server'
import { Feed, type Item } from 'feed'
import { cache } from 'react'

import { getObjectValueByLocale } from '@/lib/core/utils/locale'
import type { LocaleOptions } from '@/lib/core/types/i18n'
import type { RSSFeed } from '@/lib/core/types/blog'
import { defaultLocale, locales } from '@/config/i18n'
import { blogConfig } from '@/config/blog'
import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

interface FeedAuthor {
  full_name: string | null
  website: string | null
  email: string | null
}

interface FeedBlogPost {
  slug: string
  title: string
  excerpt: string | null
  locale: string
  published_at: string | null
  created_at: string | null
  author: FeedAuthor | null
}

interface FeedBlogPostRow {
  slug: string
  title: string
  excerpt: string | null
  locale: string
  published_at: string | null
  created_at: string | null
  author: FeedAuthor[] | null
}

async function getFeedPosts(locale: LocaleOptions): Promise<FeedBlogPost[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select(
      `
      slug,
      title,
      excerpt,
      locale,
      published_at,
      created_at,
      author:profiles!author_id(
        full_name,
        website,
        email
      )
    `
    )
    .eq('status', 'published')
    .eq('locale', locale)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts for feed:', error)
    throw error
  }

  return ((data ?? []) as unknown as FeedBlogPostRow[]).map(post => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    locale: post.locale,
    published_at: post.published_at,
    created_at: post.created_at,
    author: post.author?.[0] ?? null,
  }))
}

function generateWebsiteFeeds({
  file,
  posts,
  locale,
}: {
  posts: FeedBlogPost[]
  file: RSSFeed['file']
  locale: LocaleOptions
}) {
  const feed = new Feed({
    id: file,
    generator: siteConfig.name,
    copyright: siteConfig.name,
    image: siteConfig.og.image,
    language: locale || defaultLocale,
    title: `Blog - ${siteConfig.name}`,
    favicon: absoluteUrl('/favicon.ico'),
    link: absoluteUrl(`/${locale}/feed/${file}`),
    description: getObjectValueByLocale(siteConfig.description, locale),
  })

  const blogFeedEntries = posts.map(post => {
    const postLink =
      locale === defaultLocale
        ? `/blog/${post.slug}`
        : `/${locale}/blog/${post.slug}`

    const link = absoluteUrl(postLink)

    return {
      id: link,
      link,
      title: post.title,
      description: post.excerpt ?? undefined,
      date: new Date(post.published_at ?? post.created_at ?? Date.now()),

      author: [
        {
          name: post.author?.full_name ?? siteConfig.author.name,
          link: post.author?.website ?? siteConfig.links.github.url,
          email: post.author?.email || ' ',
        },
      ],
    } as Item
  })

  for (const blogFeedEntry of blogFeedEntries) {
    feed.addItem(blogFeedEntry)
  }

  return new Map<string, Feed>([[file, feed]])
}

const provideWebsiteFeeds = cache(
  async ({ feed, locale }: { feed: string; locale: LocaleOptions }) => {
    const posts = await getFeedPosts(locale || defaultLocale)
    const websiteFeeds = generateWebsiteFeeds({
      locale: locale || defaultLocale,
      file: feed,
      posts,
    })

    switch (feed) {
      case 'blog.xml':
        return websiteFeeds.get(feed)?.rss2()

      case 'blog.json':
        return websiteFeeds.get(feed)?.json1()

      default:
        return undefined
    }
  }
)

type StaticParams = {
  params: Promise<{ feed: RSSFeed['file']; locale: LocaleOptions }>
}

export const generateStaticParams = async (): Promise<
  StaticParams['params'][]
> => {
  return blogConfig.rss.flatMap(({ file }) =>
    locales.map(locale => ({ feed: file, locale }))
  ) as unknown as StaticParams['params'][]
}

export const GET = async (
  _: Request,
  context: { params: Promise<{ feed: string; locale: string }> }
) => {
  const params = await context.params

  const staticProps: StaticParams = {
    params: Promise.resolve({
      feed: params.feed as RSSFeed['file'],
      locale: params.locale as LocaleOptions,
    }),
  }

  const typedParams = await staticProps.params
  const websiteFeed = await provideWebsiteFeeds({
    feed: typedParams.feed,
    locale: typedParams.locale || defaultLocale,
  })

  const feed = blogConfig.rss.find(rss => rss.file === params.feed)

  const contentType = String(
    feed?.contentType || blogConfig.rss?.[0]?.contentType
  )

  return new NextResponse(websiteFeed, {
    status: websiteFeed ? 200 : 404,
    headers: {
      'Content-Type': contentType,
    },
  })
}

export const dynamicParams = true
export const dynamic = 'force-static'

export const revalidate = 300
