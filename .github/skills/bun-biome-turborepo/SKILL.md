---
name: bun-biome-turborepo
description: Workflow dev trong repo (Bun package manager, Biome lint/format, Turborepo scripts). Dùng khi chạy dev/build/test, debug lint/typecheck, hoặc chuẩn hoá commands.
---

# Bun + Biome + Turborepo workflow

## Khi nào dùng skill này
- Khi bạn nói: "chạy dev", "build", "typecheck", "biome", "format", "turbo".

## Commands chuẩn (repo)
- Dev (monorepo): `bun run dev`
- Build (monorepo): `bun run build`
- Start (monorepo): `bun run start`
- Lint: `bun run lint`
- Lint autofix: `bun run lint:fix`
- Format: `bun run format`

## Apps/web (khi cần chạy riêng)
- Dev: `cd apps/web` rồi `bun run dev`
- Lint: `bun run lint`
- Lint autofix: `bun run lint:fix`
- Format: `bun run format`
- Format check: `bun run format:check`
- Typecheck: `bun run typecheck`
- E2E: `bun run test:e2e`

## Quy tắc
- Không dùng npm/yarn/pnpm.
- Không dùng ESLint/Prettier (Biome là chuẩn).

## Biome là all-in-one
- Biome thay thế cả Prettier (formatter) và ESLint (linter).
- Biome có flag `--staged` để format/lint chỉ staged files (thay thế `pretty-quick`).
- Pre-commit hook: `.husky/pre-commit` chạy `bunx biome check --staged --no-errors-on-unmatched --write`.

## Khi gặp lỗi Biome
- Ưu tiên chạy script đã có:
	- Monorepo: `bun run lint:fix`
	- Riêng apps/web: `cd apps/web` rồi `bun run lint:fix`
- Nếu cần chạy Biome trực tiếp: `bunx biome check --write .`
- Nếu lỗi parse file config (JSON/JSONC), sửa trước rồi chạy lại.
