import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getBlogPostById } from '@/lib/queries/blog'
import { getTags } from '@/lib/queries/tags'
import { BlogPostForm } from '@/components/admin/blog/post-form'

interface EditBlogPostPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { locale, id } = await params
  const t = await getTranslations('admin.blog')

  const [post, tags] = await Promise.all([
    getBlogPostById(id),
    getTags(),
  ])

  if (!post) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/admin/blog`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('actions.edit')}
          </h1>
          <p className="text-muted-foreground">
            {post.title}
          </p>
        </div>
      </div>

      {/* Form */}
      <BlogPostForm post={post} tags={tags} mode="edit" />
    </div>
  )
}
