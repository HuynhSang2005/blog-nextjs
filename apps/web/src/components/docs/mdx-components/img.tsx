import Image from 'next/image'
import { cn } from '@/lib/utils'

export const img = ({
  alt,
  className,
  src,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  // Destructure to exclude height/width from props passed to Image component
  const { height, width, ...restProps } = props

  return (
    <Image
      alt={alt || ''}
      className={cn('rounded-md', className)}
      height={600}
      src={src as string}
      width={800}
      {...restProps}
    />
  )
}
