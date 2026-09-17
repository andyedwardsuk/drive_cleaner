import { useState, useMemo } from 'react'
import { FileQuestion, Filter, RefreshCw, Eye, Search, X, Download, Sparkles } from 'lucide-react'
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
import { cn } from '@/lib/utils'

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Get common temp file patterns
 */
function getTempFilePattern(fileName) {
  if (fileName === '.DS_Store') return 'macOS System'
  if (fileName === 'Thumbs.db') return 'Windows Thumbnail'
  if (fileName === 'desktop.ini') return 'Windows Desktop'
  if (fileName.startsWith('~$')) return 'Office Temp'
  if (fileName.startsWith('.~')) return 'Backup/Temp'
  if (fileName.endsWith('.tmp')) return 'Temporary File'
  if (fileName.endsWith('.bak')) return 'Backup File'
  return 'System/Temp File'
}

/**
 * Temp files summary card
 */
function TempFilesSummary({ totalSize, fileCount }) {
  return (
    <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Temporary & System Files Found
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {fileCount} files
          </p>
          <p className="text-xs text-slate-400 mt-1">
            <span className="text-emerald-300 font-semibold">{formatBytes(totalSize)}</span> of clutter to reclaim
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Temp Files View Component
 */
export default function TempFilesView() {
  const { data, loading, error, runScan } = useSmartScan()
  const { openPreview } = useFilePreview()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('size')
  const [sortOrder, setSortOrder] = useState('desc')

  // Filter and sort temp files
  const filteredFiles = useMemo(() => {
    if (!data?.temp_files?.items) return []

    let files = [...data.temp_files.items]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      files = files.filter(f => f.file_name.toLowerCase().includes(q))
    }

    // Sort files
    files.sort((a, b) => {
      if (sortBy === 'size') {
        return sortOrder === 'desc'
          ? b.size_bytes - a.size_bytes
          : a.size_bytes - b.size_bytes
      } else {
        return sortOrder === 'desc'
          ? b.file_name.localeCompare(a.file_name)
          : a.file_name.localeCompare(b.file_name)
      }
    })

    return files
  }, [data, searchQuery, sortBy, sortOrder])

  // Calculate total size
  const totalSize = useMemo(() => {
    return filteredFiles.reduce((sum, file) => sum + (file.size_bytes || 0), 0)
  }, [filteredFiles])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handlePreview = (file) => {
    openPreview(normalizeFileMetadata(file))
  }

  const handleExportCSV = () => {
    if (!filteredFiles || filteredFiles.length === 0) return
    const headers = ['File Name', 'Size (Bytes)', 'Size Formatted', 'Pattern', 'Criteria']
    const rows = filteredFiles.map(f => [
      `"${f.file_name.replace(/"/g, '""')}"`,
      f.size_bytes,
      `"${formatBytes(f.size_bytes)}"`,
      `"${getTempFilePattern(f.file_name)}"`,
      `"${(f.matched_criteria || []).join(', ')}"`
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `temp_files_audit_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // No scan run yet
  if (!data && !loading && !error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={FileQuestion}
          title="Temporary Files"
          subtitle="Find and remove system temporary files"
          illustration="🗂️"
        />
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <FileQuestion className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 mb-6 font-medium">Run a Smart Scan to discover temporary files</p>
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Hero
          icon={FileQuestion}
          title="Temporary Files"
          subtitle="Find and remove system temporary files"
          illustration="🗂️"
        />
        <div className="p-16 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-300 text-sm">Scanning your Drive for temporary files...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={FileQuestion}
          title="Temporary Files"
          subtitle="Find and remove system temporary files"
          illustration="🗂️"
        />
        <div className="p-10 border border-red-500/30 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <p className="text-red-400 font-bold mb-2">Error loading temporary files</p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Button
            onClick={() => runScan('root', 'user')}
            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // No temp files found
  if (!data?.temp_files?.items || data.temp_files.items.length === 0) {
    return (
      <div className="space-y-6">
        <Hero
          icon={FileQuestion}
          title="Temporary Files"
          subtitle="Find and remove system temporary files"
          illustration="🗂️"
        />
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <Sparkles className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-200 text-lg font-bold mb-1">No temporary files found</p>
          <p className="text-sm text-slate-400">Your Google Drive is free from cache, .tmp, and system debris!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Hero
        icon={FileQuestion}
        title="Temporary Files"
        subtitle="Find and remove system temporary files"
        illustration="🗂️"
        actions={
          <Button
            onClick={() => runScan('root', 'user')}
            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/40"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Scan
          </Button>
        }
      />

      {/* Summary */}
      <TempFilesSummary
        totalSize={totalSize}
        fileCount={filteredFiles.length}
      />

      {/* Search & Export Toolbar (All h-11) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search temporary files..."
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

        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={filteredFiles.length === 0}
          className="w-full sm:w-auto h-11 px-4 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Files Table */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <p className="text-slate-400 text-sm">No files match your search query.</p>
        </div>
      ) : (
        <div className="border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <TableHead
                  className="text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  File Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
                </TableHead>
                <TableHead className="text-slate-400">Pattern</TableHead>
                <TableHead
                  className="text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
                  onClick={() => handleSort('size')}
                >
                  Size {sortBy === 'size' && (sortOrder === 'desc' ? '↓' : '↑')}
                </TableHead>
                <TableHead className="text-slate-400">Criteria</TableHead>
                <TableHead className="text-slate-400 text-right w-20">Preview</TableHead>
              </tr>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/50 text-sm">
              {filteredFiles.map((file, index) => (
                <TableRow
                  key={file.file_id || index}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <TableCell className="text-slate-200 font-medium">
                    <span className="truncate block max-w-md">{file.file_name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {getTempFilePattern(file.file_name)}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-300 font-mono text-xs whitespace-nowrap">
                    {formatBytes(file.size_bytes)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap">
                      {file.matched_criteria?.map((criteria, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {criteria.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(file)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                      title="Preview file"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Info Card */}
      <div className="p-5 border border-slate-800/70 rounded-2xl bg-slate-900/40 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-1">About Temporary Files</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Temporary files include OS desktop files (.DS_Store, Thumbs.db), Office autosaves (~$), and backup files (.bak, .tmp). These files are safe to delete and often leftover from old editing sessions.
        </p>
      </div>
    </div>
  )
}
