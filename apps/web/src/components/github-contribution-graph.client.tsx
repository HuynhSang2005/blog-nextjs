'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'

import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphLegend,
  type Labels,
  type Activity,
} from '@/components/kibo-ui/contribution-graph'

export interface GithubContributionGraphClientProps {
  contributions: Activity[]
  total: number
  labels: Labels
}

export function GithubContributionGraphClient({
  contributions,
  total,
  labels,
}: GithubContributionGraphClientProps) {
  const t = useTranslations('site.github_contribution_graph')
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as SVGElement
      if (target.tagName === 'rect' && target.hasAttribute('data-date')) {
        const date = target.getAttribute('data-date')
        const count = target.getAttribute('data-count')
        const level = target.getAttribute('data-level')

        if (date && count !== null && level !== null) {
          setHoveredActivity({
            date,
            count: Number(count),
            level: Number(level),
          })
          setTooltipPosition({ x: e.clientX, y: e.clientY })
        }
      } else {
        setHoveredActivity(null)
        setTooltipPosition(null)
      }
    }

    const handleMouseLeave = () => {
      setHoveredActivity(null)
      setTooltipPosition(null)
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <ContributionGraph
        blockMargin={3}
        blockSize={10}
        data={contributions}
        labels={labels}
        totalCount={total}
      >
        <ContributionGraphCalendar>
          {({ activity, dayIndex, weekIndex }) => (
            <ContributionGraphBlock
              activity={activity}
              dayIndex={dayIndex}
              weekIndex={weekIndex}
            />
          )}
        </ContributionGraphCalendar>

        <div className="mt-2 flex items-center justify-end">
          <ContributionGraphLegend />
        </div>
      </ContributionGraph>

      {hoveredActivity && tooltipPosition && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-md"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 40}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {(() => {
            const [year, month, day] = hoveredActivity.date.split('-')

            return t('tooltip_full', {
              count: hoveredActivity.count,
              day: day ? Number(day) : 0,
              month: month ? Number(month) : 0,
              year: year ? Number(year) : 0,
            })
          })()}
        </div>
      )}
    </div>
  )
}
