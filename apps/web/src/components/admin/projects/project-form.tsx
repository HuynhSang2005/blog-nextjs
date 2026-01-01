'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { projectSchema, type ProjectFormData } from '@/lib/validations/project'
import {
  createProject,
  updateProject,
  updateProjectTags,
} from '@/app/actions/projects'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import { MediaPicker } from '@/components/admin/media/media-picker'
import { GalleryManager } from '@/components/admin/projects/gallery-manager'
import { TechStackManager } from '@/components/admin/projects/tech-stack-manager'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

interface ProjectFormProps {
  project?: ProjectWithAdminRelations
  mode: 'create' | 'edit'
  tags: Tag[]
}

type Tag = Database['public']['Tables']['tags']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type ProjectTag = Database['public']['Tables']['project_tags']['Row']

interface GalleryItem {
  id: string
  media_id: string
  public_id: string
  alt_text: string
  caption: string
  order_index: number
}

interface TechItem {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'tools' | 'other'
  icon?: string
  order_index: number
}

interface ProjectWithAdminRelations extends Project {
  project_tags?: Array<Pick<ProjectTag, 'tag_id'>>
  gallery?: GalleryItem[]
  tech_stack?: TechItem[]
}

// Function to remove Vietnamese tones for slug generation
function removeVietnameseTones(str: string): string {
  str = str.toLowerCase()
  str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
  str = str.replace(/[èéẹẻẽêềếệểễ]/g, 'e')
  str = str.replace(/[ìíịỉĩ]/g, 'i')
  str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
  str = str.replace(/[ùúụủũưừứựửữ]/g, 'u')
  str = str.replace(/[ỳýỵỷỹ]/g, 'y')
  str = str.replace(/đ/g, 'd')
  str = str.replace(/[^a-z0-9\s-]/g, '')
  str = str.replace(/\s+/g, '-')
  str = str.replace(/-+/g, '-')
  str = str.replace(/^-|-$/g, '')
  return str
}

