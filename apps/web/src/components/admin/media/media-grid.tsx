/**
 * Media Grid Component
 * Displays media items in a responsive grid with actions
 */

'use client'

import { useState } from 'react'
import { CldImage } from 'next-cloudinary'
import { Copy, Trash2, Edit, FileVideo, FileIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { deleteMedia, updateMedia } from '@/app/actions/media'

export interface MediaItem {
  id: string
  public_id: string
  resource_type: 'image' | 'video' | 'raw'
  format: string | null
  width: number | null
  height: number | null
  bytes: number | null
  alt_text: string | null
  caption: string | null
  uploaded_at: string | null
  metadata: unknown | null
}

interface MediaGridProps {
  media: MediaItem[]
  onRefresh?: () => void
}

export function MediaGrid({ media, onRefresh }: MediaGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editForm, setEditForm] = useState({
    alt_text: '',
    caption: '',
  })

  const handleCopyUrl = (publicId: string) => {
    const url = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`
    navigator.clipboard.writeText(url)
    toast.success('URL đã được sao chép vào clipboard')
  }

  const handleDelete = async () => {
    if (!selectedMedia) return

    setIsDeleting(true)
    try {
      const result = await deleteMedia(selectedMedia.id)

      if (result.success) {
        toast.success('Đã xóa media')
        setDeleteDialogOpen(false)
        onRefresh?.()
      } else {
        toast.error(result.error || 'Không thể xóa media')
      }
    } catch (_error) {
      toast.error('Đã xảy ra lỗi khi xóa media')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (item: MediaItem) => {
    setSelectedMedia(item)
    setEditForm({
      alt_text: item.alt_text || '',
      caption: item.caption || '',
    })
    setEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedMedia) return

    setIsUpdating(true)
    try {
      const result = await updateMedia(selectedMedia.id, editForm)

      if (result.success) {
        toast.success('Đã cập nhật media')
        setEditDialogOpen(false)
        onRefresh?.()
      } else {
        toast.error(result.error || 'Không thể cập nhật media')
      }
    } catch (_error) {
      toast.error('Đã xảy ra lỗi khi cập nhật media')
    } finally {
      setIsUpdating(false)
    }
  }

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Chưa có media nào</h3>
        <p className="text-sm text-muted-foreground">
          Upload media đầu tiên bằng nút Upload ở trên
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {media.map(item => (
          <Card className="group overflow-hidden" key={item.id}>
            <div className="relative aspect-square bg-muted">
              {item.resource_type === 'image' ? (
                <CldImage
                  alt={item.alt_text || 'Media'}
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  src={item.public_id}
                />
              ) : item.resource_type === 'video' ? (
                <div className="flex items-center justify-center h-full">
                  <FileVideo className="h-12 w-12 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FileIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  onClick={() => handleCopyUrl(item.public_id)}
                  size="icon"
                  title="Sao chép URL"
                  variant="secondary"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleEdit(item)}
                  size="icon"
                  title="Chỉnh sửa"
                  variant="secondary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setSelectedMedia(item)
                    setDeleteDialogOpen(true)
                  }}
                  size="icon"
                  title="Xóa"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3">
              <p
                className="text-sm font-medium truncate"
                title={item.public_id}
              >
                {item.public_id.split('/').pop()}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground uppercase">
                  {item.format || item.resource_type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(item.bytes)}
                </span>
              </div>
              {item.width && item.height && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.width} × {item.height}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Dialog */}
      <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa media này? Hành động này không thể hoàn tác.
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                Lưu ý: File sẽ chỉ bị xóa khỏi database, không xóa khỏi
                Cloudinary.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outline"
            >
              Hủy
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              variant="destructive"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog onOpenChange={setEditDialogOpen} open={editDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa media</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin mô tả cho media
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alt_text">Alt Text</Label>
              <Input
                id="alt_text"
                onChange={e =>
                  setEditForm({ ...editForm, alt_text: e.target.value })
                }
                placeholder="Mô tả ngắn gọn cho ảnh"
                value={editForm.alt_text}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditForm({ ...editForm, caption: e.target.value })
                }
                placeholder="Chú thích chi tiết (tùy chọn)"
                rows={3}
                value={editForm.caption}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setEditDialogOpen(false)} variant="outline">
              Hủy
            </Button>
            <Button disabled={isUpdating} onClick={handleUpdate}>
              {isUpdating ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
