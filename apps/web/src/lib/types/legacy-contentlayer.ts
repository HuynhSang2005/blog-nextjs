export interface LegacyBlogAuthorSocial {
  github?: string
  twitter?: string
  linkedin?: string
  youtube?: string
}

export interface LegacyBlogAuthor {
  name?: string
  image?: string
  bio?: string
  site?: string
  email?: string
  social?: LegacyBlogAuthorSocial
}

/**
 * Legacy shape used by pre-Supabase (Contentlayer) blog components.
 * Kept only to avoid breaking typechecking while we remove Contentlayer from the build.
 */
export interface LegacyBlog {
  _id: string
  slug: string
  slugAsParams: string
  title: string
  excerpt: string
  tags: string[]
  date: string
  readTimeInMinutes: number
  author?: LegacyBlogAuthor
}
