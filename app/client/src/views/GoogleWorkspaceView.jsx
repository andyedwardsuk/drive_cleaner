import { useState, useMemo } from 'react'
import {
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Clock,
  Share2,
  Lock,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Eye
} from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useSmartScan } from '@/hooks/useSmartScan'
import { useFilePreview } from '@/hooks/useFilePreview'
import FilePreviewModal from '@/components/preview/FilePreviewModal'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * Format days or ISO date to human-readable string
 */
function formatDaysAgo(days, isoDate) {
  if (days === null || days === undefined) {
    if (!isoDate) return 'Never viewed'
    const d = new Date(isoDate)
    const diffDays = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24))
    return `${diffDays} days ago`
  }
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  const years = (days / 365).toFixed(1)
  return `${years} years ago`
}

/**
 * Get visual icon for workspace file type
 */
function getWorkspaceIcon(type) {
  switch (type) {
    case 'document':
      return '📝'
    case 'spreadsheet':
      return '📊'
    case 'presentation':
      return '📽️'
    case 'form':
      return '📋'
    case 'drawing':
      return '🎨'
    case 'site':
      return '🌐'
    case 'script':
      return '⚙️'
    case 'jam':
      return '🎯'
    case 'shortcut':
      return '🔗'
    default:
      return '📄'
  }
}

/**
 * Filter Chip Component
 */
