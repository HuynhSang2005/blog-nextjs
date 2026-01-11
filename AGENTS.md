# Huỳnh Sang Blog — AGENTS

File này là “operating manual” cho AI Agent khi làm việc với repo này: **ngắn gọn, rõ ràng, repo-accurate**, ưu tiên *commands + boundaries + workflow* để tránh agent tự đoán sai.

**Cập nhật**: January 11, 2026

---

## 0) Lệnh hay dùng (Bun + Turbo + Biome)

- Dev (monorepo): `bun run dev`
- Build: `bun run build`
- Start: `bun run start`
- Lint: `bun run lint`
- Lint + autofix: `bun run lint:fix`
- Format: `bun run format`

Trong `apps/web/`:

- Dev: `bun run dev`
- Lint: `bun run lint`
- Lint + autofix: `bun run lint:fix`
- Typecheck: `bun run typecheck`
- Playwright E2E: `bun run test:e2e`

---

## 1) Mục tiêu & nguyên tắc khi agent làm việc

- Ưu tiên thay đổi **nhỏ, có kiểm soát**, đúng pattern sẵn có.
- Không “phát minh” kiến trúc/UX mới nếu không được yêu cầu.
- Luôn verify bằng lint/typecheck/tests (mức tối thiểu phù hợp phạm vi).
- Không bao giờ hardcode secrets/keys/tokens; không commit `.env*.local`.

---

## 2) Non‑negotiables (chuẩn project Blog Next.js v16)

- **UI text**: phải là **Tiếng Việt** qua `next-intl` và `apps/web/src/i18n/locales/vi.json` (giữ thuật ngữ kỹ thuật bằng English: Next.js, React, API, RLS…).
- **Next.js 16 App Router**: `params`/`searchParams` là Promise → luôn `await` (không destructure trực tiếp).
  ```tsx
  // ✅ Pattern đúng (Next.js 16)
  export default async function Page({ 
    params, searchParams 
  }: { 
    params: Promise<{ slug: string }>
    searchParams: Promise<{ tag?: string }>
  }) {
    const { slug } = await params
    const { tag } = await searchParams
  }
  
  // ✅ Tối ưu với Promise.all (khi cần cả hai)
  export default async function BlogPage({ 
    params, searchParams 
  }: { 
    params: Promise<{ locale: string; slug: string }>
    searchParams: Promise<{ page?: string }>
  }) {
    const [{ locale, slug }, { page = '1' }] = await Promise.all([params, searchParams])
    // ...
  }
  
  // ❌ Pattern cũ (Next.js 15) - KHÔNG DÙNG
  export default function Page({ params }: { params: { slug: string } }) {
    const { slug } = params // Lỗi: params là Promise
  }
  ```
- **Server Components mặc định**: chỉ thêm `'use client'` khi cần state/effect/handlers/browser APIs.
- **DB-first**: blog/docs/projects lấy từ **Supabase**; docs là **MDX string render runtime**.
- **Media**: file trên **Cloudinary**, DB chỉ lưu metadata/reference.
- **Toolchain**: dùng **Bun** + **Biome** (không ESLint/Prettier; không npm/yarn/pnpm).

### 2.1 State Management

- **TanStack Query** (@tanstack/react-query v5.90.16): Client-side server state.
  - Provider: `apps/web/src/providers/query-provider.tsx`
  - **Pattern khuyến nghị**: Dùng `queryOptions()` helper cho typed query keys:
    ```typescript
    import { queryOptions } from '@tanstack/react-query'
    
    const blogPostsOptions = (filters?: BlogFilters) => queryOptions({
      queryKey: ['blog', 'posts', filters] as const,
      queryFn: () => fetchBlogPosts(filters),
      staleTime: 60 * 1000, // 1 phút
      gcTime: 5 * 60 * 1000, // 5 phút (v5 đổi từ cacheTime)
    })
    ```
  - Devtools: `@tanstack/react-query-devtools` v5.91.1 (chỉ bật trong development)
  - Pattern: Query keys ổn định dạng mảng, invalidate sau mutations.
