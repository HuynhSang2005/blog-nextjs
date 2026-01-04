import type { MetadataRoute } from 'next'

import { locales } from '@/config/i18n'
import { createClient } from '@/lib/supabase/server'
import { absoluteUrl } from '@/lib/utils'

type Sitemap = MetadataRoute.Sitemap

type SitemapEntrySource = {
  slug: string
  locale: string
  updated_at: string | null
  created_at?: string | null
  published_at?: string | null
}

function pickLatestDate(values: Array<string | null | undefined>): Date {
  const candidates = values
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .map(v => new Date(v))
    .filter(d => !Number.isNaN(d.getTime()))

  if (candidates.length === 0) {
    return new Date()
  }

  candidates.sort((a, b) => b.getTime() - a.getTime())
  return candidates[0]!
}

export default async function sitemap(): Promise<Sitemap> {
  const paths: Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),

      alternates: {
        languages: Object.fromEntries(
          locales.map(locale => [locale, absoluteUrl(`/${locale}`)])
        ),
      },
    },

    {
      url: absoluteUrl('/docs'),
      lastModified: new Date(),

      alternates: {
        languages: Object.fromEntries(
          locales.map(locale => [locale, absoluteUrl(`/${locale}/docs`)])
        ),
      },
    },
  ]

  const supabase = await createClient()

  const [{ data: docs, error: docsError }, { data: posts, error: postsError }] =
    await Promise.all([
      supabase
        .from('docs')
        .select('slug, locale, updated_at, created_at')
        .order('updated_at', { ascending: false }),

      supabase
        .from('blog_posts')
        .select('slug, locale, updated_at, created_at, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
    ])

  if (docsError) {
    console.error('Error fetching docs for sitemap:', docsError)
  }
  if (postsError) {
    console.error('Error fetching blog posts for sitemap:', postsError)
  }

  const docsBySlug = new Map<
    string,
    { locales: Set<string>; lastModified: Date }
  >()

  for (const doc of (docs ?? []) as SitemapEntrySource[]) {
    // `index` is treated as /docs
    if (doc.slug === 'index') continue

    const existing = docsBySlug.get(doc.slug)
    const lastModified = pickLatestDate([doc.updated_at, doc.created_at])

    if (!existing) {
      docsBySlug.set(doc.slug, { locales: new Set([doc.locale]), lastModified })
      continue
    }

    existing.locales.add(doc.locale)
    if (lastModified.getTime() > existing.lastModified.getTime()) {
      existing.lastModified = lastModified
    }
  }

  const postsBySlug = new Map<
    string,
    { locales: Set<string>; lastModified: Date }
  >()

  for (const post of (posts ?? []) as SitemapEntrySource[]) {
    const existing = postsBySlug.get(post.slug)
    const lastModified = pickLatestDate([
      post.published_at,
      post.updated_at,
      post.created_at,
    ])

    if (!existing) {
      postsBySlug.set(post.slug, {
        locales: new Set([post.locale]),
        lastModified,
      })
      continue
    }

    existing.locales.add(post.locale)
    if (lastModified.getTime() > existing.lastModified.getTime()) {
      existing.lastModified = lastModified
    }
  }

  const docPaths: Sitemap = Array.from(docsBySlug.entries()).map(
    ([slug, info]) => {
      return {
        url: absoluteUrl(`/docs/${slug}`),
        lastModified: info.lastModified,

        alternates: {
          languages: Object.fromEntries(
            locales
              .filter(locale => info.locales.has(locale))
              .map(locale => [locale, absoluteUrl(`/${locale}/docs/${slug}`)])
          ),
        },
      }
    }
  )

  const blogPaths: Sitemap = Array.from(postsBySlug.entries()).map(
    ([slug, info]) => {
      return {
        url: absoluteUrl(`/blog/${slug}`),
        lastModified: info.lastModified,

        alternates: {
          languages: Object.fromEntries(
            locales
              .filter(locale => info.locales.has(locale))
              .map(locale => [locale, absoluteUrl(`/${locale}/blog/${slug}`)])
          ),
        },
      }
    }
  )

  return [...paths, ...docPaths, ...blogPaths]
}
