'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { tagSchema, type TagFormData } from '@/lib/validations/tag'
import { createTag, updateTag } from '@/app/actions/tags'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase/database.types'

type Tag = Database['public']['Tables']['tags']['Row']

interface TagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tag?: Tag | null
  onSuccess: (tag: Tag) => void
}

export function TagDialog({
  open,
  onOpenChange,
  tag,
  onSuccess,
}: TagDialogProps) {
  const isEditing = !!tag

  const form = useForm<TagFormData, unknown, TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      slug: '',
      color: '',
      description: '',
    },
  })

  // Reset form when dialog opens/closes or tag changes
  useEffect(() => {
    if (open) {
      if (tag) {
        form.reset({
          name: tag.name,
          slug: tag.slug,
          color: tag.color || '',
          description: tag.description || '',
        })
      } else {
        form.reset({
          name: '',
          slug: '',
          color: '',
          description: '',
        })
      }
    }
  }, [open, tag, form])

  const onSubmit = async (data: TagFormData) => {
    try {
      let result: Tag
      if (isEditing) {
        const updateData: Record<string, string | null> = {
          name: data.name,
        }
        if (data.slug) updateData.slug = data.slug
        if (data.color) updateData.color = data.color
        if (data.description) updateData.description = data.description

        result = await updateTag(tag.id, updateData)
        toast.success('Đã cập nhật thẻ thành công')
      } else {
        const createData = {
          name: data.name,
          slug: data.slug || '',
          color: data.color || null,
          description: data.description || null,
        }
        result = await createTag(createData)
        toast.success('Đã tạo thẻ mới thành công')
      }

      onSuccess(result)
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    }
  }

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    if (isEditing) return

    // Keep auto-updating until the user manually edits the slug.
    // (Otherwise it would get stuck at the first typed character.)
    if (!form.formState.dirtyFields.slug) {
      form.setValue('slug', slugify(name), { shouldDirty: false })
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa thẻ' : 'Tạo thẻ mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin của thẻ'
              : 'Thêm một thẻ mới cho bài viết và dự án'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thẻ *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Next.js"
                      {...field}
                      onChange={e => {
                        field.onChange(e)
                        handleNameChange(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nextjs"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Tự động tạo từ tên nếu để trống
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Màu sắc</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        className="h-10 w-20"
                        type="color"
                        {...field}
                        value={field.value || '#3b82f6'}
                      />
                    </FormControl>
                    <FormControl>
                      <Input
                        placeholder="#3b82f6"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Mã màu hex để hiển thị thẻ (tùy chọn)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Mô tả về thẻ này..."
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Hủy
              </Button>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting
                  ? 'Đang xử lý...'
                  : isEditing
                    ? 'Cập nhật'
                    : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
