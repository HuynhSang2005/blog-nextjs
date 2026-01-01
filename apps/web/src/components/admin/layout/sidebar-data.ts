import {
  LayoutGrid,
  FileText,
  BookOpen,
  FolderKanban,
  User,
  Tags,
  Image,
  Settings,
  HelpCircle,
} from 'lucide-react'

export type NavItem = {
  title: string
  url: string
  icon: typeof LayoutGrid
  badge?: string
  items?: NavItem[]
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export function getAdminSidebarData(locale: string): { navGroups: NavGroup[] } {
  return {
    navGroups: [
      {
        title: 'Quản lý nội dung',
        items: [
          {
            title: 'Tổng quan',
            url: `/${locale}/admin`,
            icon: LayoutGrid,
          },
          {
            title: 'Bài viết',
            url: `/${locale}/admin/blog`,
            icon: FileText,
          },
          {
            title: 'Tài liệu',
            url: `/${locale}/admin/docs`,
            icon: BookOpen,
          },
          {
            title: 'Dự án',
            url: `/${locale}/admin/projects`,
            icon: FolderKanban,
          },
        ],
      },
      {
        title: 'Cấu hình',
        items: [
          {
            title: 'Giới thiệu',
            url: `/${locale}/admin/about`,
            icon: User,
          },
          {
            title: 'Thẻ',
            url: `/${locale}/admin/tags`,
            icon: Tags,
          },
          {
            title: 'Media',
            url: `/${locale}/admin/media`,
            icon: Image,
          },
        ],
      },
      {
        title: 'Khác',
        items: [
          {
            title: 'Cài đặt',
            url: `/${locale}/admin/settings`,
            icon: Settings,
          },
          {
            title: 'Trợ giúp',
            url: `/${locale}/admin/help`,
            icon: HelpCircle,
          },
        ],
      },
    ],
  }
}
