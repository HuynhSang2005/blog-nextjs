'use client'

import type { Day as WeekDay } from 'date-fns'
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  formatISO,
  getDay,
  getMonth,
  getYear,
  nextDay,
  parseISO,
  subWeeks,
} from 'date-fns'
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  Fragment,
  createContext,
  forwardRef,
  useContext,
  useMemo,
} from 'react'

import { cn } from '@/lib/utils'

export interface Activity {
  date: string
  count: number
  level: number
}

type Week = Array<Activity | undefined>

export interface Labels {
  months?: string[]
  weekdays?: string[]
  totalCount?: string
  legend?: {
    less?: string
    more?: string
  }
}

interface MonthLabel {
  weekIndex: number
  label: string
}

const DEFAULT_MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const DEFAULT_LABELS: Labels = {
  months: DEFAULT_MONTH_LABELS,
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  totalCount: '{{count}} hoạt động trong {{year}}',
  legend: {
    less: 'Ít',
    more: 'Nhiều',
  },
}

interface ContributionGraphContextType {
  data: Activity[]
  weeks: Week[]
  blockMargin: number
  blockRadius: number
  blockSize: number
  fontSize: number
  labels: Labels
  labelHeight: number
  maxLevel: number
  totalCount: number
  weekStart: WeekDay
  year: number
  width: number
  height: number
}

const ContributionGraphContext =
  createContext<ContributionGraphContextType | null>(null)

function useContributionGraph(): ContributionGraphContextType {
  const context = useContext(ContributionGraphContext)

  if (!context) {
    throw new Error(
      'ContributionGraph components must be used within a ContributionGraph'
    )
  }

  return context
}

function fillMissingDays(activities: Activity[]): Activity[] {
  if (activities.length === 0) return []

  const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0]
  const last = sorted.at(-1)
  if (!first || !last) return []

  const byDate = new Map<string, Activity>(activities.map(a => [a.date, a]))

  return eachDayOfInterval({
    start: parseISO(first.date),
    end: parseISO(last.date),
  }).map(day => {
    const date = formatISO(day, { representation: 'date' })

    const existing = byDate.get(date)
    if (existing) return existing

    return { date, count: 0, level: 0 }
  })
}

function groupByWeeks(activities: Activity[], weekStart: WeekDay = 0): Week[] {
  if (activities.length === 0) return []

  const normalized = fillMissingDays(activities)
  const first = normalized[0]
  if (!first) return []

  const firstDate = parseISO(first.date)
  const firstCalendarDate =
    getDay(firstDate) === weekStart
      ? firstDate
      : subWeeks(nextDay(firstDate, weekStart), 1)

  const padStart = differenceInCalendarDays(firstDate, firstCalendarDate)
  const padded: Array<Activity | undefined> = [
    ...new Array(padStart).fill(undefined),
    ...normalized,
  ]

  const weekCount = Math.ceil(padded.length / 7)
  return new Array(weekCount)
    .fill(undefined)
    .map((_, weekIndex) => padded.slice(weekIndex * 7, weekIndex * 7 + 7))
}

function getMonthLabels(
  weeks: Week[],
  monthNames: string[] = DEFAULT_MONTH_LABELS
): MonthLabel[] {
  return weeks
    .reduce<MonthLabel[]>((labels, week, weekIndex) => {
      const firstActivity = week.find(Boolean)
      if (!firstActivity) return labels

      const monthLabel = monthNames[getMonth(parseISO(firstActivity.date))]
      if (!monthLabel) return labels

      const prev = labels.at(-1)
      if (!prev || prev.label !== monthLabel) {
        return labels.concat({ weekIndex, label: monthLabel })
      }

      return labels
    }, [])
    .filter(({ weekIndex }, index, labels) => {
      const minWeeks = 3

      if (index === 0) {
        return !!labels[1] && labels[1].weekIndex - weekIndex >= minWeeks
      }

      if (index === labels.length - 1) {
        return weeks.slice(weekIndex).length >= minWeeks
      }

      return true
    })
}

