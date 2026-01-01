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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { deleteTag } from '@/app/actions/tags'
import { toast } from 'sonner'
import type { Database } from '@/lib/supabase/database.types'

type Tag = Database['public']['Tables']['tags']['Row'] & {
  usageCount?: number
}

interface TagsTableProps {
  tags: Tag[]
  onEdit: (tag: Tag) => void
  onDeleteSuccess: (id: string) => void
}

export function TagsTable({ tags, onEdit, onDeleteSuccess }: TagsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const columns: ColumnDef<Tag>[] = [
    {
      accessorKey: 'name',
      header: 'Tên thẻ',
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
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-sm">
          {row.getValue('slug')}
        </code>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => {
        const description = row.getValue('description') as string | null
        return description ? (
          <span className="text-sm text-muted-foreground">{description}</span>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            Chưa có mô tả
          </span>
        )
      },
    },
    {
      accessorKey: 'usageCount',
      header: 'Sử dụng',
      cell: ({ row }) => {
        const count = row.getValue('usageCount') as number
        return <Badge variant="secondary">{count || 0}</Badge>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const tag = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(tag)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setDeletingTag(tag)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
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
      toast.success('Đã xóa thẻ thành công')
      onDeleteSuccess(deletingTag.id)
      setDeleteDialogOpen(false)
      setDeletingTag(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa thẻ')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filter */}
        <Input
          className="max-w-sm"
          onChange={event =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          placeholder="Tìm kiếm thẻ..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
        />

        {/* Table */}
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
                    Chưa có thẻ nào.
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
            <AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn thẻ{' '}
              <strong>{deletingTag?.name}</strong>.
              {deletingTag?.usageCount && deletingTag.usageCount > 0 ? (
                <span className="mt-2 block text-destructive">
                  Thẻ này đang được sử dụng bởi {deletingTag.usageCount} bài
                  viết/dự án. Bạn cần gỡ thẻ khỏi các nội dung trước khi xóa.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || (deletingTag?.usageCount || 0) > 0}
              onClick={handleDelete}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
