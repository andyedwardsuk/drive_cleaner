import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2,
  ArchiveRestore,
  RotateCcw,
  AlertTriangle,
  Clock,
  HardDrive,
  CheckCircle2,
  X,
  Search,
  Download,
  Eye,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  FileCode,
  Film,
  Image as ImageIcon,
  Music,
  Archive,
  AlertOctagon,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowUpDown
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { useTrashGovernance } from '@/hooks/useTrashGovernance'
import { useFilePreview, normalizeFileMetadata } from '@/hooks/useFilePreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TableSkeleton } from '@/components/ui/TableSkeleton'
import { cn } from '@/lib/utils'

function getCategoryIcon(category) {
  switch (category) {
    case 'video':
      return Film
    case 'image':
      return ImageIcon
    case 'audio':
      return Music
    case 'spreadsheet':
      return FileSpreadsheet
    case 'presentation':
    case 'document':
      return FileText
    case 'archive':
      return Archive
    default:
      return FileCode
  }
}

export default function TrashGovernanceView() {
  const {
    loading,
    error,
    overview,
    activeTab,
    setActiveTab,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedIds,
    toggleSelect,
    selectAllVisible,
    deselectAll,
    filteredFiles,
    isRestoring,
    isPurging,
    isEmptying,
    actionMessage,
    restoreSelected,
    restoreSingle,
    purgeSelectedPermanently,
    purgeSinglePermanently,
    emptyDriveTrashPermanently,
    exportManifestCSV,
    loadData
  } = useTrashGovernance()

  const { openPreview } = useFilePreview()

  // Modal States
  const [purgeSelectedModalOpen, setPurgeSelectedModalOpen] = useState(false)
  const [emptyTrashModalOpen, setEmptyTrashModalOpen] = useState(false)
  const [purgeConfirmText, setPurgeConfirmText] = useState('')
  const [singlePurgeTarget, setSinglePurgeTarget] = useState(null)

  const summary = overview.summary || {}

  // Selected files metrics
  const selectedFilesList = useMemo(() => {
    const list = overview.files || []
    return list.filter((f) => selectedIds.has(f.id))
  }, [overview.files, selectedIds])

  const selectedBytes = useMemo(() => {
    return selectedFilesList.reduce((sum, f) => sum + f.fileSize, 0)
  }, [selectedFilesList])

  const selectedBytesFormatted = useMemo(() => {
    if (selectedBytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(selectedBytes) / Math.log(k))
    return `${(selectedBytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }, [selectedBytes])

  const isAllVisibleSelected =
    filteredFiles.length > 0 && filteredFiles.every((f) => selectedIds.has(f.id))

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      deselectAll()
    } else {
      selectAllVisible()
    }
  }

  const handlePreview = (file) => {
    openPreview(normalizeFileMetadata(file))
  }

  const handleOpenSinglePurge = (file) => {
    setSinglePurgeTarget(file)
  }

  const handleConfirmSinglePurge = async () => {
    if (!singlePurgeTarget) return
    await purgeSinglePermanently(singlePurgeTarget.id)
    setSinglePurgeTarget(null)
  }

  const handleConfirmPurgeSelected = async () => {
    await purgeSelectedPermanently()
    setPurgeSelectedModalOpen(false)
  }

  const handleConfirmEmptyTrash = async () => {
    if (purgeConfirmText.trim().toUpperCase() !== 'PURGE') return
    await emptyDriveTrashPermanently()
    setEmptyTrashModalOpen(false)
    setPurgeConfirmText('')
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast / Notification Banner */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              'fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-xl transition-all',
              actionMessage.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            )}
          >
            {actionMessage.type === 'error' ? (
              <AlertOctagon className="h-5 w-5 text-red-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
            <span className="text-sm font-medium">{actionMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <Hero
        title="Cloud Trash Governance"
        subtitle="Audit trapped storage in Google Drive Trash and execute safe permanent purges"
        faIcon={faTrashCan}
        variant="rose"
      />

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Trapped Storage */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <HardDrive className="h-16 w-16 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <HardDrive className="h-4 w-4 text-indigo-400" />
              Trapped Trash Storage
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {summary.totalBytesFormatted || '0 B'}
            </div>
            <p className="text-xs text-slate-400 mt-1">Consuming your Google account quota</p>
          </div>

          {/* Card 2: Total Items */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trash2 className="h-16 w-16 text-blue-400" />
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <Trash2 className="h-4 w-4 text-blue-400" />
              Items in Trash
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {summary.totalCount || 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Across all categories in bin</p>
          </div>

          {/* Card 3: Expiring Soon */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock className="h-16 w-16 text-red-400" />
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <Clock className="h-4 w-4 text-red-400" />
              Expiring Soon (&lt; 7d)
            </div>
            <div className="text-3xl font-bold text-red-400 tracking-tight">
              {summary.criticalCount || 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Auto-deleted permanently by Google</p>
          </div>

          {/* Card 4: Accidental Deletion Candidates */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <AlertTriangle className="h-16 w-16 text-amber-400" />
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Accidental Candidates
            </div>
            <div className="text-3xl font-bold text-amber-400 tracking-tight">
              {summary.accidentalCandidatesCount || 0}
            </div>
            <p className="text-xs text-slate-400 mt-1">Recent or critical documents in trash</p>
          </div>
        </div>

        {/* Policy Explainer Banner */}
        <div className="bg-slate-900/40 border border-slate-800/70 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                Google Drive 30-Day Auto-Purge Policy & Storage Quota
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Items in Trash continue to consume storage quota until permanently deleted. Google automatically purges items after 30 days. You can restore misplaced files or permanently delete clutter to immediately free storage.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="h-10 px-4 rounded-xl border-slate-800 hover:bg-slate-800/80 text-slate-300"
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setEmptyTrashModalOpen(true)}
              disabled={loading || summary.totalCount === 0}
              className="h-10 px-4 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-medium shadow-md shadow-red-950/40"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Empty Entire Trash
            </Button>
          </div>
        </div>

        {/* Navigation Tabs & Controls Toolbar */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300'
              )}
            >
              All Items ({summary.totalCount || 0})
            </button>
            <button
              onClick={() => setActiveTab('expiring')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
                activeTab === 'expiring'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300'
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              Expiring Soon ({summary.criticalCount || 0})
            </button>
            <button
              onClick={() => setActiveTab('large')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
                activeTab === 'large'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300'
              )}
            >
              <HardDrive className="h-3.5 w-3.5" />
              Large Items (&gt;50MB)
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
                activeTab === 'recent'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Recent (&le; 3d)
            </button>
            <button
              onClick={() => setActiveTab('accidental')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
                activeTab === 'accidental'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300'
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Accidental Candidates ({summary.accidentalCandidatesCount || 0})
            </button>
          </div>

          {/* Unified Controls Row (All h-11) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search trashed files..."
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

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-11 bg-slate-950/80 border border-slate-800 rounded-xl px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">All File Categories</option>
                <option value="video">Videos</option>
                <option value="image">Images & Photos</option>
                <option value="document">Documents & PDFs</option>
                <option value="spreadsheet">Spreadsheets</option>
                <option value="presentation">Presentations</option>
                <option value="archive">Archives & Zips</option>
                <option value="audio">Audio Files</option>
                <option value="other">Other Files</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-11 bg-slate-950/80 border border-slate-800 rounded-xl px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="remaining_asc">Urgency (Fewest Days Left)</option>
                <option value="size_desc">File Size (Largest First)</option>
                <option value="days_desc">Time in Trash (Longest First)</option>
                <option value="name_asc">File Title (A–Z)</option>
              </select>
            </div>

            {/* Export Manifest */}
            <div className="md:col-span-2">
              <Button
                variant="outline"
                onClick={exportManifestCSV}
                disabled={!overview.files || overview.files.length === 0}
                className="w-full h-11 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Selected Items Batch Floating Toolbar */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-slate-900 border border-blue-500/40 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-bold">
                  {selectedIds.size} Selected
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Trapped Quota: <strong className="text-white">{selectedBytesFormatted}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deselectAll}
                  className="h-10 text-xs text-slate-400 hover:text-white"
                >
                  Clear Selection
                </Button>

                <Button
                  size="sm"
                  onClick={restoreSelected}
                  disabled={isRestoring || isPurging}
                  className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/30"
                >
                  <RotateCcw className={cn('h-4 w-4 mr-1.5', isRestoring && 'animate-spin')} />
                  Restore to Drive
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setPurgeSelectedModalOpen(true)}
                  disabled={isRestoring || isPurging}
                  className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-950/30"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Permanently Purge
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trashed Files Table */}
        <div className="relative bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {loading && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-pulse z-30 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          )}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      onChange={handleToggleSelectAll}
                      disabled={loading}
                      className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/20 cursor-pointer disabled:opacity-40"
                    />
                  </th>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Days in Trash</th>
                  <th className="py-3.5 px-4">Auto-Purge Countdown</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={cn('divide-y divide-slate-800/50 text-sm', loading && filteredFiles.length > 0 && 'opacity-60 transition-opacity duration-150')}>
                {loading && filteredFiles.length === 0 ? (
                  <TableSkeleton rows={8} columnWidths={['w-4', 'w-56', 'w-20', 'w-16', 'w-24', 'w-32', 'w-16']} />
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <ShieldCheck className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-base font-medium text-slate-300">No items match your filter</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {overview.files?.length === 0
                          ? 'Your Google Drive Trash is completely clean!'
                          : 'Try selecting a different filter tab or clearing your search.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => {
                    const CategoryIcon = getCategoryIcon(file.category)
                    const isSelected = selectedIds.has(file.id)

                    return (
                      <tr
                        key={file.id}
                        className={cn(
                          'hover:bg-slate-800/40 transition-colors group',
                          isSelected && 'bg-blue-950/20'
                        )}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(file.id)}
                            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                          />
                        </td>

                        {/* Title & Icons */}
                        <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300 shrink-0">
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            <div className="truncate">
                              <div className="font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                                {file.title}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {file.isAccidentalCandidate && (
                                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                    <AlertTriangle className="h-2.5 w-2.5" />
                                    Accidental Suspect
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-500 truncate">
                                  {file.mimeType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="capitalize text-xs text-slate-300 px-2.5 py-1 rounded-md bg-slate-800/60">
                            {file.category}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-200 whitespace-nowrap">
                          {file.fileSizeFormatted}
                        </td>

                        {/* Days in Trash */}
                        <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                          {file.daysInTrash} days ago
                        </td>

                        {/* Auto-Purge Countdown */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {file.urgencyTier === 'critical' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              <Clock className="h-3 w-3" />
                              {file.daysRemaining} days left!
                            </span>
                          ) : file.urgencyTier === 'approaching' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <Clock className="h-3 w-3" />
                              {file.daysRemaining} days left
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-slate-400 bg-slate-800/80 border border-slate-700/60">
                              <Clock className="h-3 w-3 text-slate-500" />
                              {file.daysRemaining} days left
                            </span>
                          )}
                        </td>

                        {/* Row Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(file)}
                              title="Preview file"
                              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Restore */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => restoreSingle(file.id)}
                              title="Restore to Drive"
                              className="h-8 px-2.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 text-xs font-medium"
                            >
                              <RotateCcw className="h-3.5 w-3.5 mr-1" />
                              Restore
                            </Button>

                            {/* Purge Permanently */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenSinglePurge(file)}
                              title="Permanently purge"
                              className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Selective Permanent Purge Confirmation */}
        <AnimatePresence>
          {purgeSelectedModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                    <AlertOctagon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Permanently Delete Items?</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      You are about to permanently purge{' '}
                      <strong className="text-slate-200">{selectedIds.size} files</strong> totaling{' '}
                      <strong className="text-white">{selectedBytesFormatted}</strong>. This cannot be undone and files cannot be recovered.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 max-h-36 overflow-y-auto text-xs text-slate-400 divide-y divide-slate-800/40">
                  {selectedFilesList.map((f) => (
                    <div key={f.id} className="py-1.5 flex justify-between gap-2">
                      <span className="truncate text-slate-300">{f.title}</span>
                      <span className="shrink-0 font-mono text-slate-500">{f.fileSizeFormatted}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setPurgeSelectedModalOpen(false)}
                    className="h-11 rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmPurgeSelected}
                    disabled={isPurging}
                    className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-950/50"
                  >
                    {isPurging ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Purging...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Confirm Permanent Purge
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 2: Single File Purge Confirmation */}
        <AnimatePresence>
          {singlePurgeTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                    <AlertOctagon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Permanently Delete File?</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Are you sure you want to permanently delete{' '}
                      <strong className="text-slate-200">"{singlePurgeTarget.title}"</strong> (
                      {singlePurgeTarget.fileSizeFormatted})? This action is irreversible.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSinglePurgeTarget(null)}
                    className="h-11 rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmSinglePurge}
                    disabled={isPurging}
                    className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold"
                  >
                    {isPurging ? 'Purging...' : 'Permanently Delete'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal 3: Empty Entire Trash (Strict Double Verification) */}
        <AnimatePresence>
          {emptyTrashModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-red-500/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                    <AlertOctagon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white tracking-tight">
                      Empty Entire Google Drive Trash?
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      This will permanently and irreversibly destroy all{' '}
                      <strong className="text-white">{summary.totalCount} files</strong> (
                      <strong className="text-white">{summary.totalBytesFormatted}</strong>) in your Google Drive Trash. No files can ever be restored after this operation.
                    </p>
                  </div>
                </div>

                <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 space-y-2">
                  <label className="text-xs font-semibold text-red-300 block">
                    To safeguard against accidental data loss, please type{' '}
                    <span className="font-mono font-bold text-white bg-red-900/60 px-1.5 py-0.5 rounded">
                      PURGE
                    </span>{' '}
                    below to confirm:
                  </label>
                  <Input
                    type="text"
                    value={purgeConfirmText}
                    onChange={(e) => setPurgeConfirmText(e.target.value)}
                    placeholder="Type PURGE to confirm"
                    className="h-11 bg-slate-950 border-red-500/40 rounded-xl font-mono text-center tracking-widest text-red-200 focus-visible:ring-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmptyTrashModalOpen(false)
                      setPurgeConfirmText('')
                    }}
                    className="h-11 rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmEmptyTrash}
                    disabled={isEmptying || purgeConfirmText.trim().toUpperCase() !== 'PURGE'}
                    className="h-11 px-6 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold shadow-lg shadow-red-950/60"
                  >
                    {isEmptying ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Emptying Trash...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Empty Entire Trash
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  )
}
