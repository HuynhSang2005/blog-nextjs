'use client'

import {
  CldImage as NextCloudinaryImage,
  type CldImageProps,
} from 'next-cloudinary'

/**
 * Client wrapper cho next-cloudinary CldImage
 * CldImage nội bộ sử dụng React hooks nên cần 'use client' directive
 *
 * This wrapper allows CldImage to be used safely in Server Components
 * while maintaining all Cloudinary transformation capabilities
 */
export function CldImage(props: CldImageProps) {
  return <NextCloudinaryImage {...props} />
}
