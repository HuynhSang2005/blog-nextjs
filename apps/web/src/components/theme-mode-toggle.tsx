'use client'

import { type PointerEvent, useMemo, useState } from 'react'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'

import { useIsMobile } from '@/lib/core/hooks/use-is-mobile'
import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from './ui/dropdown-menu'

interface ThemeModeToggleProps {
  messages: {
    dark: string
    light: string
    system: string
  }
}

export function ThemeModeToggle({ messages }: ThemeModeToggleProps) {
  const isMobile = useIsMobile()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const themes = useMemo(() => {
    return [
      { label: messages.dark, value: 'dark' },
      { label: messages.light, value: 'light' },
      { label: messages.system, value: 'system' },
    ]
  }, [messages])

  function openDropdown() {
    setOpen(() => true)
  }

  function closeDropdown(element: PointerEvent<HTMLElement>) {
    const target = element.relatedTarget as Element

    if ('closest' in target && target.closest('[role=menu]')) return

    setOpen(() => false)
  }

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-expanded={open}
          className="group pointer-events-auto relative flex w-fit gap-1 px-2 py-4"
          onClick={() => isMobile && openDropdown()}
          onPointerEnter={() => !isMobile && openDropdown()}
          onPointerLeave={event => !isMobile && closeDropdown(event)}
          variant="ghost"
        >
          <SunIcon className="size-[1.2rem] rotate-0 scale-100 transition-all dark:hidden dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="hidden size-[1.2rem] rotate-90 scale-0 transition-all dark:flex dark:rotate-0 dark:scale-100" />
          <ChevronDown className="size-3 transition duration-300 group-aria-expanded:rotate-180" />

          <span className="sr-only">Toggle theme</span>
          <span className="pointer-events-auto absolute z-10 block h-14 w-full" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="flex flex-col items-center"
        onCloseAutoFocus={e => e.preventDefault()}
        onPointerLeave={closeDropdown}
        role="menu"
      >
        <div className="w-full">
          {themes.map(({ label, value }) => (
            <DropdownMenuItem
              disabled={theme === value}
              key={value}
              onClick={() => setTheme(value)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
