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
├── layout.tsx              # Root layout
├── page.tsx                # Homepage
├── template.tsx            # Re-render on navigation
├── loading.tsx             # Loading UI
├── error.tsx               # Error boundary
├── not-found.tsx           # 404 page
├── blog/
│   ├── page.tsx           # /blog
│   ├── [slug]/
│   │   └── page.tsx       # /blog/post-slug
│   └── tags/[tag]/
│       └── page.tsx       # /blog/tags/nextjs
└── docs/
    └── [...slug]/
        └── page.tsx       # /docs/getting-started
```

### Page Component Pattern (Next.js 16)

**IMPORTANT**: In Next.js 16, `params` and `searchParams` must be **awaited**:

**Blog Posts (from Supabase Database):**
```tsx
// apps/web/src/app/[locale]/blog/[slug]/page.tsx
import { getBlogPost } from '@/lib/supabase/queries'
import { getTranslations } from 'next-intl/server'

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations('blog')
  
  // Fetch from Supabase database
  const post = await getBlogPost(slug, locale)
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{t('published')}: {post.published_at}</p> {/* "Xuất bản lúc" */}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}
```

**Documentation (from Supabase + runtime MDX):**
```tsx
// apps/web/src/app/[locale]/docs/[...slug]/page.tsx
import { getPublicDocBySlug } from '@/lib/queries/docs'
import { MdxRemote } from '@/components/mdx/MdxRemote'
import { getTranslations } from 'next-intl/server'

export default async function DocPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations('docs')

  const doc = await getPublicDocBySlug({ locale, slug: slug.join('/') })

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
  description: 'My blog posts',
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
  
  if (!post) {
    notFound() // Renders not-found.tsx
  }
  
  return <article>...</article>
}
```

### Data Fetching

**Server Component (preferred):**
```tsx
export default async function BlogPage() {
  // Direct data fetch in Server Component
  const posts = await getPosts()
  
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
import { getBlogPosts } from '@/lib/queries/blog'

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
  
  const posts = await getBlogPosts({ locale })

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
  const { tag, category } = await searchParams
  
  let posts = allBlogPosts
  
  if (tag) {
    posts = posts.filter(p => p.tags.includes(tag))
  }
  
  if (category) {
    posts = posts.filter(p => p.category === category)
  }
  
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
  async () => getPosts(),
  ['posts'],
  { revalidate: 3600 } // 1 hour
)

export default async function BlogPage() {
  const posts = await getCachedPosts()
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

## Critical Rules

1. **Always await** `params` and `searchParams` in Next.js 16
2. **Use Server Components** by default
3. **Generate static paths** with `generateStaticParams()`
4. **Export metadata** from pages for SEO
5. **Use `notFound()`** instead of throwing errors for 404s
6. **Wrap async operations** in Suspense boundaries
7. **Cache expensive operations** with `unstable_cache`
