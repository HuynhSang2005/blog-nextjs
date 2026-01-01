'use client'

import { useState, useEffect } from 'react'
import { CldImage, CldUploadWidget } from 'next-cloudinary'
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Upload, GripVertical, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

/**
 * GalleryManager - Quản lý gallery cho project
 * Hỗ trợ upload, reorder, delete images với captions
 */

interface GalleryItem {
  id: string // project_media.id
  media_id: string
  public_id: string // Cloudinary public_id
  alt_text: string
  caption: string
  order_index: number
}

interface GalleryManagerProps {
  initialGallery?: GalleryItem[]
  onGalleryChange?: (gallery: GalleryItem[]) => void
  maxImages?: number
  projectId?: string
}

export function GalleryManager({
  initialGallery = [],
  onGalleryChange,
  maxImages = 10,
}: GalleryManagerProps) {
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery)
  const [isUploading, setIsUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Sync gallery changes to parent
  useEffect(() => {
    onGalleryChange?.(gallery)
  }, [gallery, onGalleryChange])

  const handleUpload = async (result: CloudinaryUploadWidgetResults) => {
    if (
      result.event !== 'success' ||
      !result.info ||
      typeof result.info === 'string'
    )
      return

    setIsUploading(true)
    try {
      const info = result.info

      // Add to gallery (temporary - will be saved to DB on form submit)
      const newItem: GalleryItem = {
        id: `temp-${Date.now()}`, // Temporary ID
        media_id: '', // Will be created when form submits
        public_id: info.public_id,
        alt_text: info.original_filename || '',
        caption: '',
        order_index: gallery.length,
      }

      setGallery(prev => [...prev, newItem])
      toast.success('Đã thêm ảnh vào gallery')
    } catch (error) {
      console.error('Error adding image to gallery:', error)
      toast.error('Lỗi khi thêm ảnh')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCaptionChange = (index: number, caption: string) => {
    setGallery(prev =>
      prev.map((item, i) => (i === index ? { ...item, caption } : item))
    )
  }

  const handleRemove = (index: number) => {
    setGallery(prev => {
      const updated = prev.filter((_, i) => i !== index)
      // Reorder indices
      return updated.map((item, i) => ({ ...item, order_index: i }))
    })
    toast.success('Đã xóa ảnh khỏi gallery')
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newGallery = [...gallery]
    const draggedItem = newGallery[draggedIndex]
    if (!draggedItem) return
    newGallery.splice(draggedIndex, 1)
    newGallery.splice(index, 0, draggedItem)

    // Update order indices
    const reorderedGallery = newGallery.map((item, i) => ({
      ...item,
      order_index: i,
    }))

    setGallery(reorderedGallery)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const canAddMore = gallery.length < maxImages

  return (
    <div className="space-y-4">
      {/* Gallery Grid */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {gallery.map((item, index) => (
            <Card
              className={cn(
                'cursor-move transition-shadow hover:shadow-lg',
                draggedIndex === index && 'opacity-50'
              )}
              draggable
              key={item.id}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, index)}
              onDragStart={() => handleDragStart(index)}
            >
              <CardContent className="p-2">
                {/* Image */}
                <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                  <CldImage
                    alt={item.alt_text || `Gallery image ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    src={item.public_id}
                  />

                  {/* Remove Button */}
                  <Button
                    className="absolute right-1 top-1 h-7 w-7"
                    onClick={() => handleRemove(index)}
                    size="icon"
                    type="button"
                    variant="destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Drag Handle */}
                  <div className="absolute left-1 top-1 rounded bg-background/80 p-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Order Badge */}
                  <div className="absolute bottom-1 left-1 rounded bg-background/80 px-2 py-0.5 text-xs font-medium">
                    #{index + 1}
                  </div>
                </div>

                {/* Caption Input */}
                <Input
                  className="mt-2 h-8 text-sm"
                  onChange={e => handleCaptionChange(index, e.target.value)}
                  placeholder="Mô tả ảnh (không bắt buộc)"
                  type="text"
                  value={item.caption}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {canAddMore && (
        <CldUploadWidget
          onSuccess={handleUpload}
          options={{
            folder: 'projects/gallery',
            maxFiles: 1,
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
          }}
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME}
        >
          {({ open }) => (
            <Button
              className="w-full"
              disabled={isUploading}
              onClick={() => open()}
              type="button"
              variant="outline"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Thêm ảnh vào gallery ({gallery.length}/{maxImages})
                </>
              )}
            </Button>
          )}
        </CldUploadWidget>
      )}

      {/* Info */}
      {gallery.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Chưa có ảnh trong gallery. Click để upload.
        </p>
      )}

      {!canAddMore && (
        <p className="text-center text-sm text-muted-foreground">
          Đã đạt giới hạn {maxImages} ảnh
        </p>
      )}
    </div>
  )
}
