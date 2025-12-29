'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MDXEditorComponent } from '@/components/admin/mdx-editor'
import { createDoc, updateDoc } from '@/app/actions/docs'
import type { Database } from '@/lib/supabase/database.types'
import type { DocWithRelations } from '@/lib/supabase/queries/docs'

type DocTopic = Database['public']['Tables']['docs_topics']['Row']

// Validation schema
const docFormSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(200, 'Tiêu đề không được quá 200 ký tự'),
  slug: z.string()
    .min(1, 'Slug là bắt buộc')
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  description: z.string().max(500, 'Mô tả không được quá 500 ký tự').optional(),
  content: z.string().min(1, 'Nội dung là bắt buộc'),
  topic_id: z.string().uuid('Vui lòng chọn chủ đề'),
  parent_id: z.string().uuid().nullable(),
  show_toc: z.boolean(),
  order_index: z.number().int().min(0),
  locale: z.string(),
})

type DocFormData = z.infer<typeof docFormSchema>

interface DocsFormProps {
  doc?: DocWithRelations
  topics: DocTopic[]
  mode: 'create' | 'edit'
  defaultLocale?: string
}

export function DocsForm({ doc, topics, mode, defaultLocale = 'vi' }: DocsFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [docsInTopic, setDocsInTopic] = useState<Array<{ id: string; title: string }>>([])

  const form = useForm<DocFormData>({
    resolver: zodResolver(docFormSchema),
    defaultValues: {
      title: doc?.title || '',
      slug: doc?.slug || '',
      description: doc?.description || '',
      content: doc?.content || '',
      topic_id: doc?.topic_id || '',
      parent_id: doc?.parent_id || null,
      show_toc: doc?.show_toc !== false, // Default true
      order_index: doc?.order_index || 0,
      locale: doc?.locale || defaultLocale,
    },
  })

  // Watch topic changes to update parent dropdown
  const selectedTopicId = form.watch('topic_id')

  useEffect(() => {
    // Fetch docs in selected topic for parent dropdown
    if (selectedTopicId) {
      // TODO: Add query function to get docs by topic
      // For now, we'll just clear the parent selection
      setDocsInTopic([])
    }
  }, [selectedTopicId])

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    if (mode === 'create' && !form.getValues('slug')) {
      const slug = value
        .toLowerCase()
        .normalize('NFD') // Decompose Vietnamese characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/đ/g, 'd') // Replace đ
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-') // Replace multiple - with single -
      
      form.setValue('slug', slug)
    }
  }

  const onSave = async (data: DocFormData) => {
    try {
      setIsSaving(true)
      
      if (mode === 'create') {
        const result = await createDoc(data)
        
        if (result.success && result.data) {
          toast.success('Đã tạo tài liệu thành công')
          router.push(`/${data.locale}/admin/docs/${result.data.id}`)
        } else {
          toast.error(result.error || 'Không thể tạo tài liệu')
        }
      } else if (doc) {
        const result = await updateDoc(doc.id, data)
        
        if (result.success) {
          toast.success('Đã cập nhật tài liệu thành công')
          router.refresh()
        } else {
          toast.error(result.error || 'Không thể cập nhật tài liệu')
        }
      }
    } catch (error) {
      console.error('Error saving doc:', error)
      toast.error('Đã xảy ra lỗi khi lưu tài liệu')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tiêu đề tài liệu"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            handleTitleChange(e.target.value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Slug */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đường dẫn (slug) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="duong-dan-url"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        URL thân thiện: /docs/topic-slug/doc-slug
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả ngắn</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả ngắn về nội dung tài liệu (tùy chọn)"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Hiển thị trong danh sách tài liệu và meta description
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Content Card with MDX Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Nội dung *</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="min-h-[500px] border rounded-lg">
                          <MDXEditorComponent
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Nhập nội dung tài liệu (hỗ trợ MDX)..."
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Hỗ trợ Markdown, MDX components, code blocks, tables, images
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-6">
            {/* Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Topic */}
                <FormField
                  control={form.control}
                  name="topic_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chủ đề *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chủ đề" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topics.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id}>
                              {topic.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Chủ đề chính của tài liệu này
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parent Doc */}
                <FormField
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tài liệu cha</FormLabel>
                      <Select
                        value={field.value || 'none'}
                        onValueChange={(value) => 
                          field.onChange(value === 'none' ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tài liệu gốc" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Tài liệu gốc (không có cha)</SelectItem>
                          {docsInTopic.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Tạo cấu trúc phân cấp cho tài liệu
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Show TOC */}
                <FormField
                  control={form.control}
                  name="show_toc"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Hiển thị mục lục
                        </FormLabel>
                        <FormDescription>
                          Hiển thị Table of Contents ở cột bên phải
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Order Index */}
                <FormField
                  control={form.control}
                  name="order_index"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ tự hiển thị</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Số thứ tự trong danh sách (0 = đầu tiên)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Locale */}
                <FormField
                  control={form.control}
                  name="locale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngôn ngữ</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {mode === 'create' ? 'Tạo tài liệu' : 'Cập nhật'}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Hủy
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}
