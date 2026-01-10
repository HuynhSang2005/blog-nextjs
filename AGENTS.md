# Huỳnh Sang Blog — AGENTS

File này là “operating manual” cho AI Agent khi làm việc với repo này: **ngắn gọn, rõ ràng, repo-accurate**, ưu tiên *commands + boundaries + workflow* để tránh agent tự đoán sai.

**Cập nhật**: January 9, 2026

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
- **Server Components mặc định**: chỉ thêm `'use client'` khi cần state/effect/handlers/browser APIs.
- **DB-first**: blog/docs/projects lấy từ **Supabase**; docs là **MDX string render runtime**.
- **Media**: file trên **Cloudinary**, DB chỉ lưu metadata/reference.
- **Toolchain**: dùng **Bun** + **Biome** (không ESLint/Prettier; không npm/yarn/pnpm).

### 2.1 State Management

- **TanStack Query** (@tanstack/react-query v5): Client-side server state.
  - Provider: `apps/web/src/providers/query-provider.tsx`
  - Pattern: Query keys ổn định, invalidate sau mutations.
  - Devtools chỉ bật trong development.
- **Zustand** (v5): Client-only UI state.
  - Stores: `apps/web/src/stores/ui-store.ts`, `admin-store.ts`
  - Pattern: Dùng persist middleware với `partialize`, subscribeWithSelector.
  - Chỉ cho UI state (theme, sidebar, selection) — không cho server data.

### 2.2 Validation (Zod v4)

- **Zod** v4.3.5: Schema validation.
- Schemas tối ưu với built-in validators (`.min()`, `.max()`, `.url()`, `.email()`, `.regex()`).
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
- TanStack Query: Dùng centralized QueryClient từ `query-provider.tsx`, tránh tạo client mới. Dùng `queryKey` ổn định dạng mảng.
- Zustand: Dùng persist middleware với `partialize` để chỉ persist field cần thiết. Dùng `subscribeWithSelector` để reactive subscriptions.

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
- Features pattern: `.github/instructions/features.instructions.md`

---

## 9) Agent Skills (khuyến nghị)

- Skills là "playbook" theo chủ đề (i18n, Supabase, Playwright…) tại `.github/skills/<skill-name>/SKILL.md`.
- Chỉ đọc skill liên quan task; không bắt buộc đọc tất cả.

**Skills quan trọng cho Dev Refactor 3.1:**
- `.github/skills/tanstack-react-query/SKILL.md` — QueryClient, optimistic updates
- `.github/skills/zustand/SKILL.md` — Store setup, persist middleware
- `.github/skills/zod/SKILL.md` — Schema validation patterns

---

## 10) Knowns CLI (tuỳ chọn)

- Nếu dùng Knowns để quản lý task/docs/time tracking: xem `.github/instructions/knowns-cli.instructions.md`.
- Knowns chỉ phục vụ quản lý công việc/tri thức; thao tác repo/DB vẫn theo workflow Serena + Supabase MCP.

