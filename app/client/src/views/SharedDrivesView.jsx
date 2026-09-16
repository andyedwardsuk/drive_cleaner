import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  HardDrive,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Download,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Film,
  Image as ImageIcon,
  FolderArchive,
  FolderOpen,
  ArrowUpRight,
  Info,
  Sparkles,
  Lock,
  Globe
} from 'lucide-react'
import Hero from '@/components/Hero'
import { useSharedDrives } from '@/hooks/useSharedDrives'
import { useFilePreview } from '@/hooks/useFilePreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function getFileIcon(mimeType) {
  if (!mimeType) return FileText
  if (mimeType.includes('image')) return ImageIcon
  if (mimeType.includes('spreadsheet') || mimeType.includes('sheet') || mimeType.includes('excel')) return FileSpreadsheet
  if (mimeType.includes('video')) return Film
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed')) return FolderArchive
  if (mimeType.includes('folder')) return FolderOpen
  return FileText
}

export default function SharedDrivesView() {
  const {
    drives,
    loading,
    error,
    isWorkspace,
    portfolioMetrics,
    selectedDriveId,
    selectedDrive,
    setSelectedDriveId,
    auditReport,
    auditLoading,
    refresh
  } = useSharedDrives()

  const { openPreview } = useFilePreview()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'high_risk', 'dormant', 'healthy'
  const [activeTab, setActiveTab] = useState('external') // 'external', 'stale'
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter drives
  const filteredDrives = useMemo(() => {
    return drives.filter((drive) => {
      const matchesSearch = drive.name.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      if (filterType === 'high_risk') {
        return (drive.hygieneScore !== undefined && drive.hygieneScore < 60) || (drive.riskFlags?.externalExposureCount > 0)
      }
      if (filterType === 'dormant') {
        return drive.isDormant || drive.daysSinceLastActive >= 180
      }
      if (filterType === 'healthy') {
        return drive.hygieneScore !== undefined && drive.hygieneScore >= 80
      }
      return true
    })
  }, [drives, searchQuery, filterType])

  // Export audit report CSV
  const handleExportCSV = () => {
    if (!selectedDrive || !auditReport) return
    const lines = [
      ['Report', 'Shared Drive Hygiene Audit Manifest'],
      ['Shared Drive Name', selectedDrive.name],
      ['Drive ID', selectedDrive.id],
      ['Hygiene Score', `${auditReport.hygieneScore || 0}/100`],
      ['Total Storage', formatBytes(auditReport.summary?.totalBytes || 0)],
      ['Total Files', auditReport.summary?.fileCount || 0],
      ['Days Inactive', auditReport.summary?.daysSinceLastActive || 0],
      [],
      ['Finding Type', 'File Name', 'Path', 'Size (Bytes)', 'Last Modified', 'Risk / Reason', 'Access']
    ]

    ;(auditReport.externalExposureFiles || []).forEach((f) => {
      lines.push([
        'External Exposure',
        `"${f.name.replace(/"/g, '""')}"`,
        `"${f.path}"`,
        f.sizeBytes,
        f.modifiedDate,
        `"${f.reason}"`,
        `"${f.sharingAccess || ''}"`
      ])
    })

    ;(auditReport.staleLargeFiles || []).forEach((f) => {
      lines.push([
        'Stale Large File',
        `"${f.name.replace(/"/g, '""')}"`,
        `"${f.path}"`,
        f.sizeBytes,
        f.modifiedDate,
        `"${f.reason}"`,
        ''
      ])
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `shared_drive_audit_${selectedDrive.name.replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported audit manifest CSV')
  }

  return (
    <div className="min-h-screen p-8 space-y-8 bg-slate-950 text-slate-100">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-600/90 text-white font-medium shadow-2xl backdrop-blur-md border border-blue-400/30"
          >
            <CheckCircle2 className="w-5 h-5 text-blue-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Hero
        title="Google Workspace Shared Drives Hygiene Hub"
        subtitle="Audit external contributor risks, discover dormant team repositories, and optimize enterprise cloud storage"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="border-glass-border hover:bg-slate-800 text-slate-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            disabled={!selectedDrive || !auditReport}
            className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Audit CSV
          </Button>
        </div>
      </Hero>

      {/* Workspace Context Notice */}
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-blue-500/20 bg-blue-500/10 backdrop-blur-md text-sm text-blue-300">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div className="flex-1">
          <span className="font-semibold text-white">Google Workspace Shared Drives Mode:</span>{' '}
          Shared Drives belong to the organization rather than individual users. Files here persist even when team members leave.
        </div>
        <Badge variant="outline" className="border-blue-400/30 bg-blue-500/20 text-blue-200 text-xs">
          Team Storage
        </Badge>
      </div>

      {/* Portfolio Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-glass-border bg-slate-900/60 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Shared Drives</p>
            <h3 className="text-2xl font-bold text-white mt-1">{portfolioMetrics.totalDrives}</h3>
            <p className="text-xs text-slate-400 mt-1">Domain team repositories</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-glass-border bg-slate-900/60 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Shared Storage</p>
            <h3 className="text-2xl font-bold text-white mt-1">
              {formatBytes(portfolioMetrics.totalStorageBytes)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Across all team drives</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-glass-border bg-slate-900/60 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">High Risk Drives</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1">{portfolioMetrics.highRiskCount}</h3>
            <p className="text-xs text-slate-400 mt-1">External exposure or poor hygiene</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-glass-border bg-slate-900/60 backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dormant Repositories</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{portfolioMetrics.dormantCount}</h3>
            <p className="text-xs text-slate-400 mt-1">&gt; 180 days without file edits</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Layout: Drives Inventory on Left, Deep Audit on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Shared Drives Inventory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <Input
                placeholder="Search Shared Drives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900/60 border-glass-border text-white text-sm"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', label: 'All Drives' },
              { id: 'high_risk', label: 'High Risk' },
              { id: 'dormant', label: 'Dormant' },
              { id: 'healthy', label: 'Healthy' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  filterType === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-glass-border'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Drives Cards List */}
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredDrives.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-glass-border bg-slate-900/40 text-slate-400">
                No Shared Drives match your criteria.
              </div>
            ) : (
              filteredDrives.map((drive) => {
                const isSelected = drive.id === selectedDriveId
                const score = drive.hygieneScore !== undefined ? drive.hygieneScore : 80
                const isScoreGood = score >= 80
                const isScoreFair = score >= 60 && score < 80

                return (
                  <div
                    key={drive.id}
                    onClick={() => setSelectedDriveId(drive.id)}
                    className={cn(
                      'p-4 rounded-2xl border transition-all cursor-pointer relative',
                      isSelected
                        ? 'border-blue-500/60 bg-blue-950/30 shadow-lg shadow-blue-500/10'
                        : 'border-glass-border bg-slate-900/60 hover:bg-slate-800/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white line-clamp-1">{drive.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatBytes(drive.totalBytes || 0)} • {drive.fileCount || 0} files
                          </p>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border',
                          isScoreGood && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                          isScoreFair && 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                          !isScoreGood && !isScoreFair && 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                        )}
                      >
                        {score}/100
                      </div>
                    </div>

                    {/* Risk Tag Chips */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {drive.riskFlags?.externalExposureCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {drive.riskFlags.externalExposureCount} External
                        </span>
                      )}
                      {(drive.isDormant || drive.daysSinceLastActive >= 180) && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Dormant ({drive.daysSinceLastActive}d)
                        </span>
                      )}
                      {drive.riskFlags?.staleLargeFileCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                          {drive.riskFlags.staleLargeFileCount} Large Stale
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right: Deep Audit Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {!selectedDrive ? (
            <div className="p-12 text-center rounded-2xl border border-glass-border bg-slate-900/40 text-slate-400">
              Select a Shared Drive on the left to view its deep hygiene audit.
            </div>
          ) : auditLoading ? (
            <div className="p-12 text-center rounded-2xl border border-glass-border bg-slate-900/40 text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <span>Auditing repository {selectedDrive.name}...</span>
            </div>
          ) : !auditReport ? (
            <div className="p-12 text-center rounded-2xl border border-glass-border bg-slate-900/40 text-slate-400">
              No audit report available.
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-glass-border bg-slate-900/60 backdrop-blur-xl space-y-6">
              {/* Drive Header Banner */}
              <div className="flex items-start justify-between gap-4 border-b border-glass-border pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedDrive.name}</h3>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                      Shared Drive
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    ID: <span className="font-mono">{selectedDrive.id}</span> • Last active{' '}
                    <span className="text-slate-300 font-medium">
                      {auditReport.summary?.daysSinceLastActive === 999
                        ? 'Never'
                        : `${auditReport.summary?.daysSinceLastActive} days ago`}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      showToast(`Scoping active scan to ${selectedDrive.name}`)
                    }}
                    className="border-blue-500/40 hover:bg-blue-600/20 text-blue-300 text-xs"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                    Scope Scan Here
                  </Button>
                </div>
              </div>

              {/* Hygiene Health Meter */}
              <div className="p-4 rounded-xl border border-glass-border bg-slate-950/60 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400">Hygiene Health Rating</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={cn(
                        'text-3xl font-black',
                        auditReport.hygieneScore >= 80
                          ? 'text-emerald-400'
                          : auditReport.hygieneScore >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      )}
                    >
                      {auditReport.hygieneScore}/100
                    </span>
                    <span className="text-xs text-slate-400 max-w-[280px]">
                      {auditReport.hygieneScore >= 80
                        ? 'Compliant and well maintained. Low risk profile.'
                        : auditReport.hygieneScore >= 60
                        ? 'Moderate hygiene issues. External links or stale files found.'
                        : 'High risk repository. Stale or external exposure requires triage.'}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-end gap-1">
                  {auditReport.hygieneScore >= 80 ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Healthy Repository</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Action Recommended</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs: External Exposure vs Stale Files */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-glass-border pb-2">
                  <button
                    onClick={() => setActiveTab('external')}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2',
                      activeTab === 'external'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    External Exposure ({auditReport.externalExposureFiles?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('stale')}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2',
                      activeTab === 'stale'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Stale Large Files ({auditReport.staleLargeFiles?.length || 0})
                  </button>
                </div>

                {/* Tab 1: External Exposure Files */}
                {activeTab === 'external' && (
                  <div className="space-y-2">
                    {(!auditReport.externalExposureFiles || auditReport.externalExposureFiles.length === 0) ? (
                      <div className="p-8 text-center rounded-xl border border-glass-border bg-slate-950/40 text-slate-400 text-xs">
                        <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        No external or public exposure detected in this Shared Drive!
                      </div>
                    ) : (
                      auditReport.externalExposureFiles.map((file) => {
                        const Icon = getFileIcon(file.mimeType)
                        return (
                          <div
                            key={file.id}
                            className="p-3 rounded-xl border border-rose-500/20 bg-slate-950/40 hover:bg-slate-900/80 transition-all flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 flex-shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                                <p className="text-slate-500 text-[11px] truncate">
                                  {file.path} • {formatBytes(file.sizeBytes)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-300 text-[11px]">
                                {file.sharingAccess || 'External Access'}
                              </Badge>

                              {/* Preview Button */}
                              <button
                                onClick={() => openPreview(file, auditReport.externalExposureFiles)}
                                title="Inspect File Preview"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* External Link */}
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}

                {/* Tab 2: Stale Large Files */}
                {activeTab === 'stale' && (
                  <div className="space-y-2">
                    {(!auditReport.staleLargeFiles || auditReport.staleLargeFiles.length === 0) ? (
                      <div className="p-8 text-center rounded-xl border border-glass-border bg-slate-950/40 text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        No large stale files (&gt;50MB untouched for &gt;180 days) found!
                      </div>
                    ) : (
                      auditReport.staleLargeFiles.map((file) => {
                        const Icon = getFileIcon(file.mimeType)
                        return (
                          <div
                            key={file.id}
                            className="p-3 rounded-xl border border-indigo-500/20 bg-slate-950/40 hover:bg-slate-900/80 transition-all flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                                <p className="text-slate-500 text-[11px] truncate">
                                  {file.path} • {formatBytes(file.sizeBytes)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[11px]">
                                Inactive {file.ageDays} days
                              </Badge>

                              {/* Preview Button */}
                              <button
                                onClick={() => openPreview(file, auditReport.staleLargeFiles)}
                                title="Inspect File Preview"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* External Link */}
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
