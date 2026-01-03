---
applyTo: "**"
---

# MCP Workflow (Bắt buộc)

## Mục tiêu
Giảm sai lệch kiến thức, tránh đọc file thừa, và đảm bảo mọi thay đổi DB có migration rõ ràng.

## Quy tắc sử dụng tool
- **Repo ops (tìm file/đọc/sửa)**: ưu tiên Serena tools (find/get_symbols/replace/insert/search). Hạn chế đọc cả file nếu không cần.
- **Supabase (DB)**:
  - DDL/migration: dùng `apply_migration`.
  - Query/debug dữ liệu: dùng `execute_sql`.
  - Kiểm tra vấn đề security/perf: dùng `get_advisors` khi phù hợp.
- **Tra cứu thư viện**: dùng Context7 (`resolve-library-id` → `query-docs`) trước khi “đoán API”.
- **Tra cứu web/so sánh**: dùng Perplexity khi cần thông tin bên ngoài repo.

## Nguyên tắc an toàn
- Không hardcode secrets/keys.
- Không commit `.env*.local`.
- Tôn trọng boundaries: không sửa `apps/web/src/lib/core/**` và `apps/web/src/components/ui/**`.
