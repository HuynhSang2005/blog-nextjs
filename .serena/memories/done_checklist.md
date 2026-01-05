# Definition of Done Checklist

- Typecheck passes: `cd apps/web; bun run typecheck`
- Lint/format passes (or auto-fixed): `bun run lint:fix` (root turbo) hoặc `cd apps/web; bun run lint:fix`
- Manual smoke test via `bun dev` cho các route vừa chạm
- Nếu cần ghi chú thay đổi trong `docs/**`: cập nhật local, nhưng không commit trừ khi có yêu cầu rõ ràng