export function ProjectForm({ project, mode, tags }: ProjectFormProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('admin.projects')
  const [isCreating, setIsCreating] = useState(false)

  const form = useForm<ProjectFormData, unknown, ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title || '',
          slug: project.slug || '',
          tag_ids:
            project.project_tags?.map(pt => pt.tag_id).filter(Boolean) || [],
          description: project.description || '',
          long_description: project.long_description || '',
          cover_media_id: project.cover_media_id || null,
          og_media_id: project.og_media_id || null,
          demo_url: project.demo_url || '',
          github_url: project.github_url || '',
          status:
            project.status === 'in_progress' ||
            project.status === 'completed' ||
            project.status === 'archived'
              ? project.status
              : 'completed',
          featured: project.featured || false,
          start_date: project.start_date || '',
          end_date: project.end_date || '',
          locale: project.locale || 'vi',
        }
      : {
          title: '',
          slug: '',
          tag_ids: [],
          description: '',
          long_description: '',
          cover_media_id: null,
          og_media_id: null,
          demo_url: '',
          github_url: '',
          status: 'completed',
          featured: false,
          start_date: '',
          end_date: '',
          locale: 'vi',
        },
  })

  // Auto-generate slug from title
  const watchTitle = form.watch('title')
  useEffect(() => {
    if (mode === 'create' && watchTitle) {
      if (form.formState.dirtyFields.slug) return
      const slug = removeVietnameseTones(watchTitle)
      form.setValue('slug', slug, {
        shouldValidate: true,
        shouldDirty: false,
      })
    }
  }, [watchTitle, mode, form])

  const onSubmit = async (data: ProjectFormData) => {
    setIsCreating(true)
    try {
      const { tag_ids, ...rest } = data

      if (mode === 'create') {
        const created = await createProject(rest)
        await updateProjectTags(created.id, tag_ids)
        toast.success(t('messages.create_success'))
      } else {
        if (!project?.id) {
          throw new Error('Không tìm thấy dự án để cập nhật')
        }

        await updateProject(project.id, rest)
        await updateProjectTags(project.id, tag_ids)
        toast.success(t('messages.update_success'))
      }
      router.push(`/${locale}/admin/projects`)
      router.refresh()
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error(
        mode === 'create'
          ? t('messages.create_error')
          : t('messages.update_error')
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.title')}</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tiêu đề dự án..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tag_ids"
          render={({ field }) => {
            const selectedIds = field.value || []
            const selectedCount = selectedIds.length

            return (
              <FormItem>
                <div>
                  <FormLabel>Thẻ</FormLabel>
                  <FormDescription>Chọn thẻ cho dự án</FormDescription>
                </div>

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
                            const isSelected = selectedIds.includes(tag.id)

                            return (
                              <CommandItem
                                key={tag.id}
                                onSelect={() => {
                                  const next = isSelected
                                    ? selectedIds.filter(id => id !== tag.id)
                                    : [...selectedIds, tag.id]

                                  field.onChange(next)
                                }}
                                value={tag.name}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    isSelected ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <span className="flex-1">{tag.name}</span>
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

                <FormMessage />
              </FormItem>
            )
          }}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.slug')}</FormLabel>
              <FormControl>
                <Input placeholder="project-slug" {...field} />
              </FormControl>
              <FormDescription>
                URL-friendly identifier (tự động tạo từ tiêu đề)
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
              <FormLabel>{t('form.description')}</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[80px]"
                  placeholder="Mô tả ngắn về dự án..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Mô tả ngắn gọn (tối đa 500 ký tự)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Long Description */}
        <FormField
          control={form.control}
          name="long_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.long_description')}</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Mô tả chi tiết về dự án (hỗ trợ MDX)..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Mô tả chi tiết với hỗ trợ MDX format
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cover Media */}
        <FormField
          control={form.control}
          name="cover_media_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh bìa</FormLabel>
              <FormControl>
                <MediaPicker
                  aspectRatio="video"
                  description="Ảnh đại diện cho dự án (tỷ lệ 16:9 khuyến nghị)"
                  label="Chọn ảnh bìa"
                  onSelect={mediaId => field.onChange(mediaId)}
                  selectedMediaId={field.value || undefined}
                />
              </FormControl>
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
              <FormLabel>Ảnh Open Graph</FormLabel>
              <FormControl>
                <MediaPicker
                  aspectRatio="16/9"
                  description="Ảnh hiển thị khi chia sẻ link (1200x630px)"
                  label="Chọn ảnh OG"
                  onSelect={mediaId => field.onChange(mediaId)}
                  selectedMediaId={field.value || undefined}
                />
              </FormControl>
              <FormDescription>
                Không bắt buộc (mặc định dùng ảnh bìa)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Demo URL */}
        <FormField
          control={form.control}
          name="demo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.demo_url')}</FormLabel>
              <FormControl>
                <Input placeholder="https://demo.example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* GitHub URL */}
        <FormField
          control={form.control}
          name="github_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.github_url')}</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://github.com/username/repo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.status')}</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in_progress">
                    {t('status.in_progress')}
                  </SelectItem>
                  <SelectItem value="completed">
                    {t('status.completed')}
                  </SelectItem>
                  <SelectItem value="archived">
                    {t('status.archived')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Date */}
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.start_date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date */}
        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.end_date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gallery Manager */}
        <div className="space-y-2">
          <FormLabel className="text-base">Gallery ảnh dự án</FormLabel>
          <FormDescription>
            Thêm nhiều ảnh để hiển thị trong trang chi tiết dự án. Kéo thả để
            sắp xếp thứ tự.
          </FormDescription>
          <GalleryManager
            initialGallery={project?.gallery ?? []}
            maxImages={10}
            projectId={project?.id}
          />
        </div>

        {/* Tech Stack Manager */}
        <div className="space-y-2">
          <FormLabel className="text-base">Công nghệ sử dụng</FormLabel>
          <FormDescription>
            Thêm các công nghệ, framework, tools được sử dụng trong dự án. Kéo
            thả để sắp xếp thứ tự.
          </FormDescription>
          <TechStackManager
            initialTechStack={project?.tech_stack ?? []}
            projectId={project?.id}
          />
        </div>

        {/* Featured */}
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t('form.featured')}
                </FormLabel>
                <FormDescription>
                  Hiển thị dự án này ở vị trí nổi bật
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

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button disabled={isCreating} type="submit">
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('form.save')}
          </Button>
          <Button
            onClick={() => router.push(`/${locale}/admin/projects`)}
            type="button"
            variant="outline"
          >
            {t('form.cancel')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
