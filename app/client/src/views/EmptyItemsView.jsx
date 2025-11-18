import { useState, useMemo } from 'react'
import { Trash2, Filter, RefreshCw, Folder, FileX } from 'lucide-react'
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
 * Check if item is a folder
 */
function isFolder(mimeType) {
  return mimeType === 'application/vnd.google-apps.folder'
}

/**
 * Type filter chip component
 */
function TypeFilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border transition-all ${
        active
          ? 'bg-purple-500 border-purple-500 text-white'
          : 'bg-card/50 border-glass-border text-gray-300 hover:border-purple-400'
      }`}
    >
      {label}
    </button>
  )
}

/**
 * Empty items summary card
 */
function EmptyItemsSummary({ totalCount, folderCount, fileCount }) {
  return (
    <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-purple-500/10">
          <Trash2 className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Empty Items Found</p>
          <p className="text-2xl font-semibold text-gray-100">{totalCount} items</p>
          <p className="text-sm text-gray-500">
            {folderCount} folders • {fileCount} files
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
  const [typeFilter, setTypeFilter] = useState('all') // 'all', 'folders', 'files'
  const [sortBy, setSortBy] = useState('name')
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

    // Sort items
    items.sort((a, b) => {
      return sortOrder === 'desc'
        ? b.file_name.localeCompare(a.file_name)
        : a.file_name.localeCompare(b.file_name)
    })

    return items
  }, [data, typeFilter, sortOrder])

  // Calculate counts
  const { folderCount, fileCount } = useMemo(() => {
    if (!data?.empty_items?.items) return { folderCount: 0, fileCount: 0 }

    const folders = data.empty_items.items.filter(item => isFolder(item.mime_type)).length
    const files = data.empty_items.items.length - folders

    return { folderCount: folders, fileCount: files }
  }, [data])

  // Toggle sort
  const handleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
  }

  // No scan run yet
  if (!data && !loading && !error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Trash2}
          title="Empty Items"
          subtitle="Find empty files and folders to clean up"
          illustration="🗑️"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <Trash2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">Run a Smart Scan to discover empty items</p>
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
          icon={Trash2}
          title="Empty Items"
          subtitle="Find empty files and folders to clean up"
          illustration="🗑️"
        />
        <div className="p-12 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-3" />
          <p className="text-gray-300">Scanning your Drive for empty items...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Trash2}
          title="Empty Items"
          subtitle="Find empty files and folders to clean up"
          illustration="🗑️"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <p className="text-red-400 mb-4">Error loading empty items</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => runScan('root', 'user')}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // No empty items found
  if (!data?.empty_items?.items || data.empty_items.items.length === 0) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Trash2}
          title="Empty Items"
          subtitle="Find empty files and folders to clean up"
          illustration="🗑️"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <Trash2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">No empty items found</p>
          <p className="text-sm text-gray-500">Your Drive is clean!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Hero
        icon={Trash2}
        title="Empty Items"
        subtitle="Find empty files and folders to clean up"
        illustration="🗑️"
        actions={
          <Button onClick={() => runScan('root', 'user')} size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Scan
          </Button>
        }
      />

      {/* Summary */}
      <EmptyItemsSummary
        totalCount={filteredItems.length}
        folderCount={folderCount}
        fileCount={fileCount}
      />

      {/* Type Filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter by Type
        </label>
        <div className="flex flex-wrap gap-2">
          <TypeFilterChip
            label="All Items"
            active={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          />
          <TypeFilterChip
            label="📁 Folders Only"
            active={typeFilter === 'folders'}
            onClick={() => setTypeFilter('folders')}
          />
          <TypeFilterChip
            label="📄 Files Only"
            active={typeFilter === 'files'}
            onClick={() => setTypeFilter('files')}
          />
        </div>
      </div>

      {/* Items Table */}
      {filteredItems.length === 0 ? (
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <p className="text-gray-400">No items match the selected filter</p>
        </div>
      ) : (
        <div className="border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-glass-border hover:bg-transparent">
                <TableHead className="text-gray-400">Type</TableHead>
                <TableHead
                  className="text-gray-400 cursor-pointer hover:text-gray-300"
                  onClick={handleSort}
                >
                  Name {sortOrder === 'desc' ? '↓' : '↑'}
                </TableHead>
                <TableHead className="text-gray-400">Criteria</TableHead>
                <TableHead className="text-gray-400">Safety</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => (
                <TableRow key={item.file_id || index} className="border-glass-border hover:bg-white/5">
                  <TableCell>
                    {isFolder(item.mime_type) ? (
                      <Folder className="w-5 h-5 text-purple-400" />
                    ) : (
                      <FileX className="w-5 h-5 text-purple-300" />
                    )}
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {item.file_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {item.matched_criteria?.map((criteria, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        >
                          {criteria.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.safety_level === 'safe'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : item.safety_level === 'review'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {item.safety_level}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Info Card */}
      <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">About Empty Items</h3>
        <p className="text-gray-400 text-sm">
          Empty folders and files take up minimal space but can clutter your Drive.
          Items marked as "safe" can typically be deleted without risk. Always review before deleting.
        </p>
      </div>
    </div>
  )
}
