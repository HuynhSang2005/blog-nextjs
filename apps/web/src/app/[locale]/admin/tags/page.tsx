import { Metadata } from 'next'
import { getTags } from '@/app/actions/tags'
import { TagsClient } from './tags-client'

export const metadata: Metadata = {
  title: 'Quản lý thẻ',
  description: 'Quản lý thẻ cho bài viết và dự án',
}

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý thẻ</h1>
        <p className="text-muted-foreground">
          Quản lý thẻ sử dụng cho bài viết và dự án
        </p>
      </div>

      <TagsClient initialTags={tags} />
    </div>
  )
}