function FilterChip({ label, active, count, onClick, color = 'blue' }) {
  const activeColorClasses = {
    blue: 'bg-blue-600 border-blue-500 text-white shadow-sm',
    orange: 'bg-orange-600 border-orange-500 text-white shadow-sm',
    purple: 'bg-purple-600 border-purple-500 text-white shadow-sm',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-1.5 ${
        active
          ? activeColorClasses[color] || activeColorClasses.blue
          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

/**
 * Summary Metric Card
 */
function MetricCard({ icon: Icon, title, value, subtitle, color = 'blue' }) {
  const colors = {
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400' },
    green: { bg: 'bg-green-500/10', icon: 'text-green-400' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400' },
  }
  const current = colors[color] || colors.blue

  return (
    <div className="p-5 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2.5 rounded-xl ${current.bg}`}>
          <Icon className={`w-5 h-5 ${current.icon}`} />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h4>
          <span className="text-xl font-bold text-white">{value}</span>
        </div>
      </div>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  )
}

/**
 * Google Workspace Files View
 */
export default function GoogleWorkspaceView() {
  const { data, loading, error, runScan } = useSmartScan()

  const [typeFilter, setTypeFilter] = useState('all')
  const [activityFilter, setActivityFilter] = useState('all') // 'all', '6m', '1y', '2y'
  const [sharingFilter, setSharingFilter] = useState('all') // 'all', 'shared', 'private'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('viewed') // 'name', 'viewed', 'type'
  const [sortOrder, setSortOrder] = useState('desc')
  const { previewFile, isPreviewOpen, openPreview, closePreview } = useFilePreview()

  const workspaceData = data?.workspace_files

  const handlePreview = (file) => {
    openPreview({
      id: file.file_id || file.id,
      name: file.file_name || file.name,
      size: file.size_bytes || file.size || 0,
      mimeType: file.mime_type || `application/vnd.google-apps.${file.workspace_type || 'document'}`,
      modifiedTime: file.modified_date || file.modifiedTime,
      webViewLink: file.drive_link || `https://drive.google.com/open?id=${file.file_id}`,
      parentName: file.parent_name,
    })
  }

  // Filtered and sorted files
  const filteredFiles = useMemo(() => {
    if (!workspaceData?.items) return []

    let list = [...workspaceData.items]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((f) => f.file_name?.toLowerCase().includes(q))
    }

    // Type filter
    if (typeFilter !== 'all') {
      list = list.filter((f) => f.workspace_type === typeFilter)
    }

    // Activity filter
    if (activityFilter === '6m') {
      list = list.filter((f) => f.days_since_viewed >= 183)
    } else if (activityFilter === '1y') {
      list = list.filter((f) => f.days_since_viewed >= 365)
    } else if (activityFilter === '2y') {
      list = list.filter((f) => f.days_since_viewed >= 730)
    }

    // Sharing filter
    if (sharingFilter === 'shared') {
      list = list.filter((f) => f.is_shared === true)
    } else if (sharingFilter === 'private') {
      list = list.filter((f) => f.is_shared === false)
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'name') {
        const comp = (a.file_name || '').localeCompare(b.file_name || '')
        return sortOrder === 'desc' ? -comp : comp
      }
      if (sortBy === 'type') {
        const comp = (a.workspace_type || '').localeCompare(b.workspace_type || '')
        return sortOrder === 'desc' ? -comp : comp
      }
      // default: sortBy === 'viewed'
      const daysA = a.days_since_viewed ?? 99999
      const daysB = b.days_since_viewed ?? 99999
      return sortOrder === 'desc' ? daysB - daysA : daysA - daysB
    })

    return list
  }, [workspaceData, searchQuery, typeFilter, activityFilter, sharingFilter, sortBy, sortOrder])

  // Counts by type
  const typeCounts = useMemo(() => {
    const counts = { all: 0 }
    if (!workspaceData?.items) return counts
    counts.all = workspaceData.items.length
    workspaceData.items.forEach((item) => {
      const t = item.workspace_type || 'other'
      counts[t] = (counts[t] || 0) + 1
    })
    return counts
  }, [workspaceData])

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
          icon={FileSpreadsheet}
          title="Google Workspace Files"
          subtitle="Analyze your Docs, Sheets, Slides, Forms, and native Google files"
          illustration="📝"
        />
        <div className="p-12 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm text-center">
          <FileSpreadsheet className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-70" />
          <h3 className="text-lg font-semibold text-slate-200 mb-2">No Scan Data Found</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Run a Smart Scan to inspect and categorize all Google Workspace files across your Drive.
          </p>
          <Button onClick={() => runScan('root', 'user')} size="lg" className="rounded-xl">
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
          icon={FileSpreadsheet}
          title="Google Workspace Files"
          subtitle="Analyzing Google Workspace files..."
          illustration="⏳"
        />
        <div className="p-12 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Scanning and categorizing Workspace files...</p>
        </div>
      </div>
    )
  }

  const unusedCount = workspaceData?.unused_breakdown?.six_months || 0
  const sharedCount = workspaceData?.sharing_breakdown?.shared || 0
  const totalCount = workspaceData?.count || 0

  return (
    <div className="space-y-6">
      <Hero
        icon={FileSpreadsheet}
        title="Google Workspace Files"
        subtitle={`Discovered ${totalCount} native Google Workspace files in ${data?.folder_name || 'My Drive'}`}
        illustration="📝"
        actions={
          <Button onClick={() => runScan('root', 'user')} size="lg" className="rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Scan
          </Button>
        }
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={FileSpreadsheet}
          title="Total Workspace Files"
          value={`${totalCount} files`}
          subtitle="Docs, Sheets, Slides, Forms, etc."
          color="blue"
        />
        <MetricCard
          icon={Clock}
          title="Inactive (>6 Months)"
          value={`${unusedCount} files`}
          subtitle={
            unusedCount > 0
              ? `${Math.round((unusedCount / (totalCount || 1)) * 100)}% not viewed recently`
              : 'All files active'
          }
          color="orange"
        />
        <MetricCard
          icon={Share2}
          title="Shared With Others"
          value={`${sharedCount} files`}
          subtitle={`${(workspaceData?.sharing_breakdown?.private || 0)} private files`}
          color="purple"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm space-y-4">
        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search Workspace files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950/70 border-slate-800 text-sm h-11 rounded-xl text-white"
            />
          </div>

          {/* Activity / Inactive Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-medium mr-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Inactive:
            </span>
            <FilterChip
              label="All Activity"
              active={activityFilter === 'all'}
              onClick={() => setActivityFilter('all')}
              color="orange"
            />
            <FilterChip
              label=">6 Months"
              active={activityFilter === '6m'}
              count={workspaceData?.unused_breakdown?.six_months}
              onClick={() => setActivityFilter('6m')}
              color="orange"
            />
            <FilterChip
              label=">1 Year"
              active={activityFilter === '1y'}
              count={workspaceData?.unused_breakdown?.one_year}
              onClick={() => setActivityFilter('1y')}
              color="orange"
            />
            <FilterChip
              label=">2 Years"
              active={activityFilter === '2y'}
              count={workspaceData?.unused_breakdown?.two_years}
              onClick={() => setActivityFilter('2y')}
              color="orange"
            />
          </div>
        </div>

        {/* File Type Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          <FilterChip
            label="All Types"
            count={typeCounts.all}
            active={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          />
          {typeCounts.document > 0 && (
            <FilterChip
              label="📝 Docs"
              count={typeCounts.document}
              active={typeFilter === 'document'}
              onClick={() => setTypeFilter('document')}
            />
          )}
          {typeCounts.spreadsheet > 0 && (
            <FilterChip
              label="📊 Sheets"
              count={typeCounts.spreadsheet}
              active={typeFilter === 'spreadsheet'}
              onClick={() => setTypeFilter('spreadsheet')}
            />
          )}
          {typeCounts.presentation > 0 && (
            <FilterChip
              label="📽️ Slides"
              count={typeCounts.presentation}
              active={typeFilter === 'presentation'}
              onClick={() => setTypeFilter('presentation')}
            />
          )}
          {typeCounts.form > 0 && (
            <FilterChip
              label="📋 Forms"
              count={typeCounts.form}
              active={typeFilter === 'form'}
              onClick={() => setTypeFilter('form')}
            />
          )}
          {typeCounts.drawing > 0 && (
            <FilterChip
              label="🎨 Drawings"
              count={typeCounts.drawing}
              active={typeFilter === 'drawing'}
              onClick={() => setTypeFilter('drawing')}
            />
          )}
          {typeCounts.shortcut > 0 && (
            <FilterChip
              label="🔗 Shortcuts"
              count={typeCounts.shortcut}
              active={typeFilter === 'shortcut'}
              onClick={() => setTypeFilter('shortcut')}
            />
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Sharing:</span>
            <FilterChip
              label="All"
              active={sharingFilter === 'all'}
              onClick={() => setSharingFilter('all')}
              color="purple"
            />
            <FilterChip
              label="👥 Shared"
              active={sharingFilter === 'shared'}
              onClick={() => setSharingFilter('shared')}
              color="purple"
            />
            <FilterChip
              label="🔒 Private"
              active={sharingFilter === 'private'}
              onClick={() => setSharingFilter('private')}
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Files Table */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm text-center">
          <Info className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No files match your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the type or inactivity filter</p>
        </div>
      ) : (
        <div className="border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800/80 hover:bg-transparent">
                <TableHead className="w-12 text-slate-400">Icon</TableHead>
                <TableHead
                  className="text-slate-400 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('name')}
                >
                  File Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
                </TableHead>
                <TableHead
                  className="text-slate-400 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('type')}
                >
                  Type {sortBy === 'type' && (sortOrder === 'desc' ? '↓' : '↑')}
                </TableHead>
                <TableHead
                  className="text-slate-400 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort('viewed')}
                >
                  Last Viewed {sortBy === 'viewed' && (sortOrder === 'desc' ? '↓' : '↑')}
                </TableHead>
                <TableHead className="text-slate-400">Sharing</TableHead>
                <TableHead className="text-slate-400">Recommendation</TableHead>
                <TableHead className="text-right text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file, idx) => {
                const driveUrl =
                  file.drive_link ||
                  `https://drive.google.com/open?id=${file.file_id}`

                return (
                  <TableRow
                    key={file.file_id || idx}
                    className="border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                  >
                    <TableCell>
                      <span className="text-xl select-none">
                        {getWorkspaceIcon(file.workspace_type)}
                      </span>
                    </TableCell>

                    <TableCell className="font-medium text-slate-200">
                      <div className="flex flex-col">
                        <span className="truncate max-w-xs md:max-w-md">{file.file_name}</span>
                        {file.parent_name && (
                          <span className="text-xs text-slate-500 font-normal">
                            📁 {file.parent_name}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs font-normal border-slate-700 bg-slate-800/60 text-slate-300">
                        {file.workspace_type || 'Workspace'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-orange-400/80" />
                        <span>{formatDaysAgo(file.days_since_viewed, file.last_viewed_date)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {file.is_shared ? (
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs font-normal flex items-center gap-1 w-fit">
                          <Share2 className="w-3 h-3" /> Shared
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400 border-slate-700 text-xs font-normal flex items-center gap-1 w-fit">
                          <Lock className="w-3 h-3" /> Private
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {file.recommendation ? (
                        <div className="flex items-start gap-1.5 text-xs text-amber-300/90 max-w-xs">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                          <span>{file.recommendation}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-green-400/80">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Active</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(file)}
                          className="h-8 px-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                          title="Quick Preview"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Preview
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(driveUrl, '_blank')}
                          className="h-8 px-2 text-xs text-slate-300 hover:text-blue-400 hover:bg-slate-800 rounded-lg"
                          title="Open in Google Workspace"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          Open
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        file={previewFile}
      />
    </div>
  )
}
