'use client'

import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { type PointerEvent, useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'

import { useIsMobile } from '@/lib/core/hooks/use-is-mobile'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { useRouter } from '@/navigation'

interface VersionDropdownProps {
  messages: {
    changelog: string
  }
}

export function VersionDropdown({ messages }: VersionDropdownProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

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
          className="group pointer-events-auto relative flex w-fit gap-1 px-2"
          onClick={() => isMobile && openDropdown()}
          onPointerEnter={() => !isMobile && openDropdown()}
          onPointerLeave={event => !isMobile && closeDropdown(event)}
          variant="ghost"
        >
          <span className="">v{siteConfig.app.latestVersion}</span>

          <ChevronDown className="size-3 transition duration-300 group-aria-expanded:rotate-180" />

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
          <DropdownMenuItem onClick={() => router.push('/docs/changelog')}>
            {messages.changelog} <ArrowUpRight className="ml-1 size-3" />
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
