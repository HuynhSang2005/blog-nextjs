import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getTags } from '@/lib/queries/tags'
import { BlogPostForm } from '@/components/admin/blog/post-form'

export default async function NewBlogPostPage() {
  const t = await getTranslations('admin.blog')
  const tags = await getTags()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('actions.create')}
          </h1>
          <p className="text-muted-foreground">
            Tạo bài viết blog mới
          </p>
        </div>
      </div>

      {/* Form */}
      <BlogPostForm tags={tags} mode="create" />
    </div>
  )
}
