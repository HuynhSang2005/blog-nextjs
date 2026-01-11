---
name: nextjs-app-router
description: Next.js 16 App Router patterns for this repo (await params/searchParams, next-intl locale handling, Supabase DB-first via services).
---

# Next.js 16 App Router (Huynh Sang Blog)

## Khi nao dung skill nay
- Khi tao/sua route trong `apps/web/src/app/**`.
- Khi can `generateMetadata`, caching (`revalidate`), hoac route handlers.

## Checklist bat buoc (Next.js 16)
- Luon `await props.params` va `await props.searchParams`.
- Luon goi `setRequestLocale(locale)` cho page theo locale.
- UI text dung `next-intl` (`getTranslations`/`useTranslations`).
- Data: DB-first qua `apps/web/src/services/*-service.ts` (khong dung Contentlayer cho blog/docs/projects).

## Pattern khuyen nghi (CAP NHAT)

### 1. Await params/searchParams rieng le
```tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  // ...
}
```

### 2. Promise.all (TOI UU - khi can ca hai)
```tsx
export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string; tag?: string }>
}) {
  // ✅ Toi uu: Await cung luc
  const [{ locale }, { page = '1', tag }] = await Promise.all([
    params,
    searchParams,
  ])
  
  setRequestLocale(locale)
  const posts = await getBlogPosts(locale, 'published', {
    page: parseInt(page),
    tag,
  })
  
  return <BlogList posts={posts} />
}
```

### 3. Streaming voi Suspense
```tsx
import { Suspense } from 'react'

export default function BlogPage({ searchParams }: Props) {
  return (
    <div className="container">
      <Header />
      <Suspense fallback={<BlogPostsSkeleton />}>
        <BlogPosts searchParams={searchParams} />
      </Suspense>
      <Footer />
    </div>
  )
}

function BlogPostsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-1/4 animate-pulse bg-gray-200" />
      <div className="h-4 w-1/2 animate-pulse bg-gray-200" />
      <div className="h-32 w-full animate-pulse bg-gray-200" />
    </div>
  )
}
```

## React Compiler (Next.js 16)

Tu dong memoization, khong can `useMemo`/`useCallback` thu cong:

```tsx
// next.config.ts
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
}
```

## Go y repo-specific
- Blog: dung `getBlogPosts`, `getBlogPost` tu `@/services/blog-service`.
- Docs: dung `getPublicDocBySlug` tu `@/services/docs-service` + render runtime bang `@/components/docs/mdx-remote`.

## Khong duoc lam
- Khong destructure `params` truc tiep trong signature (vi `params` la Promise o Next.js 16).
- Khong hardcode English string cho UI.
- Khong sua `apps/web/src/lib/core/**` va `apps/web/src/components/ui/**`.
