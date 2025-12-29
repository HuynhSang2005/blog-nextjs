'use client'

import { useState, useEffect } from 'react'
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
  }, [lightboxOpen, selectedIndex])

  const handlePrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? sortedMedia.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === sortedMedia.length - 1 ? 0 : prev + 1
    )
  }

  // Ensure we have a valid selected media
  if (sortedMedia.length === 0) {
    return null
  }

  const currentMedia = sortedMedia[selectedIndex]!

  return (
    <div className="space-y-6">
      {/* Main Image Viewer */}
      <div
        className="relative aspect-video overflow-hidden rounded-xl border bg-muted cursor-pointer group"
        onClick={() => setLightboxOpen(true)}
      >
        <CldImage
          src={currentMedia.media.public_id}
          alt={currentMedia.media.alt_text || 'Project image'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <p className="text-white text-sm font-medium">
            Nhấn để xem lớn hơn
          </p>
        </div>
      </div>

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
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Thumbnails */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-3">
              {sortedMedia.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    'relative aspect-video w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                    selectedIndex === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-primary/50'
                  )}
                >
                  <CldImage
                    src={item.media.public_id}
                    alt={item.media.alt_text || `Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            aria-label="Next image"
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
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl p-0 bg-black/95">
          <DialogTitle className="sr-only">
            {currentMedia.media.alt_text || 'Project image'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {currentMedia.caption || 'Full size project image'}
          </DialogDescription>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Buttons */}
          {sortedMedia.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Large Image */}
          <div className="relative aspect-video w-full max-h-[90vh]">
            <CldImage
              src={currentMedia.media.public_id}
              alt={currentMedia.media.alt_text || 'Project image'}
              fill
              className="object-contain"
              sizes="100vw"
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
