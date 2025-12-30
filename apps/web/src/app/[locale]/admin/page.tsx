import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, FolderKanban, Image, Tags } from 'lucide-react'
import { cn } from '@/lib/utils'
import { adminDesignSystem as ds, adminPatterns } from '@/lib/admin-design-system'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: postsCount },
    { count: projectsCount },
    { count: mediaCount },
    { count: tagsCount },
  ] = await Promise.all([
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('media').select('*', { count: 'exact', head: true }),
    supabase.from('tags').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      title: 'Blog Posts',
      value: postsCount || 0,
      icon: FileText,
      description: 'Tổng số bài viết',
    },
    {
      title: 'Projects',
      value: projectsCount || 0,
      icon: FolderKanban,
      description: 'Tổng số dự án',
    },
    {
      title: 'Media',
      value: mediaCount || 0,
      icon: Image,
      description: 'Tổng số media',
    },
    {
      title: 'Tags',
      value: tagsCount || 0,
      icon: Tags,
      description: 'Tổng số tags',
    },
  ]

  return (
    <div className={cn('space-y-6', ds.layout.content.maxWidth, 'mx-auto')}>
      <div className="flex items-center justify-between">
        <h1 className={cn('font-bold tracking-tight', ds.typography.h1)}>
          Dashboard
        </h1>
      </div>

      {/* Stats Grid with design system tokens */}
      <div className={cn('grid', ds.spacing.grid.loose, ds.grid.dashboard.stats)}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className={cn(
                adminPatterns.statCard,
                'hover:border-primary/50'
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Activity Grid with design system tokens */}
      <div className={cn('grid', ds.spacing.grid.normal, 'md:grid-cols-2 lg:grid-cols-7')}>
        <Card className={cn('col-span-4', ds.spacing.card.padding)}>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Danh sách hoạt động sẽ được hiển thị ở đây...
            </p>
          </CardContent>
        </Card>

        <Card className={cn('col-span-3', ds.spacing.card.padding)}>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Các thao tác nhanh sẽ được hiển thị ở đây...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

