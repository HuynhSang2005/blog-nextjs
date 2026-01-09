import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import '@/styles/mdx.css'

import type { LocaleOptions } from '@/types/i18n'
import { getBlogPost } from '@/services/blog-service'
import { siteConfig } from '@/config/site'
import { absoluteUrl, cn, formatDate } from '@/lib/utils'
import { CldImage } from '@/components/ui/cld-image'
import { Balancer } from '@/components/ui/balancer'
import Link from 'next/link'
import { dateLocales } from '@/config/i18n'
import { ReadTime } from '@/features/blog'
import { badgeVariants } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { TwitterLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons'
import { Icons } from '@/components/icons'
import { MdxRemote } from '@/components/docs/mdx-remote'

// Revalidate every 30 minutes (Phase 2: Runtime caching)
export const revalidate = 1800

interface BlogPostPageProps {
  params: Promise<{
    slug: string
    locale: LocaleOptions
  }>
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const params = await props.params
  const { locale, slug } = params

  setRequestLocale(locale)

  const { data: post, error } = await getBlogPost(slug, locale)

  if (error || !post) {
    notFound()
  }
  const t = await getTranslations('blog')

  return (
    <main className="container max-w-screen-xl py-10">
      <article className="prose dark:prose-invert max-w-none">
        {post.cover_media && (
          <div className="relative aspect-video overflow-hidden rounded-lg mb-8 not-prose">
            <CldImage
              alt={post.cover_media.alt_text || post.title}
              className="object-cover"
              crop="fill"
              gravity="auto"
              height={630}
              priority
              src={post.cover_media.public_id}
              width={1200}
            />
          </div>
        )}

        <header className="not-prose mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <Balancer>{post.title}</Balancer>
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {post.author && (
              <span>
                {t('by')} {post.author.full_name}
              </span>
            )}
            {(post.published_at || post.created_at) && (
              <time
                dateTime={post.published_at || post.created_at || undefined}
              >
                {formatDate(
                  (post.published_at || post.created_at) as string,
                  dateLocales[locale]
                )}
              </time>
            )}
            {post.reading_time_minutes && (
              <ReadTime
                messages={{ min_read: t('min_read') }}
                time={post.reading_time_minutes}
              />
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
                <Link
                  className={cn(
                    badgeVariants({ variant: 'secondary' }),
                    'hover:bg-primary hover:text-primary-foreground transition-colors'
                  )}
                  href={`/blog?tag=${encodeURIComponent(tag.slug)}`}
                  key={tag.id}
                  style={{ backgroundColor: tag.color || undefined }}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        {post.content ? <MdxRemote source={post.content} /> : null}

        {post.author && (
          <footer className="mt-12 pt-8 border-t not-prose">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex-1">
                  <CardTitle>{post.author.full_name}</CardTitle>
                  {post.author.bio && (
                    <CardDescription className="mt-1">
                      {post.author.bio}
                    </CardDescription>
                  )}
                  <div className="flex gap-2 mt-3">
                    {post.author.twitter_username && (
                      <Link
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' })
                        )}
                        href={`https://twitter.com/${post.author.twitter_username}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <TwitterLogoIcon className="h-4 w-4" />
                      </Link>
                    )}
                    {post.author.github_username && (
                      <Link
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' })
                        )}
                        href={`https://github.com/${post.author.github_username}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Icons.gitHub className="h-4 w-4" />
                      </Link>
                    )}
                    {post.author.linkedin_username && (
                      <Link
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'sm' })
                        )}
                        href={`https://linkedin.com/in/${post.author.linkedin_username}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <LinkedInLogoIcon className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          </footer>
        )}
      </article>
    </main>
  )
}

export async function generateMetadata(
  props: BlogPostPageProps
): Promise<Metadata> {
  const params = await props.params
  const { locale, slug } = params

  const { data: post, error } = await getBlogPost(slug, locale)

  if (error || !post) {
    return {
      title: 'Post not found',
    }
  }

  const ogImage = post.og_media?.public_id
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${post.og_media.public_id}`
    : post.cover_media?.public_id
      ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_1200,h_630/${post.cover_media.public_id}`
      : absoluteUrl('/blog-og/default-og.jpg')

  const authorTwitter =
    post.author?.twitter_username ||
    siteConfig.links.twitter.username.replace('@', '')

  return {
    title: post.title,
    description: post.excerpt || '',
    keywords: post.tags?.map(tag => tag.name) || [],

    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      url: absoluteUrl(`/${locale}/blog/${post.slug}`),
      publishedTime: post.published_at || post.created_at || undefined,
      authors: [post.author?.full_name || siteConfig.author.name],
      tags: post.tags?.map(tag => tag.name) || [],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },

    twitter: {
      title: post.title,
      description: post.excerpt || '',
      images: [ogImage],
      card: 'summary_large_image',
      creator: authorTwitter ? `@${authorTwitter}` : undefined,
    },
  }
}

export async function generateStaticParams(): Promise<
  Array<{ locale: string; slug: string }>
> {
  return []
}
