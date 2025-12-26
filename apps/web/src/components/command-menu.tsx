'use client'

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import type { AlertDialogProps } from '@radix-ui/react-alert-dialog'
import { useRouter } from '@/navigation'
import { useTheme } from 'next-themes'
import { useLocale } from 'next-intl'

import {
  SunIcon,
  FileIcon,
  MoonIcon,
  CircleIcon,
  LaptopIcon,
  FileTextIcon,
} from '@radix-ui/react-icons'

import { useBlogConfig } from '@/lib/core/hooks/use-blog-config'
import { useDocsConfig } from '@/lib/core/hooks/use-docs-config'
import { getObjectValueByLocale } from '@/lib/core/utils/locale'
import type { NavItemWithChildren } from '@/lib/core/types/nav'
import { allBlogs } from 'contentlayer/generated'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command'

function DocsCommandMenu({
  runCommand,
  messages,
}: {
  runCommand: (command: () => unknown) => void
  messages: {
    docs: string
  }
}) {
  const router = useRouter()
  const docsConfig = useDocsConfig()

  function renderItems(items: NavItemWithChildren[]) {
    return items.map(navItem => {
      if (!navItem.href) {
        return (
          <Fragment
            key={getObjectValueByLocale(
              navItem.title,
              docsConfig.currentLocale
            )}
          >
            <CommandGroup
              heading={getObjectValueByLocale(
                navItem.title,
                docsConfig.currentLocale
              )}
            >
              {renderItems(navItem.items)}
            </CommandGroup>
          </Fragment>
        )
      }

      return (
        <Fragment key={navItem.href}>
          <CommandItem
            onSelect={() => {
              runCommand(() => router.push(navItem.href as string))
            }}
            value={getObjectValueByLocale(
              navItem.title,
              docsConfig.currentLocale
            )}
          >
            <div className="mr-2 flex size-4 items-center justify-center">
              <CircleIcon className="size-3" />
            </div>

            {getObjectValueByLocale(navItem.title, docsConfig.currentLocale)}
          </CommandItem>

          {navItem?.items?.length > 0 && (
            <CommandGroup>{renderItems(navItem.items)}</CommandGroup>
          )}
        </Fragment>
      )
    })
  }

  return (
    <CommandGroup heading={messages.docs}>
      {docsConfig.docs.sidebarNav.map(group => (
        <CommandGroup
          heading={getObjectValueByLocale(
            group.title,
            docsConfig.currentLocale
          )}
          key={getObjectValueByLocale(group.title, docsConfig.currentLocale)}
        >
          {renderItems(group.items)}
        </CommandGroup>
      ))}
    </CommandGroup>
  )
}

function BlogCommandMenu({
  runCommand,
  messages,
}: {
  runCommand: (command: () => unknown) => void
  messages: {
    blog: string
  }
}) {
  const router = useRouter()
  const locale = useLocale()

  const posts = useMemo(() => {
    return allBlogs.filter(post => {
      const [postLocale] = post.slugAsParams.split('/')

      return postLocale === locale
    })
  }, [locale])

  return (
    <CommandGroup heading={messages.blog}>
      {posts.map(post => (
        <CommandItem
          key={post._id}
          onSelect={() => {
            const [, ...slugs] = post.slugAsParams.split('/')
            const slug = slugs.join('/')

            runCommand(() => router.push(`/blog/${slug}`))
          }}
          value={`${post.title} ${post.excerpt} ${post.tags.join(' ')}`}
        >
          <div className="mx-1 flex size-4 items-center justify-center">
            <FileTextIcon className="size-4" />
          </div>

          <div className="flex flex-col gap-1 p-2 w-full">
            <h1 className="text-lg">{post.title}</h1>
            <p className="truncate">{post.excerpt}</p>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

interface CommandMenuProps extends AlertDialogProps {
  messages: {
    docs: string
    blog: string
    search: string
    noResultsFound: string
    searchDocumentation: string
    typeCommandOrSearch: string

    themes: {
      theme: string
      dark: string
      light: string
      system: string
    }
  }
}

export function CommandMenu({ messages, ...props }: CommandMenuProps) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const docsConfig = useDocsConfig()
  const blogConfig = useBlogConfig()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)

    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  const mainNavs = useMemo(
    () => [...docsConfig.docs.mainNav, ...blogConfig.blog.mainNav],
    [docsConfig, blogConfig]
  )

  return (
    <>
      <Button
        className={cn(
          'bg-card-primary text-muted-foreground relative h-8 w-full justify-start rounded-lg text-sm font-normal shadow-none sm:pr-12 md:w-40 lg:w-64'
        )}
        onClick={() => setOpen(true)}
        variant="outline"
        {...props}
      >
        <span className="hidden lg:inline-flex">
          {messages.searchDocumentation}...
        </span>

        <span className="inline-flex lg:hidden">{messages.search}...</span>

        <kbd className="bg-muted pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder={`${messages.typeCommandOrSearch}...`} />

        <CommandList>
          <CommandEmpty>{messages.noResultsFound}.</CommandEmpty>

          <CommandGroup heading="Links">
            {mainNavs
              .filter(navitem => !navitem.external)
              .map(navItem => (
                <CommandItem
                  key={navItem.href}
                  onSelect={() =>
                    runCommand(() => router.push(navItem.href as string))
                  }
                  value={getObjectValueByLocale(
                    navItem.title,
                    docsConfig.currentLocale
                  )}
                >
                  <FileIcon className="mr-2 size-4" />

                  {getObjectValueByLocale(
                    navItem.title,
                    docsConfig.currentLocale
                  )}
                </CommandItem>
              ))}
          </CommandGroup>

          <DocsCommandMenu
            messages={{
              docs: messages.docs,
            }}
            runCommand={runCommand}
          />

          <CommandSeparator className="my-1" />

          <BlogCommandMenu
            messages={{
              blog: messages.blog,
            }}
            runCommand={runCommand}
          />

          <CommandSeparator className="my-1" />

          <CommandGroup heading={messages.themes.theme}>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <SunIcon className="mr-2 size-4" />
              {messages.themes.light}
            </CommandItem>

            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <MoonIcon className="mr-2 size-4" />
              {messages.themes.dark}
            </CommandItem>

            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <LaptopIcon className="mr-2 size-4" />
              {messages.themes.system}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
