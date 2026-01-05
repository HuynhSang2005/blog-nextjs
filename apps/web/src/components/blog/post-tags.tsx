import { badgeVariants } from '../ui/badge'
import { Link } from '@/navigation'
import { cn } from '@/lib/utils'
import type { LegacyBlog } from '@/lib/types/legacy-blog'

export async function BlogPostTags({ post }: { post: LegacyBlog }) {
  if (!post.tags) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1 md:gap-2 items-center pt-4">
      {post.tags.map(tag => (
        <Link
          className={cn(badgeVariants({ variant: 'secondary' }), 'gap-1')}
          href={`/blog?tag=${encodeURI(tag)}`}
          key={tag}
        >
          {tag}
        </Link>
      ))}
    </div>
  )
}
