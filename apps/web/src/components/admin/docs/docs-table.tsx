'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
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
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

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
import type { Doc } from '@/services/docs-service'
import { deleteDoc } from '@/app/actions/docs'
import { AdminPagination } from '@/components/admin/shared/admin-pagination'
import { AdminDateRangePicker } from '@/components/admin/shared/admin-date-range-picker'

export interface DocsTableProps {
  data: Doc[]
  page: number
  totalPages: number
  topics: Array<{ slug: string; name: string }>
  initialSearch: string
  initialTopic: string
}

export function DocsTable({
  data,
  page,
  totalPages,
  topics,
  initialSearch,
  initialTopic,
}: DocsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const locale = useMemo(() => {
    const match = pathname.match(/^\/([^/]+)(?:\/|$)/)
    return match?.[1] ?? 'vi'
  }, [pathname])
  const t = useTranslations('admin.docs')
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
    [pathname, router, searchParams]
  )

  const columns: ColumnDef<Doc>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          variant="ghost"
        >
          {t('table.columns.title')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const doc = row.original
        return (
          <div className="flex flex-col gap-1">
            <Link
              className="font-medium hover:underline"
              href={`/${locale}/admin/docs/${doc.id}`}
            >
              {doc.title}
            </Link>
            {doc.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {doc.description}
              </p>
            )}
          </div>
        )
      },
      // Keep first column left-aligned
    },
    {
      accessorKey: 'topic',
      header: t('table.columns.topic'),
      cell: ({ row }) => {
        const topicName = row.original.topic?.name
        return topicName || <span className="text-muted-foreground">-</span>
      },
      className: 'text-center',
    },
    {
      accessorKey: 'locale',
      header: t('table.columns.locale'),
      cell: ({ row }) => row.getValue('locale') || 'vi',
      className: 'text-center',
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <Button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          variant="ghost"
        >
          {t('table.columns.updated_at')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('updated_at') as string | null
        if (!date) return <span className="text-muted-foreground">-</span>
        return format(new Date(date), 'dd MMM yyyy', { locale: vi })
      },
      className: 'text-center',
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const doc = row.original

        const handleDelete = async () => {
          if (!confirm(t('messages.delete_confirm'))) return

          try {
            await deleteDoc(doc.id)
            toast.success(t('messages.delete_success'))
            router.refresh()
          } catch (error) {
            console.error('Error deleting doc:', error)
            toast.error(t('messages.delete_error'))
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">{t('actions.open_menu')}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('table.actions_label')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/docs/${doc.id}`}>
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
      className: 'text-center',
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          className="sm:max-w-sm"
          defaultValue={initialSearch}
          onChange={event => {
            updateQueryParam('search', event.target.value || null)
          }}
          placeholder={t('table.search_placeholder')}
        />

        <Select
          defaultValue={initialTopic || 'all'}
          onValueChange={value => {
            updateQueryParam('topic', value === 'all' ? null : value)
          }}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder={t('form.placeholders.topic')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {topics.map(topic => (
              <SelectItem key={topic.slug} value={topic.slug}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AdminDateRangePicker
          clearLabel={t('table.date_range_clear')}
          placeholder={t('table.date_range_placeholder')}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.className}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.className}
                    >
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
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  {t('table.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        nextAriaLabel={t('table.pagination.next')}
        nextLabel={t('table.pagination.next')}
        page={page}
        previousAriaLabel={t('table.pagination.previous')}
        previousLabel={t('table.pagination.previous')}
        totalPages={totalPages}
      />
    </div>
  )
}
