import { useState, useMemo } from 'react'
import { FileQuestion, Filter, RefreshCw } from 'lucide-react'
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
    <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-green-500/10">
          <FileQuestion className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Temporary Files Found</p>
          <p className="text-2xl font-semibold text-gray-100">{fileCount} files</p>
          <p className="text-sm text-gray-500">{formatBytes(totalSize)} to reclaim</p>
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
  const [sortBy, setSortBy] = useState('size')
  const [sortOrder, setSortOrder] = useState('desc')

  // Filter and sort temp files
  const filteredFiles = useMemo(() => {
    if (!data?.temp_files?.items) return []

    let files = [...data.temp_files.items]

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
  }, [data, sortBy, sortOrder])

  // Calculate total size
  const totalSize = useMemo(() => {
    return filteredFiles.reduce((sum, file) => sum + (file.size_bytes || 0), 0)
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
          icon={FileQuestion}
          title="Temporary Files"
          subtitle="Find and remove system temporary files"
          illustration="🗂️"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <FileQuestion className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">Run a Smart Scan to discover temporary files</p>
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
          icon={FileQuestion}
          title="Temporary Files"
          subtitle="Find and remove system temporary files"
          illustration="🗂️"
        />
        <div className="p-12 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-400 mx-auto mb-3" />
          <p className="text-gray-300">Scanning your Drive for temporary files...</p>
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
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <p className="text-red-400 mb-4">Error loading temporary files</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => runScan('root', 'user')}>
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
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <FileQuestion className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">No temporary files found</p>
          <p className="text-sm text-gray-500">Your Drive is free of system clutter!</p>
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
          <Button onClick={() => runScan('root', 'user')} size="lg">
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

      {/* Files Table */}
      <div className="border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-glass-border hover:bg-transparent">
              <TableHead className="text-gray-400">Pattern</TableHead>
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
              <TableHead className="text-gray-400">Safety</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFiles.map((file, index) => (
              <TableRow key={file.file_id || index} className="border-glass-border hover:bg-white/5">
                <TableCell>
                  <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-300 border border-green-500/30">
                    {getTempFilePattern(file.file_name)}
                  </span>
                </TableCell>
                <TableCell className="text-gray-200 font-mono text-sm">
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
                        className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-300 border border-gray-500/30"
                      >
                        {criteria.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      file.safety_level === 'safe'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : file.safety_level === 'review'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {file.safety_level}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Info Card */}
      <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">About Temporary Files</h3>
        <p className="text-gray-400 text-sm mb-3">
          Temporary files are created by operating systems and applications for various purposes.
          Common examples include:
        </p>
        <ul className="text-gray-400 text-sm space-y-1 ml-4">
          <li>• <span className="font-mono text-gray-300">.DS_Store</span> - macOS folder metadata</li>
          <li>• <span className="font-mono text-gray-300">Thumbs.db</span> - Windows thumbnail cache</li>
          <li>• <span className="font-mono text-gray-300">~$*.doc</span> - Office temporary files</li>
          <li>• <span className="font-mono text-gray-300">*.tmp</span> - Generic temporary files</li>
        </ul>
        <p className="text-gray-400 text-sm mt-3">
          Files marked as "safe" can typically be deleted without risk as they are automatically regenerated when needed.
        </p>
      </div>
    </div>
  )
}
