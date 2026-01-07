import type { BlogConfig } from '@/types/blog'

export const blogConfig: BlogConfig = {
  mainNav: [
    {
      href: '/blog',

      title: {
        vi: 'Blog',
      },
    },
  ],

  authors: [
    {
      /* the id property should match `author_id` in blog data so we can map author details from blogConfig */
      id: 'huynhsang',
      name: 'Huỳnh Sang',
      image: '/authors/huynhsang.jpg',
      site: 'https://github.com/HuynhSang2005',
      email: 'huynhsang2005@example.com',

      bio: {
        vi: 'Lập trình viên | Người yêu công nghệ | Blogger',
      },

      social: {
        github: 'HuynhSang2005',
        twitter: '@huynhsang',
        youtube: 'huynhsang',
        linkedin: 'huynhsang',
      },
    },
  ],

  rss: [
    {
      type: 'xml',
      file: 'blog.xml',
      contentType: 'application/xml',
    },

    {
      type: 'json',
      file: 'blog.json',
      contentType: 'application/json',
    },
  ],
} as const
