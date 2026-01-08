---
name: supabase-mcp
description: Workflow chuẩn khi làm việc với Supabase (DDL/migrations, query/debug) cho repo này.
---

# Supabase MCP Workflow

## Khi nào dùng skill này
- Khi cần thay đổi schema (DDL), tạo bảng/cột/index/RLS.
- Khi cần debug dữ liệu (SELECT/UPDATE tạm), kiểm tra logs/advisors.

## Quy tắc
- DDL/migration: luôn dùng Supabase MCP `apply_migration`.
- Query/debug dữ liệu: dùng Supabase MCP `execute_sql`.
- Tránh hardcode secrets/keys trong code và trong migration.

## Repo patterns
- App fetch data qua `apps/web/src/services/*-service.ts`.
- Supabase client server-side: `@/lib/supabase/server` (thường `await createClient()`).

## Checklist trước khi kết thúc
- Có migration rõ ràng cho mọi thay đổi DDL.
- Không phụ thuộc vào ID phát sinh ngẫu nhiên trong data migration.
- Nếu thay đổi bảo mật/perf: cân nhắc chạy Supabase MCP `get_advisors` (security/performance).
