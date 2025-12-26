import type { BlogConfig } from '../lib/core/types/blog'

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
      /* the id property must be the same as author_id in the blog post mdx files required for the computed field
        in contentlayer.config.ts so we can get the author details from the blogConfig by comparing the author_id
        with the id below
      */
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
