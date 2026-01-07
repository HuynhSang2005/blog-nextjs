'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import type { FieldErrors } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
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
import { Card, CardContent } from '@/components/ui/card'
import { MDXEditorWrapper } from '@/components/admin/shared/mdx-editor'

import { docSchema, type DocFormData } from '@/schemas/docs'
import { createDoc, updateDoc } from '@/app/actions/docs'
import type { Database } from '@/types/database'

type DocRow = Database['public']['Tables']['docs']['Row']
type DocsTopic = Database['public']['Tables']['docs_topics']['Row']

interface DocFormProps {
  doc?: DocRow
  topics: DocsTopic[]
  mode: 'create' | 'edit'
}

export function DocForm({ doc, topics, mode }: DocFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useMemo(() => {
    const match = pathname.match(/^\/([^/]+)(?:\/|$)/)
    return match?.[1] ?? 'vi'
  }, [pathname])
  const [isSaving, setIsSaving] = useState(false)
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)
  const [lastSavedContent, setLastSavedContent] = useState(doc?.content || '')
  const t = useTranslations('admin.docs')

  useEffect(() => {
    setLastSavedContent(doc?.content || '')
  }, [doc?.content])

  const form = useForm<DocFormData>({
    resolver: zodResolver(docSchema),
    defaultValues: {
      topic_id: doc?.topic_id || (topics[0]?.id ?? ''),
      title: doc?.title || '',
      slug: doc?.slug || '',
      description: doc?.description || '',
      content: doc?.content || '',
      locale: doc?.locale || 'vi',
      order_index: doc?.order_index ?? 0,
      parent_id: doc?.parent_id ?? null,
      show_toc: doc?.show_toc ?? true,
    },
  })

  const handleTitleChange = (value: string) => {
    if (mode === 'create' && !isSlugManuallyEdited) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s/-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      form.setValue('slug', slug, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      })
    }
  }

  const onSubmit = async (data: DocFormData) => {
    try {
      setIsSaving(true)

      const payload = {
        topic_id: data.topic_id,
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        content: data.content,
        locale: data.locale,
        order_index: data.order_index ?? 0,
        parent_id: data.parent_id ?? null,
        show_toc: data.show_toc,
      }

      if (mode === 'create') {
        const created = await createDoc(payload)
        setLastSavedContent(payload.content)
        toast.success(t('messages.create_success'))
        router.push(`/${currentLocale}/admin/docs/${created.id}`)
      } else if (doc) {
        await updateDoc(doc.id, payload)
        setLastSavedContent(payload.content)
        toast.success(t('messages.update_success'))
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving doc:', error)
      const message =
        error instanceof Error && error.message
          ? error.message
          : t('messages.save_error')

      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const onInvalid = (errors: FieldErrors<DocFormData>) => {
    const firstError = Object.values(errors)[0]
    const message =
      firstError && typeof firstError.message === 'string'
        ? firstError.message
        : t('messages.save_error')

    toast.error(message)
  }

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      >
        <Card>
          <CardContent className="pt-6 space-y-4">
            <FormField
              control={form.control}
              name="topic_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.labels.topic')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('form.placeholders.topic')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics.map(topic => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.labels.title')} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.placeholders.title')}
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

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.labels.slug')} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.placeholders.slug')}
                      {...field}
                      onChange={e => {
                        setIsSlugManuallyEdited(true)
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.labels.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder={t('form.placeholders.description')}
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.labels.locale')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="vi">vi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order_index"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.labels.order_index')}</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        type="number"
                        {...field}
                        onChange={e => {
                          const value = e.target.value
                          field.onChange(value === '' ? 0 : Number(value))
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_toc"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>{t('form.labels.show_toc')}</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {t('form.help.show_toc')}
                      </p>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="p-6 pt-6 space-y-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.labels.content')} *</FormLabel>
                    <FormControl>
                      <div className="min-h-[500px] rounded-md border">
                        <MDXEditorWrapper
                          diffMarkdown={lastSavedContent}
                          onChange={field.onChange}
                          placeholder={t('form.placeholders.content')}
                          value={field.value}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button disabled={isSaving} type="submit">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('form.saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('actions.save')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
