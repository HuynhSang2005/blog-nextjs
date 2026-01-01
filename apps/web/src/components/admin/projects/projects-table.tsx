'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { deleteProject } from '@/app/actions/projects'
import { toast } from 'sonner'

type Media = Database['public']['Tables']['media']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type ProjectWithRelations = Project & {
  cover_media: Media | null
  og_media: Media | null
}

interface ProjectsTableProps {
  projects: ProjectWithRelations[]
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('admin.projects')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  const columns: ColumnDef<ProjectWithRelations>[] = [
    {
      accessorKey: 'title',
      header: t('table.title'),
      cell: ({ row }) => {
        const isFeatured = row.original.featured
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.getValue('title')}</span>
            {isFeatured && (
              <Badge className="text-xs" variant="secondary">
                {t('form.featured')}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const statusVariant = {
          in_progress: 'secondary',
          completed: 'default',
          archived: 'outline',
        }[status] as 'default' | 'secondary' | 'outline'

        return <Badge variant={statusVariant}>{t(`status.${status}`)}</Badge>
      },
      filterFn: (row, id, value) => {
        return value === 'all' || row.getValue(id) === value
      },
    },
    {
      accessorKey: 'demo_url',
      header: t('table.links'),
      cell: ({ row }) => {
        const demoUrl = row.original.demo_url
        const githubUrl = row.original.github_url

        return (
          <div className="flex gap-2">
            {demoUrl && (
              <Badge className="text-xs" variant="outline">
                Demo
              </Badge>
            )}
            {githubUrl && (
              <Badge className="text-xs" variant="outline">
                GitHub
              </Badge>
            )}
            {!demoUrl && !githubUrl && (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: t('table.created_at'),
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string
        return date
          ? format(new Date(date), 'dd MMM yyyy', { locale: vi })
          : '-'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const project = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0" variant="ghost">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/admin/projects/${project.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('actions.edit')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setProjectToDelete(project.id)
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
    },
  ]

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
    if (!projectToDelete) return

    try {
      await deleteProject(projectToDelete)
      toast.success(t('messages.delete_success'))
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      router.refresh()
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error(t('messages.delete_error'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          className="max-w-sm"
          onChange={event =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          placeholder={t('table.search_placeholder')}
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
        />
        <Select
          onValueChange={value =>
            table
              .getColumn('status')
              ?.setFilterValue(value === 'all' ? '' : value)
          }
          value={
            (table.getColumn('status')?.getFilterValue() as string) ?? 'all'
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('table.filter_status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('table.all_status')}</SelectItem>
            <SelectItem value="in_progress">
              {t('status.in_progress')}
            </SelectItem>
            <SelectItem value="completed">{t('status.completed')}</SelectItem>
            <SelectItem value="archived">{t('status.archived')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                  className="h-24 text-center"
                  colSpan={columns.length}
                >
                  {t('table.no_results')}
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
          {t('table.previous')}
        </Button>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
          size="sm"
          variant="outline"
        >
          {t('table.next')}
        </Button>
      </div>

      <AlertDialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
            >
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
