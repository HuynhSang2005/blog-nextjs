'use client'

import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
import type { Doc } from '@/lib/queries/docs'
import { deleteDoc } from '@/app/actions/docs'

export function DocsTable({ data }: { data: Doc[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useMemo(() => {
    const match = pathname.match(/^\/([^/]+)(?:\/|$)/)
    return match?.[1] ?? 'vi'
  }, [pathname])
  const t = useTranslations('admin.docs')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

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
    },
    {
      accessorKey: 'topic',
      header: t('table.columns.topic'),
      cell: ({ row }) => {
        const topicName = row.original.topic?.name
        return topicName || <span className="text-muted-foreground">-</span>
      },
      filterFn: (row, id, value) => {
        const v = row.getValue(id)
        return typeof v === 'string' ? v.includes(value) : true
      },
    },
    {
      accessorKey: 'locale',
      header: t('table.columns.locale'),
      cell: ({ row }) => row.getValue('locale') || 'vi',
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
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
      <div className="flex items-center gap-2">
        <Input
          className="max-w-sm"
          onChange={event =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          placeholder={t('table.search_placeholder')}
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
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

      <div className="flex items-center justify-end space-x-2">
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          size="sm"
          variant="outline"
        >
          {t('table.pagination.previous')}
        </Button>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          size="sm"
          variant="outline"
        >
          {t('table.pagination.next')}
        </Button>
      </div>
    </div>
  )
}
