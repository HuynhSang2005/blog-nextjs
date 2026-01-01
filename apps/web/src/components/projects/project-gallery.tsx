'use client'

import { useCallback, useEffect, useState } from 'react'
import { CldImage } from 'next-cloudinary'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ProjectGalleryProps {
  media: Array<{
    order_index: number
    caption: string | null
    media: {
      public_id: string
      alt_text: string | null
      width: number | null
      height: number | null
    }
  }>
}

export function ProjectGallery({ media }: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Sort media by order_index
  const sortedMedia = [...media].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  )

  const total = sortedMedia.length

  const handlePrevious = useCallback(() => {
    setSelectedIndex(prev => (prev === 0 ? total - 1 : prev - 1))
  }, [total])

  const handleNext = useCallback(() => {
    setSelectedIndex(prev => (prev === total - 1 ? 0 : prev + 1))
  }, [total])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNext()
          break
        case 'Escape':
          e.preventDefault()
          setLightboxOpen(false)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, handleNext, handlePrevious])

  // Ensure we have a valid selected media
  if (sortedMedia.length === 0) {
    return null
  }

  const currentMedia = sortedMedia[selectedIndex]
  if (!currentMedia) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Main Image Viewer */}
      <button
        aria-label="Xem ảnh lớn hơn"
        className="relative aspect-video overflow-hidden rounded-xl border bg-muted cursor-pointer group"
        onClick={() => setLightboxOpen(true)}
        type="button"
      >
        <CldImage
          alt={currentMedia.media.alt_text || 'Ảnh dự án'}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          src={currentMedia.media.public_id}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <p className="text-white text-sm font-medium">Nhấn để xem lớn hơn</p>
        </div>
      </button>

      {/* Caption */}
      {currentMedia.caption && (
        <p className="text-sm text-muted-foreground text-center">
          {currentMedia.caption}
        </p>
      )}

      {/* Thumbnail Navigation */}
      {sortedMedia.length > 1 && (
        <div className="flex items-center gap-4">
          {/* Previous Button */}
          <Button
            aria-label="Ảnh trước"
            onClick={handlePrevious}
            size="icon"
            variant="outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Thumbnails */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-3">
              {sortedMedia.map((item, index) => (
                <button
                  className={cn(
                    'relative aspect-video w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                    selectedIndex === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-primary/50'
                  )}
                  key={`${item.media.public_id}-${item.order_index}`}
                  onClick={() => setSelectedIndex(index)}
                  type="button"
                >
                  <CldImage
                    alt={item.media.alt_text || `Ảnh thu nhỏ ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="96px"
                    src={item.media.public_id}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <Button
            aria-label="Ảnh sau"
            onClick={handleNext}
            size="icon"
            variant="outline"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Image Counter */}
      {sortedMedia.length > 1 && (
        <p className="text-sm text-muted-foreground text-center">
          {selectedIndex + 1} / {sortedMedia.length}
        </p>
      )}

      {/* Lightbox Dialog */}
      <Dialog onOpenChange={setLightboxOpen} open={lightboxOpen}>
        <DialogContent className="max-w-7xl p-0 bg-black/95">
          <DialogTitle className="sr-only">
            {currentMedia.media.alt_text || 'Ảnh dự án'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {currentMedia.caption || 'Ảnh dự án kích thước đầy đủ'}
          </DialogDescription>

          {/* Close Button */}
          <Button
            className="absolute right-4 top-4 z-50 text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
            size="icon"
            variant="ghost"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Buttons */}
          {sortedMedia.length > 1 && (
            <>
              <Button
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={e => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                size="icon"
                variant="ghost"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={e => {
                  e.stopPropagation()
                  handleNext()
                }}
                size="icon"
                variant="ghost"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Large Image */}
          <div className="relative aspect-video w-full max-h-[90vh]">
            <CldImage
              alt={currentMedia.media.alt_text || 'Ảnh dự án'}
              className="object-contain"
              fill
              sizes="100vw"
              src={currentMedia.media.public_id}
            />
          </div>

          {/* Caption in Lightbox */}
          {currentMedia.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-white text-center">{currentMedia.caption}</p>
            </div>
          )}

          {/* Image Counter in Lightbox */}
          {sortedMedia.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm">
              {selectedIndex + 1} / {sortedMedia.length}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
