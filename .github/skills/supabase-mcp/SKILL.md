---
name: supabase-mcp
description: Workflow chuẩn khi làm việc với Supabase (DDL/migrations, query/debug, RLS policies) cho repo này.
---

# Supabase MCP Workflow

## Khi nào dùng skill này

- Khi cần thay đổi schema (DDL), tạo bảng/cột/index/RLS.
- Khi cần debug dữ liệu (SELECT/UPDATE tạm), kiểm tra logs/advisors.
- Khi cần tạo/restore development branches.

## Quy tắc bắt buộc

- **DDL/migration**: luôn dùng Supabase MCP `apply_migration`.
- **Query/debug dữ liệu**: dùng Supabase MCP `execute_sql`.
- **Branches**: dùng `create_branch` cho development isolation.
- **Security/Performance**: dùng `get_advisors` sau khi thay đổi schema.
- **Tránh**: hardcode secrets/keys trong code và trong migration.

## Repo patterns

- **App fetch data**: `apps/web/src/services/*-service.ts`.
- **Supabase client server-side**: `@/lib/supabase/server` (thường `await createClient()`).
- **Supabase client client-side**: `@/lib/supabase/client` (dùng trong Client Components).
- **Migrations folder**: `apps/web/supabase/migrations/**` (theo thứ tự timestamp).

## Migration Pattern (Bắt buộc)

```sql
-- Tạo bảng mới
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho authenticated users
CREATE POLICY "Users can insert their own posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## RLS Best Practices

- Luôn tạo policy cho mỗi table (SELECT, INSERT, UPDATE, DELETE).
- Dùng `auth.uid()` để check ownership.
- Test policies với `execute_sql` trước khi deploy.

## Branch Management

```bash
# Tạo development branch
supabase branch create feature-new-table

# Sau khi done, merge về main
supabase branch merge <branch_id>
```

## Checklist trước khi kết thúc

- [ ] Có migration rõ ràng cho mọi thay đổi DDL.
- [ ] Không phụ thuộc vào ID phát sinh ngẫu nhiên trong data migration.
- [ ] Đã chạy `get_advisors` (security/performance) sau khi thay đổi schema.
- [ ] RLS policies đã được tạo và test.
- [ ] Indexes đã được tạo cho các foreign key và query phổ biến.
