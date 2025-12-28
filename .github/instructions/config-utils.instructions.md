---
applyTo: "apps/web/src/{config,lib}/**/!(core/**)"
---

# Configuration & Utilities Instructions

## Important Rules
- ✅ **Vietnamese UI in config values** where appropriate
- ✅ **Add Supabase utilities** for database queries
- ✅ **Add Cloudinary helpers** for media handling
- ✅ **Keep technical keys in English** (property names, types)
- ✅ **Document database queries** with JSDoc comments

## Configuration Files

### Site Config (`config/site.ts`)
```typescript
export const siteConfig = {
  name: 'Huỳnh Sang Blog',
  description: 'Blog cá nhân về lập trình web', // Vietnamese
  url: 'https://blog.huynhsang.com',
  ogImage: 'https://blog.huynhsang.com/og.jpg',
  links: {
    github: 'https://github.com/HuynhSang2005',
    // ... other links
  },
  author: {
    name: 'Huỳnh Sang',
    email: 'contact@huynhsang.com',
  },
}
```

**Rules:**
- Export as `const` object (not function)
- Use consistent naming: `config`, `Config` suffix
- Add JSDoc for complex configurations
- Don't add runtime logic here (configs should be static)

### Blog Config (`config/blog.ts`)
```typescript
export const blogConfig = {
  postsPerPage: 10,
  showReadTime: true,
  showAuthor: true,
  showTags: true,
  rssEnabled: true,
}

export type BlogConfig = typeof blogConfig
```

### Docs Config (`config/docs.ts`)
```typescript
import type { NavItem } from '@/lib/core/types/nav'

export const docsConfig: {
  mainNav: NavItem[]
  sidebarNav: NavItem[]
} = {
  mainNav: [
    { title: 'Documentation', href: '/docs' },
    { title: 'Blog', href: '/blog' },
  ],
  sidebarNav: [
    {
      title: 'Getting Started',
      items: [
        { title: 'Introduction', href: '/docs' },
        { title: 'Installation', href: '/docs/installation' },
      ],
    },
  ],
}
```

## Utility Functions

### Location: `lib/utils.ts`

**Rules:**
- Pure functions only (no side effects)
- Export individual functions, not default object
- Add TypeScript types for all parameters and return values
- Add JSDoc comments for complex utilities

### Common Utilities

#### Class Name Utility
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with proper precedence.
 * Uses clsx for conditional classes and tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### Date Formatting
```typescript
import { format } from 'date-fns'

/**
 * Formats a date to a human-readable string.
 * @param date - Date object or ISO string
 * @param formatStr - date-fns format string (default: 'MMMM dd, yyyy')
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'MMMM dd, yyyy'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}
```

#### Slug Generation
```typescript
/**
 * Converts a string to a URL-friendly slug.
 * @param str - String to convert
 * @returns Kebab-case slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

#### String Truncation
```typescript
/**
 * Truncates a string to a specified length.
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to append (default: '...')
 */
export function truncate(
  str: string,
  length: number,
  suffix: string = '...'
): string {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}
```

#### Reading Time Calculation
```typescript
/**
 * Calculates reading time for text content.
 * @param text - Content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200)
 * @returns Reading time in minutes
 */
export function calculateReadTime(
  text: string,
  wordsPerMinute: number = 200
): number {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
```

#### Absolute URL Helper
```typescript
/**
 * Converts a relative path to an absolute URL.
 * @param path - Relative path (e.g., '/blog/post-slug')
 * @returns Absolute URL
 */
export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}
```

## Data Fetching Utilities

### Supabase Helpers (`lib/supabase/queries.ts`)
```typescript
import { createClient } from '@/lib/supabase/server'

/**
 * Lấy tất cả blog posts đã published theo locale.
 * Fetches all published blog posts for a locale.
 * @param locale - Locale code (e.g., 'vi')
 * @returns Blog posts with media and author info
 */
export async function getBlogPosts(locale: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      media:cover_media_id(*),
      profiles:author_id(*)
    `)
    .eq('locale', locale)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  
  if (error) throw error
  return data
}

/**
 * Lấy một blog post theo slug và locale.
 * Fetches a single blog post by slug and locale.
 * @param slug - Post slug
 * @param locale - Locale code
 * @returns Blog post with relations
 */
export async function getBlogPost(slug: string, locale: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      cover_media:media!cover_media_id(*),
      author:profiles!author_id(*)
    `)
    .eq('slug', slug)
    .eq('locale', locale)
    .eq('status', 'published')
    .single()
  
  if (error) throw error
  return data
}
```

### Contentlayer Helpers (for Docs only)
```typescript
import { allDocs, type Doc } from 'contentlayer/generated'

