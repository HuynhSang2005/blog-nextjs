```instructions
---
applyTo: "**"
---

# AI Agent Skills Usage Instructions

Hướng dẫn sử dụng AI Agent Skills hiệu quả, kết hợp đúng công cụ MCP cho từng loại tác vụ, và tối ưu workflow cho repo này.

---

## 1. Nguyên tắc chung khi sử dụng Skills

### 1.1 Chọn đúng công cụ cho đúng việc

| Loại tác vụ | Công cụ chính | Công cụ hỗ trợ |
|-------------|---------------|----------------|
| Khám phá/đọc code | **Serena MCP** | file_search, grep_search |
| Tìm symbol/function | **Serena MCP** (`find_symbol`) | list_code_usages |
| Chỉnh sửa code | **Serena MCP** (`replace_symbol_body`, `replace_lines`) | insert_edit_into_file |
| Tra cứu thư viện | **Context7 MCP** | — |
| Tra cứu web/so sánh | **Perplexity MCP** | — |
| Database DDL | **Supabase MCP** (`apply_migration`) | — |
| Database query/debug | **Supabase MCP** (`execute_sql`) | — |
| Chạy lệnh terminal | **run_in_terminal** | — |

### 1.2 Quy tắc vàng

1. **Luôn bắt đầu với Serena MCP** cho mọi tác vụ repo operations
2. **Không đoán API** — tra cứu Context7 trước khi sử dụng
3. **Không tự ý tạo integration** — kiểm tra MCP tools có sẵn
4. **Giới hạn scope** — mỗi task một mục tiêu rõ ràng
5. **Validate liên tục** — chạy lint/typecheck sau mỗi thay đổi lớn

---

## 2. Serena MCP — Repo Operations (BẮT BUỘC)

Serena MCP là công cụ chính cho mọi thao tác với codebase. Ưu tiên sử dụng thay vì read_file/semantic_search thông thường.

### 2.1 Các tools quan trọng và cách dùng

#### 2.1.1 Tìm kiếm symbol (functions, classes, interfaces)

```typescript
// ✅ ĐÚNG: Dùng find_symbol để tìm nhanh
await mcp_oraios_serena_find_symbol({
  namePath: "useBlogPosts", // Tìm chính xác hoặc pattern
  includeBody: true,        // Lấy cả body nếu cần
  filePaths: ["apps/web/src/features/blog/**/*.ts"]
})

// ❌ SAI: Đọc cả file để tìm function
read_file({ filePath: "apps/web/src/features/blog/hooks/use-blog-posts.ts" })
```

**Khi nào dùng:**
- Tìm định nghĩa function/method
- Tìm class/interface definition
- Tìm biến global/hằng

#### 2.1.2 Lấy overview file

```typescript
// ✅ Dùng get_symbols_overview trước khi đọc chi tiết
await mcp_oraios_serena_get_symbols_overview({
  relativePath: "apps/web/src/services/blog-service.ts",
  depth: 2 // Lấy top-level + methods
})
```

**Khi nào dùng:**
- File mới, chưa quen cấu trúc
- Cần map các exports của file
- Chuẩn bị chỉnh sửa có kiểm soát

#### 2.1.3 Tìm references

```typescript
// ✅ Dùng find_referencing_symbols trước khi refactor
await mcp_oraios_serena_find_referencing_symbols({
  symbolName: "getBlogPost",
  filePaths: ["apps/web/src/**/*.ts"]
})
```

**Khi nào dùng:**
- Thay đổi API của function
- Refactor class/interface
- Kiểm tra impact trước khi sửa

#### 2.1.4 Chỉnh sửa có kiểm soát

```typescript
// ✅ Dùng replace_symbol_body thay vì replace_string_in_file nếu thay toàn bộ symbol
await mcp_oraios_serena_replace_symbol_body({
  symbolName: "useBlogPosts",
  filePath: "apps/web/src/features/blog/hooks/use-blog-posts.ts",
  newBody: `...`
})