- **Zustand** (v5.0.9): Client-only UI state.
  - Stores: `apps/web/src/stores/ui-store.ts`, `admin-store.ts`
  - Pattern: Dùng persist middleware với `partialize`, subscribeWithSelector.
  - **Runtime API**: `store.persist.getOptions()` và `store.persist.setOptions()`
  - Chỉ cho UI state (theme, sidebar, selection) — không cho server data.

### 2.2 Validation (Zod v4)

- **Zod** v4.3.5: Schema validation.
- **Pattern khuyến nghị**: Dùng `error:` parameter thay vì `message:` (Zod v4):
  ```typescript
  // Zod 4 pattern (KHUYẾN NGHỊ)
  z.string().min(5, { error: "Quá ngắn, tối thiểu 5 ký tự" })
  
  // Zod 3 pattern (vẫn hoạt động nhưng không khuyến nghị)
  z.string().min(5, { message: "Quá ngắn" })
  ```
- Schemas tối ưu với built-in validators (`.min()`, `.max()`, `.url()`, `.email()`, `.regex()`).
- **Locales**: `z.config(z.locales.en)` cho error messages theo ngôn ngữ.
- Pattern: Validation trong tầng service/handler, không trong component.

---

## 3) Bản đồ repo (nơi sửa đúng chỗ)

- App (Next.js): `apps/web/src/app/[locale]/...`
- Components: `apps/web/src/components/**` (KHÔNG sửa `apps/web/src/components/ui/**`)
- Features (hooks, components per domain): `apps/web/src/features/**`
- Stores (Zustand): `apps/web/src/stores/**`
- Services (Supabase queries): `apps/web/src/services/**`
- Providers (React context): `apps/web/src/providers/**`
- i18n messages: `apps/web/src/i18n/locales/vi.json`
- Supabase migrations: `apps/web/supabase/migrations/**`
- E2E tests (Playwright): `apps/web/tests/**`
- Repo rules (path-specific): `.github/instructions/**`
- Skills (playbook per topic): `.github/skills/**`

---

## 4) Workflow bắt buộc (MCP/tools)

### 4.1 Repo ops (bắt buộc)

- Luôn kết hợp **Serena MCP** (folder `.serena/` ở root) cho các tác vụ repo: tìm file, đọc code, tìm symbol, sửa code.
- Tránh đọc cả file nếu không cần; ưu tiên search + symbol-level reads.

### 4.2 Research / verify (bắt buộc khi cần)

- Khi có “thắc mắc / không chắc API / so sánh / verify”: dùng **Context7 MCP** (docs thư viện) + **Perplexity MCP** (web) + **search-tools** trong workspace.
- Không đoán API nếu có thể check nhanh qua codebase hoặc docs.

### 4.3 Database (bắt buộc)

- Khi làm DB: dùng **Supabase MCP** vì database host trên Supabase.
  - DDL/migration: dùng `apply_migration`.
  - Query/debug dữ liệu: dùng `execute_sql`.
  - Security/perf checks khi phù hợp: advisors/logs.

---

## 5) Boundaries (tuyệt đối không phá)

- 🚫 Không sửa: `apps/web/src/components/ui/**` (shadcn — regenerate nếu cần)
- 🚫 Không sửa: `apps/web/src/lib/core/**` (immutable)
- 🚫 Không commit secrets / keys; không commit `.env*.local`
- ⚠️ Chỉ sửa `packages/**`, `turbo.json`, `.husky/**` khi có yêu cầu rõ ràng

---

## 6) Chuẩn hoá cách implement (những lỗi agent hay dính)

