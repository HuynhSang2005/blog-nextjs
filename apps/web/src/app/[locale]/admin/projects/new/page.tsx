import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectForm } from '@/components/admin/projects/project-form'
import { getTranslations } from 'next-intl/server'

export default async function NewProjectPage() {
  const t = await getTranslations('admin.projects')
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('actions.create')}</h1>
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
          <ProjectForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
