import { useState, useMemo, useEffect } from 'react'
import { Copy, RefreshCw, ChevronDown, ChevronRight, Eye, Search, X, Sparkles, Trash2 } from 'lucide-react'
import { faClone } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSmartScan } from '@/hooks/useSmartScan'
import { useFilePreview, normalizeFileMetadata } from '@/hooks/useFilePreview'
import { useFileActions } from '@/hooks/useFileActions'
import { TrashConfirmationModal } from '@/components/actions/TrashConfirmationModal'
import { UndoToast } from '@/components/actions/UndoToast'
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
function DuplicatesSummary({ totalWastedSpace, groupCount, fileCount, onCleanAll, canClean }) {
  return (
    <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Copy className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Duplicate Files Found
          </p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {fileCount} {fileCount === 1 ? 'duplicate' : 'duplicates'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {groupCount} {groupCount === 1 ? 'group' : 'groups'} • <span className="text-cyan-300 font-semibold">{formatBytes(totalWastedSpace)}</span> reclaimable space
          </p>
        </div>
      </div>

      {canClean && (
        <Button
          onClick={onCleanAll}
          className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-900/30 flex items-center gap-2 self-start sm:self-auto shrink-0 transition-all active:scale-[0.98]"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clean All Duplicates ({formatBytes(totalWastedSpace)})</span>
        </Button>
      )}
    </div>
  )
}

/**
 * Duplicate group row component (expandable)
 */
function DuplicateGroupRow({ group, isExpanded, onToggle, onPreview, onCleanGroup, onTrashItem, trashedIds }) {
  // Filter active items that haven't been trashed yet
  const activeItems = (group.items || []).filter((item) => !trashedIds.has(item.file_id || item.fileId))
  const copiesToClean = activeItems.length > 1 ? activeItems.slice(1) : (activeItems.length === 1 && (group.items?.length === 1 || group.duplicate_count > 1) ? activeItems : [])
  const isGroupCleaned = (activeItems.length <= 1 && (group.items?.length || 0) > 1) || activeItems.length === 0
  const wastedBytes = activeItems.length > 1
    ? activeItems.slice(1).reduce((sum, item) => sum + (item.size_bytes || 0), 0)
    : (activeItems.length === 1 && group.items?.length === 1 ? (activeItems[0].size_bytes || 0) : 0)

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
          <div className="flex items-center gap-2">
            <span>{group.file_name}</span>
            {isGroupCleaned && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Cleaned
              </span>
            )}
          </div>
        </TableCell>
        <TableCell>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {activeItems.length} {activeItems.length === 1 ? 'copy remaining' : 'copies'}
          </span>
        </TableCell>
        <TableCell className="text-slate-300 font-mono text-xs">
          {formatBytes(group.total_size_bytes)}
        </TableCell>
        <TableCell className="text-xs font-semibold text-slate-300">
          {wastedBytes > 0 ? (
            <span className="text-cyan-400">{formatBytes(wastedBytes)} wasted</span>
          ) : (
            <span className="text-emerald-400 font-medium">0 B wasted (Clean)</span>
          )}
        </TableCell>
        <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
          {copiesToClean.length > 0 ? (
            <Button
              size="sm"
              onClick={() => onCleanGroup(group)}
              className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-900/30 text-xs font-semibold flex items-center gap-1.5 transition-all ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clean {copiesToClean.length === 1 ? 'Copy' : `${copiesToClean.length} Copies`}</span>
            </Button>
          ) : (
            <span className="text-xs text-emerald-400/90 font-medium pr-2">Resolved</span>
          )}
        </TableCell>
      </TableRow>

      {/* Expanded: Show individual files */}
      {isExpanded &&
        group.items?.map((item, index) => {
          const isTrashed = trashedIds.has(item.file_id || item.fileId)
          const isOriginal = (group.items?.length || 0) > 1 && index === 0

          return (
            <TableRow
              key={item.file_id || item.fileId || index}
              className={cn(
                'border-b border-slate-800/40 bg-slate-950/40 hover:bg-slate-800/30 transition-colors',
                isTrashed && 'opacity-40 line-through'
              )}
            >
              <TableCell className="pl-6">
                <div className={cn('w-2 h-2 rounded-full', isOriginal ? 'bg-emerald-400' : 'bg-cyan-400/60')} />
              </TableCell>
              <TableCell className="text-slate-300 text-xs pl-4">
                <div className="flex items-center justify-between gap-2 max-w-sm">
                  <span className="truncate">{item.file_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPreview(item)
                    }}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg shrink-0"
                    title="Preview file"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-slate-400 text-xs">
                Copy {index + 1} {isOriginal ? (
                  <span className="text-emerald-400 font-semibold ml-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Original (Kept)
                  </span>
                ) : (
                  <span className="text-amber-400/90 font-medium ml-1.5 text-[11px]">
                    (Duplicate)
                  </span>
                )}
              </TableCell>
              <TableCell className="text-slate-400 font-mono text-xs">
                {formatBytes(item.size_bytes)}
              </TableCell>
              <TableCell className="text-slate-400 text-xs">
                {formatDate(item.created_date || item.modified_date)}
              </TableCell>
              <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                {!isTrashed ? (
                  <Button
                    size="sm"
                    variant={isOriginal ? 'ghost' : 'default'}
                    onClick={() => onTrashItem(item)}
                    className={cn(
                      'h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ml-auto',
                      isOriginal
                        ? 'bg-slate-800/80 hover:bg-red-600 text-slate-400 hover:text-white border border-slate-700'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-900/30'
                    )}
                    title={isOriginal ? 'Move this copy to trash' : 'Move duplicate copy to trash'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isOriginal ? 'Trash Original' : 'Trash Copy'}</span>
                  </Button>
                ) : (
                  <span className="text-[11px] text-red-400 italic pr-2">In Trash</span>
                )}
              </TableCell>
            </TableRow>
          )
        })}
    </>
  )
}

