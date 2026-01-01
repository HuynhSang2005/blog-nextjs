import { z } from 'zod'

export const projectSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(200, 'Tiêu đề không được quá 200 ký tự'),
  slug: z
    .string()
    .min(1, 'Slug không được để trống')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  tag_ids: z.array(z.string().uuid()),
  description: z
    .string()
    .max(500, 'Mô tả không được quá 500 ký tự')
    .optional()
    .or(z.literal('')),
  long_description: z.string().optional().or(z.literal('')),
  demo_url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  github_url: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  status: z.enum(['in_progress', 'completed', 'archived']),
  locale: z.string(),
  featured: z.boolean(),
  start_date: z.string().optional().or(z.literal('')),
  end_date: z.string().optional().or(z.literal('')),
  cover_media_id: z.string().uuid().nullable().optional(),
  og_media_id: z.string().uuid().nullable().optional(),
})

export type ProjectFormData = z.infer<typeof projectSchema>
