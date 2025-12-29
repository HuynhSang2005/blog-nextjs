'use client'

import { CldImage } from 'next-cloudinary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, GraduationCap, Trophy, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  event_type: 'education' | 'work' | 'achievement' | 'other'
  start_date: string
  end_date: string | null
  is_current: boolean
  icon: string | null
  media: {
    public_id: string
    alt_text: string | null
    width: number
    height: number
  } | null
  locale: string
  order_index: number
  created_at: string
}

interface TimelineProps {
  events: TimelineEvent[]
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case 'work':
      return Briefcase
    case 'education':
      return GraduationCap
    case 'achievement':
      return Trophy
    default:
      return Calendar
  }
}

function getEventColor(eventType: string) {
  switch (eventType) {
    case 'work':
      return 'bg-blue-500'
    case 'education':
      return 'bg-green-500'
    case 'achievement':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

interface TimelineEventCardProps {
  event: TimelineEvent
  index: number
  isLeft: boolean
}

function TimelineEventCard({ event, index, isLeft }: TimelineEventCardProps) {
  const t = useTranslations('about.timeline')
  const Icon = getEventIcon(event.event_type)
  const colorClass = getEventColor(event.event_type)

  // Format dates
  const startDate = format(new Date(event.start_date), 'MMM yyyy', { locale: vi })
  const endDate = event.is_current
    ? t('present')
    : event.end_date
      ? format(new Date(event.end_date), 'MMM yyyy', { locale: vi })
      : null

  const dateRange = endDate ? `${startDate} - ${endDate}` : startDate

  return (
    <div
      className={cn(
        'relative mb-12 flex items-center gap-8',
        isLeft ? 'flex-row' : 'flex-row-reverse',
        'animate-in fade-in slide-in-from-bottom-4',
        'md:flex-row' // On mobile, always left-aligned
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Content Card */}
      <div className="flex-1">
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <CardTitle className="text-xl">{event.title}</CardTitle>
                {event.subtitle && (
                  <p className="text-sm font-medium text-muted-foreground">
                    {event.subtitle}
                  </p>
                )}
              </div>
              <Badge variant="secondary" className="shrink-0">
                {t(`types.${event.event_type}`)}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              <Calendar className="mr-1 inline h-3 w-3" />
              {dateRange}
            </p>
          </CardHeader>

          {(event.description || event.media) && (
            <CardContent className="space-y-4">
              {event.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              )}

              {event.media && (
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <CldImage
                    src={event.media.public_id}
                    alt={event.media.alt_text || event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  />
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Timeline Dot - Hidden on mobile */}
      <div className="relative hidden shrink-0 md:flex md:items-center md:justify-center">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full border-4 border-background shadow-lg',
            colorClass
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Spacer for alternating layout - Hidden on mobile */}
      <div className="hidden flex-1 md:block" />
    </div>
  )
}

export function Timeline({ events }: TimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <p>Chưa có sự kiện nào trong timeline</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line - Hidden on mobile */}
      <div
        className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block"
        aria-hidden="true"
      />

      {/* Timeline Events */}
      <div className="space-y-8">
        {events.map((event, index) => (
          <TimelineEventCard
            key={event.id}
            event={event}
            index={index}
            isLeft={index % 2 === 0}
          />
        ))}
      </div>
    </div>
  )
}