/**
 * Duplicates View Component
 */
export default function DuplicatesView() {
  const { data, loading, error, runScan } = useSmartScan()
  const { openPreview } = useFilePreview()
  const {
    isTrashing,
    trashProgress,
    confirmModalOpen,
    filesPendingTrash,
    requestTrash,
    cancelTrash,
    executeTrash,
    undoToast,
    executeRestore,
    dismissUndo,
    isRestoring,
  } = useFileActions()

  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('wasted') // 'wasted', 'count', 'name'
  const [sortOrder, setSortOrder] = useState('desc')
  const [trashedIds, setTrashedIds] = useState(new Set())

  // Track trashed & restored files via global events
  useEffect(() => {
    const handleTrashed = (e) => {
      const ids = e.detail?.fileIds || []
      setTrashedIds((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.add(id))
        return next
      })
    }

    const handleRestored = (e) => {
      const files = e.detail?.files || []
      setTrashedIds((prev) => {
        const next = new Set(prev)
        files.forEach((f) => next.delete(f.fileId || f.id || f.file_id))
        return next
      })
    }

    window.addEventListener('drive_cleaner_files_trashed', handleTrashed)
    window.addEventListener('drive_cleaner_files_restored', handleRestored)
    return () => {
      window.removeEventListener('drive_cleaner_files_trashed', handleTrashed)
      window.removeEventListener('drive_cleaner_files_restored', handleRestored)
    }
  }, [])

  // Resolve groups from data (either pre-grouped or derived from items)
  const rawGroups = useMemo(() => {
    if (data?.duplicates?.groups && data.duplicates.groups.length > 0) {
      return data.duplicates.groups.map((group) => {
        if (!group.items || group.items.length === 0) {
          const matched = (data?.duplicates?.items || []).filter((i) => i.file_name === group.file_name)
          return {
            ...group,
            items: matched.length > 0 ? matched : (group.items || []),
          }
        }
        return group
      })
    }
    if (data?.duplicates?.items && data.duplicates.items.length > 0) {
      const map = new Map()
      data.duplicates.items.forEach((item) => {
        const key = `${item.file_name}_${item.size_bytes}`
        if (!map.has(key)) {
          map.set(key, [])
        }
        map.get(key).push(item)
      })
      return Array.from(map.values()).map((items) => {
        const totalSize = items.reduce((s, i) => s + (i.size_bytes || 0), 0)
        return {
          file_name: items[0].file_name,
          duplicate_count: items.length > 1 ? items.length : items.length + 1,
          total_size_bytes: totalSize,
          items: items,
        }
      })
    }
    return []
  }, [data])

  // Compute all actionable duplicate copies (excluding the preserved original at index 0)
  const allDuplicateCopies = useMemo(() => {
    const copies = []
    rawGroups.forEach((group) => {
      if (group.items && group.items.length > 1) {
        group.items.slice(1).forEach((item) => {
          if (!trashedIds.has(item.file_id || item.fileId)) {
            copies.push(item)
          }
        })
      } else if (group.items && group.items.length === 1) {
        const item = group.items[0]
        if (!trashedIds.has(item.file_id || item.fileId)) {
          copies.push(item)
        }
      }
    })
    return copies
  }, [rawGroups, trashedIds])

  const handleCleanAllDuplicates = () => {
    if (allDuplicateCopies.length > 0) {
      requestTrash(allDuplicateCopies)
    }
  }

  const handleCleanGroup = (group) => {
    const activeItems = (group.items || []).filter((item) => !trashedIds.has(item.file_id || item.fileId))
    const copies = activeItems.length > 1 ? activeItems.slice(1) : (activeItems.length === 1 && group.items.length > 1 ? [] : activeItems)
    if (copies.length > 0) {
      requestTrash(copies)
    }
  }

  const handleTrashItem = (item) => {
    requestTrash([item])
  }

  // Toggle specific group expansion
  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupName)) {
        next.delete(groupName)
      } else {
        next.add(groupName)
      }
      return next
    })
  }

  // Expand all groups
  const expandAll = () => {
    if (rawGroups.length > 0) {
      setExpandedGroups(new Set(rawGroups.map((g) => g.file_name)))
    }
  }

  // Collapse all groups
  const collapseAll = () => {
    setExpandedGroups(new Set())
  }

  // Filter and Sort groups
  const filteredAndSortedGroups = useMemo(() => {
    if (rawGroups.length === 0) return []

    let groups = [...rawGroups]

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
  }, [rawGroups, searchQuery, sortBy, sortOrder])

  // Calculate dynamic totals accounting for trashed copies
  const { totalWastedSpace, totalFileCount, groupCount } = useMemo(() => {
    if (rawGroups.length === 0) {
      return {
        totalWastedSpace: 0,
        totalFileCount: 0,
        groupCount: 0,
      }
    }

    let activeDuplicatesCount = 0
    let activeWastedBytes = 0
    let activeGroupCount = 0

    rawGroups.forEach((group) => {
      const activeItems = (group.items || []).filter((item) => !trashedIds.has(item.file_id || item.fileId))
      if (activeItems.length > 1) {
        activeGroupCount += 1
        activeDuplicatesCount += activeItems.length - 1
        const groupWasted = activeItems.slice(1).reduce((sum, item) => sum + (item.size_bytes || 0), 0)
        activeWastedBytes += groupWasted
      } else if (activeItems.length === 1 && group.items.length === 1 && !trashedIds.has(group.items[0].file_id || group.items[0].fileId)) {
        activeGroupCount += 1
        activeDuplicatesCount += 1
        activeWastedBytes += (group.items[0].size_bytes || 0)
      }
    })

    return {
      totalWastedSpace: activeWastedBytes,
      totalFileCount: activeDuplicatesCount,
      groupCount: activeGroupCount,
    }
  }, [rawGroups, trashedIds])

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
          faIcon={faClone}
          variant="primary"
          title="Duplicates"
          subtitle="Find and remove duplicate files to save space"
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

  return (
    <div className="space-y-6">
      <Hero
        faIcon={faClone}
        variant="primary"
        title="Duplicates"
        subtitle="Find and remove duplicate files to save space"
        actions={
          <div className="flex items-center gap-2">
            {allDuplicateCopies.length > 0 && (
              <Button
                onClick={handleCleanAllDuplicates}
                className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-900/40 flex items-center gap-2 active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clean All Copies ({formatBytes(totalWastedSpace)})</span>
              </Button>
            )}
            <Button
              onClick={() => runScan('root', 'user')}
              disabled={loading}
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/40 disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
              {loading ? 'Scanning...' : 'Refresh Scan'}
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 border border-red-500/30 rounded-2xl bg-red-950/20 text-red-400 text-sm flex items-center justify-between gap-3">
          <p><strong>Error loading duplicates:</strong> {error}</p>
          <Button
            size="sm"
            onClick={() => runScan('root', 'user')}
            className="h-8 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Summary with Quick Clean */}
      <DuplicatesSummary
        totalWastedSpace={totalWastedSpace}
        groupCount={groupCount}
        fileCount={totalFileCount}
        onCleanAll={handleCleanAllDuplicates}
        canClean={allDuplicateCopies.length > 0}
      />

      {/* Search and Expand/Collapse Controls */}
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
          {allDuplicateCopies.length > 0 && (
            <Button
              onClick={handleCleanAllDuplicates}
              className="h-11 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-red-900/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clean {allDuplicateCopies.length} {allDuplicateCopies.length === 1 ? 'Duplicate' : 'Duplicates'}</span>
            </Button>
          )}
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
              <TableHead className="text-slate-400 text-right pr-6">Action</TableHead>
            </tr>
          </TableHeader>
          <TableBody className={cn('divide-y divide-slate-800/50 text-sm', loading && filteredAndSortedGroups.length > 0 && 'opacity-60 transition-opacity duration-150')}>
            {loading && filteredAndSortedGroups.length === 0 ? (
              <TableSkeleton rows={6} columnWidths={['w-6', 'w-64', 'w-24', 'w-20', 'w-16', 'w-24']} />
            ) : filteredAndSortedGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-14 text-center">
                  <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-200">No duplicate files found</p>
                  <p className="text-xs text-slate-500 mt-1">Your Google Drive has zero duplicate file clutter!</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedGroups.map((group) => (
                <DuplicateGroupRow
                  key={group.file_name}
                  group={group}
                  isExpanded={expandedGroups.has(group.file_name)}
                  onToggle={() => toggleGroup(group.file_name)}
                  onPreview={handlePreview}
                  onCleanGroup={handleCleanGroup}
                  onTrashItem={handleTrashItem}
                  trashedIds={trashedIds}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Safety Confirmation Modal */}
      <TrashConfirmationModal
        isOpen={confirmModalOpen}
        files={filesPendingTrash}
        onConfirm={executeTrash}
        onCancel={cancelTrash}
        isTrashing={isTrashing}
        trashProgress={trashProgress}
      />

      {/* Undo Toast Banner */}
      <UndoToast
        undoToast={undoToast}
        onUndo={executeRestore}
        onDismiss={dismissUndo}
        isRestoring={isRestoring}
      />

      {/* Info Card */}
      <div className="p-5 border border-slate-800/70 rounded-2xl bg-slate-900/40 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-1">About Duplicate Cleanup</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Drive Cleaner automatically preserves the original newest version of your file and identifies surplus copies for safe removal. You can review copies with the eye preview, clean individual copies, clean a specific group, or click <strong>Clean All Duplicates</strong> to reclaim space in one click. All deleted files are safely moved to Google Drive Trash with full multi-session undo.
        </p>
      </div>
    </div>
  )
}
