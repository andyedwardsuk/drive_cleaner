import { useState, useMemo } from 'react'
import { HardDrive, Filter, RefreshCw, Eye, Search, X, Download, Sparkles } from 'lucide-react'
import { faHardDrive } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSmartScan } from '@/hooks/useSmartScan'
import { useSettings } from '@/hooks/useSettings'
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
 * Get file type category from MIME type
 */
function getFileTypeCategory(mimeType) {
  if (!mimeType) return 'other'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document'
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'archive'
  return 'other'
}

/**
 * Get icon for file type
 */
function getFileTypeIcon(mimeType) {
  const category = getFileTypeCategory(mimeType)
  const icons = {
    video: '🎥',
    image: '🖼️',
    audio: '🎵',
    document: '📄',
    archive: '📦',
    other: '📎'
  }
  return icons[category] || icons.other
}

/**
 * Size filter chip component
 */
function SizeFilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all',
        active
          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/30'
          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
      )}
    >
      {label}
    </button>
  )
}

/**
 * File type tab component
 */
function FileTypeTab({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all',
        active
          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/30'
          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
      )}
    >
      {label} {count > 0 && <span className="ml-1 text-[11px] opacity-75">({count})</span>}
    </button>
  )
}

/**
 * Storage summary card
 */
function StorageSummary({ totalSize, fileCount }) {
  return (
    <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <HardDrive className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Large Storage Space
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {formatBytes(totalSize)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Across {fileCount} {fileCount === 1 ? 'large file' : 'large files'}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Large Files View Component
 */
export default function LargeFilesView() {
  const { data, loading, error, runScan } = useSmartScan()
  const { thresholds } = useSettings()
  const { openPreview } = useFilePreview()
  const minMB = thresholds?.largeFileMinMB || 100
  const [sizeFilter, setSizeFilter] = useState('all') // 'all', 'min', '500mb', '1gb'
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('size')
  const [sortOrder, setSortOrder] = useState('desc')

  // Filter and sort large files
  const filteredFiles = useMemo(() => {
    if (!data?.large_files?.items) return []

    let files = [...data.large_files.items]

    // Apply size filter
    if (sizeFilter === 'min' || sizeFilter === '100mb') {
      files = files.filter(f => f.size_bytes >= minMB * 1024 * 1024)
    } else if (sizeFilter === '500mb') {
      files = files.filter(f => f.size_bytes >= 500 * 1024 * 1024)
    } else if (sizeFilter === '1gb') {
      files = files.filter(f => f.size_bytes >= 1024 * 1024 * 1024)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      files = files.filter(f => getFileTypeCategory(f.mime_type) === typeFilter)
    }

    // Apply search query
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
  }, [data, sizeFilter, typeFilter, searchQuery, sortBy, sortOrder, minMB])

  // Calculate type counts
  const typeCounts = useMemo(() => {
    if (!data?.large_files?.items) return {}

    const counts = {
      all: data.large_files.items.length,
      video: 0,
      image: 0,
      audio: 0,
      document: 0,
      archive: 0,
      other: 0
    }

    data.large_files.items.forEach(file => {
      const category = getFileTypeCategory(file.mime_type)
      counts[category] = (counts[category] || 0) + 1
    })

    return counts
  }, [data])

  // Calculate total size of filtered files
  const filteredTotalSize = useMemo(() => {
    return filteredFiles.reduce((sum, file) => sum + file.size_bytes, 0)
  }, [filteredFiles])

  // Toggle sort
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
    const headers = ['File Name', 'Size (Bytes)', 'Size Formatted', 'MIME Type', 'Criteria']
    const rows = filteredFiles.map(f => [
      `"${f.file_name.replace(/"/g, '""')}"`,
      f.size_bytes,
      `"${formatBytes(f.size_bytes)}"`,
      `"${f.mime_type}"`,
      `"${(f.matched_criteria || []).join(', ')}"`
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `large_files_audit_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // No scan run yet
  if (!data && !loading && !error) {
    return (
      <div className="space-y-6">
        <Hero
          faIcon={faHardDrive}
          variant="primary"
          title="Large Files"
          subtitle="Find and manage files taking up the most space"
        />
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <HardDrive className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 mb-6 font-medium">Run a Smart Scan to discover large files</p>
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
          faIcon={faHardDrive}
          variant="primary"
          title="Large Files"
          subtitle="Find and manage files taking up the most space"
        />
        <div className="p-16 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300 text-sm">Scanning your Drive for large files...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Hero
          faIcon={faHardDrive}
          variant="primary"
          title="Large Files"
          subtitle="Find and manage files taking up the most space"
        />
        <div className="p-10 border border-red-500/30 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <p className="text-red-400 font-bold mb-2">Error loading large files</p>
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

  // No large files found
  if (!data?.large_files?.items || data.large_files.items.length === 0) {
    return (
      <div className="space-y-6">
        <Hero
          faIcon={faHardDrive}
          variant="primary"
          title="Large Files"
          subtitle="Find and manage files taking up the most space"
        />
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <Sparkles className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-200 text-lg font-bold mb-1">No large files found</p>
          <p className="text-sm text-slate-400">Your Google Drive is exceptionally lean and well-optimised!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Hero
        faIcon={faHardDrive}
        variant="primary"
        title="Large Files"
        subtitle="Find and manage files taking up the most space"
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

      {/* Storage Summary */}
      <StorageSummary
        totalSize={filteredTotalSize}
        fileCount={filteredFiles.length}
      />

      {/* Filters Card */}
      <div className="p-5 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm space-y-4 shadow-xl">
        {/* Size Filters */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            Filter by Size Threshold
          </label>
          <div className="flex flex-wrap gap-2">
            <SizeFilterChip
              label="All Large Sizes"
              active={sizeFilter === 'all'}
              onClick={() => setSizeFilter('all')}
            />
            <SizeFilterChip
              label={`>${minMB} MB (Custom Threshold)`}
              active={sizeFilter === 'min' || sizeFilter === '100mb'}
              onClick={() => setSizeFilter('min')}
            />
            <SizeFilterChip
              label=">500 MB"
              active={sizeFilter === '500mb'}
              onClick={() => setSizeFilter('500mb')}
            />
            <SizeFilterChip
              label=">1 GB (Massive)"
              active={sizeFilter === '1gb'}
              onClick={() => setSizeFilter('1gb')}
            />
          </div>
        </div>

        {/* File Type Tabs */}
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            <FileTypeTab label="All Types" count={typeCounts.all} active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
            <FileTypeTab label="🎥 Videos" count={typeCounts.video} active={typeFilter === 'video'} onClick={() => setTypeFilter('video')} />
            <FileTypeTab label="🖼️ Images" count={typeCounts.image} active={typeFilter === 'image'} onClick={() => setTypeFilter('image')} />
            <FileTypeTab label="🎵 Audio" count={typeCounts.audio} active={typeFilter === 'audio'} onClick={() => setTypeFilter('audio')} />
            <FileTypeTab label="📄 Documents" count={typeCounts.document} active={typeFilter === 'document'} onClick={() => setTypeFilter('document')} />
            <FileTypeTab label="📦 Archives" count={typeCounts.archive} active={typeFilter === 'archive'} onClick={() => setTypeFilter('archive')} />
            <FileTypeTab label="📎 Other" count={typeCounts.other} active={typeFilter === 'other'} onClick={() => setTypeFilter('other')} />
          </div>
        </div>

        {/* Search & Export Controls (All h-11) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search large files by name..."
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
      </div>

      {/* Files Table */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <p className="text-slate-400 text-sm">No files match the selected filters or search query.</p>
        </div>
      ) : (
        <div className="border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-xl">
          <Table>
            <TableHeader>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <TableHead className="w-12 text-slate-400">Type</TableHead>
                <TableHead
                  className="text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
                </TableHead>
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
                  <TableCell>
                    <span className="text-xl">{getFileTypeIcon(file.mime_type)}</span>
                  </TableCell>
                  <TableCell className="text-slate-200 font-medium">
                    <span className="truncate block max-w-md">{file.file_name}</span>
                  </TableCell>
                  <TableCell className="text-slate-300 font-mono text-xs font-semibold whitespace-nowrap">
                    {formatBytes(file.size_bytes)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 flex-wrap">
                      {file.matched_criteria?.map((criteria, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20"
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
    </div>
  )
}
