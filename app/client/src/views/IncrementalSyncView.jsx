import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  RefreshCw,
  Database,
  CheckCircle2,
  Clock,
  TrendingDown,
  Trash2,
  Search,
  ExternalLink,
  Maximize2,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Video,
  File,
  HardDrive,
  ShieldCheck,
  Activity,
  AlertCircle,
  FolderOpen
} from 'lucide-react'
import Hero from '@/components/Hero'
import { useIncrementalSync } from '@/hooks/useIncrementalSync'
import { useFilePreview } from '@/hooks/useFilePreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { APP_VERSION } from '@/version'

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function getFileIcon(mimeType = '') {
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
  }
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('pdf')) {
    return <FileText className="w-4 h-4 text-blue-400" />
  }
  if (mimeType.includes('image')) {
    return <ImageIcon className="w-4 h-4 text-purple-400" />
  }
  if (mimeType.includes('video')) {
    return <Video className="w-4 h-4 text-pink-400" />
  }
  if (mimeType.includes('script') || mimeType.includes('json') || mimeType.includes('javascript')) {
    return <FileCode className="w-4 h-4 text-amber-400" />
  }
  return <File className="w-4 h-4 text-slate-400" />
}

export default function IncrementalSyncView() {
  const {
    initialLoading,
    isSyncing,
    changeToken,
    localFileCount,
    lastSyncedAt,
    lastSyncDurationMs,
    filteredFiles,
    recentDeltas,
    error,
    actionSuccessMessage,
    searchQuery,
    setSearchQuery,
    performanceStats,
    runQuickSync,
    clearLocalCache,
  } = useIncrementalSync()

  const { openPreview } = useFilePreview()
  const [activeTab, setActiveTab] = useState('cached_catalog') // 'cached_catalog' | 'changes_stream' | 'diagnostics'
  const [showConfirmPurge, setShowConfirmPurge] = useState(false)

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <Hero
        icon={Zap}
        badge="Drive Changes API v2 Engine"
        title="Incremental Sync & Real-Time Engine"
        subtitle="Sub-second delta synchronisation using Google Drive Changes tokens and persistent browser IndexedDB storage. Sync instantly without scanning all files."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={runQuickSync}
              disabled={isSyncing || initialLoading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium shadow-lg shadow-amber-500/20 border border-amber-400/20"
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isSyncing && 'animate-spin')} />
              {isSyncing ? 'Synchronizing...' : 'Quick Sync Now'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowConfirmPurge(true)}
              disabled={isSyncing}
              className="bg-slate-900/40 border-slate-700/60 hover:bg-slate-800 text-slate-300"
            >
              <Trash2 className="w-4 h-4 mr-2 text-rose-400" />
              Purge Local Cache
            </Button>
          </div>
        }
      />

      {/* Engine Status Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-slate-900/40 to-slate-900/40 p-5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Activity className={cn('w-6 h-6', isSyncing ? 'animate-pulse text-amber-300' : 'text-amber-400')} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">Drive Changes Engine Status</h2>
                <Badge className={cn('text-xs px-2 py-0.5', isSyncing ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40')}>
                  {performanceStats.cacheStatus}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Drive Change Token: <span className="font-mono text-amber-300 font-medium">{changeToken || 'Generating...'}</span> · Last Synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400">Sync Latency</span>
              <div className="text-lg font-bold text-amber-400 font-mono">
                {lastSyncDurationMs ? `${lastSyncDurationMs}ms` : `${performanceStats.avgLatency}ms`}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-right">
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400">API Quota Saved</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {performanceStats.quotaSavedPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cached Files</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{localFileCount}</div>
          <p className="text-xs text-slate-400 mt-1">IndexedDB browser storage</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Incremental Speed</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">~{performanceStats.avgLatency}ms</div>
          <p className="text-xs text-slate-400 mt-1">vs ~12-15s full re-scan</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Sync Cycles</span>
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">{performanceStats.totalSyncs}</div>
          <p className="text-xs text-slate-400 mt-1">Delta events tracked</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sync Architecture</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">v{APP_VERSION}</div>
          <p className="text-xs text-slate-400 mt-1">Zero-memory-leak engine</p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('cached_catalog')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              activeTab === 'cached_catalog'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            )}
          >
            <Database className="w-4 h-4" />
            Cached Catalog
            <Badge className="ml-1 bg-slate-800 text-slate-300">{filteredFiles.length}</Badge>
          </button>

          <button
            onClick={() => setActiveTab('changes_stream')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              activeTab === 'changes_stream'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            )}
          >
            <Activity className="w-4 h-4" />
            Changes Stream & Deltas
            <Badge className="ml-1 bg-slate-800 text-slate-300">{recentDeltas.length}</Badge>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
              activeTab === 'diagnostics'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            )}
          >
            <HardDrive className="w-4 h-4" />
            Engine Diagnostics
          </button>
        </div>

        {activeTab === 'cached_catalog' && (
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cached files..."
              className="pl-9 h-9 text-xs bg-slate-900/60 border-slate-800 text-slate-200 placeholder:text-slate-500 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Cached Catalog */}
      {activeTab === 'cached_catalog' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 backdrop-blur-md">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Parent Folder</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Last Modified</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                      No files currently cached in local IndexedDB. Click &quot;Quick Sync Now&quot; to fetch changes.
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file.fileId} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-slate-800/60 shrink-0">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate max-w-md group-hover:text-amber-300 transition-colors">
                              {file.fileName}
                            </div>
                            <div className="text-xs text-slate-500 truncate max-w-sm">
                              {file.mimeType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
                          {file.parentName || 'Drive Folder'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">
                        {formatBytes(file.fileSizeBytes)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {file.modifiedDate ? new Date(file.modifiedDate).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openPreview(file)}
                            className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Quick Preview"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </Button>
                          {file.driveLink && (
                            <Button
                              size="sm"
                              variant="ghost"
                              asChild
                              className="h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Open in Drive"
                            >
                              <a href={file.driveLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Changes Stream & Deltas */}
      {activeTab === 'changes_stream' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {recentDeltas.length === 0 ? (
              <div className="p-12 text-center border border-slate-800 rounded-xl text-slate-500 bg-slate-900/30">
                No sync activities recorded yet.
              </div>
            ) : (
              recentDeltas.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg shrink-0 mt-0.5',
                      event.type === 'initial_sync' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                    )}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {event.type === 'initial_sync' ? 'Baseline Synchronisation' : 'Incremental Delta Sync'}
                        </span>
                        <Badge className="text-xs bg-slate-800 text-slate-300 font-mono">
                          Token: {event.token}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="text-emerald-400 font-medium">+{event.createdCount} created</span> ·{' '}
                        <span className="text-blue-400 font-medium">~{event.modifiedCount} updated</span> ·{' '}
                        <span className="text-rose-400 font-medium">-{event.deletedCount} removed</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5">
                      {event.durationMs}ms
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Engine Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-amber-400" />
              IndexedDB Storage Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drive Cleaner bypasses Google Apps Script CacheService quotas (limited to 100KB) and browser localStorage (limited to 5MB) by persisting the entire catalog into client-side IndexedDB.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Database Name:</span>
                <span className="font-mono text-white">drive_cleaner_db</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Primary Object Store:</span>
                <span className="font-mono text-white">files (keyPath: fileId)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Metadata Object Store:</span>
                <span className="font-mono text-white">sync_meta</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Current Cached Records:</span>
                <span className="font-mono text-emerald-400">{localFileCount} files</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              Drive API Quota Conservation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard full scans consume 10 to 50 paginated API calls per folder hierarchy. Incremental sync queries only Drive Changes with startChangeId, completing in 1 API call per synchronisation cycle.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Full Scan API Calls:</span>
                <span className="font-mono text-rose-400">~25 - 60 calls</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Delta Sync API Calls:</span>
                <span className="font-mono text-emerald-400">1 call (98% reduction)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Calculated Quota Saved:</span>
                <span className="font-mono text-amber-300">{performanceStats.quotaSavedPercent}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Engine Health:</span>
                <span className="font-mono text-emerald-400">{performanceStats.healthRating}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Purge Cache */}
      {showConfirmPurge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-950 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Purge Local Sync Cache?</h3>
            </div>
            <p className="text-sm text-slate-400">
              This will erase all cached file records in your browser&apos;s IndexedDB and reset the Drive Change Token. It will not delete any files on Google Drive.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowConfirmPurge(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmPurge(false)
                  clearLocalCache()
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
              >
                Confirm Purge
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
