'use client'

import { useMemo, useState, useTransition } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function parseYyyyMmDd(value: string): Date | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (!match) return undefined

  const year = Number.parseInt(match[1] ?? '', 10)
  const month = Number.parseInt(match[2] ?? '', 10)
  const day = Number.parseInt(match[3] ?? '', 10)

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return undefined
  }

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return undefined

  return date
}

function formatYyyyMmDd(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export interface AdminDateRangePickerProps {
  className?: string
  placeholder: string
  clearLabel: string
  fromKey?: string
  toKey?: string
}

export function AdminDateRangePicker({
  className,
  placeholder,
  clearLabel,
  fromKey = 'from',
  toKey = 'to',
}: AdminDateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [open, setOpen] = useState(false)

  const selected = useMemo<DateRange | undefined>(() => {
    const from = parseYyyyMmDd(searchParams.get(fromKey) ?? '')
    const to = parseYyyyMmDd(searchParams.get(toKey) ?? '')

    if (!from && !to) return undefined
    return { from, to }
  }, [fromKey, searchParams, toKey])

  const label = useMemo(() => {
    if (selected?.from && selected?.to) {
      return `${selected.from.toLocaleDateString('vi-VN')} - ${selected.to.toLocaleDateString('vi-VN')}`
    }

    if (selected?.from) {
      return selected.from.toLocaleDateString('vi-VN')
    }

    return placeholder
  }, [placeholder, selected?.from, selected?.to])

  const updateRange = (range: DateRange | undefined) => {
    const next = new URLSearchParams(searchParams)

    if (range?.from) {
      next.set(fromKey, formatYyyyMmDd(range.from))
    } else {
      next.delete(fromKey)
    }

    if (range?.to) {
      next.set(toKey, formatYyyyMmDd(range.to))
    } else {
      next.delete(toKey)
    }

    next.delete('page')

    startTransition(() => {
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
      router.refresh()
    })
  }

  const clearRange = () => {
    const next = new URLSearchParams(searchParams)
    next.delete(fromKey)
    next.delete(toKey)
    next.delete('page')

    startTransition(() => {
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
      router.refresh()
      setOpen(false)
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            'w-full justify-between font-normal sm:w-[260px]',
            !selected?.from && 'text-muted-foreground',
            className
          )}
          variant="outline"
        >
          {label}
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto overflow-hidden p-0">
        <div className="flex items-center justify-end border-b p-2">
          <Button onClick={clearRange} size="sm" type="button" variant="ghost">
            {clearLabel}
          </Button>
        </div>
        <Calendar
          captionLayout="dropdown"
          mode="range"
          onSelect={range => updateRange(range)}
          selected={selected}
        />
      </PopoverContent>
    </Popover>
  )
}
