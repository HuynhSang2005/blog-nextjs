---
name: supabase-db-model
description: Chuẩn hoá cách đọc/viết DB model Supabase (migrations + TS types + services) trong repo này.
---

## Mục tiêu
- Giữ source of truth ở Supabase (DB-first) và truy cập dữ liệu qua `apps/web/src/services/*-service.ts`.
- Dùng type-safe schema từ `apps/web/src/types/database.ts` khi thao tác với Row/Insert/Update.

## Nguồn sự thật trong repo
- Schema/migrations: `apps/web/supabase/migrations/*.sql`
- Types (generated/committed): `apps/web/src/types/database.ts`
- Query patterns:
  - Blog: `apps/web/src/services/blog-service.ts`
  - Docs: `apps/web/src/services/docs-service.ts`

## Type pattern (khuyến nghị)
- Row type:
  - `Database['public']['Tables']['blog_posts']['Row']`
- Insert type:
  - `Database['public']['Tables']['blog_posts']['Insert']`
- Update type:
  - `Database['public']['Tables']['blog_posts']['Update']`

Ví dụ đang dùng trong repo:
- Blog joins: `blog_posts` + `profiles` (author) + `media` (cover/og) + `tags` (qua `blog_post_tags`).

## Query patterns quan trọng
### 1) Joins + flatten junction table
- Repo dùng join kiểu:
  - `tags:blog_post_tags(tag:tags(*))`
- Sau đó flatten bằng helper (xem `flattenTags` trong `apps/web/src/services/blog-service.ts`).

### 2) Full-text search (FTS)
- Blog list dùng `textSearch('search_vector', term, { type: 'websearch', config: 'simple' })`.
- Khi thêm field mới vào tìm kiếm, cần cập nhật:
  - Migration tạo/đổi `search_vector` (index GIN nếu có)
  - Service query (tên column phải khớp)

### 3) Date range filter cho admin
- Pattern trong repo: dùng `.or(...)` để match cả `created_at` và `published_at/updated_at`.
- Xem `applyOrDateFilter` trong `blog-service.ts` và `docs-service.ts`.

### 4) Docs slug normalization
- Public docs dùng `slugParts.join('/')` và map `'' -> 'index'` (xem `getPublicDocBySlug` trong `docs-service.ts`).
- Khi thiết kế URL docs, ưu tiên giữ quy ước `index` này để tránh 2 nguồn truth.

## Workflow khi đổi DB
1) Tạo migration mới dưới `apps/web/supabase/migrations/` (DDL/RLS/indexes).
2) Apply migration bằng Supabase MCP:
   - DDL: dùng `apply_migration`
   - Debug dữ liệu: dùng `execute_sql`
3) Regenerate TypeScript types:
   - Ưu tiên dùng Supabase tooling (CLI hoặc MCP `generate_typescript_types`) để cập nhật `apps/web/src/types/database.ts`.
4) Cập nhật services (`apps/web/src/services/*-service.ts`) và types helper nếu cần.

## Lưu ý
- Không hardcode secrets/keys.
- RLS: thay đổi policy phải có migration rõ ràng.
- App Router Next.js 16: pages phải `await params/searchParams` (liên quan khi query theo locale/slug).
