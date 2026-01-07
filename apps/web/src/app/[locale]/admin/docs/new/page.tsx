import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getDocsTopics } from '@/services/docs-service'
import { DocForm } from '@/components/admin/docs/doc-form'

interface NewDocPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewDocPage({ params }: NewDocPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin.docs')
  const topics = await getDocsTopics()

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
            {t('actions.create')}
          </h1>
          <p className="text-muted-foreground">{t('messages.create_hint')}</p>
        </div>
      </div>

      <DocForm mode="create" topics={topics} />
    </div>
  )
}