/**
 * Lấy tất cả docs theo locale (MDX files).
 * Gets all docs for a locale (static MDX files).
 * @param locale - Locale code (e.g., 'vi')
 * @returns Sorted docs
 */
export function getDocs(locale: string): Doc[] {
  return allDocs
    .filter(doc => doc.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title))
}
```

### Cloudinary Helpers (`lib/cloudinary.ts`)
```typescript
/**
 * Tạo Cloudinary URL từ public_id.
 * Generates Cloudinary URL from public_id.
 * @param publicId - Cloudinary public ID
 * @param transformations - URL transformations
 * @returns Full Cloudinary URL
 */
export function getCloudinaryUrl(
  publicId: string,
  transformations?: string
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`
  
  return transformations
    ? `${baseUrl}/${transformations}/${publicId}`
    : `${baseUrl}/${publicId}`
}

/**
 * Tạo thumbnail URL với kích thước cụ thể.
 * Generates thumbnail URL with specific dimensions.
 */
export function getThumbnailUrl(publicId: string, width: number, height: number): string {
  return getCloudinaryUrl(publicId, `c_fill,w_${width},h_${height},g_auto`)
}

/**
 * Gets a single blog post by slug.
 * @param slug - Post slug
 * @param locale - Locale code
 * @returns Blog post or undefined
 */
export function getBlogPost(slug: string, locale: string): BlogPost | undefined {
  return allBlogPosts.find(
    post => post.slug === slug && post.locale === locale
  )
}

/**
 * Gets all unique tags from blog posts.
 * @param locale - Locale code
 * @returns Array of unique tags
 */
export function getAllTags(locale: string): string[] {
  const tags = allBlogPosts
    .filter(post => post.locale === locale)
    .flatMap(post => post.tags || [])
  
  return Array.from(new Set(tags)).sort()
}
```

## Type Definitions

### Custom Types Location: `lib/types.ts`

```typescript
// Navigation types
export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: React.ComponentType<{ className?: string }>
  label?: string
  description?: string
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[]
}

// SEO types
export interface SeoData {
  title: string
  description: string
  ogImage?: string
  canonicalUrl?: string
  keywords?: string[]
}

// Pagination types
export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}
```

## Constants

### Location: `lib/constants.ts`

```typescript
export const SITE_NAME = 'Huỳnh Sang Blog'
export const SITE_DESCRIPTION = 'Personal blog about web development'

export const POSTS_PER_PAGE = 10
export const DOCS_PER_PAGE = 20

export const SOCIAL_LINKS = {
  github: 'https://github.com/HuynhSang2005',
  twitter: 'https://twitter.com/huynhsang',
} as const

export const LOCALES = ['vi', 'en'] as const
export const DEFAULT_LOCALE = 'vi'

export type Locale = (typeof LOCALES)[number]
```

## Error Handling

```typescript
/**
 * Type-safe error handling utility.
 * @param error - Unknown error object
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

/**
 * Logs error with context.
 * @param error - Error to log
 * @param context - Additional context
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  console.error('Error:', getErrorMessage(error))
  if (context) {
    console.error('Context:', context)
  }
}
```

## Validation

```typescript
/**
 * Validates email format.
 * @param email - Email string to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates URL format.
 * @param url - URL string to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
```

## Best Practices

1. **Pure Functions**: No side effects, same input = same output
2. **Type Safety**: Always add TypeScript types
3. **Documentation**: JSDoc for all exported functions
4. **Error Handling**: Graceful error handling with try/catch
5. **Performance**: Memoize expensive operations if needed
6. **Testing**: Write tests for complex utilities (future)
7. **Naming**: Descriptive names, verbs for functions (e.g., `formatDate`, `getBlogPosts`)

## DO NOT

- ❌ Modify files in `lib/core/**` (core utilities are immutable)
- ❌ Add side effects to utility functions
- ❌ Use `any` type (use `unknown` if type is truly unknown)
- ❌ Add runtime logic to config files
- ❌ Export default objects from utilities (prefer named exports)

## Examples

### ✅ Good Utility
```typescript
/**
 * Formats a number as a compact string.
 * @example formatCompact(1234) // "1.2K"
 */
export function formatCompact(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1_000_000) return `${(num / 1000).toFixed(1)}K`
  return `${(num / 1_000_000).toFixed(1)}M`
}
```

### ✅ Good Config
```typescript
export const commentConfig = {
  enabled: true,
  provider: 'giscus' as const,
  giscus: {
    repo: 'user/repo',
    repoId: 'R_xxx',
    category: 'Announcements',
    categoryId: 'DIC_xxx',
  },
} as const

export type CommentConfig = typeof commentConfig
```

### ❌ Bad Utility
```typescript
// Bad: No types, no docs, side effects
export function doStuff(x: any) {
  console.log(x) // Side effect
  return x.toString()
}
```
