import { ChevronRightIcon } from 'lucide-react'

import { Link } from '@/navigation'
import type { LegacyBlog } from '@/lib/types/legacy-blog'

interface BlogPostBreadcrumbProps {
  post: LegacyBlog

  messages: {
    posts: string
  }
}

export function BlogPostBreadcrumb({
  post,
  messages,
}: BlogPostBreadcrumbProps) {
  return (
    <div className="text-muted-foreground mb-4 flex items-center space-x-1 text-sm">
      <Link className="text-foreground hover:underline" href="/blog">
        {messages.posts}
      </Link>

      <ChevronRightIcon className="size-4" />

      <span className="truncate">{post.title}</span>
    </div>
  )
}
