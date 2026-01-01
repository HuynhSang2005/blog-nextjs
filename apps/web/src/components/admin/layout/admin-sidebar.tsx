'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  getAdminSidebarData,
  type NavGroup as SidebarNavGroup,
} from './sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import Link from 'next/link'
import { useLocale } from 'next-intl'

type AdminSidebarProps = {
  user: {
    name: string
    email: string
    avatar?: string
  }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const locale = useLocale()
  const adminSidebarData = getAdminSidebarData(locale)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href={`/${locale}/admin`}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span className="text-lg font-bold">B</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Blog Admin</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {adminSidebarData.navGroups.map((props: SidebarNavGroup) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
