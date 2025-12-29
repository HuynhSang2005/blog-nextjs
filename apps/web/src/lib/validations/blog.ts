import { z } from 'zod'

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề không được quá 200 ký tự'),
  
  slug: z
    .string()
    .min(1, 'Slug không được để trống')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  
  excerpt: z
    .string()
    .max(500, 'Mô tả ngắn không được quá 500 ký tự')
    .optional()
    .nullable(),
  
  content: z.string().min(1, 'Nội dung không được để trống'),
  
  status: z.enum(['draft', 'published', 'archived'], {
    message: 'Vui lòng chọn trạng thái',
  }),
  
  locale: z.string(),
  
  featured: z.boolean(),
  
  allow_comments: z.boolean(),
  
  meta_description: z.string().max(160).optional().nullable(),
  
  cover_media_id: z.string().uuid().optional().nullable(),
  
  og_media_id: z.string().uuid().optional().nullable(),
  
  tag_ids: z.array(z.string().uuid()),
  
  series_id: z.string().uuid().optional().nullable(),
  
  series_order: z.number().int().optional().nullable(),
  
  read_time_minutes: z.number().int().optional().nullable(),
})

export type BlogPostFormData = z.infer<typeof blogPostSchema>
