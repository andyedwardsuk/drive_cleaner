import { useState, useMemo } from 'react'
import { Copy, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
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
    <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-cyan-500/10">
          <Copy className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Duplicate Files Found</p>
          <p className="text-2xl font-semibold text-gray-100">{fileCount} duplicates</p>
          <p className="text-sm text-gray-500">
            {groupCount} groups • {formatBytes(totalWastedSpace)} wasted
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Duplicate group row component (expandable)
 */
function DuplicateGroupRow({ group, isExpanded, onToggle }) {
  return (
    <>
      {/* Group Header Row */}
      <TableRow className="border-glass-border hover:bg-white/5 cursor-pointer" onClick={onToggle}>
        <TableCell>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-cyan-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </TableCell>
        <TableCell className="text-gray-200 font-semibold">
          {group.file_name}
        </TableCell>
        <TableCell>
          <span className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            {group.duplicate_count} copies
          </span>
        </TableCell>
        <TableCell className="text-gray-300 font-mono">
          {formatBytes(group.total_size_bytes)}
        </TableCell>
        <TableCell className="text-sm text-gray-400">
          {formatBytes(group.total_size_bytes - (group.items[0]?.size_bytes || 0))} wasted
        </TableCell>
      </TableRow>

      {/* Expanded: Show individual files */}
      {isExpanded && group.items?.map((item, index) => (
        <TableRow key={item.file_id || index} className="border-glass-border bg-white/[0.02]">
          <TableCell className="pl-8">
            <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
          </TableCell>
          <TableCell className="text-gray-400 text-sm pl-4">
            {item.file_name}
          </TableCell>
          <TableCell className="text-gray-500 text-xs">
            Copy {index + 1}
          </TableCell>
          <TableCell className="text-gray-400 font-mono text-sm">
            {formatBytes(item.size_bytes)}
          </TableCell>
          <TableCell className="text-gray-500 text-sm">
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
  const [expandedGroups, setExpandedGroups] = useState(new Set())
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
      setExpandedGroups(new Set(data.duplicates.groups.map(g => g.file_name)))
    }
  }

  // Collapse all groups
  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  // Sort groups
  const sortedGroups = useMemo(() => {
    if (!data?.duplicates?.groups) return []

    const groups = [...data.duplicates.groups]

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
  }, [data, sortBy, sortOrder])

  // Calculate totals
  const { totalWastedSpace, totalFileCount, groupCount } = useMemo(() => {
    if (!data?.duplicates?.groups) return { totalWastedSpace: 0, totalFileCount: 0, groupCount: 0 }

    const wastedSpace = data.duplicates.groups.reduce((sum, group) => {
      // Wasted space = total size - size of one file (keep one, delete others)
      const wasted = group.total_size_bytes - (group.items[0]?.size_bytes || 0)
      return sum + wasted
    }, 0)

    return {
      totalWastedSpace: wastedSpace,
      totalFileCount: data.duplicates.count || 0,
      groupCount: data.duplicates.groups.length
    }
  }, [data])

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
          icon={Copy}
          title="Duplicates"
          subtitle="Find and remove duplicate files to save space"
          illustration="📋"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <Copy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">Run a Smart Scan to discover duplicate files</p>
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
          icon={Copy}
          title="Duplicates"
          subtitle="Find and remove duplicate files to save space"
          illustration="📋"
        />
        <div className="p-12 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
          <p className="text-gray-300">Scanning your Drive for duplicates...</p>
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
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <p className="text-red-400 mb-4">Error loading duplicates</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => runScan('root', 'user')}>
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
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <Copy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">No duplicate files found</p>
          <p className="text-sm text-gray-500">Your Drive has no duplicates!</p>
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
          <Button onClick={() => runScan('root', 'user')} size="lg">
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

      {/* Expand/Collapse Controls */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={expandAll}>
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          Collapse All
        </Button>
      </div>

      {/* Duplicates Table */}
      <div className="border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-glass-border hover:bg-transparent">
              <TableHead className="w-8"></TableHead>
              <TableHead
                className="text-gray-400 cursor-pointer hover:text-gray-300"
                onClick={() => handleSort('name')}
              >
                File Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
              </TableHead>
              <TableHead
                className="text-gray-400 cursor-pointer hover:text-gray-300"
                onClick={() => handleSort('count')}
              >
                Copies {sortBy === 'count' && (sortOrder === 'desc' ? '↓' : '↑')}
              </TableHead>
              <TableHead className="text-gray-400">Total Size</TableHead>
              <TableHead
                className="text-gray-400 cursor-pointer hover:text-gray-300"
                onClick={() => handleSort('wasted')}
              >
                Wasted Space {sortBy === 'wasted' && (sortOrder === 'desc' ? '↓' : '↑')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGroups.map((group) => (
              <DuplicateGroupRow
                key={group.file_name}
                group={group}
                isExpanded={expandedGroups.has(group.file_name)}
                onToggle={() => toggleGroup(group.file_name)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Info Card */}
      <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">About Duplicates</h3>
        <p className="text-gray-400 text-sm">
          Duplicate files are identified by matching file names and sizes. Click on a group to expand and see
          all duplicate copies. The "wasted space" shows how much storage you could reclaim by keeping only
          one copy and deleting the rest.
        </p>
      </div>
    </div>
  )
}
