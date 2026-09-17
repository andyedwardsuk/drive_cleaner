import { useState, useMemo } from 'react'
import { Copy, RefreshCw, ChevronDown, ChevronRight, Eye, Search, X, Sparkles, Folder } from 'lucide-react'
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
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

/**
 * Duplicates summary card
 */
function DuplicatesSummary({ totalWastedSpace, groupCount, fileCount }) {
  return (
    <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Copy className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Duplicate Files Found
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {fileCount} duplicates
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {groupCount} groups • <span className="text-cyan-300 font-semibold">{formatBytes(totalWastedSpace)}</span> reclaimable space
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Duplicate group row component (expandable)
 */
function DuplicateGroupRow({ group, isExpanded, onToggle, onPreview }) {
  const wastedBytes = group.total_size_bytes - (group.items[0]?.size_bytes || 0)

  return (
    <>
      {/* Group Header Row */}
      <TableRow
        className="border-b border-slate-800/60 hover:bg-slate-800/40 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <TableCell className="w-10">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-cyan-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </TableCell>
        <TableCell className="text-slate-200 font-semibold text-sm">
          {group.file_name}
        </TableCell>
        <TableCell>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {group.duplicate_count} copies
          </span>
        </TableCell>
        <TableCell className="text-slate-300 font-mono text-xs">
          {formatBytes(group.total_size_bytes)}
        </TableCell>
        <TableCell className="text-xs font-semibold text-slate-300">
          <span className="text-cyan-400">{formatBytes(wastedBytes)}</span> wasted
        </TableCell>
      </TableRow>

      {/* Expanded: Show individual files */}
      {isExpanded &&
        group.items?.map((item, index) => (
          <TableRow
            key={item.file_id || index}
            className="border-b border-slate-800/40 bg-slate-950/40 hover:bg-slate-800/30 transition-colors"
          >
            <TableCell className="pl-6">
              <div className="w-2 h-2 rounded-full bg-cyan-400/60" />
            </TableCell>
            <TableCell className="text-slate-300 text-xs pl-4 flex items-center justify-between gap-2">
              <span className="truncate">{item.file_name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview(item)
                }}
                className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                title="Preview file"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </TableCell>
            <TableCell className="text-slate-400 text-xs">
              Copy {index + 1} {index === 0 && <span className="text-emerald-400 font-medium ml-1">(Original)</span>}
            </TableCell>
            <TableCell className="text-slate-400 font-mono text-xs">
              {formatBytes(item.size_bytes)}
            </TableCell>
            <TableCell className="text-slate-400 text-xs">
              {formatDate(item.created_date)}
            </TableCell>
          </TableRow>
        ))}
    </>
  )
}

/**
 * Duplicates View Component
 */
export default function DuplicatesView() {
  const { data, loading, error, runScan } = useSmartScan()
  const { openPreview } = useFilePreview()
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('wasted') // 'wasted', 'count', 'name'
  const [sortOrder, setSortOrder] = useState('desc')

  // Toggle group expansion
  const toggleGroup = (fileName) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(fileName)) {
      newExpanded.delete(fileName)
    } else {
      newExpanded.add(fileName)
    }
    setExpandedGroups(newExpanded)
  }

  // Expand all groups
  const expandAll = () => {
    if (data?.duplicates?.groups) {
      setExpandedGroups(new Set(data.duplicates.groups.map((g) => g.file_name)))
    }
  }

  // Collapse all groups
  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  // Filter and Sort groups
  const filteredAndSortedGroups = useMemo(() => {
    if (!data?.duplicates?.groups) return []

    let groups = [...data.duplicates.groups]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      groups = groups.filter((g) => g.file_name.toLowerCase().includes(q))
    }

    groups.sort((a, b) => {
      if (sortBy === 'wasted') {
        const wastedA = a.total_size_bytes - (a.items[0]?.size_bytes || 0)
        const wastedB = b.total_size_bytes - (b.items[0]?.size_bytes || 0)
        return sortOrder === 'desc' ? wastedB - wastedA : wastedA - wastedB
      } else if (sortBy === 'count') {
        return sortOrder === 'desc'
          ? b.duplicate_count - a.duplicate_count
          : a.duplicate_count - b.duplicate_count
      } else {
        return sortOrder === 'desc'
          ? b.file_name.localeCompare(a.file_name)
          : a.file_name.localeCompare(b.file_name)
      }
    })

    return groups
  }, [data, searchQuery, sortBy, sortOrder])

  // Calculate totals
  const { totalWastedSpace, totalFileCount, groupCount } = useMemo(() => {
    if (!data?.duplicates?.groups) return { totalWastedSpace: 0, totalFileCount: 0, groupCount: 0 }

    const wastedSpace = data.duplicates.groups.reduce((sum, group) => {
      const wasted = group.total_size_bytes - (group.items[0]?.size_bytes || 0)
      return sum + wasted
    }, 0)

    return {
      totalWastedSpace: wastedSpace,
      totalFileCount: data.duplicates.count || 0,
      groupCount: data.duplicates.groups.length
    }
  }, [data])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handlePreview = (item) => {
    openPreview(normalizeFileMetadata(item))
  }

  // No scan run yet
  if (!data && !loading && !error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Copy}
          title="Duplicates"
          subtitle="Find and remove duplicate files to save space"
          illustration="📋"
        />
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <Copy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 mb-6 font-medium">Run a Smart Scan to discover duplicate files</p>
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
          icon={Copy}
          title="Duplicates"
          subtitle="Find and remove duplicate files to save space"
          illustration="📋"
        />
        <div className="p-16 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-300 text-sm">Scanning your Google Drive for duplicate files...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Copy}
          title="Duplicates"
          subtitle="Find and remove duplicate files to save space"
          illustration="📋"
        />
        <div className="p-10 border border-red-500/30 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <p className="text-red-400 font-bold mb-2">Error loading duplicates</p>
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

  // No duplicates found
  if (!data?.duplicates?.groups || data.duplicates.groups.length === 0) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Copy}
          title="Duplicates"
          subtitle="Find and remove duplicate files to save space"
          illustration="📋"
        />
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <Sparkles className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-200 text-lg font-bold mb-1">No duplicate files found</p>
          <p className="text-sm text-slate-400">Your Google Drive has zero duplicate file clutter!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Hero
        icon={Copy}
        title="Duplicates"
        subtitle="Find and remove duplicate files to save space"
        illustration="📋"
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
      <DuplicatesSummary
        totalWastedSpace={totalWastedSpace}
        groupCount={groupCount}
        fileCount={totalFileCount}
      />

      {/* Search and Expand/Collapse Controls (All h-11) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Filter duplicate groups..."
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

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            onClick={expandAll}
            className="h-11 px-4 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            onClick={collapseAll}
            className="h-11 px-4 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Duplicates Table */}
      <div className="border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <TableHead className="w-10"></TableHead>
              <TableHead
                className="text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('name')}
              >
                File Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
              </TableHead>
              <TableHead
                className="text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('count')}
              >
                Copies {sortBy === 'count' && (sortOrder === 'desc' ? '↓' : '↑')}
              </TableHead>
              <TableHead className="text-slate-400">Total Size</TableHead>
              <TableHead
                className="text-slate-400 cursor-pointer hover:text-slate-200 transition-colors"
                onClick={() => handleSort('wasted')}
              >
                Wasted Space {sortBy === 'wasted' && (sortOrder === 'desc' ? '↓' : '↑')}
              </TableHead>
            </tr>
          </TableHeader>
          <TableBody className="divide-y divide-slate-800/50 text-sm">
            {filteredAndSortedGroups.map((group) => (
              <DuplicateGroupRow
                key={group.file_name}
                group={group}
                isExpanded={expandedGroups.has(group.file_name)}
                onToggle={() => toggleGroup(group.file_name)}
                onPreview={handlePreview}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Info Card */}
      <div className="p-5 border border-slate-800/70 rounded-2xl bg-slate-900/40 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-1">About Duplicate Detection</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Duplicates are detected using exact MD5 checksum hashes and file size matching. Click any group to expand all identical copies and click the eye icon to preview each file before cleanup.
        </p>
      </div>
    </div>
  )
}
