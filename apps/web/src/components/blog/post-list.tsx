import Link from 'next/link'
import { CldImage } from '@/components/ui/cld-image'
import type { BlogPostListItem } from '@/types/supabase-helpers'
import type { LocaleOptions } from '@/types/i18n'
import { SeriesBadge } from './series-badge'
import { Balancer } from '@/components/ui/balancer'
import { cn } from '@/lib/utils'
import { Clock, User } from 'lucide-react'

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
 * Blog posts list với horizontal row layout (desktop) và vertical stacked layout (mobile)
 * Thiết kế theo Figma design specifications
 * - Container: 1440px (1200px content)
 * - Card: 956 x 344px
 * - Image: 390 x 248px (aspect ratio ~1.57:1)
 * - Padding: 24px all around
 * - Gap: 32px (row layout)
 */
export function BlogPostList({ posts, locale, messages }: BlogPostListProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {posts.map((post, index) => (
        <BlogPostCard
          key={post.id}
          locale={locale}
          messages={messages}
          post={post}
          priority={index < 2}
        />
      ))}
    </div>
  )
}

interface BlogPostCardProps {
  post: BlogPostListItem
  locale: LocaleOptions
  messages: {
    by: string
    min_read: string
    read_more: string
  }
  priority?: boolean
}

