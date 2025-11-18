import { useState, useMemo } from 'react'
import { HardDrive, Filter, RefreshCw, Folder, Download } from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { useSmartScan } from '@/hooks/useSmartScan'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
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
function SizeFilterChip({ label, sizeBytes, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border transition-all ${
        active
          ? 'bg-blue-500 border-blue-500 text-white'
          : 'bg-card/50 border-glass-border text-gray-300 hover:border-blue-400'
      }`}
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
      className={`px-4 py-2 rounded-lg border transition-all ${
        active
          ? 'bg-blue-500 border-blue-500 text-white'
          : 'bg-card/50 border-glass-border text-gray-300 hover:border-blue-400'
      }`}
    >
      {label} {count > 0 && <span className="ml-1 text-xs opacity-75">({count})</span>}
    </button>
  )
}

/**
 * Storage summary card
 */
function StorageSummary({ totalSize, fileCount }) {
  return (
    <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-blue-500/10">
          <HardDrive className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Total Storage Used</p>
          <p className="text-2xl font-semibold text-gray-100">{formatBytes(totalSize)}</p>
          <p className="text-sm text-gray-500">{fileCount} {fileCount === 1 ? 'file' : 'files'}</p>
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
  const [sizeFilter, setSizeFilter] = useState('all') // 'all', '100mb', '500mb', '1gb'
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'video', 'image', 'audio', 'document', 'archive', 'other'
  const [sortBy, setSortBy] = useState('size') // 'size', 'name'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'

  // Filter and sort large files
  const filteredFiles = useMemo(() => {
    if (!data?.large_files?.items) return []

    let files = [...data.large_files.items]

    // Apply size filter
    if (sizeFilter === '100mb') {
      files = files.filter(f => f.size_bytes >= 100 * 1024 * 1024)
    } else if (sizeFilter === '500mb') {
      files = files.filter(f => f.size_bytes >= 500 * 1024 * 1024)
    } else if (sizeFilter === '1gb') {
      files = files.filter(f => f.size_bytes >= 1024 * 1024 * 1024)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      files = files.filter(f => getFileTypeCategory(f.mime_type) === typeFilter)
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
  }, [data, sizeFilter, typeFilter, sortBy, sortOrder])

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
      counts[category]++
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

  // No scan run yet
  if (!data && !loading && !error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={HardDrive}
          title="Large Files"
          subtitle="Find and manage files taking up the most space"
          illustration="📦"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <HardDrive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">Run a Smart Scan to discover large files</p>
          <Button onClick={() => runScan('root', 'user')} size="lg">
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
          icon={HardDrive}
          title="Large Files"
          subtitle="Find and manage files taking up the most space"
          illustration="📦"
        />
        <div className="p-12 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
          <p className="text-gray-300">Scanning your Drive for large files...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={HardDrive}
          title="Large Files"
          subtitle="Find and manage files taking up the most space"
          illustration="📦"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <p className="text-red-400 mb-4">Error loading large files</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => runScan('root', 'user')}>
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
          icon={HardDrive}
          title="Large Files"
          subtitle="Find and manage files taking up the most space"
          illustration="📦"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <HardDrive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">No large files found</p>
          <p className="text-sm text-gray-500">Your Drive is well-optimized!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Hero
        icon={HardDrive}
        title="Large Files"
        subtitle="Find and manage files taking up the most space"
        illustration="📦"
        actions={
          <Button onClick={() => runScan('root', 'user')} size="lg">
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

      {/* Size Filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter by Size
        </label>
        <div className="flex flex-wrap gap-2">
          <SizeFilterChip
            label="All Sizes"
            active={sizeFilter === 'all'}
            onClick={() => setSizeFilter('all')}
          />
          <SizeFilterChip
            label=">100 MB"
            active={sizeFilter === '100mb'}
            onClick={() => setSizeFilter('100mb')}
          />
          <SizeFilterChip
            label=">500 MB"
            active={sizeFilter === '500mb'}
            onClick={() => setSizeFilter('500mb')}
          />
          <SizeFilterChip
            label=">1 GB"
            active={sizeFilter === '1gb'}
            onClick={() => setSizeFilter('1gb')}
          />
        </div>
      </div>

      {/* File Type Tabs */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Filter by Type</label>
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

      {/* Files Table */}
      {filteredFiles.length === 0 ? (
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <p className="text-gray-400">No files match the selected filters</p>
        </div>
      ) : (
        <div className="border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('name')}
                >
                  Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
                </TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('size')}
                >
                  Size {sortBy === 'size' && (sortOrder === 'desc' ? '↓' : '↑')}
                </TableHead>
                <TableHead className="text-gray-400">Criteria</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file, index) => (
                <TableRow key={file.file_id || index} className="border-glass-border hover:bg-white/5">
                  <TableCell>
                    <span className="text-2xl">{getFileTypeIcon(file.mime_type)}</span>
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {file.file_name}
                  </TableCell>
                  <TableCell className="text-gray-300 font-mono">
                    {formatBytes(file.size_bytes)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {file.matched_criteria?.map((criteria, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        >
                          {criteria.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
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
