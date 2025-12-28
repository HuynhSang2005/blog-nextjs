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

export const adminSidebarData = {
  navGroups: [
    {
      title: 'Quản lý nội dung',
      items: [
        {
          title: 'Dashboard',
          url: '/vi/admin',
          icon: LayoutGrid,
        },
        {
          title: 'Blog Posts',
          url: '/vi/admin/blog',
          icon: FileText,
        },
        {
          title: 'Docs',
          url: '/vi/admin/docs',
          icon: BookOpen,
        },
        {
          title: 'Projects',
          url: '/vi/admin/projects',
          icon: FolderKanban,
        },
      ],
    },
    {
      title: 'Cấu hình',
      items: [
        {
          title: 'About',
          url: '/vi/admin/about',
          icon: User,
        },
        {
          title: 'Tags',
          url: '/vi/admin/tags',
          icon: Tags,
        },
        {
          title: 'Media',
          url: '/vi/admin/media',
          icon: Image,
        },
      ],
    },
    {
      title: 'Khác',
      items: [
        {
          title: 'Settings',
          url: '/vi/admin/settings',
          icon: Settings,
        },
        {
          title: 'Help',
          url: '/vi/admin/help',
          icon: HelpCircle,
        },
      ],
    },
  ] as NavGroup[],
}