export interface ContributionGraphProps extends HTMLAttributes<HTMLDivElement> {
  data: Activity[]
  blockMargin?: number
  blockRadius?: number
  blockSize?: number
  fontSize?: number
  labels?: Labels
  maxLevel?: number
  style?: CSSProperties
  totalCount?: number
  weekStart?: WeekDay
  children: ReactNode
  className?: string
}

export function ContributionGraph({
  data,
  blockMargin = 4,
  blockRadius = 2,
  blockSize = 12,
  fontSize = 14,
  labels: labelsProp,
  maxLevel: maxLevelProp = 4,
  style = {},
  totalCount: totalCountProp,
  weekStart = 0,
  className,
  ...props
}: ContributionGraphProps) {
  const maxLevel = Math.max(1, maxLevelProp)
  const weeks = useMemo(() => groupByWeeks(data, weekStart), [data, weekStart])

  const LABEL_MARGIN = 8
  const labels: Labels = { ...DEFAULT_LABELS, ...labelsProp }
  const labelHeight = fontSize + LABEL_MARGIN

  const firstActivity = data[0]
  const year = firstActivity
    ? getYear(parseISO(firstActivity.date))
    : new Date().getFullYear()

  const totalCount =
    typeof totalCountProp === 'number'
      ? totalCountProp
      : data.reduce((sum, activity) => sum + activity.count, 0)

  const width = weeks.length * (blockSize + blockMargin) - blockMargin
  const height = labelHeight + (blockSize + blockMargin) * 7 - blockMargin

  if (data.length === 0) return null

  return (
    <ContributionGraphContext.Provider
      value={{
        data,
        weeks,
        blockMargin,
        blockRadius,
        blockSize,
        fontSize,
        labels,
        labelHeight,
        maxLevel,
        totalCount,
        weekStart,
        year,
        width,
        height,
      }}
    >
      <div
        className={cn('flex w-full max-w-full flex-col gap-2', className)}
        style={{ fontSize, ...style }}
        {...props}
      />
    </ContributionGraphContext.Provider>
  )
}

export interface ContributionGraphBlockProps
  extends HTMLAttributes<SVGRectElement> {
  activity: Activity
  dayIndex: number
  weekIndex: number
}

export const ContributionGraphBlock = forwardRef<
  SVGRectElement,
  ContributionGraphBlockProps
>(function ContributionGraphBlock(
  { activity, dayIndex, weekIndex, className, ...props },
  ref
) {
  const { blockSize, blockMargin, blockRadius, labelHeight, maxLevel } =
    useContributionGraph()

  if (activity.level < 0 || activity.level > maxLevel) {
    throw new RangeError(
      `Provided activity level ${activity.level} for ${activity.date} is out of range. It must be between 0 and ${maxLevel}.`
    )
  }

  return (
    <rect
      className={cn(
        'stroke-[1px] stroke-border',
        'data-[level="0"]:fill-muted',
        'data-[level="1"]:fill-emerald-500/65 dark:data-[level="1"]:fill-emerald-400/50',
        'data-[level="2"]:fill-emerald-600/85 dark:data-[level="2"]:fill-emerald-400/70',
        'data-[level="3"]:fill-emerald-700/95 dark:data-[level="3"]:fill-emerald-400/90',
        'data-[level="4"]:fill-emerald-700 dark:data-[level="4"]:fill-emerald-400',
        className
      )}
      data-count={activity.count}
      data-date={activity.date}
      data-level={activity.level}
      height={blockSize}
      ref={ref}
      rx={blockRadius}
      ry={blockRadius}
      width={blockSize}
      x={(blockSize + blockMargin) * weekIndex}
      y={labelHeight + (blockSize + blockMargin) * dayIndex}
      {...props}
    />
  )
})

ContributionGraphBlock.displayName = 'ContributionGraphBlock'

export interface ContributionGraphCalendarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  hideMonthLabels?: boolean
  className?: string
  children: (props: {
    activity: Activity
    dayIndex: number
    weekIndex: number
  }) => ReactNode
}

