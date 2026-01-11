---
applyTo: "apps/web/src/app/**"
---

# App Router Instructions

## Next.js 16 App Router Patterns

### Important Rules
- ✅ **All UI text in Vietnamese** via `next-intl`
- ✅ **Fetch blog posts from Supabase** (not Contentlayer)
- ✅ **Fetch docs from Supabase** (MDX string, render runtime)
- ✅ **Await params and searchParams** (Next.js 16 requirement)
- ✅ **Cloudinary for media** (metadata in database)

### Route Structure
```
apps/web/src/app/[locale]/
├── (site)/
│   ├── blog/
│   │   ├── page.tsx           # /[locale]/blog
│   │   └── [slug]/page.tsx    # /[locale]/blog/post-slug
│   └── docs/
│       └── [[...slug]]/page.tsx # /[locale]/docs/... (slug optional)
└── admin/
  └── ...
```

### Page Component Pattern (Next.js 16)

**IMPORTANT**: In Next.js 16, `params` and `searchParams` must be **awaited**:

**Pattern tối ưu với Promise.all (khi cần cả params và searchParams):**
```tsx
// apps/web/src/app/[locale]/blog/page.tsx
export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; tag?: string }>
}) {
  // ✅ Tối ưu: Await cả hai cùng lúc
  const [{ locale }, { page = '1', tag }] = await Promise.all([params, searchParams])
  setRequestLocale(locale)
  
  // Fetch data với pagination và filter
  const posts = await getBlogPosts(locale, 'published', {
    page: parseInt(page),
    tag,
  })
  
  return <BlogList posts={posts} />
}
```

**Blog Posts (from Supabase Database):**
```tsx
// apps/web/src/app/[locale]/blog/[slug]/page.tsx
import { getBlogPost } from '@/services/blog-service'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { MdxRemote } from '@/components/docs/mdx-remote'

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const t = await getTranslations('blog')
  
  // Fetch từ Supabase (DB-first)
  const { data: post, error } = await getBlogPost(slug, locale)
  if (error || !post) notFound()
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{t('published')}: {post.published_at}</p> {/* "Xuất bản lúc" */}
      {post.content ? <MdxRemote source={post.content} /> : null}
    </article>
  )
}
```

**Documentation (from Supabase + runtime MDX):**
```tsx
// apps/web/src/app/[locale]/docs/[...slug]/page.tsx
import { getPublicDocBySlug } from '@/services/docs-service'
import { MdxRemote } from '@/components/docs/mdx-remote'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'

export default async function DocPage({
  params,
}: {
  params: Promise<{ locale?: string; slug?: string[] }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale ?? 'vi')
  const t = await getTranslations('docs')

  const doc = await getPublicDocBySlug({
    locale: locale ?? 'vi',
    slugParts: slug,
  })

  if (!doc) return <div>{t('notFound')}</div>

  return (
    <article>
      <h1>{doc.title}</h1>
      <MdxRemote source={doc.content} />
    </article>
  )
}
```

// ❌ Wrong - Don't destructure params directly (Next.js 16)
export default async function BlogPage({ 
  params: { locale, slug }  // This breaks in Next.js 16
}: { 
  params: { locale: string; slug: string }
}) {
  // Error: params is a Promise
}
```

### Metadata (SEO)

```tsx
import type { Metadata } from 'next'

// Static metadata
export const metadata: Metadata = {
  title: 'Blog',
  description: 'Bài viết về lập trình web',
}

// Dynamic metadata
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.ogImage }],
    },
  }
}
```

### Static Generation

```tsx
// Generate static paths at build time
export async function generateStaticParams() {
  const posts = await getPosts()
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// Use with dynamic routes: [slug]/page.tsx
export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const post = await getPost(slug)
  
  return <article>{post.title}</article>
}
```

### Cloudinary Image Usage

```tsx
import { CldImage } from 'next-cloudinary'

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params
  const post = await getBlogPost(slug, locale)
  
  return (
    <article>
      {post.cover_media && (
        <CldImage
          src={post.cover_media.cloudinary_public_id}
          width={post.cover_media.width}
          height={post.cover_media.height}
          alt={post.cover_media.alt_text || post.title}
          crop="fill"
          gravity="auto"
          className="rounded-lg"
        />
      )}
      <h1>{post.title}</h1>
    </article>
  )
}
```

### Vietnamese UI in Layouts

```tsx
// apps/web/src/app/[locale]/blog/layout.tsx
import { getTranslations } from 'next-intl/server'

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations('blog')
  
  return (
    <div>
      <header>
        <h1>{t('title')}</h1> {/* "Blog" */}
        <p>{t('description')}</p> {/* "Chia sẻ kiến thức..." */}
      </header>
      <main>{children}</main>
    </div>
  )
}

// Gợi ý: trong page chi tiết, dùng `notFound()` khi không tìm thấy nội dung.
```

### Data Fetching

**Server Component (preferred):**
```tsx
export default async function BlogPage() {
  // Direct data fetch in Server Component
  const { data: posts } = await getBlogPosts('vi', 'published', {
    page: 1,
    pageSize: 10,
  })
  
  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  )
}
```

**Legacy: Contentlayer (seed/backup only)**

Nếu bạn đang làm phần legacy MDX pipeline (không phải source of truth), bạn có thể gặp Contentlayer. Mặc định hiện tại: blog/docs/projects đều lấy từ Supabase.

### Layouts

**Root Layout** (`app/[locale]/layout.tsx`):
```tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/theme-provider'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

