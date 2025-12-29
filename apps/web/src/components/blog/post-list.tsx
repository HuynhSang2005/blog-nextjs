import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CldImage } from 'next-cloudinary'
import type { BlogPostListItem } from '@/lib/supabase/types-helpers'
import type { LocaleOptions } from '@/lib/core/types/i18n'
import { dateLocales } from '@/config/i18n'
import { ReadTime } from './read-time'
import Balancer from 'react-wrap-balancer'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

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
      className={cn('grid gap-4 grid-cols-1', {
        'md:grid-cols-2': posts.length >= 2,
        'md:grid-cols-1': posts.length < 2,
      })}
    >
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <Link href={`/${locale}/blog/${post.slug}`}>
            {/* Cover Image */}
            {post.cover_media && (
              <div className="relative aspect-video overflow-hidden">
                <CldImage
                  src={post.cover_media.public_id}
                  alt={post.cover_media.alt_text || post.title}
                  width={800}
                  height={450}
                  crop="fill"
                  gravity="auto"
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                />
              </div>
            )}

            <CardHeader>
              {/* Title */}
              <h2 className="text-2xl font-bold mb-2 line-clamp-2">
                <Balancer>{post.title}</Balancer>
              </h2>

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

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      style={{
                        backgroundColor: tag.color || undefined,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
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