// ✅ Dùng insert_after_symbol/insert_before_symbol để thêm code
await mcp_oraios_serena_insert_after_symbol({
  symbolName: "useBlogPosts",
  filePath: "apps/web/src/features/blog/hooks/use-blog-posts.ts",
  code: `
  export function useBlogPostCount() {
    // ...
  }
  `
})
```

**Khi nào dùng:**
- Thay toàn bộ function/class
- Thêm code vào vị trí cụ thể
- Refactor có kiểm soát

### 2.2 Workflow tối ưu với Serena

#### Bước 1: Khám phá — Đừng đọc cả file

```
❌ BAD: read_file cả file 500 dòng
✅ GOOD: get_symbols_overview → find_symbol (specific) → read_file (portion)
```

#### Bước 2: Hiểu mối quan hệ

```
❌ BAD: Grep_search từ khóa rồi đoán
✅ GOOD: find_referencing_symbols → list_code_usages
```

#### Bước 3: Chỉnh sửa

```
❌ BAD: replace_string_in_file với guess
✅ GOOD: replace_symbol_body (toàn bộ) HOẶC replace_lines (cụ thể)
```

#### Bước 4: Verify

```
❌ BAD: Assume xong rồi chạy lint
✅ GOOD: Sau mỗi edit: get_errors → run_in_terminal lint
```

---

## 3. Context7 MCP — Thư viện Documentation

Dùng để tra cứu API documentation chính thức của thư viện. **BẮT BUỘC** khi không chắc về API.

### 3.1 Quy trình tra cứu

```typescript
// Bước 1: Resolve library ID
const libraryId = await mcp_io_github_ups_resolve-library-id({
  libraryName: "@tanstack/react-query"
})
// Kết quả: "/tanstack/query"

await mcp_io_github_ups_resolve-library-id({
  libraryName: "zustand"
})
// Kết quả: "/pmndrs/zustand"

await mcp_io_github_ups_resolve-library-id({
  libraryName: "zod"
})
// Kết quả: "/colinhacks/zod"

// Bước 2: Lấy docs với topic cụ thể
await mcp_io_github_ups_get-library-docs({
  context7CompatibleLibraryID: "/tanstack/query",
  topic: "useQuery",         // Hoặc "hooks", "mutation", "optimistic updates"
  mode: "code"               // code = API references, info = conceptual
})

await mcp_io_github_ups_get-library-docs({
  context7CompatibleLibraryID: "/pmndrs/zustand",
  topic: "persist middleware", // Hoặc "store", "selectors"
  mode: "code"
})
```

### 3.2 Topics phổ biến theo thư viện

| Thư viện | Topics thường hỏi |
|----------|-------------------|
| @tanstack/react-query | useQuery, useMutation, invalidation, optimistic updates, devtools |
| zustand | persist middleware, subscribeWithSelector, transient updates |
| zod | schema validation, transformers, refinements, .check() |
| next-intl | getTranslations, useTranslations, locale routing |
| @tanstack/react-table | columnDef, sorting, filtering, pagination |

### 3.3 Khi nào phải tra cứu

| Tình huống | Hành động |
|------------|-----------|
| Không nhớ API exact syntax | Context7 → topic phù hợp |
| API mới (v4, v5) khác v4 | Context7 để verify |
| Không chắc best practice | Context7 → mode "info" |
| Thư viện ít dùng | Context7 trước khi search web |

---

## 4. Perplexity MCP — Web Research

Dùng cho tra cứu web, so sánh giải pháp, và các câu hỏi không có trong repo/docs.

### 4.1 Các loại query phù hợp

```typescript
// ✅ Best: So sánh solutions
await mcp_perplexity_perplexity_search({
  query: "React Query v5 vs v4 optimistic updates differences best practices 2024"
})

// ✅ Best: Tìm patterns mới
await mcp_perplexity_perplexity_search({
  query: "Zustand v5 persist middleware partialize best practices 2024"
})

// ✅ Best: Troubleshooting
await mcp_perplexity_perplexity_search({
  query: "Next.js 16 App Router params searchParams Promise type error solutions"
})

