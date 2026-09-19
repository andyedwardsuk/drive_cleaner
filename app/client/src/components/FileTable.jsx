import { useState, useMemo, useEffect } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Download,
  FileText,
  FolderOpen,
  Trash2,
  Eye,
} from 'lucide-react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/pro-duotone-svg-icons'
import { useFilePreview } from '@/hooks/useFilePreview'
import { cn } from '@/lib/utils'

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
import { Badge } from '@/components/ui/badge'
import { useFileActions } from '@/hooks/useFileActions'
import { TrashConfirmationModal } from './actions/TrashConfirmationModal'
import { UndoToast } from './actions/UndoToast'
import { TableSkeleton } from '@/components/ui/TableSkeleton'

// Helper to copy text to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}

// Helper to format bytes
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

// Helper to export data as CSV
const exportToCSV = (data) => {
  const headers = [
    'Icon',
    'File Name',
    'File Size',
    'Category',
    'Last Modified',
    'Created Date',
    'Last Viewed',
    'Owner',
    'Sharing Status',
    'Starred',
    'Parent Folder',
    'File ID',
    'Drive Link',
    'MIME Type',
  ]
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      [
        row.icon,
        row.fileName,
        row.fileSize,
        row.fileCategory,
        row.modifiedDate,
        row.createdDate,
        row.lastViewedDate,
        row.ownerNames,
        row.sharingStatus,
        row.starred,
        row.parentName,
        row.fileId,
        row.driveLink,
        row.mimeType,
      ]
        .map((cell) => `"${cell || ''}"`)
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'drive-files.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}

// Helper to export data as JSON
const exportToJSON = (data) => {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'drive-files.json'
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function FileTable({ data = [], loading = false }) {
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [trashedIds, setTrashedIds] = useState(new Set())

  const {
    isTrashing,
    isRestoring,
    trashProgress,
    confirmModalOpen,
    filesPendingTrash,
    requestTrash,
    cancelTrash,
    executeTrash,
    undoToast,
    executeRestore,
    dismissUndo,
  } = useFileActions()

  const { openPreview } = useFilePreview()

  // Track trashed & restored files via global events
  useEffect(() => {
    const handleTrashed = (e) => {
      const ids = e.detail?.fileIds || []
      setTrashedIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.add(id))
        return next
      })
      setRowSelection({})
    }

    const handleRestored = (e) => {
      const files = e.detail?.files || []
      setTrashedIds((prev) => {
        const next = new Set(prev)
        files.forEach((f) => next.delete(f.fileId))
        return next
      })
    }

    window.addEventListener('drive_cleaner_files_trashed', handleTrashed)
    window.addEventListener('drive_cleaner_files_restored', handleRestored)
    return () => {
      window.removeEventListener('drive_cleaner_files_trashed', handleTrashed)
      window.removeEventListener('drive_cleaner_files_restored', handleRestored)
    }
  }, [])

  // Filter out actively trashed files
  const activeData = useMemo(() => {
    return data.filter((item) => !trashedIds.has(item.fileId))
  }, [data, trashedIds])

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              className="rounded border-gray-600 bg-zinc-800 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              checked={table.getIsAllPageRowsSelected()}
              onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              className="rounded border-gray-600 bg-zinc-800 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
              checked={row.getIsSelected()}
              onChange={(e) => row.toggleSelected(!!e.target.checked)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'icon',
        header: 'Type',
        cell: ({ row }) => {
          const isFolder = row.original.mimeType === 'application/vnd.google-apps.folder'
          return (
            <div className="flex items-center">
              {isFolder ? (
                <FolderOpen className="h-5 w-5 text-blue-500" />
              ) : (
                <FileText className="h-5 w-5 text-gray-500" />
              )}
            </div>
          )
        },
        enableSorting: false,
        enableGlobalFilter: false,
      },
      {
        accessorKey: 'fileName',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              File Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openPreview(row.original, activeData)}
              className="font-medium text-left text-white hover:text-blue-400 hover:underline transition-colors truncate max-w-xs sm:max-w-md cursor-pointer"
              title="Click to preview & inspect file"
            >
              {row.getValue('fileName')}
            </button>
            {row.original.starred && (
              <FontAwesomeIcon icon={faStar} className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Starred in Drive" />
            )}
          </div>
        ),
      },
      {
        accessorKey: 'fileSize',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Size
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="text-sm">{row.getValue('fileSize')}</div>,
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.fileSizeBytes || 0
          const b = rowB.original.fileSizeBytes || 0
          return a - b
        },
      },
      {
        accessorKey: 'fileCategory',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Category
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const category = row.getValue('fileCategory')
          return (
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'modifiedDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Last Modified
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="text-sm">{row.getValue('modifiedDate')}</div>,
      },
      {
        accessorKey: 'ownerNames',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Owner
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="text-sm">{row.getValue('ownerNames')}</div>,
      },
      {
        accessorKey: 'sharingStatus',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Sharing
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => {
          const status = row.getValue('sharingStatus')
          const variant = status === 'Private' ? 'outline' : status === 'Public' ? 'destructive' : 'default'
          return (
            <Badge variant={variant} className="text-xs">
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'parentName',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Parent Folder
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const file = row.original
          const driveUrl = file.driveLink || `https://drive.google.com/file/d/${file.fileId}/view`

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openPreview(file, activeData)}>
                  <Eye className="mr-2 h-4 w-4 text-blue-400" />
                  Preview & Inspect
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => copyToClipboard(file.fileId)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy File ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyToClipboard(driveUrl)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Drive Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open(driveUrl, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in Drive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => requestTrash([file])}
                  className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                  Move to Trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [requestTrash]
  )

  const table = useReactTable({
    data: activeData,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  })

  // Selected rows calculation
  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)
  const selectedBytes = selectedRows.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)

  return (
    <div className="w-full space-y-4">
      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input
          placeholder="Search files by name or folder..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm bg-slate-950/60 border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 rounded-xl h-10 text-sm"
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(activeData)}
            className="h-10 px-4 bg-slate-900/60 border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl shadow-sm"
          >
            <Download className="mr-2 h-4 w-4 text-slate-400" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToJSON(activeData)}
            className="h-10 px-4 bg-slate-900/60 border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl shadow-sm"
          >
            <Download className="mr-2 h-4 w-4 text-slate-400" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Floating Bulk Action Bar when rows selected */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 shadow-lg backdrop-blur-md animate-in fade-in-0 slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white">
              {selectedRows.length} {selectedRows.length === 1 ? 'file' : 'files'} selected
            </span>
            <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {formatBytes(selectedBytes)} to reclaim
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => requestTrash(selectedRows)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 h-auto rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-600/25"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Move {selectedRows.length} to Trash
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-lg">
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-pulse z-30 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isActions = header.column.id === 'actions'
                  const isSelect = header.column.id === 'select'
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        isActions && 'sticky right-0 bg-slate-900/95 backdrop-blur-md z-20 shadow-[-8px_0_14px_-4px_rgba(0,0,0,0.7)] text-right',
                        isSelect && 'sticky left-0 bg-slate-900/95 backdrop-blur-md z-20 shadow-[8px_0_14px_-4px_rgba(0,0,0,0.7)]'
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={cn(loading && table.getRowModel().rows?.length > 0 && 'opacity-60 transition-opacity duration-150')}>
            {loading && !table.getRowModel().rows?.length ? (
              <TableSkeleton rows={8} columnWidths={['w-4', 'w-5', 'w-56', 'w-16', 'w-20', 'w-28', 'w-24', 'w-16', 'w-6']} />
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => {
                    const isActions = cell.column.id === 'actions'
                    const isSelect = cell.column.id === 'select'
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          isActions && 'sticky right-0 bg-slate-900/95 backdrop-blur-md z-10 shadow-[-8px_0_14px_-4px_rgba(0,0,0,0.7)] text-right',
                          isSelect && 'sticky left-0 bg-slate-900/95 backdrop-blur-md z-10 shadow-[8px_0_14px_-4px_rgba(0,0,0,0.7)]'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400">
                  No files found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} entries
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-9 w-[75px] bg-slate-900/70 border-slate-700/60 text-slate-200 rounded-xl text-xs">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9 px-3 rounded-xl bg-slate-900/70 border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 disabled:opacity-40"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9 px-3 rounded-xl bg-slate-900/70 border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800 disabled:opacity-40"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Safety Confirmation Modal */}
      <TrashConfirmationModal
        isOpen={confirmModalOpen}
        files={filesPendingTrash}
        onConfirm={executeTrash}
        onCancel={cancelTrash}
        isTrashing={isTrashing}
        trashProgress={trashProgress}
      />

      {/* Undo Toast Banner */}
      <UndoToast
        undoToast={undoToast}
        onUndo={executeRestore}
        onDismiss={dismissUndo}
        isRestoring={isRestoring}
      />
    </div>
  )
}
