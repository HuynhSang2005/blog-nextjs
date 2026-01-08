---
name: zod
description: Quy ước dùng Zod trong repo (schemas folder, Vietnamese messages, integration với react-hook-form và server actions).
---

## Nguồn trong repo
- Schemas: `apps/web/src/schemas/*.ts`
  - Ví dụ: `apps/web/src/schemas/blog.ts`
- Resolver: `@hookform/resolvers/zod` (đã dùng trong admin forms).

## Quy ước
- Định nghĩa schema ở `apps/web/src/schemas/<domain>.ts`.
- Xuất type bằng `z.infer<typeof schema>` để không bị drift.
- Message validation phải tiếng Việt (giữ thuật ngữ kỹ thuật English khi cần).

## Pattern hay dùng
- Optional + nullable (match DB):
  - `z.string().max(160).optional().nullable()`
- UUID:
  - `z.string().uuid()`
- Enum status:
  - `z.enum(['draft', 'published', 'archived'], { message: '...' })`

## Với react-hook-form
- `resolver: zodResolver(schema)`
- Prefer `useForm<FormData, unknown, FormData>` để types khớp.

## Với server actions / route handlers
- Validate input bằng `schema.safeParse(data)`.
- Không throw raw ZodError ra UI; map sang message tiếng Việt hoặc cấu trúc lỗi form.

## Tránh
- Tránh `z.any()` (repo strict TS). Nếu cần, dùng `z.unknown()` và refine.
- Tránh duplicate rule giữa client & server; schema nên dùng chung.
