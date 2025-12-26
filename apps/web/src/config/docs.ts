/**
 * This file contains the configuration for the documentation
 * to be used by files like:
 * - src/components/command-menu.tsx
 * - src/components/mobile-nav.tsx
 * - src/app/[locale]/docs/layout.tsx
 * - src/lib/core/components/docs/pager.tsx
 */

import type { DocsConfig } from '@/lib/core/types/docs'

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      href: '/docs',

      title: {
        vi: 'Tài liệu',
      },
    },
  ],

  sidebarNav: [
    {
      title: {
        vi: 'Bắt đầu',
      },

      items: [
        {
          href: '/docs',

          title: {
            vi: 'Giới thiệu',
          },

          items: [],
        },

        {
          href: '/docs/adding-new-docs',

          title: {
            vi: 'Thêm tài liệu mới',
          },

          items: [],
        },

        {
          href: '/docs/customizing',

          title: {
            vi: 'Tùy chỉnh',
          },

          items: [],
        },

        {
          title: {
            vi: 'MDX',
          },

          items: [
            {
              href: '/docs/mdx/frontmatter',

              title: {
                vi: 'Frontmatter',
              },

              items: [],
            },

            {
              href: '/docs/mdx/code',

              title: {
                vi: 'Code',
              },

              items: [],
            },

            {
              href: '/docs/mdx/components',

              title: {
                vi: 'Components',
              },

              items: [],
            },
          ],
        },

        {
          href: '/docs/changelog',

          title: {
            vi: 'Lịch sử thay đổi',
          },

          items: [],
        },
      ],
    },
  ],
} as const