function BlogPostCard({
  post,
  locale,
  messages,
  priority = false,
}: BlogPostCardProps) {
  // Lấy tag đầu tiên (nếu có)
  const primaryTag = post.tags?.[0]

  return (
    <article
      className={cn(
        'group relative',
        // Mobile: vertical stacked layout
        'flex flex-col',
        // Desktop: horizontal row layout (theo Figma)
        'lg:flex-row',
        // Padding: mobile p-4, desktop p-6
        'p-4 lg:p-6',
        // Card styling - Figma specs
        'bg-card rounded-xl lg:rounded-2xl',
        'border border-border',
        // Figma multi-layer shadow
        'shadow-blog',
        // Hover effects - smooth transition
        'transition-all duration-200',
        'hover:shadow-blog-hover hover:-translate-y-0.5',
        // Focus states for accessibility
        'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2'
      )}
    >
      {/* Clickable link wrapper - ảnh bìa hoặc placeholder */}
      <Link
        aria-label={`Đọc bài viết: ${post.title}`}
        className={cn(
          'block w-full overflow-hidden',
          // Mobile: full width, aspect-[16/10]
          'aspect-[16/10]',
          // Desktop: compact blog card preview - 300x190 (16:10 ratio)
          // Optimized for better readability and less white space
          'lg:w-[300px] lg:flex-shrink-0 lg:aspect-[16/10]',
          // Image border radius
          'rounded-lg lg:rounded-xl',
          // Smooth scale on hover (only when has image)
          post.cover_media &&
            'transition-transform duration-300 group-hover:scale-[1.02]'
        )}
        href={`/${locale}/blog/${post.slug}`}
      >
        {post.cover_media ? (
          <CldImage
            alt={post.cover_media.alt_text || post.title}
            className="object-cover w-full h-full"
            crop="fill"
            gravity="auto"
            height={190}
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 300px"
            src={post.cover_media.public_id}
            width={300}
          />
        ) : (
          // Placeholder cho posts không có ảnh - làm sáng trong dark mode
          <div
            className={cn(
              'w-full h-full',
              // Light mode: subtle gradient
              'bg-gradient-to-br from-secondary to-secondary/50',
              // Dark mode: lighter, more visible placeholder
              'dark:bg-gradient-to-br dark:from-zinc-700 dark:to-zinc-800',
              'flex items-center justify-center',
              // Text color - very subtle in light mode, visible in dark mode
              'text-muted-foreground/20 dark:text-zinc-300'
            )}
          >
            {/* Placeholder content */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 lg:w-12 lg:h-12 rounded-full',
                  'bg-background/10 dark:bg-zinc-600/20'
                )}
              />
              <span
                className={cn(
                  'text-xs lg:text-sm font-medium',
                  'opacity-30 dark:opacity-60',
                  'text-foreground dark:text-zinc-300'
                )}
              >
                {post.title.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </Link>

      {/* Nội dung bài viết - dùng flex-1 và mt-auto để đẩy metadata xuống bottom */}
      <div className="flex flex-col flex-1 min-w-0 pt-4 lg:pt-0 pl-0 lg:pl-6">
        {/* Top: Tag badge + Series badge */}
        <div className="flex items-center gap-2 mb-2">
          {primaryTag && (
            <span
              className={cn(
                // Tag styling - title case, more subtle
                'text-[10px] lg:text-xs',
                'font-medium',
                // Remove uppercase, use normal case
                // Figma colors: bg #EBFAFF, text #1F87AD
                'bg-[var(--color-tag-bg)] text-[var(--color-tag-text)]',
                'px-2 py-0.5 rounded-md'
              )}
            >
              {primaryTag.name}
            </span>
          )}
          {post.series_order && <SeriesBadge seriesOrder={post.series_order} />}
        </div>

        {/* Title - Figma: 23.8px, line-height 1.34, letter-spacing -3% */}
        <h2
          className={cn(
            'font-normal text-lg lg:text-[24px]',
            // Figma line-height 1.34, letter-spacing -3%
            'leading-[1.34] tracking-tight',
            // Title color #272727
            'text-[var(--color-title-primary)]',
            // Limit to 2 lines
            'line-clamp-2 mb-3'
          )}
        >
          <Balancer>{post.title}</Balancer>
        </h2>

        {/* Excerpt - Figma: 16px, line-height 1.5, color #5C5C5C */}
        {post.excerpt && (
          <p
            className={cn(
              'text-sm lg:text-base',
              'leading-relaxed',
              // Figma color #5C5C5C
              'text-[var(--color-text-secondary)]',
              'line-clamp-2 mb-4'
            )}
          >
            <Balancer>{post.excerpt}</Balancer>
          </p>
        )}

        {/* Meta info - Icons + Read time + Author + Read more */}
        <div className="flex items-center justify-between gap-4 mt-auto pt-2 border-t border-border/50">
          {/* Left: Read time + Author */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Read time với icon - show default if missing */}
            {(() => {
              const readTime = post.reading_time_minutes ?? 1
              return (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] dark:text-zinc-400" />
                  <span className="text-xs lg:text-sm text-[var(--color-text-tertiary)] dark:text-zinc-400">
                    {readTime} {messages.min_read}
                  </span>
                </div>
              )
            })()}

            {/* Author với avatar - show default if missing */}
            {(() => {
              const authorName = post.author?.full_name ?? 'Huỳnh Sang'
              return (
                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div
                    className={cn(
                      'w-7 h-7 lg:w-8 lg:h-8 rounded-full',
                      'bg-secondary dark:bg-zinc-700',
                      'flex items-center justify-center',
                      'text-muted-foreground dark:text-zinc-400'
                    )}
                  >
                    <User className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </div>
                  {/* Author name */}
                  <span className="text-xs lg:text-sm font-medium text-[var(--color-text-tertiary)] dark:text-zinc-400">
                    {authorName}
                  </span>
                </div>
              )
            })()}
          </div>

          {/* Right: Read more link - brighter in dark mode */}
          <Link
            aria-label={`Đọc tiếp: ${post.title}`}
            className={cn(
              'text-xs lg:text-sm font-medium',
              'text-[var(--color-tag-text)] dark:text-blue-400',
              'hover:opacity-80 dark:hover:text-blue-300',
              'transition-opacity flex items-center gap-1'
            )}
            href={`/${locale}/blog/${post.slug}`}
          >
            {messages.read_more}
            <svg
              aria-label="Đọc tiếp"
              className="w-3 h-3 lg:w-4 lg:h-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              height="24"
              role="img"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}
