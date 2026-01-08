---
name: react-hook-form
description: Pattern dùng react-hook-form + Shadcn Form + next-intl trong repo này (client forms, admin/forms).
---

## Khi nào dùng
- Form có input/validation client-side (login, admin create/edit).
- Không dùng cho Server Components; form component sẽ là `'use client'`.

## Nguồn trong repo
- Shadcn form wrapper (không sửa): `apps/web/src/components/ui/form.tsx`
- Form thật (admin/blog): `apps/web/src/components/admin/blog/post-form.tsx`

## Pattern chuẩn
1) Khai báo schema Zod (ở `apps/web/src/schemas/*`) và type:
- `export type XxxFormData = z.infer<typeof xxxSchema>`

2) Trong Client Component:
- `const form = useForm<XxxFormData, unknown, XxxFormData>({ resolver: zodResolver(xxxSchema), defaultValues })`

3) Render với Shadcn Form components:
- `<Form {...form}>` + `<FormField name="..." render={({ field }) => (...) } />`
- Dùng `<FormMessage />` để hiển thị lỗi.

## i18n/UI
- Text UI phải tiếng Việt và ưu tiên lấy từ `next-intl`:
  - `const t = useTranslations('admin.blog')`
- Tránh hardcode English strings cho label/button/toast.

## Mapping dữ liệu với DB
- Dữ liệu đọc/ghi DB nên theo type `Database['public']['Tables'][...]['Row'|'Insert'|'Update']`.
- Khi form có field nullable/optional, đồng bộ với Zod (`optional().nullable()`) và defaultValues (`null`/'' đúng ngữ nghĩa).

## Common gotchas
- `defaultValues` phải stable (đặc biệt khi edit). Nếu phụ thuộc `post`, set lại bằng `form.reset(...)` hoặc đảm bảo props ổn định.
- Với boolean nullable từ DB, normalize về boolean trong form (ví dụ repo dùng `allow_comments !== false`).
- Với UUID: dùng `z.string().uuid()` để match DB.
