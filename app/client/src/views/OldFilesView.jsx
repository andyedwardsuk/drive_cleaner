import { useState, useMemo } from 'react'
import { Clock, Filter, RefreshCw, Calendar } from 'lucide-react'
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
 * Format age in years to readable string
 */
function formatAge(years) {
  if (years >= 1) {
    return `${years.toFixed(1)} years`
  }
  const months = Math.floor(years * 12)
  return `${months} months`
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
      className={`px-4 py-2 rounded-lg border transition-all ${
        active
          ? 'bg-orange-500 border-orange-500 text-white'
          : 'bg-card/50 border-glass-border text-gray-300 hover:border-orange-400'
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
          ? 'bg-orange-500 border-orange-500 text-white'
          : 'bg-card/50 border-glass-border text-gray-300 hover:border-orange-400'
      }`}
    >
      {label} {count > 0 && <span className="ml-1 text-xs opacity-75">({count})</span>}
    </button>
  )
}

/**
 * Age summary card
 */
function AgeSummary({ totalSize, fileCount, oldestAge }) {
  return (
    <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-orange-500/10">
          <Clock className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Old Files Found</p>
          <p className="text-2xl font-semibold text-gray-100">{fileCount} files</p>
          <p className="text-sm text-gray-500">
            {formatBytes(totalSize)} total • Oldest: {formatAge(oldestAge)}
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
  const [ageFilter, setAgeFilter] = useState('all') // 'all', '1yr', '2yr', '5yr'
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('age') // 'age', 'name', 'size'
  const [sortOrder, setSortOrder] = useState('desc')

  // Filter and sort old files
  const filteredFiles = useMemo(() => {
    if (!data?.old_files?.items) return []

    let files = [...data.old_files.items]

    // Apply age filter
    if (ageFilter === '1yr') {
      files = files.filter(f => f.age_years >= 1)
    } else if (ageFilter === '2yr') {
      files = files.filter(f => f.age_years >= 2)
    } else if (ageFilter === '5yr') {
      files = files.filter(f => f.age_years >= 5)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      files = files.filter(f => getFileTypeCategory(f.mime_type) === typeFilter)
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
  }, [data, ageFilter, typeFilter, sortBy, sortOrder])

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
      counts[category]++
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

  // No scan run yet
  if (!data && !loading && !error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Clock}
          title="Old Files"
          subtitle="Find files that haven't been accessed in a long time"
          illustration="⏰"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">Run a Smart Scan to discover old files</p>
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
          icon={Clock}
          title="Old Files"
          subtitle="Find files that haven't been accessed in a long time"
          illustration="⏰"
        />
        <div className="p-12 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-400 mx-auto mb-3" />
          <p className="text-gray-300">Scanning your Drive for old files...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Clock}
          title="Old Files"
          subtitle="Find files that haven't been accessed in a long time"
          illustration="⏰"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <p className="text-red-400 mb-4">Error loading old files</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => runScan('root', 'user')}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // No old files found
  if (!data?.old_files?.items || data.old_files.items.length === 0) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Clock}
          title="Old Files"
          subtitle="Find files that haven't been accessed in a long time"
          illustration="⏰"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">No old files found</p>
          <p className="text-sm text-gray-500">All your files are recent!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Hero
        icon={Clock}
        title="Old Files"
        subtitle="Find files that haven't been accessed in a long time"
        illustration="⏰"
        actions={
          <Button onClick={() => runScan('root', 'user')} size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Scan
          </Button>
        }
      />

      {/* Age Summary */}
      <AgeSummary
        totalSize={filteredTotalSize}
        fileCount={filteredFiles.length}
        oldestAge={oldestAge}
      />

      {/* Age Filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter by Age
        </label>
        <div className="flex flex-wrap gap-2">
          <AgeFilterChip
            label="All Ages"
            active={ageFilter === 'all'}
            onClick={() => setAgeFilter('all')}
          />
          <AgeFilterChip
            label=">1 Year"
            active={ageFilter === '1yr'}
            onClick={() => setAgeFilter('1yr')}
          />
          <AgeFilterChip
            label=">2 Years"
            active={ageFilter === '2yr'}
            onClick={() => setAgeFilter('2yr')}
          />
          <AgeFilterChip
            label=">5 Years"
            active={ageFilter === '5yr'}
            onClick={() => setAgeFilter('5yr')}
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
                  onClick={() => handleSort('age')}
                >
                  Age {sortBy === 'age' && (sortOrder === 'desc' ? '↓' : '↑')}
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
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      {formatAge(file.age_years)}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300 font-mono">
                    {formatBytes(file.size_bytes)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {file.matched_criteria?.map((criteria, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30"
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
