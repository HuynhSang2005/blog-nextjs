---
name: bun-biome-turborepo
description: Workflow dev trong repo (Bun package manager, Biome lint/format, Turborepo scripts). Dùng khi chạy dev/build/test, debug lint/typecheck, hoặc chuẩn hoá commands.
---

# Bun + Biome + Turborepo workflow

## Khi nào dùng skill này
- Khi bạn nói: “chạy dev”, “build”, “typecheck”, “biome”, “format”, “turbo”.

## Commands chuẩn (repo)
- Dev (monorepo): `bun dev`
- Build (monorepo): `bun run build`
- Format/lint (monorepo): `bun run format` hoặc `bun run lint` (tuỳ script)

## Apps/web (khi cần chạy riêng)
- Dev: `cd apps/web` rồi `bun dev`
- Typecheck: `bun run typecheck`
- E2E: `bun run test:e2e`

## Quy tắc
- Không dùng npm/yarn/pnpm.
- Không dùng ESLint/Prettier (Biome là chuẩn).

## Khi gặp lỗi Biome
- Chạy `bun run biome check --write .` để fix format/lint tự động.
- Nếu lỗi parse file config (JSON/JSONC), sửa trước rồi chạy lại.
