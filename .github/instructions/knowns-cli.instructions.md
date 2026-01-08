---
applyTo: "**"
---

# Knowns CLI (tuỳ chọn) — Hướng dẫn cho AI Agent (repo này)

## Knowns giải quyết gì?
- Knowns là lớp **task + docs + time tracking** “CLI-first” để AI/humans không phải lặp lại context qua nhiều session.
- Dùng ref (`@doc/...`, `@task-...`) để liên kết tri thức với task; AI có thể đọc context qua output `--plain` hoặc MCP.

## Vai trò trong repo này (quan trọng)
- Knowns là **tuỳ chọn**.
- Repo ops: **luôn ưu tiên Serena MCP** (tìm/đọc/sửa code).
- DB: **luôn dùng Supabase MCP** (DDL migration/query).
- Research/verify lib & web: dùng **Context7 MCP** + **Perplexity** + search tools.

## Dữ liệu Knowns nằm ở đâu?
- Mặc định: `.knowns/` trong root.
- Docs: `.knowns/docs/**` (Markdown, có thể có frontmatter). Lưu ý: thư mục này có thể **chưa tồn tại** cho tới khi bạn tạo doc đầu tiên.
- Tasks: `.knowns/tasks/**` (tuỳ theo version/tooling).

## Quy tắc `--plain` (bắt buộc cho AI)
- Chỉ dùng `--plain` cho lệnh **read-only**: `task view`, `task list`, `doc view`, `doc list`, `search`, `config get`.
- Không dùng `--plain` cho lệnh **write**: `task create`, `task edit`, `doc create`, `doc edit`, `time ...`.

## Ref system (đầu vào vs đầu ra)
- Khi **viết ref** (trong mô tả task/plan/notes):
  - Doc: `@doc/<path>` hoặc `@docs/<path>` (cả 2 đều hợp lệ theo docs Knowns).
  - Task: `@task-<id>`.
- Khi **đọc output** từ `knowns ... --plain`, bạn có thể thấy dạng file thật:
  - `@.knowns/docs/<path>.md` → tương ứng `knowns doc "<path>" --plain`
  - `@.knowns/tasks/task-<id> - ...` → tương ứng `knowns task <id> --plain`

## Workflow khuyến nghị (AI-friendly)
### 1) Khởi động phiên (nếu dùng Knowns)
```bash
knowns doc list --plain
knowns task list --plain
```

### 2) Trước khi bắt đầu code một việc lớn
```bash
knowns task <id> --plain
knowns search "<keyword>" --type doc --plain
knowns search "<keyword>" --type task --status done --plain
```

### 3) Nhận task + theo dõi thời gian
```bash
knowns task edit <id> -s in-progress -a $(knowns config get defaultAssignee --plain || echo "@me")
knowns time start <id>
```

### 4) Viết plan (PowerShell-friendly)
```powershell
knowns task edit <id> --plan "1. Đọc doc liên quan (@doc/...)`n2. Implement`n3. Test`n4. Ghi notes"
```

### 5) Trong lúc làm
```bash
knowns task edit <id> --append-notes "✓ Tiến độ: ..."
knowns task edit <id> --check-ac 1
```

### 6) Kết thúc
```bash
knowns time stop
knowns task edit <id> -s done
```

## Web UI (tuỳ chọn)
- `knowns browser` để mở UI (kanban/docs) khi cần xem tổng quan.

## Cảnh báo: `knowns agents sync`
- Knowns có lệnh `knowns agents sync` có thể **tự động ghi/đồng bộ** các file như `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` hoặc guideline templates.
- Trong repo này, chỉ chạy khi bạn **thực sự muốn** Knowns rewrite instruction files; sau đó nên review diff và giữ các rule repo-specific (Serena/Supabase/Next.js 16/i18n).

## Có nên đưa `docs/` vào `.knowns/docs`?
- Không cần copy toàn bộ.
- Chỉ nên tạo vài doc **ngắn, ổn định** trong Knowns (ví dụ: conventions, architecture tóm tắt, workflow Supabase/Serena/i18n) để AI đọc nhanh.
