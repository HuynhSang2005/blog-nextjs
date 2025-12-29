import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getDocTopics } from '@/lib/supabase/queries/docs'
import { DocsForm } from '@/components/admin/docs/docs-form'

export default async function NewDocPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('admin.docs')
  
  // Fetch topics for dropdown
  const topicsResult = await getDocTopics()
  const topics = topicsResult.data || []

  return (
    <div className="flex flex-col gap-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${locale}/admin/docs`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại danh sách tài liệu</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('actions.create')}
          </h1>
          <p className="text-muted-foreground">
            Tạo trang tài liệu kỹ thuật mới
          </p>
        </div>
      </div>

      {/* Form component */}
      <DocsForm 
        mode="create" 
        topics={topics}
        defaultLocale={locale}
      />
    </div>
  )
}
