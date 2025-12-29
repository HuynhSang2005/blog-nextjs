import { getTranslations } from 'next-intl/server'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getAboutData } from '@/app/actions/about'

interface AboutAdminPageProps {
  params: Promise<{ locale: string }>
}

export default async function AboutAdminPage({ params }: AboutAdminPageProps) {
  const { locale } = await params
  const t = await getTranslations('about')
  const data = await getAboutData(locale)

  const sectionCount = data.sections.length
  const timelineCount = data.timeline.length
  const skillCount = data.skills.length

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý trang Giới thiệu</h1>
        <p className="text-muted-foreground">
          Kiểm tra nhanh dữ liệu Giới thiệu (sections, timeline, skills) theo ngôn ngữ hiện tại.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium">Số section</CardTitle>
            <CardDescription>{t('title')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sectionCount}</p>
            <p className="text-sm text-muted-foreground">Bio, liên hệ, giới thiệu ngắn...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <CardDescription>{t('timeline.title')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{timelineCount}</p>
            <p className="text-sm text-muted-foreground">Số mốc hành trình đã lưu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium">Kỹ năng</CardTitle>
            <CardDescription>{t('skills.title')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{skillCount}</p>
            <p className="text-sm text-muted-foreground">Tổng kỹ năng trong database</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sections</CardTitle>
          <CardDescription>Thứ tự hiển thị và trạng thái visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.sections.length === 0 ? (
            <p className="text-muted-foreground">Chưa có section nào. Thêm dữ liệu trong database.</p>
          ) : (
            <div className="space-y-3">
              {data.sections.map((section) => (
                <div key={section.id} className="flex flex-col gap-1 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{section.title || section.section_key}</span>
                      <Badge variant={section.visible ? 'default' : 'outline'}>
                        {section.visible ? 'Hiển thị' : 'Ẩn'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">Thứ tự: {section.order_index ?? '-'} • Locale: {section.locale}</span>
                  </div>
                  {section.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{section.subtitle}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn</CardTitle>
          <CardDescription>Thiết kế chi tiết nằm trong tài liệu UI/UX</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            - Kiểm tra file <span className="font-medium">docs/dev-v1/ui-ux-design/about-page-layout.md</span> để đối chiếu giao diện.
          </p>
          <p>
            - Dữ liệu hiện lấy trực tiếp từ Supabase (bảng about_sections, timeline_events, skills, profiles). Hãy cập nhật bằng thủ công hoặc bổ sung form admin nếu cần.
          </p>
          <Separator />
          <p>
            Nếu cần chỉnh sửa nhanh, cập nhật trực tiếp trên Supabase rồi bấm refresh trang này để xem kết quả.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
