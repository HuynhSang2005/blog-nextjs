'use client'

import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  useReactTable,
} from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { deleteTag } from '@/app/actions/tags'
import { toast } from 'sonner'
import type { Database } from '@/types/database'
import { useTranslations } from 'next-intl'

type Tag = Database['public']['Tables']['tags']['Row'] & {
  usageCount?: number
}

interface TagsTableProps {
  tags: Tag[]
  onEdit: (tag: Tag) => void
  onDeleteSuccess: (id: string) => void
}

export function TagsTable({ tags, onEdit, onDeleteSuccess }: TagsTableProps) {
  const t = useTranslations('admin.tags')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const columns: ColumnDef<Tag>[] = [
    {
      accessorKey: 'name',
      header: t('table.columns.name'),
      cell: ({ row }) => {
        const color = row.original.color
        return (
          <div className="flex items-center gap-2">
            {color && (
              <div
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: color }}
              />
            )}
            <span className="font-medium">{row.getValue('name')}</span>
          </div>
        )
      },
      // Keep first column left-aligned
    },
    {
      accessorKey: 'slug',
      header: t('table.columns.slug'),
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {row.getValue('slug')}
        </code>
      ),
      className: 'text-center',
    },
    {
      accessorKey: 'description',
      header: t('table.columns.description'),
      cell: ({ row }) => {
        const description = row.getValue('description') as string | null
        return description ? (
          <span className="text-sm text-muted-foreground">{description}</span>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            {t('table.empty_description')}
          </span>
        )
      },
      className: 'text-center',
    },
    {
      accessorKey: 'usageCount',
      header: t('table.columns.usage'),
      cell: ({ row }) => {
        const count = row.getValue('usageCount') as number
        return <Badge variant="secondary">{count || 0}</Badge>
      },
      className: 'text-center',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const tag = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">{t('actions.open_menu')}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(tag)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t('actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setDeletingTag(tag)
                  setDeleteDialogOpen(true)
                }}
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
    data: tags,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  const handleDelete = async () => {
    if (!deletingTag) return

    setIsDeleting(true)
    try {
      await deleteTag(deletingTag.id)
      toast.success(t('messages.delete_success'))
      onDeleteSuccess(deletingTag.id)
      setDeleteDialogOpen(false)
      setDeletingTag(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('messages.delete_error'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Table */}
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.confirm_description', { name: deletingTag?.name ?? '' })}
              {deletingTag?.usageCount && deletingTag.usageCount > 0 ? (
                <span className="mt-2 block text-destructive">
                  {t('delete.in_use', { count: deletingTag.usageCount })}
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || (deletingTag?.usageCount || 0) > 0}
              onClick={handleDelete}
            >
              {isDeleting ? t('actions.deleting') : t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
