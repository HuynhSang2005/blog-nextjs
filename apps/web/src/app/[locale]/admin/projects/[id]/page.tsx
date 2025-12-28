import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectForm } from '@/components/admin/projects/project-form'
import { getProjectById } from '@/lib/queries/projects'
import { getTranslations } from 'next-intl/server'

interface EditProjectPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params
  const t = await getTranslations('admin.projects')
  
  const project = await getProjectById(id)
  
  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('actions.edit')}</h1>
          <p className="text-muted-foreground">Chỉnh sửa thông tin dự án</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin dự án</CardTitle>
          <CardDescription>
            Cập nhật thông tin chi tiết về dự án
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm project={project} mode="edit" />
        </CardContent>
      </Card>
    </div>
  )
}
