import { useState, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Copy, ExternalLink, Download, FileText, FolderOpen } from 'lucide-react'

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

// Helper to copy text to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
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
    ...data.map(row =>
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
        .map(cell => `"${cell || ''}"`)
        .join(',')
    )
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

// Get file type label
const getFileTypeLabel = (mimeType) => {
  if (mimeType === 'application/vnd.google-apps.folder') return 'Folder'
  if (mimeType.startsWith('application/vnd.google-apps.')) {
    return mimeType.replace('application/vnd.google-apps.', 'Google ').split('.').pop()
  }
  if (mimeType.startsWith('image/')) return 'Image'
  if (mimeType.startsWith('video/')) return 'Video'
  if (mimeType.startsWith('audio/')) return 'Audio'
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('document')) return 'Document'
  if (mimeType.includes('spreadsheet')) return 'Spreadsheet'
  if (mimeType.includes('presentation')) return 'Presentation'
  return 'File'
}

export default function FileTable({ data = [] }) {
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState([])

  const columns = useMemo(
    () => [
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
            <span className="font-medium">{row.getValue('fileName')}</span>
            {row.original.starred && <span className="text-yellow-500">{row.original.starred}</span>}
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
                <DropdownMenuItem
                  onClick={() => copyToClipboard(file.fileId)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy File ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => copyToClipboard(driveUrl)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Drive Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => window.open(driveUrl, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in Drive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  })

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search files..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(data)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToJSON(data)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
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
            <SelectTrigger className="h-8 w-[70px]">
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
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
