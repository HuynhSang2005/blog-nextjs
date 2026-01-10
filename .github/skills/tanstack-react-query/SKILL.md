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
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

- **Devtools**: chỉ bật trong development (kiểm tra `process.env.NODE_ENV`).
- **Persister**: Optional, có thể dùng `persistQueryClient` nếu cần offline support.

## Pattern khuyến nghị

### 1. Query Keys Ổn định
```typescript
// Tốt: mảng ổn định
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