// ✅ Best: So sánh thư viện
await mcp_perplexity_perplexity_search({
  query: "TanStack Query vs SWR vs React Query 2024 which to choose"
})
```

### 4.2 Khi NÊN dùng Perplexity

- So sánh 2+ giải pháp/thư viện
- Tìm best practices cho use case cụ thể
- Debug issues không có trong docs
- Research cho quyết định kiến trúc

### 4.3 Khi KHÔNG nên dùng

- API documentation có sẵn trong Context7 → Dùng Context7
- Có trong repo/codebase → Dùng file_search/Serena
- Câu hỏi simple về syntax → Dùng Context7

---

## 5. Supabase MCP — Database Operations

Database được host trên Supabase. **BẮT BUỘC** dùng Supabase MCP cho mọi thao tác DB.

### 5.1 Quy tắc DDL/Migration

```typescript
// ✅ ĐÚNG: Tạo migration rõ ràng
await mcp_supabase_apply_migration({
  sql: `
  -- Tạo bảng mới với RLS
  CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_media JSONB,
    technologies TEXT[],
    demo_url TEXT,
    repo_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Enable RLS
  ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

  -- Policy cho read
  CREATE POLICY "Public can view published projects"
    ON public.projects FOR SELECT
    USING (is_published = TRUE);

  -- Policy cho admin write
  CREATE POLICY "Admins can manage projects"
    ON public.projects FOR ALL
    USING (auth.role() = 'authenticated');
  `
})

// ❌ SAI: Sửa schema trực tiếp không có migration
await mcp_supabase_execute_sql({ sql: "ALTER TABLE posts ADD COLUMN new_col TEXT" })
```

### 5.2 Quy tắc Query/Debug

```typescript
// ✅ Dùng execute_sql cho query tạm thời/debug
await mcp_supabase_execute_sql({
  sql: `
  SELECT 
    p.id, p.title, p.slug, p.published_at,
    array_agg(t.name) as tags
  FROM public.posts p
  LEFT JOIN public.post_tags pt ON p.id = pt.post_id
  LEFT JOIN public.tags t ON pt.tag_id = t.id
  WHERE p.locale = 'vi' AND p.status = 'published'
  GROUP BY p.id
  ORDER BY p.published_at DESC
  LIMIT 10
  `
})

// ✅ Check security/perf sau khi thay đổi
await mcp_supabase_get_advisors({ type: "security" })
await mcp_supabase_get_advisors({ type: "performance" })
```

### 5.3 Danh sách tools Supabase MCP

| Tool | Mục đích | Khi nào dùng |
|------|----------|--------------|
| `apply_migration` | DDL/schema changes | Tạo bảng, cột, index, RLS |
| `execute_sql` | Query/debug data | SELECT tạm, UPDATE test |
| `list_migrations` | Xem lịch sử migration | Verify migration status |
| `list_tables` | Liệt kê tables | Khám phá schema |
| `get_advisors` | Security/Performance checks | Sau khi thay đổi schema |
| `get_logs` | Debug API/database | Khi có lỗi |
| `get_project_url` | Lấy project URL | Config |

---

## 6. Tổng hợp Workflow Patterns

### 6.1 Pattern: Thêm feature mới

```typescript
// Bước 1: Khám phá cấu trúc với Serena
await mcp_oraios_serena_get_symbols_overview({
  relativePath: "apps/web/src/features/blog",
  depth: 2
})

// Bước 2: Tìm patterns tương tự
await mcp_oraios_serena_find_symbol({
  namePath: "useProjects",
  filePaths: ["apps/web/src/features/projects/**/*.ts"]
})

// Bước 3: Tra cứu docs nếu cần
await mcp_io_github_ups_get-library-docs({
  context7CompatibleLibraryID: "/tanstack/query",
  topic: "useQuery",
  mode: "code"
})

// Bước 4: Tạo hook mới
await mcp_oraios_serena_insert_after_symbol({
  symbolName: "useProjects",
  filePath: "apps/web/src/features/blog/hooks/use-blog-posts.ts",
  code: `...`
})

// Bước 5: Validate
await run_in_terminal({ command: "bun run lint", explanation: "Lint sau khi thêm code" })
```

### 6.2 Pattern: Database migration

```typescript
// Bước 1: Kiểm tra schema hiện tại
await mcp_supabase_list_tables({ schemas: ["public"] })

// Bước 2: Tạo migration với đầy đủ RLS
await mcp_supabase_apply_migration({ sql: "..." })

// Bước 3: Verify với advisors
await mcp_supabase_get_advisors({ type: "security" })
await mcp_supabase_get_advisors({ type: "performance" })

// Bước 4: Test query
await mcp_supabase_execute_sql({ sql: "SELECT * FROM new_table LIMIT 1" })
```

### 6.3 Pattern: Debugging

```typescript
// Bước 1: Lấy logs
await mcp_supabase_get_logs({ service: "api" })

