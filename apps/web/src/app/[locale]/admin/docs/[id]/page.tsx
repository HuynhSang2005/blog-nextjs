import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getDocById, getDocTopics } from '@/lib/supabase/queries/docs'
import { DocsForm } from '@/components/admin/docs/docs-form'

interface EditDocPageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function EditDocPage({ params }: EditDocPageProps) {
  const { id, locale } = await params
  const t = await getTranslations('admin.docs')

  // Fetch doc data and topics in parallel
  const [docResult, topicsResult] = await Promise.all([
    getDocById(id),
    getDocTopics(),
  ])

  const doc = docResult.data
  const topics = topicsResult.data || []

  if (!doc) {
    notFound()
  }

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
            {t('actions.edit')}
          </h1>
          <p className="text-muted-foreground">
            {doc.title}
          </p>
        </div>
      </div>

      {/* Form component with existing data */}
      <DocsForm 
        mode="edit"
        doc={doc}
        topics={topics}
        defaultLocale={locale}
      />
    </div>
  )
}
