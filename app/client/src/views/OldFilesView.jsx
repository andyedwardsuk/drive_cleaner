import { useState, useMemo } from 'react'
import { Clock, Filter, RefreshCw, Eye, Search, X, Download, Sparkles } from 'lucide-react'
import { faHourglassHalf } from '@fortawesome/pro-duotone-svg-icons'
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
import { TableSkeleton } from '@/components/ui/TableSkeleton'
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
 * Format age in years or months
 */
function formatAge(years) {
  if (!years) return 'Unknown'
  if (years < 1) {
    const months = Math.round(years * 12)
    return `${months} ${months === 1 ? 'month' : 'months'}`
  }
  const roundedYears = years.toFixed(1)
  return `${roundedYears} ${roundedYears === '1.0' ? 'year' : 'years'}`
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString()
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
 * Age filter chip component
 */
function AgeFilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all',
        active
          ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-900/30'
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
          ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-900/30'
          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
      )}
    >
      {label} {count > 0 && <span className="ml-1 text-[11px] opacity-75">({count})</span>}
    </button>
  )
}

/**
 * Age summary card
 */
function AgeSummary({ totalSize, fileCount, oldestAge }) {
  return (
    <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Dormant / Old Files
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {fileCount} files
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {formatBytes(totalSize)} total • Oldest file: <span className="text-amber-300 font-semibold">{formatAge(oldestAge)}</span> inactive
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Old Files View Component
 */
export default function OldFilesView() {
  const { data, loading, error, runScan } = useSmartScan()
  const { thresholds } = useSettings()
  const { openPreview } = useFilePreview()
  const inactiveDays = thresholds?.oldFileInactiveDays || 365
  const inactiveYears = inactiveDays / 365
  const [ageFilter, setAgeFilter] = useState('all') // 'all', 'custom', '2yr', '5yr'
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('age') // 'age', 'name', 'size'
  const [sortOrder, setSortOrder] = useState('desc')

  // Filter and sort old files
  const filteredFiles = useMemo(() => {
    if (!data?.old_files?.items) return []

    let files = [...data.old_files.items]

    // Apply age filter
    if (ageFilter === 'custom' || ageFilter === '1yr') {
      files = files.filter(f => f.age_years >= inactiveYears)
    } else if (ageFilter === '2yr') {
      files = files.filter(f => f.age_years >= 2)
    } else if (ageFilter === '5yr') {
      files = files.filter(f => f.age_years >= 5)
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
      if (sortBy === 'age') {
        return sortOrder === 'desc'
          ? b.age_years - a.age_years
          : a.age_years - b.age_years
      } else if (sortBy === 'size') {
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
  }, [data, ageFilter, typeFilter, searchQuery, sortBy, sortOrder, inactiveYears])

  // Calculate type counts
  const typeCounts = useMemo(() => {
    if (!data?.old_files?.items) return {}

    const counts = {
      all: data.old_files.items.length,
      video: 0,
      image: 0,
      audio: 0,
      document: 0,
      archive: 0,
      other: 0
    }

    data.old_files.items.forEach(file => {
      const category = getFileTypeCategory(file.mime_type)
      counts[category] = (counts[category] || 0) + 1
    })

    return counts
  }, [data])

  // Calculate total size and oldest age of filtered files
  const { filteredTotalSize, oldestAge } = useMemo(() => {
    const totalSize = filteredFiles.reduce((sum, file) => sum + file.size_bytes, 0)
    const maxAge = filteredFiles.reduce((max, file) => Math.max(max, file.age_years || 0), 0)
    return { filteredTotalSize: totalSize, oldestAge: maxAge }
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
    const headers = ['File Name', 'Size (Bytes)', 'Size Formatted', 'MIME Type', 'Age (Years)', 'Last Modified']
    const rows = filteredFiles.map(f => [
      `"${f.file_name.replace(/"/g, '""')}"`,
      f.size_bytes,
      `"${formatBytes(f.size_bytes)}"`,
      `"${f.mime_type}"`,
      f.age_years ? f.age_years.toFixed(2) : '0',
      `"${formatDate(f.modified_date)}"`
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `old_files_audit_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // No scan run yet
  if (!data && !loading && !error) {
    return (
      <div className="space-y-6">
        <Hero
          faIcon={faHourglassHalf}
          variant="amber"
          title="Old Files"
          subtitle="Find and archive files you haven't used in a long time"
        />
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 mb-6 font-medium">Run a Smart Scan to discover old files</p>
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
        faIcon={faHourglassHalf}
        variant="amber"
        title="Old Files"
        subtitle="Find and archive files you haven't used in a long time"
        actions={
          <Button
            onClick={() => runScan('root', 'user')}
            disabled={loading}
            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/40 disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            {loading ? 'Scanning...' : 'Refresh Scan'}
          </Button>
        }
      />

      {error && (
        <div className="p-4 border border-red-500/30 rounded-2xl bg-red-950/20 text-red-400 text-sm flex items-center justify-between gap-3">
          <p><strong>Error loading old files:</strong> {error}</p>
          <Button
            size="sm"
            onClick={() => runScan('root', 'user')}
            className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Age Summary */}
      <AgeSummary
        totalSize={filteredTotalSize}
        fileCount={filteredFiles.length}
        oldestAge={oldestAge}
      />

      {/* Filters Card */}
      <div className="p-5 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm space-y-4 shadow-xl">
        {/* Age Filters */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            Filter by Age Inactivity
          </label>
          <div className="flex flex-wrap gap-2">
            <AgeFilterChip
              label="All Old Files"
              active={ageFilter === 'all'}
              onClick={() => setAgeFilter('all')}
            />
            <AgeFilterChip
              label={`>${inactiveDays} Days (${inactiveYears >= 1 ? `${inactiveYears}yr` : `${inactiveDays}d`})`}
              active={ageFilter === 'custom' || ageFilter === '1yr'}
              onClick={() => setAgeFilter('custom')}
            />
            <AgeFilterChip
              label=">2 Years"
              active={ageFilter === '2yr'}
              onClick={() => setAgeFilter('2yr')}
            />
            <AgeFilterChip
              label=">5 Years (Ancient)"
              active={ageFilter === '5yr'}
              onClick={() => setAgeFilter('5yr')}
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
              placeholder="Search old files by name..."
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
      {/* Files Table */}
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
                onClick={() => handleSort('age')}
              >
                Age {sortBy === 'age' && (sortOrder === 'desc' ? '↓' : '↑')}
              </TableHead>
              <TableHead
                className="text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('size')}
              >
                Size {sortBy === 'size' && (sortOrder === 'desc' ? '↓' : '↑')}
              </TableHead>
              <TableHead className="text-slate-400">Last Modified</TableHead>
              <TableHead className="text-slate-400 text-right w-20">Preview</TableHead>
            </tr>
          </TableHeader>
          <TableBody className={cn('divide-y divide-slate-800/50 text-sm', loading && filteredFiles.length > 0 && 'opacity-60 transition-opacity duration-150')}>
            {loading && filteredFiles.length === 0 ? (
              <TableSkeleton rows={8} columnWidths={['w-6', 'w-64', 'w-16', 'w-20', 'w-24', 'w-8']} />
            ) : filteredFiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-14 text-center text-slate-400">
                  <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-200">No inactive files match your filters</p>
                  <p className="text-xs text-slate-500 mt-1">All files within this range have been recently accessed or updated.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredFiles.map((file, index) => (
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
                  <TableCell className="whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {formatAge(file.age_years)}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-300 font-mono text-xs whitespace-nowrap">
                    {formatBytes(file.size_bytes)}
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs whitespace-nowrap">
                    {formatDate(file.modified_date)}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