// Bước 2: Kiểm tra data
await mcp_supabase_execute_sql({ sql: "SELECT * FROM posts WHERE id = '...'" })

// Bước 3: Research solution nếu cần
await mcp_perplexity_perplexity_search({
  query: "Supabase RLS policy not working correctly how to debug 2024"
})
```

### 6.4 Pattern: Refactor code

```typescript
// Bước 1: Tìm tất cả references
await mcp_oraios_serena_find_referencing_symbols({
  symbolName: "getBlogPost",
  filePaths: ["apps/web/src/**/*.ts"]
})

// Bước 2: Tra cứu best practices
await mcp_io_github_ups_get-library-docs({
  context7CompatibleLibraryID: "/tanstack/query",
  topic: "optimistic updates",
  mode: "code"
})

// Bước 3: Thực hiện refactor có kiểm soát
await mcp_oraios_serena_replace_symbol_body({
  symbolName: "useUpdatePost",
  filePath: "...",
  newBody: `...`
})

// Bước 4: Validate
await run_in_terminal({ command: "bun run typecheck", explanation: "Typecheck sau refactor" })
```

---

## 7. Anti-Patterns cần tránh

### 7.1 Repo Operations

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Đọc cả file 1000 dòng | get_symbols_overview → find_symbol |
| Grep_search rồi guess | find_referencing_symbols |
| replace_string_in_file không context | replace_symbol_body |
| Không chạy lint sau edit | Luôn validate |

### 7.2 Documentation

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Đoán API từ memory | Context7 → resolve → get-docs |
| Search web cho simple API | Context7 |
| Không check version | Context7 với version cụ thể |

### 7.3 Database

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Sửa schema không migration | apply_migration |
| Hardcode IDs trong migration | Dùng UUID/gen_random_uuid |
| Không tạo RLS | Luôn tạo policies |
| Không check advisors | get_advisors sau mọi thay đổi |

### 7.4 Research

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Search web cho API docs | Context7 |
| Đoán best practices | Perplexity search |
| Không verify info | Perplexity + Context7 |

---

## 8. Quick Reference Card

### Command Cheat Sheet

```bash
# Repo Exploration
serena-find-symbol "useBlogPosts"
serena-get-symbols-overview "apps/web/src/services/blog.ts"
serena-find-referencing-symbols "getBlogPost"

# Documentation
context7-resolve "@tanstack/react-query"
context7-get-docs "/tanstack/query" --topic "useQuery" --mode "code"

# Web Research
perplexity-search "React Query optimistic updates best practices"

# Database
supabase-apply-migration "CREATE TABLE..."
supabase-execute-sql "SELECT * FROM posts"
supabase-get-advisors --type "security"

# Validation
bun run lint
bun run typecheck
```

### Decision Tree

```
Cần làm gì?
├── Đọc code → Serena
│   ├── Tìm symbol → find_symbol
│   ├── Lấy overview → get_symbols_overview
│   └── Tìm references → find_referencing_symbols
├── Chỉnh sửa code → Serena
│   ├── Thay toàn bộ → replace_symbol_body
│   └── Thêm code → insert_after_symbol
├── Tra docs thư viện → Context7
│   ├── Resolve → get-library-docs
│   └── Topic cụ thể
├── Research web → Perplexity
│   ├── So sánh solutions
│   └── Best practices
└── Database → Supabase MCP
    ├── Schema → apply_migration
    ├── Query → execute_sql
    └── Check → get_advisors
```

---

## 9. Skills Files liên quan

Đọc thêm trong `.github/skills/` để biết cách dùng cụ thể:

- `.github/skills/serena-workflow/SKILL.md` — Chi tiết Serena MCP
- `.github/skills/supabase-mcp/SKILL.md` — Database workflow
- `.github/skills/tanstack-react-query/SKILL.md` — React Query patterns
- `.github/skills/zustand/SKILL.md` — Zustand patterns
- `.github/skills/playwright-e2e/SKILL.md` — E2E testing

---

## 10. Validation Checklist

Trước khi kết thúc mỗi task:

- [ ] Đã dùng Serena MCP cho repo ops?
- [ ] Đã tra Context7 trước khi dùng API mới?
- [ ] Đã validate với lint/typecheck?
- [ ] Database changes có migration rõ ràng?
- [ ] Không hardcode secrets/keys?
- [ ] Không sửa `lib/core/**` hoặc `components/ui/**`?
```
