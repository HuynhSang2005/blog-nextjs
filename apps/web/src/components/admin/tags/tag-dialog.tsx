'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
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
import { tagSchema, type TagFormData } from '@/schemas/tag'
import { createTag, updateTag } from '@/app/actions/tags'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

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
  const t = useTranslations('admin.tags')

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

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
        setIsSlugManuallyEdited(true)
        form.reset({
          name: tag.name,
          slug: tag.slug,
          color: tag.color || '',
          description: tag.description || '',
        })
      } else {
        setIsSlugManuallyEdited(false)
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
        toast.success(t('messages.update_success'))
      } else {
        const createData = {
          name: data.name,
          slug: data.slug || '',
          color: data.color || null,
          description: data.description || null,
        }
        result = await createTag(createData)
        toast.success(t('messages.create_success'))
      }

      onSuccess(result)
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('messages.generic_error'))
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
    if (!isSlugManuallyEdited) {
      form.setValue('slug', slugify(name), { shouldDirty: false })
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('dialog.edit_title') : t('dialog.create_title')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('dialog.edit_description')
              : t('dialog.create_description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.name_label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.name_placeholder')}
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
                  <FormLabel>{t('form.slug_label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.slug_placeholder')}
                      {...field}
                      onChange={e => {
                        setIsSlugManuallyEdited(true)
                        field.onChange(e)
                      }}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>{t('form.slug_help')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.color_label')}</FormLabel>
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
                        placeholder={t('form.color_placeholder')}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>{t('form.color_help')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.description_label')}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder={t('form.description_placeholder')}
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
                {t('actions.cancel')}
              </Button>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting
                  ? t('actions.saving')
                  : isEditing
                    ? t('actions.save')
                    : t('actions.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
