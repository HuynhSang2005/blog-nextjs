'use client'

import { useCallback, useState, useTransition } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BlogPostListItem } from '@/types/supabase-helpers'
import { deleteBlogPost } from '@/app/actions/blog'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { AdminPagination } from '@/components/admin/shared/admin-pagination'
import { AdminDateRangePicker } from '@/components/admin/shared/admin-date-range-picker'

export function BlogPostsTable({
  data,
  locale,
  page,
  totalPages,
  initialSearch,
  initialStatus,
}: {
  data: BlogPostListItem[]
  locale: string
  page: number
  totalPages: number
  initialSearch: string
  initialStatus: 'all' | 'draft' | 'published' | 'archived'
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const t = useTranslations('admin.blog')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const updateQueryParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams)
      if (!value) {
        next.delete(key)
      } else {
        next.set(key, value)
      }

      // Reset pagination when filters change
      next.delete('page')

      startTransition(() => {
        const qs = next.toString()
        router.replace(qs ? `${pathname}?${qs}` : pathname)
        router.refresh()
      })
    },
    [pathname, router, searchParams, startTransition]
  )

  const columns: ColumnDef<BlogPostListItem>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant="ghost"
          >
            {t('columns.title')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const post = row.original
        return (
          <div className="flex flex-col gap-1">
            <Link
              className="font-medium hover:underline"
              href={`/${locale}/admin/blog/${post.id}`}
            >
              {post.title}
            </Link>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {post.excerpt}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('columns.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as 'draft' | 'published' | 'archived'
        const variant =
          status === 'published'
            ? ('default' as const)
            : status === 'draft'
              ? ('secondary' as const)
              : ('outline' as const)

        return <Badge variant={variant}>{t(`status.${status}`)}</Badge>
      },
    },
    {
      accessorKey: 'author',
      header: t('columns.author'),
      cell: ({ row }) => {
        const author = row.original.author
        return author?.full_name || '-'
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <Button
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            variant="ghost"
          >
            {t('columns.created_at')}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string
        return format(new Date(date), 'dd MMM yyyy', { locale: vi })
      },
    },
    {
      accessorKey: 'published_at',
      header: t('columns.published_at'),
      cell: ({ row }) => {
        const date = row.getValue('published_at') as string | null
        if (!date) return <span className="text-muted-foreground">-</span>
        return format(new Date(date), 'dd MMM yyyy', { locale: vi })
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const post = row.original

        const handleDelete = async () => {
          if (!confirm(t('messages.delete_confirm'))) return

          try {
            await deleteBlogPost(post.id)
            toast.success(t('messages.delete_success'))
            router.refresh()
          } catch (error) {
            console.error('Error deleting post:', error)
            toast.error(t('messages.delete_error'))
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(post.slug)}
              >
                {t('actions.copy_slug')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/blog/${post.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('actions.edit')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          className="sm:max-w-sm"
          defaultValue={initialSearch}
          onChange={event => {
            updateQueryParam('search', event.target.value || null)
          }}
          placeholder={t('list.search_placeholder')}
        />

        <Select
          defaultValue={initialStatus}
          onValueChange={value => {
            updateQueryParam('status', value === 'all' ? null : value)
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t('list.filter_by_status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('status.all')}</SelectItem>
            <SelectItem value="draft">{t('status.draft')}</SelectItem>
            <SelectItem value="published">{t('status.published')}</SelectItem>
            <SelectItem value="archived">{t('status.archived')}</SelectItem>
          </SelectContent>
        </Select>

        <AdminDateRangePicker
          clearLabel={t('list.date_range_clear')}
          placeholder={t('list.date_range_placeholder')}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  data-state={row.getIsSelected() && 'selected'}
                  key={row.id}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                >
                  {t('list.no_posts')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        nextAriaLabel={t('pagination.next')}
        nextLabel={t('pagination.next')}
        page={page}
        previousAriaLabel={t('pagination.previous')}
        previousLabel={t('pagination.previous')}
        totalPages={totalPages}
      />

    </div>
  )
}
