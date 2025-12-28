'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

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
import { projectSchema, type ProjectFormData } from '@/lib/validations/project'
import { createProject, updateProject } from '@/app/actions/projects'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface ProjectFormProps {
  project?: any
  mode: 'create' | 'edit'
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

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter()
  const t = useTranslations('admin.projects')
  const [isCreating, setIsCreating] = useState(false)

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? {
          title: project.title || '',
          slug: project.slug || '',
          description: project.description || '',
          long_description: project.long_description || '',
          demo_url: project.demo_url || '',
          github_url: project.github_url || '',
          status: project.status || 'completed',
          featured: project.featured || false,
          start_date: project.start_date || '',
          end_date: project.end_date || '',
          locale: project.locale || 'vi',
        }
      : {
          title: '',
          slug: '',
          description: '',
          long_description: '',
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
      const slug = removeVietnameseTones(watchTitle)
      form.setValue('slug', slug)
    }
  }, [watchTitle, mode, form])

  const onSubmit = async (data: ProjectFormData) => {
    setIsCreating(true)
    try {
      if (mode === 'create') {
        await createProject(data)
        toast.success(t('messages.create_success'))
      } else {
        await updateProject(project.id, data)
        toast.success(t('messages.update_success'))
      }
      router.push('/admin/projects')
      router.refresh()
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error(mode === 'create' ? t('messages.create_error') : t('messages.update_error'))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  placeholder="Mô tả ngắn về dự án..."
                  className="min-h-[80px]"
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
                  placeholder="Mô tả chi tiết về dự án (hỗ trợ MDX)..."
                  className="min-h-[200px] font-mono text-sm"
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
                <Input placeholder="https://github.com/username/repo" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in_progress">{t('status.in_progress')}</SelectItem>
                  <SelectItem value="completed">{t('status.completed')}</SelectItem>
                  <SelectItem value="archived">{t('status.archived')}</SelectItem>
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

        {/* Featured */}
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t('form.featured')}</FormLabel>
                <FormDescription>
                  Hiển thị dự án này ở vị trí nổi bật
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('form.save')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/projects')}
          >
            {t('form.cancel')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
