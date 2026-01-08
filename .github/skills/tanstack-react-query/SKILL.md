---
name: tanstack-react-query
description: Cách dùng @tanstack/react-query trong repo này (QueryProvider, client-only server state, invalidate sau mutation).
---

## Nguồn trong repo
- Provider: `apps/web/src/providers/query-provider.tsx`

## Quy tắc dùng đúng
- React Query là client-side server-state.
- Không dùng trong Server Components. Với Server Components, fetch trực tiếp (ví dụ qua Supabase services).

## Setup hiện tại
- `QueryProvider` tạo `QueryClient` với:
  - `staleTime: 60s`
  - `refetchOnWindowFocus: false`
- Devtools chỉ bật trong development.

## Pattern khuyến nghị
- Query keys: dùng mảng ổn định (ví dụ `['admin','docs', filters]`).
- Mutations:
  - Sau khi create/update/delete: `queryClient.invalidateQueries({ queryKey: [...] })`.
- Error UI:
  - Hiển thị tiếng Việt (toast/message) và log error có context.

## Tránh
- Không “cache chồng cache”: nếu data đã được fetch server-side và render server, tránh refetch client trừ khi cần interactivity.
- Không dùng React Query để thay thế DB RLS/permission checks.