**Nested Layout** (`app/[locale]/blog/layout.tsx`):
```tsx
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <BlogHeader />
      <main>{children}</main>
      <BlogFooter />
    </div>
  )
}
```

### Loading States

**loading.tsx:**
```tsx
export default function Loading() {
  return (
    <div className="container py-10">
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
```

### Error Handling

**error.tsx:**
```tsx
'use client' // Error boundaries must be Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <h2 className="mb-4 text-2xl font-bold">Đã xảy ra lỗi!</h2>
      <p className="mb-4 text-muted-foreground">{error.message}</p>
      <button onClick={reset}>Thử lại</button>
    </div>
  )
}
```

**not-found.tsx:**
```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="mb-4 text-muted-foreground">Không tìm thấy trang</p>
      <Button asChild>
        <Link href="/">Về trang chủ</Link>
      </Button>
    </div>
  )
}
```

### Route Handlers (API Routes)

**app/api/route.ts:**
```tsx
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')
  
  const data = await fetchData(query)
  
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Process request
  
  return NextResponse.json({ success: true })
}
```

### RSS Feed (Route Handler)

**app/[locale]/feed/[format]/route.ts:**
```tsx
import { Feed } from 'feed'
import { getBlogPosts } from '@/services/blog-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; format: string }> }
) {
  const { locale, format } = await params
  
  const feed = new Feed({
    title: 'Blog',
    id: 'https://example.com',
    link: 'https://example.com',
  })
  
  const { data: posts } = await getBlogPosts(locale, 'published', {
    page: 1,
    pageSize: 100,
  })

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: post.slug,
      link: post.slug,
      date: new Date(post.published_at ?? post.created_at),
    })
  })
  
  if (format === 'xml') {
    return new NextResponse(feed.rss2(), {
      headers: { 'Content-Type': 'application/xml' },
    })
  }
  
  return NextResponse.json(feed.json1())
}
```

### Parallel Routes

```
app/[locale]/
├── @modal/
│   └── (..)photo/[id]/
│       └── page.tsx       # Intercept route
└── photo/[id]/
    └── page.tsx           # Normal route
```

### Middleware (i18n)

**middleware.ts (root):**
```tsx
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './src/config/i18n'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

## Common Patterns

### Pagination
```tsx
export default async function BlogPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const { page = '1' } = await searchParams
  const currentPage = parseInt(page)
  const postsPerPage = 10
  
  const posts = await getPaginatedPosts(currentPage, postsPerPage)
  
  return (
    <>
      <PostList posts={posts} />
      <Pagination currentPage={currentPage} totalPages={posts.totalPages} />
    </>
  )
}
```

### Filtering
```tsx
export default async function BlogPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tag?: string; category?: string }> 
}) {
  const { tag } = await searchParams

  // Gợi ý: filter nên chạy ở tầng Supabase query (services) thay vì filter mảng in-memory.
  const { data: posts } = await getBlogPosts('vi', 'published', {
    page: 1,
    pageSize: 10,
  }, {
    tagSlug: tag,
  })

  return <PostList posts={posts} />
}
```

### Search
```tsx
export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const { q } = await searchParams
  
  if (!q) {
    return <SearchForm />
  }
  
  const results = await searchContent(q)
  
  return <SearchResults query={q} results={results} />
}
```

## Performance

### Caching
```tsx
import { unstable_cache } from 'next/cache'

const getCachedPosts = unstable_cache(
  async () => getBlogPosts('vi', 'published', { page: 1, pageSize: 10 }),
  ['posts'],
  { revalidate: 3600 } // 1 hour
)

export default async function BlogPage() {
  const { data: posts } = await getCachedPosts()
  return <PostList posts={posts} />
}
```

### Streaming
```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={<Skeleton />}>
        <BlogPosts />
      </Suspense>
      <Footer />
    </>
  )
}
```

### React Compiler (Next.js 16)

Next.js 16 hỗ trợ **React Compiler** - tự động memoization cho React components:

```tsx
// next.config.ts
const nextConfig = {
  experimental: {
    reactCompiler: true,
    // hoặc: compilationMode: 'annotation' cho per-component opt-in
  },
}
```

**Lợi ích:**
- Tự động memoize computations
- Không cần `useMemo`/`useCallback` thủ công cho simple values
- Giảm boilerplate code

**Với TanStack Query, vẫn cần `queryOptions()`:**
```typescript
// queryOptions vẫn cần thiết cho stable query keys
const postsOptions = queryOptions({
  queryKey: ['blog', 'posts', filters] as const,
  queryFn: () => fetchBlogPosts(filters),
})
```

**Vẫn nên giữ `useMemo`/`useCallback` cho:**
- Computed values phức tạp với nhiều dependencies
- Values phụ thuộc vào external state
- Callback handlers cần stable references

## Critical Rules

1. **Always await** `params` and `searchParams` in Next.js 16
2. **Use Server Components** by default
3. **Generate static paths** with `generateStaticParams()`
4. **Export metadata** from pages for SEO
5. **Use `notFound()`** instead of throwing errors for 404s
6. **Wrap async operations** in Suspense boundaries
7. **Cache expensive operations** with `unstable_cache`
