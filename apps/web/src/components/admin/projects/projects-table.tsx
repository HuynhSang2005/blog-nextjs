'use client'

import { useCallback, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

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

import type { ProjectListItem } from '@/types/supabase-helpers'
import { AdminPagination } from '@/components/admin/shared/admin-pagination'
import { AdminDateRangePicker } from '@/components/admin/shared/admin-date-range-picker'

interface ProjectsTableProps {
  projects: ProjectListItem[]
  page: number
  totalPages: number
  initialSearch: string
  initialStatus: 'all' | 'in_progress' | 'completed' | 'archived'
}

export function ProjectsTable({
  projects,
  page,
  totalPages,
  initialSearch,
  initialStatus,
}: ProjectsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const locale = useLocale()
  const t = useTranslations('admin.projects')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

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

  const columns: ColumnDef<ProjectListItem>[] = [
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
    getSortedRowModel: getSortedRowModel(),
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
          defaultValue={initialSearch}
          onChange={event =>
            updateQueryParam('search', event.target.value || null)
          }
          placeholder={t('table.search_placeholder')}
        />
        <Select
          defaultValue={initialStatus}
          onValueChange={value =>
            updateQueryParam('status', value === 'all' ? null : value)
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

      <AdminPagination
        nextAriaLabel={t('table.next')}
        nextLabel={t('table.next')}
        page={page}
        previousAriaLabel={t('table.previous')}
        previousLabel={t('table.previous')}
        totalPages={totalPages}
      />

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
