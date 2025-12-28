/**
 * Media Uploader Component
 * Upload media to Cloudinary and save metadata to Supabase
 */

'use client'

import { useState } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createMedia } from '@/app/actions/media'

interface MediaUploaderProps {
  onUploadSuccess?: () => void
  folder?: string
  multiple?: boolean
}

export function MediaUploader({
  onUploadSuccess,
  folder = 'blog',
  multiple = true,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (result: CloudinaryUploadWidgetResults) => {
    if (result.event !== 'success' || !result.info || typeof result.info === 'string') {
      return
    }

    const info = result.info
    setIsUploading(true)

    try {
      // Save metadata to Supabase
      const mediaData = {
        public_id: info.public_id,
        version: info.version,
        resource_type: info.resource_type as 'image' | 'video' | 'raw',
        format: info.format,
        width: info.width,
        height: info.height,
        bytes: info.bytes,
        duration: info.duration,
        folder: folder,
        metadata: {
          colors: info.colors,
          phash: info.phash,
          url: info.secure_url,
        },
      }

      const response = await createMedia(mediaData)

      if (response.success) {
        toast.success('Upload thành công!')
        onUploadSuccess?.()
      } else {
        toast.error(response.error || 'Không thể lưu thông tin media')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Đã xảy ra lỗi khi upload')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME || 'blog_uploads'}
      options={{
        folder: folder,
        multiple: multiple,
        maxFiles: multiple ? 10 : 1,
        resourceType: 'auto',
        clientAllowedFormats: [
          'jpg',
          'jpeg',
          'png',
          'gif',
          'webp',
          'svg',
          'mp4',
          'webm',
          'mov',
        ],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        sources: ['local', 'url', 'camera'],
        showPoweredBy: false,
      }}
      onSuccess={handleUpload}
      onQueuesEnd={() => {
        setIsUploading(false)
      }}
    >
      {({ open }) => (
        <Button onClick={() => open()} disabled={isUploading} size="default">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang upload...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </>
          )}
        </Button>
      )}
    </CldUploadWidget>
  )
}
