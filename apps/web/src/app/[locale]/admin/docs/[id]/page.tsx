import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getDocById, getDocsTopics } from '@/services/docs-service'
import { DocForm } from '@/components/admin/docs/doc-form'

interface EditDocPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditDocPage({ params }: EditDocPageProps) {
  const { locale, id } = await params
  const t = await getTranslations('admin.docs')

  const [doc, topics] = await Promise.all([getDocById(id), getDocsTopics()])

  if (!doc) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href={`/${locale}/admin/docs`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('actions.edit')}
          </h1>
          <p className="text-muted-foreground">{doc.title}</p>
        </div>
      </div>

      <DocForm doc={doc} mode="edit" topics={topics} />
    </div>
  )
}
