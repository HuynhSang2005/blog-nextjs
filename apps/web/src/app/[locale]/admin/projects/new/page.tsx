import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ProjectForm } from '@/components/admin/projects/project-form'
import { getTranslations } from 'next-intl/server'
import { getTags } from '@/lib/queries/tags'

interface NewProjectPageProps {
  params: Promise<{ locale: string }>
}

export default async function NewProjectPage({ params }: NewProjectPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin.projects')
  const tags = await getTags()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href={`/${locale}/admin/projects`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('actions.create')}
          </h1>
          <p className="text-muted-foreground">Tạo dự án mới cho portfolio</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin dự án</CardTitle>
          <CardDescription>
            Nhập thông tin chi tiết về dự án của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm mode="create" tags={tags} />
        </CardContent>
      </Card>
    </div>
  )
}
