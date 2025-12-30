import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar'
import { AdminHeader } from '@/components/admin/layout/admin-header'

/**
 * Admin Dashboard Layout - Isolated from main site
 * No main site header/footer
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/vi/login')
  }

  // Check if user is admin and fetch avatar
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      `
      role,
      full_name,
      email,
      avatar_media:media!avatar_media_id (
        public_id,
        alt_text
      )
    `
    )
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/vi')
  }

  return (
    <div className="relative flex min-h-screen">
      <SidebarProvider>
        <AdminSidebar
          user={{
            name: profile.full_name || 'Admin',
            email: profile.email,
            avatar: profile.avatar_media && typeof profile.avatar_media === 'object' && 'public_id' in profile.avatar_media 
              ? String(profile.avatar_media.public_id)
              : undefined,
          }}
        />
        <div className="flex w-full flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
