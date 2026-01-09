import { z } from 'zod'

export const docSchema = z.object({
  topic_id: z.string().min(1, { error: 'Vui lòng chọn chủ đề' }),
  title: z
    .string()
    .min(1, { error: 'Tiêu đề không được để trống' })
    .max(200, { error: 'Tiêu đề không được quá 200 ký tự' }),
  slug: z
    .string()
    .min(1, { error: 'Slug không được để trống' })
    .regex(/^[a-z0-9-/]+$/, {
      error: 'Slug chỉ chứa chữ thường, số, dấu gạch ngang và dấu /',
    }),
  description: z
    .string()
    .max(500, { error: 'Mô tả không được quá 500 ký tự' })
    .optional(),
  content: z.string().min(1, { error: 'Nội dung không được để trống' }),
  locale: z.string().min(2, { error: 'Ngôn ngữ không hợp lệ' }),
  order_index: z.number().int().min(0),
  parent_id: z.string().uuid().nullable().optional(),
  show_toc: z.boolean(),
})

export type DocFormInput = z.input<typeof docSchema>
export type DocFormData = z.output<typeof docSchema>
