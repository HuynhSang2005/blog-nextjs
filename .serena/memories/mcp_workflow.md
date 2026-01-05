# MCP workflow (blog-nextjs)

## Mục tiêu
- Giảm đọc file thừa, tránh đoán API, và đảm bảo mọi thay đổi quan trọng có commit rõ ràng.

## Chọn tool đúng việc
- Repo ops (tìm/đọc/sửa code): ưu tiên Serena MCP (search/find symbols/references/insert/replace).
- Database (Supabase):
  - DDL/migrations: dùng Supabase MCP `apply_migration`.
  - Query/debug dữ liệu: dùng Supabase MCP `execute_sql`.
- Tra docs thư viện: dùng Context7 (`resolve-library-id` → `query-docs`) trước khi “đoán API”.
- Tra cứu web/so sánh/cập nhật: dùng Perplexity.

## Quy tắc project
- UI text: Tiếng Việt qua next-intl; thuật ngữ kỹ thuật giữ tiếng Anh.
- Next.js 16: luôn await `params`/`searchParams`.
- Source of truth: Supabase (blog/docs/projects); MDX render runtime.
- Không sửa: `apps/web/src/lib/core/**`, `apps/web/src/components/ui/**`.
- Không commit: `docs/**`.
