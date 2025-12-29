import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CldImage } from '@/components/ui/cld-image'
import type { BlogPostListItem } from '@/lib/supabase/types-helpers'
import type { LocaleOptions } from '@/lib/core/types/i18n'
import { dateLocales } from '@/config/i18n'
import { ReadTime } from './read-time'
import { SeriesBadge } from './series-badge'
import { Balancer } from '@/components/ui/balancer'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { getContrastTextClass } from '@/lib/color-contrast'

interface BlogPostListProps {
  posts: BlogPostListItem[]
  locale: LocaleOptions
  messages: {
    by: string
    min_read: string
    read_more: string
  }
}

/**
 * Server Component - Blog posts list với grid layout
 * Hiển thị blog posts trong grid responsive
 */
export function BlogPostList({ posts, locale, messages }: BlogPostListProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <div
      className={cn('grid gap-6 grid-cols-1', {
        'md:grid-cols-2': posts.length >= 2,
        'lg:grid-cols-3': posts.length >= 3,
        'md:grid-cols-1': posts.length < 2,
      })}
    >
      {posts.map((post) => (
        <Card
          key={post.id}
          className="group overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300"
        >
          <Link href={`/${locale}/blog/${post.slug}`}>
            {/* Cover Image */}
            {post.cover_media && (
              <div className="relative aspect-[4/3] overflow-hidden">
                <CldImage
                  src={post.cover_media.public_id}
                  alt={post.cover_media.alt_text || post.title}
                  width={640}
                  height={480}
                  crop="fill"
                  gravity="auto"
                  quality="auto:best"
                  fetchFormat="auto"
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}

            <CardHeader>
              {/* Title */}
              <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                <Balancer>{post.title}</Balancer>
              </h2>

              {/* Series Badge */}
              {post.series_order && (
                <div className="mb-3">
                  <SeriesBadge seriesOrder={post.series_order} />
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {post.author && (
                  <span>
                    {messages.by} {post.author.full_name}
                  </span>
                )}
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at, dateLocales[locale])}
                  </time>
                )}
                {post.read_time_minutes && (
                  <ReadTime
                    time={post.read_time_minutes}
                    messages={{ min_read: messages.min_read }}
                  />
                )}
              </div>
            </CardHeader>

            <CardContent>
              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}

              {/* Tags - Limit to 3 + counter */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className={cn(
                        'transition-colors',
                        tag.color && getContrastTextClass(tag.color)
                      )}
                      style={{
                        backgroundColor: tag.color || undefined,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-muted-foreground">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Read more */}
              <span className={cn(buttonVariants({ variant: 'link' }), 'p-0')}>
                {messages.read_more} →
              </span>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  )
}
