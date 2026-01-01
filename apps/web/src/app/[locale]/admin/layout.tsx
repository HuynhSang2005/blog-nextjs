import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { AdminSidebar } from '@/components/admin/layout/admin-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('auth')

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminHomePath = `/${locale}/admin`

  if (!user) {
    redirect(`/${locale}/login?redirectTo=${encodeURIComponent(adminHomePath)}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect(`/${locale}`)
  }

  return (
    <SidebarProvider>
      <AdminSidebar
        user={{
          name: profile.full_name || 'Quản trị',
          email: profile.email,
          avatar: undefined,
        }}
      />
      <main className="flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={adminHomePath}>
                  {t('admin_panel')}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </main>
    </SidebarProvider>
  )
}
