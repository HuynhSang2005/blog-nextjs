---
name: tanstack-react-query
description: Cách dùng @tanstack/react-query v5 trong repo này (QueryProvider, optimistic updates, invalidate sau mutation).
---

## Nguồn trong repo

- **Provider**: `apps/web/src/providers/query-provider.tsx`
- **QueryClient**: Centralized từ `apps/web/src/lib/query-client.ts`
- **Features hooks**: `apps/web/src/features/**/use-*.ts`

## Quy tắc dùng đúng

- React Query là **client-side server-state** (không phải global cache).
- Không dùng trong Server Components. Với Server Components, fetch trực tiếp (ví dụ qua Supabase services).
- Ưu tiên centralized QueryClient từ `query-provider.tsx`, tránh tạo client mới.

## Setup hiện tại (Dev Refactor 3.1)

```typescript
// apps/web/src/lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (v5 renamed from cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

### Devtools Setup (Chi tiết)

**Provider configuration:**
```tsx
// apps/web/src/providers/query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 phút
        gcTime: 5 * 60 * 1000, // 5 phút
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools chỉ hiển thị trong development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
```

- **Devtools**: chỉ bật trong development (kiểm tra `process.env.NODE_ENV`).
- **Persister**: Optional, có thể dùng `persistQueryClient` nếu cần offline support.

## Pattern khuyến nghị

### 1. queryOptions() Helper (TanStack Query v5)

**Tạo typed, reusable query configurations:**

```typescript
import { queryOptions } from '@tanstack/react-query'

// Basic usage
const blogPostsOptions = queryOptions({
  queryKey: ['blog', 'posts'] as const,
  queryFn: fetchBlogPosts,
})

// Với filters
const blogPostsByTagOptions = (tag: string) => queryOptions({
  queryKey: ['blog', 'posts', { tag }] as const,
  queryFn: () => fetchBlogPostsByTag(tag),
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
})

// Trong component
import { useQuery } from '@tanstack/react-query'
import { blogPostsByTagOptions } from './hooks/use-blog-posts'

function BlogList({ tag }: { tag: string }) {
  const { data, isLoading, error } = useQuery(blogPostsByTagOptions(tag))
  // ...
}
```

**Benefits:**
- Type-safe query keys với `as const`
- Reusable across components
- Easy to invalidate: `queryClient.invalidateQueries({ queryKey: ['blog', 'posts'] })`

### 2. Query Keys Ổn định (CẬP NHẬT)
```typescript
// ✅ Tốt: mảng ổn định với as const
const useBlogPosts = (filters?: BlogFilters) => {
  return useQuery(
    queryOptions({
      queryKey: ['blog', 'posts', filters] as const,
      queryFn: () => fetchBlogPosts(filters),
    })
  )
}

// ❌ Tránh: Không có type safety
const useBlogPosts = (filters?: BlogFilters) => {
  return useQuery({
    queryKey: ['blog', 'posts', filters],
    queryFn: () => fetchBlogPosts(filters),
  })
}
```

### 2. Invalidate Sau Mutation
```typescript
const useCreatePost = () => {
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog', 'posts'] })
    },
  })
}
```

### 3. Optimistic Updates (Khi cần)
```typescript
const useUpdatePost = () => {
  return useMutation({
    mutationFn: updatePost,
    onMutate: async (newPost) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['blog', 'posts', newPost.id] })

      // Snapshot previous value
      const previousPost = queryClient.getQueryData(['blog', 'posts', newPost.id])

      // Optimistically update
      queryClient.setQueryData(['blog', 'posts', newPost.id], newPost)

      return { previousPost }
    },
    onError: (err, newPost, context) => {
      // Rollback
      if (context?.previousPost) {
        queryClient.setQueryData(['blog', 'posts', newPost.id], context.previousPost)
      }
    },
    onSettled: (data, error, newPost) => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['blog', 'posts', newPost.id] })
    },
  })
}
```

### 4. Error UI (Tiếng Việt)
```typescript
const useBlogPosts = (filters?: BlogFilters) => {
  return useQuery({
    queryKey: ['blog', 'posts', filters],
    queryFn: () => fetchBlogPosts(filters),
    meta: {
      errorMessage: 'Không thể tải danh sách bài viết',
    },
  })
}
```

## Tránh

- "Cache chồng cache": nếu data đã được fetch server-side và render server, tránh refetch client trừ khi cần interactivity.
- Dùng React Query để thay thế DB RLS/permission checks.
- Tạo `new QueryClient()` mới trong mỗi component/hook.
- Dùng `queryKey` dạng string thay vì mảng.

## Debug

- **React Query Devtools**: Mở rộng để xem query status, cache, và timing.
- **Query Keys**: Dùng `queryClient.getQueryData()` để kiểm tra cache.
