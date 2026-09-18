import { useState, useMemo } from 'react'
import { Trash2, Filter, RefreshCw, Folder, FileX, Eye, Search, X, Download, Sparkles } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolderMinus, faFolderOpen, faFileSlash, faLayerGroup } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSmartScan } from '@/hooks/useSmartScan'
import { useFilePreview, normalizeFileMetadata } from '@/hooks/useFilePreview'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { cn } from '@/lib/utils'

/**
 * Check if item is a folder
 */
function isFolder(mimeType) {
  return mimeType === 'application/vnd.google-apps.folder'
}

/**
 * Type filter chip component
 */
function TypeFilterChip({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all',
        active
          ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/30'
          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
      )}
    >
      {icon && <FontAwesomeIcon icon={icon} className={cn('w-3.5 h-3.5', active ? 'text-white' : 'text-purple-400')} />}
      <span>{label}</span>
    </button>
  )
}

/**
 * Empty items summary card
 */
function EmptyItemsSummary({ totalCount, folderCount, fileCount }) {
  return (
    <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Empty Items Found
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {totalCount} items
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {folderCount} empty directories • {fileCount} zero-byte files
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Empty Items View Component
 */
export default function EmptyItemsView() {
  const { data, loading, error, runScan } = useSmartScan()
  const { openPreview } = useFilePreview()
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'folders', 'files'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')

  // Filter and sort empty items
  const filteredItems = useMemo(() => {
    if (!data?.empty_items?.items) return []

    let items = [...data.empty_items.items]

    // Apply type filter
    if (typeFilter === 'folders') {
      items = items.filter(item => isFolder(item.mime_type))
    } else if (typeFilter === 'files') {
      items = items.filter(item => !isFolder(item.mime_type))
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(item => item.file_name.toLowerCase().includes(q))
    }

    // Sort items
    items.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.file_name.localeCompare(a.file_name)
        : a.file_name.localeCompare(b.file_name)
    })

    return items
  }, [data, typeFilter, searchQuery, sortOrder])

  // Calculate counts
  const { folderCount, fileCount } = useMemo(() => {
    if (!data?.empty_items?.items) return { folderCount: 0, fileCount: 0 }

    const folders = data.empty_items.items.filter(item => isFolder(item.mime_type)).length
    const files = data.empty_items.items.length - folders

    return { folderCount: folders, fileCount: files }
  }, [data])

  const handleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
  }

  const handlePreview = (item) => {
    openPreview(normalizeFileMetadata(item))
  }

  const handleExportCSV = () => {
    if (!filteredItems || filteredItems.length === 0) return
    const headers = ['Name', 'Type', 'MIME Type', 'Safety Level']
    const rows = filteredItems.map(item => [
      `"${item.file_name.replace(/"/g, '""')}"`,
      isFolder(item.mime_type) ? 'Folder' : 'File',
      `"${item.mime_type}"`,
      item.safety_level || 'safe'
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `empty_items_audit_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // No scan run yet
  if (!data && !loading && !error) {
    return (
      <div className="space-y-6">
        <Hero
          faIcon={faFolderMinus}
          variant="purple"
          title="Empty Items"
          subtitle="Find empty files and folders to clean up"
        />
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <Trash2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 mb-6 font-medium">Run a Smart Scan to discover empty items</p>
          <Button
            onClick={() => runScan('root', 'user')}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/40"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Smart Scan
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Hero
        faIcon={faFolderMinus}
        variant="purple"
        title="Empty Items"
        subtitle="Find empty files and folders to clean up"
        actions={
          <Button
            onClick={() => runScan('root', 'user')}
            disabled={loading}
            className="h-11 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40 disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            {loading ? 'Scanning...' : 'Refresh Scan'}
          </Button>
        }
      />

      {error && (
        <div className="p-4 border border-red-500/30 rounded-2xl bg-red-950/20 text-red-400 text-sm flex items-center justify-between gap-3">
          <p><strong>Error loading empty items:</strong> {error}</p>
          <Button
            size="sm"
            onClick={() => runScan('root', 'user')}
            className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Summary */}
      <EmptyItemsSummary
        totalCount={filteredItems.length}
        folderCount={folderCount}
        fileCount={fileCount}
      />

      {/* Type Filters & Search Controls (All h-11) */}
      <div className="p-5 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <TypeFilterChip
              label={`All Items (${folderCount + fileCount})`}
              icon={faLayerGroup}
              active={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            />
            <TypeFilterChip
              label={`Folders Only (${folderCount})`}
              icon={faFolderOpen}
              active={typeFilter === 'folders'}
              onClick={() => setTypeFilter('folders')}
            />
            <TypeFilterChip
              label={`0-Byte Files (${fileCount})`}
              icon={faFileSlash}
              active={typeFilter === 'files'}
              onClick={() => setTypeFilter('files')}
            />
          </div>

          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={filteredItems.length === 0}
            className="w-full sm:w-auto h-11 px-4 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search empty items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-10 bg-slate-950/80 border-slate-800 rounded-xl text-sm placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <TableHead className="w-12 text-slate-400">Type</TableHead>
              <TableHead
                className="text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={handleSort}
              >
                Name {sortOrder === 'desc' ? '↓' : '↑'}
              </TableHead>
              <TableHead className="text-slate-400">Criteria</TableHead>
              <TableHead className="text-slate-400">Safety</TableHead>
              <TableHead className="text-slate-400 text-right w-20">Preview</TableHead>
            </tr>
          </TableHeader>
          <TableBody className={cn('divide-y divide-slate-800/50 text-sm', loading && filteredItems.length > 0 && 'opacity-60 transition-opacity duration-150')}>
            {loading && filteredItems.length === 0 ? (
              <TableSkeleton rows={8} columnWidths={['w-6', 'w-64', 'w-24', 'w-16', 'w-8']} />
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-14 text-center text-slate-400">
                  <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-200">No empty items found</p>
                  <p className="text-xs text-slate-500 mt-1">Your Google Drive has no empty directories or zero-byte files matching this filter.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item, index) => (
                <TableRow
                  key={item.file_id || index}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <TableCell>
                    {isFolder(item.mime_type) ? (
                      <Folder className="w-5 h-5 text-purple-400" />
                    ) : (
                      <FileX className="w-5 h-5 text-purple-300" />
                    )}
                  </TableCell>
                  <TableCell className="text-slate-200 font-medium">
                    <span className="truncate block max-w-md">{item.file_name}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap">
                      {item.matched_criteria?.map((criteria, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        >
                          {criteria.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize',
                        item.safety_level === 'safe'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.safety_level === 'review'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      )}
                    >
                      {item.safety_level || 'safe'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {!isFolder(item.mime_type) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(item)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                        title="Preview file"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