- i18n: UI strings dùng `next-intl`; thêm key mới vào `apps/web/src/i18n/locales/vi.json`.
- Data layer: query/filter/pagination ưu tiên làm ở tầng `apps/web/src/services/**` (không filter mảng in-memory trong component).
- Routing: luôn đi theo cấu trúc `app/[locale]/...`.
- TypeScript: strict; tránh `any` (dùng `unknown` nếu bắt buộc).
- **TanStack Query**:
  - Dùng centralized QueryClient từ `query-provider.tsx`, tránh tạo client mới.
  - **Dùng `queryOptions()` helper** cho typed, reusable query configs:
    ```typescript
    // ✅ Tốt: queryOptions() cho typed keys
    const useBlogPosts = (filters?: BlogFilters) => useQuery(
      queryOptions({
        queryKey: ['blog', 'posts', filters] as const,
        queryFn: () => fetchBlogPosts(filters),
      })
    )
    
    // ❌ Tránh: Không có type safety
    const useBlogPosts = (filters?: BlogFilters) => useQuery({
      queryKey: ['blog', 'posts', filters],
      queryFn: () => fetchBlogPosts(filters),
    })
    ```
  - Dùng `queryKey` ổn định dạng mảng với `as const`.
- **Zustand**:
  - Dùng persist middleware với `partialize` để chỉ persist field cần thiết.
  - Dùng `subscribeWithSelector` để reactive subscriptions.
  - Runtime options: `store.persist.getOptions()` và `store.persist.setOptions()`.
- **Zod v4**: Dùng `error:` thay vì `message:` cho custom error messages.

---

## 7) Validation tối thiểu trước khi kết thúc task

- Chạy lint: `bun run lint` (hoặc `bun run lint:fix` nếu cần)
- Nếu đổi types/logic: `bun run typecheck` trong `apps/web/`
- Nếu đụng UI/flows quan trọng: `bun run test:e2e` trong `apps/web/`

---

## 8) Tài liệu “chuẩn repo” (đọc khi liên quan)

- App Router patterns: `.github/instructions/app-router.instructions.md`
- Components rules: `.github/instructions/components.instructions.md`
- Config/services/utils rules: `.github/instructions/config-utils.instructions.md`
- MCP workflow: `.github/instructions/mcp-workflow.instructions.md`


---

## 9) Agent Skills (khuyến nghị)

- Skills là "playbook" theo chủ đề (i18n, Supabase, Playwright…) tại `.github/skills/<skill-name>/SKILL.md`.
- Chỉ đọc skill liên quan task; không bắt buộc đọc tất cả.

**Skills theo category:**

**Core:**
- `.github/skills/nextjs-app-router/SKILL.md` — Next.js 16 patterns, await params/searchParams
- `.github/skills/serena-workflow/SKILL.md` — Serena MCP workflow
- `.github/skills/minimax-nextjs-agent/SKILL.md` — MiniMax agent patterns

**State Management:**
- `.github/skills/tanstack-react-query/SKILL.md` — QueryClient, queryOptions, optimistic updates
- `.github/skills/zustand/SKILL.md` — Store setup, persist middleware, subscribeWithSelector
- `.github/skills/zod/SKILL.md` — Schema validation, error: parameter, locales

**Backend/Services:**
- `.github/skills/supabase-mcp/SKILL.md` — Supabase MCP workflow, DDL/migrations
- `.github/skills/supabase-db-model/SKILL.md` — Database schema, RLS policies

**Frontend:**
- `.github/skills/next-intl/SKILL.md` — i18n setup, translations
- `.github/skills/i18n-next-intl-vi/SKILL.md` — Vietnamese UI patterns
- `.github/skills/tailwind/SKILL.md` — Tailwind CSS patterns
- `.github/skills/react-hook-form/SKILL.md` — Form handling, validation
- `.github/skills/frontend-design/SKILL.md` — frontend design


**Media & Content:**
- `.github/skills/cloudinary-media/SKILL.md` — Cloudinary integration
- `.github/skills/mdx-runtime/SKILL.md` — MDX rendering, mdx-bundler

**Testing & Toolchain:**
- `.github/skills/playwright-e2e/SKILL.md` — E2E testing patterns
- `.github/skills/bun-biome-turborepo/SKILL.md` — Build toolchain

**Context:**
- `.github/skills/project-context-huynhsang-blog/SKILL.md` — Project overview

---

## 10) Knowns CLI (tuỳ chọn)

- Nếu dùng Knowns để quản lý task/docs/time tracking: xem `.github/instructions/knowns-cli.instructions.md`.
- Knowns chỉ phục vụ quản lý công việc/tri thức; thao tác repo/DB vẫn theo workflow Serena + Supabase MCP.

