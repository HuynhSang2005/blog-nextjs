'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, ChevronsUpDown, Loader2, Save, Send } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { MediaPicker } from '@/components/admin/media/media-picker'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { blogPostSchema, type BlogPostFormData } from '@/lib/validations/blog'
import {
  createBlogPost,
  publishBlogPost,
  updateBlogPost,
  updateBlogPostTags,
} from '@/app/actions/blog'
import { MDXEditorWrapper } from '@/components/admin/shared/mdx-editor'
import { MDXGuidelines } from '@/components/admin/shared/mdx-guidelines'
import type { Database } from '@/lib/supabase/database.types'
import { cn } from '@/lib/utils'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type Tag = Database['public']['Tables']['tags']['Row']

interface BlogPostFormProps {
  post?: BlogPost & { tags?: Tag[] }
  tags: Tag[]
  mode: 'create' | 'edit'
}

export function BlogPostForm({ post, tags, mode }: BlogPostFormProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('admin.blog')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const [lastSavedContent, setLastSavedContent] = useState(post?.content || '')

  useEffect(() => {
    setLastSavedContent(post?.content || '')
  }, [post?.content])

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
      tag_ids: post?.tags?.map(t => t.id) || [],
      series_id: post?.series_id || null,
      series_order: post?.series_order || null,
      reading_time_minutes: post?.reading_time_minutes || null,
    },
  })

  // Auto-calculate read time from content
  const calculateReadTime = (content: string): number => {
    // Remove MDX/Markdown syntax for accurate word count
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/[#*_[\]()]/g, '') // Remove markdown symbols
      .trim()

    const words = cleanContent.split(/\s+/).filter(w => w.length > 0).length

    // Average reading speed: 200 words/minute for Vietnamese
    // Reference: https://en.wikipedia.org/wiki/Words_per_minute
    const readTime = Math.ceil(words / 200)

    return readTime > 0 ? readTime : 1 // Minimum 1 minute
  }

  const generateSlugFromTitle = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD') // Decompose Vietnamese characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd') // Replace đ
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-') // Replace multiple - with single -
      .replace(/^-+|-+$/g, '') // Trim dashes

  // Auto-generate slug from title (until the user edits slug manually)
  const handleTitleChange = (value: string) => {
    if (mode !== 'create') return
    if (isSlugManuallyEdited) return

    const slug = generateSlugFromTitle(value)
    form.setValue('slug', slug, {
      shouldValidate: true,
      shouldDirty: false,
    })
  }

  const onSaveDraft = async (data: BlogPostFormData) => {
    try {
      setIsSaving(true)

      // Auto-calculate read time before saving
      const readTime = calculateReadTime(data.content)
      const postData = {
        ...data,
        status: 'draft' as const,
        reading_time_minutes: readTime,
        series_id: null, // Hide series feature for now
        series_order: null,
      }

      const { tag_ids, ...rest } = postData

      if (mode === 'create') {
        const result = await createBlogPost(rest)
        await updateBlogPostTags(result.id, tag_ids)
        setLastSavedContent(rest.content)
        toast.success('Đã lưu nháp thành công')
        router.push(`/${locale}/admin/blog/${result.id}`)
      } else if (post) {
        await updateBlogPost(post.id, rest)
        await updateBlogPostTags(post.id, tag_ids)
        setLastSavedContent(rest.content)
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

      // Auto-calculate read time before publishing
      const readTime = calculateReadTime(data.content)
      const postData = {
        ...data,
        status: 'published' as const,
        reading_time_minutes: readTime,
        series_id: null, // Hide series feature for now
        series_order: null,
      }

      const { tag_ids, ...rest } = postData

      if (mode === 'create') {
        const result = await createBlogPost(rest)
        await updateBlogPostTags(result.id, tag_ids)
        await publishBlogPost(result.id)
        setLastSavedContent(rest.content)
        toast.success('Đã xuất bản bài viết')
        router.push(`/${locale}/admin/blog`)
      } else if (post) {
        await updateBlogPost(post.id, rest)
        await updateBlogPostTags(post.id, tag_ids)
        await publishBlogPost(post.id)
        setLastSavedContent(rest.content)
        toast.success('Đã xuất bản bài viết')
        router.push(`/${locale}/admin/blog`)
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
                          onChange={e => {
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
                        <Input
                          placeholder="duong-dan-bai-viet"
                          {...field}
                          onChange={e => {
                            setIsSlugManuallyEdited(true)
                            field.onChange(e)
                          }}
                        />
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
                          className="resize-none"
                          placeholder="Mô tả ngắn gọn về bài viết (hiển thị trong danh sách)..."
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

            {/* Media Card */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Hình ảnh</h3>
                  <p className="text-sm text-muted-foreground">
                    Ảnh bìa và Open Graph cho bài viết
                  </p>
                </div>

                <Separator />

                {/* Cover Media */}
                <FormField
                  control={form.control}
                  name="cover_media_id"
                  render={({ field }) => (
                    <FormItem>
                      <MediaPicker
                        aspectRatio="16/9"
                        description="Ảnh chính hiển thị trên bài viết (tỷ lệ 16:9)"
                        label="Ảnh bìa"
                        onSelect={field.onChange}
                        selectedMediaId={field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* OG Media */}
                <FormField
                  control={form.control}
                  name="og_media_id"
                  render={({ field }) => (
                    <FormItem>
                      <MediaPicker
                        aspectRatio="16/9"
                        description="Ảnh hiển thị khi chia sẻ trên mạng xã hội (1200x630px, tỷ lệ 16:9)"
                        label="Ảnh Open Graph"
                        onSelect={field.onChange}
                        selectedMediaId={field.value}
                      />
                      <FormDescription>
                        Nếu không chọn, sẽ sử dụng ảnh bìa làm OG image
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
                          className="resize-none"
                          placeholder="Mô tả cho Google Search (tối đa 160 ký tự)..."
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
                        defaultValue={field.value}
                        onValueChange={field.onChange}
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
                    className="w-full"
                    disabled={isSaving || isPublishing}
                    onClick={form.handleSubmit(onSaveDraft)}
                    type="button"
                    variant="outline"
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
                    className="w-full"
                    disabled={isSaving || isPublishing}
                    onClick={form.handleSubmit(onPublish)}
                    type="button"
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

            {/* Tags Card */}
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="tag_ids"
                  render={({ field }) => {
                    const selectedIds = field.value || []
                    const selectedCount = selectedIds.length

                    return (
                      <FormItem>
                        <div>
                          <h3 className="text-lg font-medium">Thẻ</h3>
                          <p className="text-sm text-muted-foreground">
                            Chọn thẻ cho bài viết
                          </p>
                        </div>

                        <Separator className="my-4" />

                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                className="w-full justify-between"
                                role="combobox"
                                type="button"
                                variant="outline"
                              >
                                {selectedCount === 0
                                  ? 'Chọn thẻ'
                                  : `Đã chọn ${selectedCount} thẻ`}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>

                          <PopoverContent align="start" className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Tìm thẻ..." />
                              <CommandList>
                                <CommandEmpty>Không tìm thấy thẻ</CommandEmpty>
                                <CommandGroup>
                                  {tags.map(tag => {
                                    const isSelected = selectedIds.includes(
                                      tag.id
                                    )

                                    return (
                                      <CommandItem
                                        key={tag.id}
                                        onSelect={() => {
                                          const next = isSelected
                                            ? selectedIds.filter(
                                                id => id !== tag.id
                                              )
                                            : [...selectedIds, tag.id]

                                          field.onChange(next)
                                        }}
                                        value={tag.name}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            isSelected
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          )}
                                        />
                                        <span className="flex-1">
                                          {tag.name}
                                        </span>
                                        {tag.slug ? (
                                          <span className="text-muted-foreground text-xs">
                                            {tag.slug}
                                          </span>
                                        ) : null}
                                      </CommandItem>
                                    )
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        <FormDescription>
                          Bạn có thể chọn nhiều thẻ.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Content Card (Full width like docs-admin) */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 pt-6 space-y-2">
              <MDXGuidelines i18nNamespace="admin.blog" />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung *</FormLabel>
                    <FormControl>
                      <div className="min-h-[500px] rounded-md border">
                        <MDXEditorWrapper
                          diffMarkdown={lastSavedContent}
                          i18nNamespace="admin.blog"
                          onChange={field.onChange}
                          placeholder={t('form.placeholders.content')}
                          value={field.value}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Hỗ trợ Markdown/MDX (code block, bảng, ảnh).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button onClick={() => router.back()} type="button" variant="outline">
            Hủy
          </Button>
          <Button
            disabled={isSaving || isPublishing}
            onClick={form.handleSubmit(onSaveDraft)}
            type="button"
            variant="secondary"
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
            disabled={isSaving || isPublishing}
            onClick={form.handleSubmit(onPublish)}
            type="button"
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
      </form>
    </Form>
  )
}
