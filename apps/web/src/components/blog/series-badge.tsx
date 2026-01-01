import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'

interface SeriesBadgeProps {
  seriesOrder: number
  className?: string
}

/**
 * Hiển thị series badge với part number
 * Displays simple series badge indicating post is part of a series
 */
export function SeriesBadge({ seriesOrder, className }: SeriesBadgeProps) {
  return (
    <Badge
      className={`${className} inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300`}
      variant="secondary"
    >
      <BookOpen className="h-3 w-3" />
      <span className="text-xs font-medium">Series</span>
      <span className="text-muted-foreground">•</span>
      <span className="text-xs">Phần {seriesOrder}</span>
    </Badge>
  )
}
