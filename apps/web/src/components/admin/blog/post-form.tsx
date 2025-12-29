'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, Send } from 'lucide-react'

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
import { Card, CardContent } from '@/components/ui/card'
import { blogPostSchema, type BlogPostFormData } from '@/lib/validations/blog'
import { createBlogPost, updateBlogPost, publishBlogPost } from '@/app/actions/blog'
import type { Database } from '@/lib/supabase/database.types'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type Tag = Database['public']['Tables']['tags']['Row']

interface BlogPostFormProps {
  post?: BlogPost & { tags?: Tag[] }
  tags: Tag[]
  mode: 'create' | 'edit'
}

export function BlogPostForm({ post, tags, mode }: BlogPostFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const form = useForm<BlogPostFormData, unknown, BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      status: (post?.status || 'draft') as 'draft' | 'published' | 'archived',
      locale: post?.locale || 'vi',
      featured: post?.featured || false,
      allow_comments: post?.allow_comments !== false, // Default true
      meta_description: post?.meta_description || '',
      cover_media_id: post?.cover_media_id || null,
      og_media_id: post?.og_media_id || null,
      tag_ids: post?.tags?.map((t) => t.id) || [],
      series_id: post?.series_id || null,
      series_order: post?.series_order || null,
      read_time_minutes: post?.read_time_minutes || null,
    },
  })

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

  const onSaveDraft = async (data: BlogPostFormData) => {
    try {
      setIsSaving(true)
      
      const postData = { ...data, status: 'draft' as const }
      
      if (mode === 'create') {
        const result = await createBlogPost(postData)
        toast.success('Đã lưu nháp thành công')
        router.push(`/admin/blog/${result.id}`)
      } else if (post) {
        await updateBlogPost(post.id, postData)
        toast.success('Đã cập nhật bài viết')
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Không thể lưu nháp')
    } finally {
      setIsSaving(false)
    }
  }

  const onPublish = async (data: BlogPostFormData) => {
    try {
      setIsPublishing(true)
      
      const postData = { ...data, status: 'published' as const }
      
      if (mode === 'create') {
        const result = await createBlogPost(postData)
        await publishBlogPost(result.id)
        toast.success('Đã xuất bản bài viết')
        router.push('/admin/blog')
      } else if (post) {
        await updateBlogPost(post.id, postData)
        await publishBlogPost(post.id)
        toast.success('Đã xuất bản bài viết')
        router.push('/admin/blog')
      }
    } catch (error) {
      console.error('Error publishing:', error)
      toast.error('Không thể xuất bản bài viết')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tiêu đề bài viết..."
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
                      <FormLabel>Slug *</FormLabel>
                      <FormControl>
                        <Input placeholder="duong-dan-bai-viet" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL của bài viết (chỉ chữ thường, số và dấu gạch ngang)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Excerpt */}
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả ngắn</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả ngắn gọn về bài viết (hiển thị trong danh sách)..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Content Card */}
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nội dung bài viết (MDX)..."
                          className="min-h-[400px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Hỗ trợ Markdown và MDX. Sẽ tích hợp Novel editor trong future.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SEO Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium">SEO</h3>
                  <p className="text-sm text-muted-foreground">
                    Tối ưu hóa công cụ tìm kiếm
                  </p>
                </div>

                <Separator />

                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả cho Google Search (tối đa 160 ký tự)..."
                          className="resize-none"
                          rows={2}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Publish Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Xuất bản</h3>
                  <p className="text-sm text-muted-foreground">
                    Quản lý trạng thái bài viết
                  </p>
                </div>

                <Separator />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Bản nháp</SelectItem>
                          <SelectItem value="published">Đã xuất bản</SelectItem>
                          <SelectItem value="archived">Đã lưu trữ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Featured */}
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Nổi bật</FormLabel>
                        <FormDescription className="text-xs">
                          Hiển thị ở trang chủ
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

                {/* Allow Comments */}
                <FormField
                  control={form.control}
                  name="allow_comments"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Cho phép bình luận</FormLabel>
                        <FormDescription className="text-xs">
                          Bật/tắt bình luận
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

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isSaving || isPublishing}
                    onClick={form.handleSubmit(onSaveDraft)}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Lưu nháp
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    className="w-full"
                    disabled={isSaving || isPublishing}
                    onClick={form.handleSubmit(onPublish)}
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xuất bản...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Xuất bản
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags Card - Simplified for now */}
            <Card>
              <CardContent className="pt-6">
                <div>
                  <h3 className="text-lg font-medium">Tags</h3>
                  <p className="text-sm text-muted-foreground">
                    Chọn tags cho bài viết
                  </p>
                </div>

                <Separator className="my-4" />

                <p className="text-sm text-muted-foreground">
                  Tag selection UI sẽ được implement sau (Phase 2.2.2)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}
