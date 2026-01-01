'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TagsTable } from '@/components/admin/tags/tags-table'
import { TagDialog } from '@/components/admin/tags/tag-dialog'
import type { Database } from '@/lib/supabase/database.types'

type Tag = Database['public']['Tables']['tags']['Row'] & {
  usageCount?: number
}

interface TagsClientProps {
  initialTags: Tag[]
}

export function TagsClient({ initialTags }: TagsClientProps) {
  const [tags, setTags] = useState(initialTags)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const handleCreateSuccess = (newTag: Tag) => {
    setTags([...tags, { ...newTag, usageCount: 0 }])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateSuccess = (updatedTag: Tag) => {
    setTags(
      tags.map(tag =>
        tag.id === updatedTag.id
          ? { ...updatedTag, usageCount: tag.usageCount }
          : tag
      )
    )
    setEditingTag(null)
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setTags(tags.filter(tag => tag.id !== deletedId))
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Tổng số: <strong>{tags.length}</strong> thẻ
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo thẻ mới
        </Button>
      </div>

      <TagsTable
        onDeleteSuccess={handleDeleteSuccess}
        onEdit={tag => setEditingTag(tag)}
        tags={tags}
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
