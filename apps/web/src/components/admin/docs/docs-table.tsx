'use client'

import { useState } from 'react'
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
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, FileText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { DocListItem } from '@/lib/supabase/queries/docs'
import { deleteDoc } from '@/app/actions/docs'
import { toast } from 'sonner'

export function DocsTable({ data, locale }: { data: DocListItem[]; locale: string }) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [isDeleting, setIsDeleting] = useState(false)

  const columns: ColumnDef<DocListItem>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Tiêu đề
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const doc = row.original
        return (
          <div className="flex flex-col gap-1">
            <Link
              href={`/${locale}/admin/docs/${doc.id}`}
              className="font-medium hover:underline inline-flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
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
      header: 'Chủ đề',
      cell: ({ row }) => {
        const topic = row.original.topic
        return (
          <Badge variant="secondary" className="gap-1">
            {topic.icon && <span>{topic.icon}</span>}
            {topic.name}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        const topic = row.original.topic
        return value.includes(topic.slug)
      },
    },
    {
      accessorKey: 'parent',
      header: 'Trang cha',
      cell: ({ row }) => {
        const parent = row.original.parent
        if (!parent) {
          return <Badge variant="outline">Trang gốc</Badge>
        }
        return (
          <span className="text-sm text-muted-foreground">
            {parent.title}
          </span>
        )
      },
    },
    {
      accessorKey: 'order_index',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Thứ tự
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const order = row.getValue('order_index') as number | null
        return order ?? '-'
      },
    },
    {
      accessorKey: 'locale',
      header: 'Ngôn ngữ',
      cell: ({ row }) => {
        const locale = row.getValue('locale') as string
        return (
          <Badge variant="outline">
            {locale === 'vi' ? 'Tiếng Việt' : 'English'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Cập nhật
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
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

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(doc.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/docs/${doc.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc muốn xóa tài liệu "{doc.title}"? Hành động này không thể hoàn tác.
                      {doc.parent === null && (
                        <span className="block mt-2 text-destructive font-medium">
                          ⚠️ Tài liệu này là trang gốc và có thể có các trang con. Tất cả sẽ bị xóa.
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        setIsDeleting(true)
                        try {
                          await deleteDoc(doc.id, locale)
                          toast.success('Đã xóa tài liệu thành công')
                          router.refresh()
                        } catch (error) {
                          toast.error('Lỗi khi xóa tài liệu')
                          console.error(error)
                        } finally {
                          setIsDeleting(false)
                        }
                      }}
                      disabled={isDeleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Đang xóa...' : 'Xóa'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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

  // Get unique topics for filter
  const uniqueTopics = Array.from(new Set(data.map((doc) => doc.topic.slug)))
    .map((slug) => data.find((d) => d.topic.slug === slug)?.topic)
    .filter((topic): topic is DocListItem['topic'] => Boolean(topic))

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Tìm kiếm tài liệu..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={(table.getColumn('topic')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('topic')?.setFilterValue(value === 'all' ? '' : [value])
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn chủ đề" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chủ đề</SelectItem>
            {uniqueTopics.map((topic) => (
              <SelectItem key={topic.slug} value={topic.slug}>
                {topic.icon && <span className="mr-1">{topic.icon}</span>}
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
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
                  className="h-24 text-center"
                >
                  Không có tài liệu nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} tài liệu
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  )
}
