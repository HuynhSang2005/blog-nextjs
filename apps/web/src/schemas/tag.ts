import { z } from 'zod'

/**
 * Validation schema for tag form
 */
export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên thẻ là bắt buộc')
    .max(50, 'Tên thẻ không được quá 50 ký tự'),
  slug: z
    .string()
    .regex(
      /^[a-z0-9-]+$/,
      'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'
    )
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Màu phải theo định dạng hex (#RRGGBB)')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(200, 'Mô tả không được quá 200 ký tự')
    .optional()
    .or(z.literal('')),
})

export type TagFormData = z.infer<typeof tagSchema>
