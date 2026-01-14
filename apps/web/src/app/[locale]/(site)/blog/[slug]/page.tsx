import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import '@/styles/mdx.css'

import type { LocaleOptions } from '@/types/i18n'
import { getBlogPost } from '@/services/blog-service'
import { getTableOfContents } from '@/lib/core/utils/toc'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TwitterLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons'
import { Icons } from '@/components/icons'
import { MdxRemote } from '@/components/docs/mdx-remote'
import { DashboardTableOfContents } from '@/components/docs/toc'
import { ScrollArea } from '@/components/ui/scroll-area'

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

  // Generate TOC from MDX content
  const toc = post.content
    ? await getTableOfContents(post.content)
    : { items: [] }

  return (
    <main className="container py-8 lg:py-10">
      <div className="mx-auto xl:grid xl:grid-cols-[4fr_1fr] xl:max-w-[1200px] xl:gap-12 xl:items-start">
        {/* Main Content */}
        <div className="w-full min-w-0 xl:border-r xl:border-gray-200 xl:pr-12">
          <article className="prose dark:prose-invert prose-base max-w-full">
            {/* Cover Image */}
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

            {/* Header */}
            <header className="not-prose mb-8">
              <h1 className="text-3xl sm:text-4xl font-medium mb-4">
                <Balancer>{post.title}</Balancer>
              </h1>

              {/* Author + Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {/* Author Avatar & Name */}
                {post.author && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        alt={post.author.full_name || undefined}
                        src={post.author.avatar_media_id || undefined}
                      />
                      <AvatarFallback>
                        {post.author.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                      {post.author.full_name}
                    </span>
                  </div>
                )}

                {/* Date */}
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

                {/* Read Time */}
                {post.reading_time_minutes && (
                  <ReadTime
                    messages={{ min_read: t('min_read') }}
                    time={post.reading_time_minutes}
                  />
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
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

            {/* MDX Content */}
            {post.content ? (
              <MdxRemote source={post.content} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nội dung đang được cập nhật...</p>
              </div>
            )}

            {/* Author Footer */}
            {post.author && (
              <footer className="mt-12 pt-8 border-t not-prose">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        alt={post.author.full_name || undefined}
                        src={post.author.avatar_media_id || undefined}
                      />
                      <AvatarFallback className="text-xl">
                        {post.author.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
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
        </div>

        {/* TOC Sidebar (Right) - 20% width */}
        <div className="hidden xl:block text-sm xl:pl-4">
          <div className="sticky top-16 -mt-10 pt-4">
            <ScrollArea className="pb-10">
              <div className="sticky top-16 -mt-10 h-fit py-12">
                <DashboardTableOfContents
                  messages={{
                    onThisPage: t('toc.on_this_page'),
                    editPageOnGitHub: t('toc.edit_page_on_github'),
                    startDiscussionOnGitHub: t(
                      'toc.start_discussion_on_github'
                    ),
                  }}
                  sourceFilePath=""
                  toc={toc}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
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
