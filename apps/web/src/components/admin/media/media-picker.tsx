'use client'

import { useState, useEffect } from 'react'
import { CldImage } from 'next-cloudinary'
import { X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getAllMedia, getMediaById } from '@/app/actions/media'
import type { Tables } from '@/lib/supabase/database.types'

type MediaItem = Tables<'media'>

interface MediaPickerProps {
  selectedMediaId?: string | null
  onSelect: (mediaId: string | null) => void
  label?: string
  description?: string
  aspectRatio?: 'square' | 'video' | '16/9' | '4/3'
}

export function MediaPicker({
  selectedMediaId,
  onSelect,
  label = 'Chọn ảnh',
  description,
  aspectRatio = '16/9',
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)

  // Load media when dialog opens
  useEffect(() => {
    if (open) {
      loadMedia()
    }
  }, [open])

  // Load selected media details
  useEffect(() => {
    let cancelled = false

    const hydrateSelectedMedia = async () => {
      if (!selectedMediaId) {
        setSelectedMedia(null)
        return
      }

      const foundInCache = media.find((m) => m.id === selectedMediaId)
      if (foundInCache) {
        setSelectedMedia(foundInCache)
        return
      }

      // If the dialog hasn't been opened yet, we won't have `media` loaded.
      // Fetch just the selected item so the preview persists on reload/edit pages.
      const result = await getMediaById(selectedMediaId)
      if (cancelled) return

      if (result && result.resource_type === 'image') {
        setSelectedMedia(result)
      } else {
        setSelectedMedia(null)
      }
    }

    void hydrateSelectedMedia()

    return () => {
      cancelled = true
    }
  }, [selectedMediaId, media])

  const loadMedia = async () => {
    setLoading(true)
    try {
      const result = await getAllMedia()

      // Filter chỉ images
      const images = result.filter((m) => m.resource_type === 'image')
      setMedia(images)
    } catch (error) {
      console.error('Failed to load media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (item: MediaItem) => {
    setSelectedMedia(item)
    onSelect(item.id)
    setOpen(false)
  }

  const handleClear = () => {
    setSelectedMedia(null)
    onSelect(null)
  }

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'video':
        return 'aspect-video'
      case '16/9':
        return 'aspect-[16/9]'
      case '4/3':
        return 'aspect-[4/3]'
      default:
        return 'aspect-video'
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {selectedMedia && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-auto p-1 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Xóa ảnh</span>
          </Button>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Card
            className={cn(
              'relative overflow-hidden cursor-pointer border-2 border-dashed transition-colors',
              'hover:border-primary hover:bg-accent',
              selectedMedia && 'border-solid'
            )}
          >
            <div className={cn('w-full', getAspectClass())}>
              {selectedMedia ? (
                <CldImage
                  src={selectedMedia.public_id}
                  alt={selectedMedia.alt_text || 'Selected media'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <span className="text-sm">Nhấn để chọn ảnh</span>
                </div>
              )}
            </div>
          </Card>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chọn ảnh từ Media Library</DialogTitle>
            <DialogDescription>
              Chọn một ảnh từ thư viện media của bạn
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Đang tải media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Chưa có media nào</h3>
              <p className="text-sm text-muted-foreground">
                Tải media lên trước khi chọn
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    'relative cursor-pointer overflow-hidden transition-all',
                    'hover:ring-2 hover:ring-primary',
                    selectedMedia?.id === item.id && 'ring-2 ring-primary'
                  )}
                  onClick={() => handleSelect(item)}
                >
                  <div className="relative aspect-video bg-muted">
                    <CldImage
                      src={item.public_id}
                      alt={item.alt_text || 'Media'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  {item.alt_text && (
                    <div className="p-2 text-xs truncate">
                      {item.alt_text}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