export function ContributionGraphCalendar({
  hideMonthLabels = false,
  className,
  children,
  ...props
}: ContributionGraphCalendarProps) {
  const { weeks, width, height, blockSize, blockMargin, labels } =
    useContributionGraph()

  const monthLabels = useMemo(
    () => getMonthLabels(weeks, labels.months),
    [weeks, labels.months]
  )

  return (
    <div
      className={cn(
        'w-fit max-w-full overflow-x-auto overflow-y-hidden',
        className
      )}
      {...props}
    >
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: Tooltip hiển thị qua Radix trên từng block; <title> trong SVG tạo native tooltip chồng lên tooltip */}
      <svg
        className="block overflow-visible"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
      >
        {!hideMonthLabels && (
          <g className="fill-current">
            {monthLabels.map(({ label, weekIndex }) => (
              <text
                dominantBaseline="hanging"
                key={weekIndex}
                x={(blockSize + blockMargin) * weekIndex}
              >
                {label}
              </text>
            ))}
          </g>
        )}
        {weeks.map((week, weekIndex) =>
          week.map((activity, dayIndex) => {
            if (!activity) return null
            return (
              <Fragment key={activity.date}>
                {children({ activity, dayIndex, weekIndex })}
              </Fragment>
            )
          })
        )}
      </svg>
    </div>
  )
}

export interface ContributionGraphFooterProps
  extends HTMLAttributes<HTMLDivElement> {}

export function ContributionGraphFooter({
  className,
  ...props
}: ContributionGraphFooterProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-1 whitespace-nowrap sm:gap-x-4',
        className
      )}
      {...props}
    />
  )
}

export interface ContributionGraphTotalCountProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: (props: { totalCount: number; year: number }) => ReactNode
}

export function ContributionGraphTotalCount({
  className,
  children,
  ...props
}: ContributionGraphTotalCountProps) {
  const { totalCount, year, labels } = useContributionGraph()

  if (children) {
    return <>{children({ totalCount, year })}</>
  }

  const template = labels.totalCount
  const text = template
    ? template
        .replace('{{count}}', String(totalCount))
        .replace('{{year}}', String(year))
    : `${totalCount} hoạt động trong ${year}`

  return (
    <div className={cn('text-muted-foreground', className)} {...props}>
      {text}
    </div>
  )
}

export interface ContributionGraphLegendProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: (props: { level: number }) => ReactNode
}

export function ContributionGraphLegend({
  className,
  children,
  ...props
}: ContributionGraphLegendProps) {
  const { labels, maxLevel, blockSize, blockRadius } = useContributionGraph()
  const levels = Array.from({ length: maxLevel + 1 }, (_, i) => i)

  return (
    <div
      className={cn('ml-auto flex items-center gap-[3px]', className)}
      {...props}
    >
      <span className="mr-1 text-muted-foreground">
        {labels.legend?.less || 'Ít'}
      </span>
      {levels.map(level =>
        children ? (
          <Fragment key={`level-${level}`}>{children({ level })}</Fragment>
        ) : (
          <svg height={blockSize} key={`level-${level}`} width={blockSize}>
            <title>{`${level} đóng góp`}</title>
            <rect
              className={cn(
                'stroke-[1px] stroke-border',
                'data-[level="0"]:fill-muted',
                'data-[level="1"]:fill-emerald-500/65 dark:data-[level="1"]:fill-emerald-400/50',
                'data-[level="2"]:fill-emerald-600/85 dark:data-[level="2"]:fill-emerald-400/70',
                'data-[level="3"]:fill-emerald-700/95 dark:data-[level="3"]:fill-emerald-400/90',
                'data-[level="4"]:fill-emerald-700 dark:data-[level="4"]:fill-emerald-400'
              )}
              data-level={level}
              height={blockSize}
              rx={blockRadius}
              ry={blockRadius}
              width={blockSize}
            />
          </svg>
        )
      )}
      <span className="ml-1 text-muted-foreground">
        {labels.legend?.more || 'Nhiều'}
      </span>
    </div>
  )
}
