'use client'

import { useCallback, useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { TagsTable } from '@/components/admin/tags/tags-table'
import { TagDialog } from '@/components/admin/tags/tag-dialog'
import type { Database } from '@/types/database'
import { Input } from '@/components/ui/input'
import { AdminPagination } from '@/components/admin/shared/admin-pagination'
import { AdminDateRangePicker } from '@/components/admin/shared/admin-date-range-picker'

type Tag = Database['public']['Tables']['tags']['Row'] & {
  usageCount?: number
}

interface TagsClientProps {
  tags: Tag[]
  totalItems: number
  page: number
  totalPages: number
  initialSlug: string
}

export function TagsClient({
  tags,
  totalItems,
  page,
  totalPages,
  initialSlug,
}: TagsClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const t = useTranslations('admin.tags')

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const updateQueryParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams)
      if (!value) {
        next.delete(key)
      } else {
        next.set(key, value)
      }

      // Reset pagination when filters change
      next.delete('page')

      startTransition(() => {
        const qs = next.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname)
        router.refresh()
      })
    },
    [pathname, router, searchParams, startTransition]
  )

  const handleCreateSuccess = (_newTag: Tag) => {
    setIsCreateDialogOpen(false)
    router.refresh()
  }

  const handleUpdateSuccess = (_updatedTag: Tag) => {
    setEditingTag(null)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('list.total')}: <strong>{totalItems}</strong>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.create')}
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          className="sm:max-w-sm"
          defaultValue={initialSlug}
          onChange={e => updateQueryParam('slug', e.target.value || null)}
          placeholder={t('list.filters.slug_placeholder')}
        />
        <AdminDateRangePicker
          clearLabel={t('list.filters.date_range_clear')}
          placeholder={t('list.filters.date_range_placeholder')}
        />
      </div>

      <TagsTable
        onDeleteSuccess={() => router.refresh()}
        onEdit={tag => setEditingTag(tag)}
        tags={tags}
      />

      <AdminPagination
        nextAriaLabel={t('pagination.next')}
        nextLabel={t('pagination.next')}
        page={page}
        previousAriaLabel={t('pagination.previous')}
        previousLabel={t('pagination.previous')}
        totalPages={totalPages}
      />

      {/* Create Dialog */}
      <TagDialog
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        open={isCreateDialogOpen}
      />

      {/* Edit Dialog */}
      {editingTag && (
        <TagDialog
          onOpenChange={open => !open && setEditingTag(null)}
          onSuccess={handleUpdateSuccess}
          open={!!editingTag}
          tag={editingTag}
        />
      )}
    </>
  )
}
