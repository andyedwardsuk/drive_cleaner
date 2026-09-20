import { Scan, FileText, Clock, Copy, Trash2, AlertCircle, CheckCircle, ChevronRight, FileSpreadsheet, Flame, Leaf, ExternalLink, RotateCcw, FolderSearch } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faMagnifyingGlassChart, faFolderOpen, faHourglassHalf, faCheck } from '@fortawesome/pro-duotone-svg-icons'
import { useNavigate } from '@tanstack/react-router'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import FolderSelector from '@/components/FolderSelector'
import { useSmartScan } from '@/hooks/useSmartScan'
import { getDriveFolderUrl } from '@/lib/driveUtils'
import { cn } from '@/lib/utils'

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Category summary card component
 */
function CategoryCard({ icon: Icon, title, count, size, color = 'blue', onClick }) {
  // Map colors to static Tailwind classes
  const colorClasses = {
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400' },
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    gray: { bg: 'bg-gray-500/10', icon: 'text-gray-400' },
    yellow: { bg: 'bg-yellow-500/10', icon: 'text-yellow-400' },
    rose: { bg: 'bg-rose-500/10', icon: 'text-rose-400' },
  }

  const classes = colorClasses[color] || colorClasses.blue

  return (
    <div
      className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm hover:bg-slate-800/50 hover:border-blue-500/40 transition-all cursor-pointer group shadow-lg"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${classes.bg}`}>
          <Icon className={`w-6 h-6 ${classes.icon}`} />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">{count}</Badge>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
      <h3 className="font-semibold text-base mb-1 text-white">{title}</h3>
      {size !== undefined && (
        <p className="text-xs text-slate-400">{formatBytes(size)}</p>
      )}
    </div>
  )
}

/**
 * Scan results summary component
 */
function ScanResults({ data }) {
  const navigate = useNavigate()

  const categories = [
    {
      icon: FileText,
      title: 'Large Files',
      count: data.large_files?.count || 0,
      size: data.large_files?.total_size_bytes,
      color: 'purple',
      to: '/clean',
      search: { tab: 'large-files' },
    },
    {
      icon: Clock,
      title: 'Old Files',
      count: data.old_files?.count || 0,
      size: data.old_files?.total_size_bytes,
      color: 'orange',
      to: '/clean',
      search: { tab: 'old-files' },
    },
    {
      icon: Copy,
      title: 'Duplicates',
      count: data.duplicates?.count || 0,
      size: data.duplicates?.total_size_bytes || data.duplicates?.groups?.reduce(
        (acc, group) => acc + group.total_size_bytes,
        0
      ) || 0,
      color: 'blue',
      to: '/clean',
      search: { tab: 'duplicates' },
    },
    {
      icon: Trash2,
      title: 'Empty Items',
      count: data.empty_items?.count || 0,
      size: 0,
      color: 'gray',
      to: '/clean',
      search: { tab: 'empty-items' },
    },
    {
      icon: AlertCircle,
      title: 'Temp Files',
      count: data.temp_files?.count || 0,
      size: data.temp_files?.total_size_bytes,
      color: 'yellow',
      to: '/clean',
      search: { tab: 'temp-files' },
    },
    {
      icon: FileSpreadsheet,
      title: 'Workspace Files',
      count: data.workspace_files?.count || 0,
      size: data.workspace_files?.total_size_bytes,
      color: 'blue',
      to: '/organise',
      search: { tab: 'workspace' },
    },
    {
      icon: Flame,
      title: 'Data ROT Analysis',
      count: data.rot_analysis?.count || 0,
      size: data.rot_analysis?.total_size_bytes,
      color: 'rose',
      to: '/security',
      search: { tab: 'rot' },
    },
  ]

  const totalFiles = data.total_files_scanned || 0
  const totalSpace = data.total_space_used_bytes || 0
  const potentialSavings = data.total_potential_savings_bytes || 0

  return (
    <div className="space-y-6">
      {/* Summary Stats & Target Folder Banner */}
      <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-xl">
        {/* Scanned Folder Details Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faFolderOpen} className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white">Folder Analysis Completed</h3>
                {data.folder_id && (
                  <Badge variant="outline" className="text-xs font-mono text-slate-400 border-slate-800 bg-slate-950">
                    ID: {data.folder_id}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                  {data.folder_id === 'root' ? 'Entire Drive' : 'Attached Folder'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: {data.folder_name || 'Selected Folder'}
              </p>
            </div>
          </div>

          {data.folder_id && (
            <a
              href={getDriveFolderUrl(data.folder_id)}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
            >
              <span>Open in Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {data.is_partial && (
          <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <div className="font-semibold text-amber-300">
                High-Volume Drive Safety Protection Active
              </div>
              <p className="text-amber-200/80 mt-0.5">
                Drive Cleaner safely indexed {totalFiles.toLocaleString()} files across this drive within Google Apps Script&apos;s safety window (4 min). All category results and savings below are ready to review and clean.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">
            {data.is_partial ? 'Partial Scan Complete' : 'Scan Complete'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <p className="text-xs text-slate-400 uppercase font-semibold">Files Scanned</p>
            <p className="text-2xl font-bold text-white mt-1">{totalFiles.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Space</p>
            <p className="text-2xl font-bold text-white mt-1">{formatBytes(totalSpace)}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <p className="text-xs text-slate-400 uppercase font-semibold">Potential Savings</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {formatBytes(potentialSavings)}
            </p>
          </div>
        </div>
        {data.scan_date && (
          <p className="text-xs text-slate-500 mt-4">
            Scanned: {new Date(data.scan_date).toLocaleString()}
          </p>
        )}

        {data.carbon_footprint && (
          <div
            onClick={() => navigate({ to: '/security', search: { tab: 'carbon' } })}
            className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer group hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Leaf className="w-4 h-4" />
              </span>
              <span>
                Annual Cloud Carbon Footprint: <strong className="text-emerald-300">{data.carbon_footprint.annual_co2_kg} kg CO₂</strong> ({data.carbon_footprint.equivalents?.headline})
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform">
              <span>View Eco Impact</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            {...category}
            onClick={() => category.to && navigate({ to: category.to, search: category.search })}
          />
        ))}
      </div>

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Actionable Recommendations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Prioritised cleanup actions based on your Drive analysis</p>
            </div>
            <Badge variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
              {data.recommendations.length} Suggestions
            </Badge>
          </div>
          <div className="space-y-3">
            {data.recommendations.map((rec, index) => {
              const title = rec.title || rec.message || 'Suggested Cleanup Action'
              const description = rec.description || null
              const savings = rec.estimated_savings_bytes || rec.space_savings_bytes || 0
              const count = rec.affected_files_count || rec.file_count || 0
              const category = rec.category || ''

              // Map category to view navigation target
              const categoryTargetMap = {
                temp_files: { to: '/clean', search: { tab: 'temp-files' } },
                duplicates: { to: '/clean', search: { tab: 'duplicates' } },
                empty_items: { to: '/clean', search: { tab: 'empty-items' } },
                old_files: { to: '/clean', search: { tab: 'old-files' } },
                large_files: { to: '/clean', search: { tab: 'large-files' } },
                workspace_files: { to: '/organise', search: { tab: 'workspace' } },
                rot_analysis: { to: '/security', search: { tab: 'rot' } },
              }
              const target = categoryTargetMap[category]

              return (
                <div
                  key={rec.recommendation_id || index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <Badge
                      variant={
                        rec.priority === 'high'
                          ? 'destructive'
                          : rec.priority === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                      className={cn(
                        'mt-0.5 uppercase text-[10px] font-bold tracking-wider shrink-0',
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      )}
                    >
                      {rec.priority}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white tracking-tight">{title}</h4>
                        {count > 0 && (
                          <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                            {count} {count === 1 ? 'file' : 'files'}
                          </span>
                        )}
                        {savings > 0 && (
                          <span className="text-[11px] font-medium text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            Save {formatBytes(savings)}
                          </span>
                        )}
                      </div>
                      {description && (
                        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{description}</p>
                      )}
                    </div>
                  </div>

                  {target && (
                    <Button
                      size="sm"
                      onClick={() => navigate({ to: target.to, search: target.search })}
                      className="h-9 px-4 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-500 text-xs font-semibold shrink-0 transition-all group"
                    >
                      <span>Review & Clean</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Smart Scan View - Main component
 */
export default function SmartScanView() {
  const {
    data,
    loading,
    error,
    targetFolder,
    recentFolders,
    setTargetFolder,
    runScan,
    reset,
    scanProgress,
    stopAndAnalyze
  } = useSmartScan()

  const handleStartScan = () => {
    const id = targetFolder?.id || 'root'
    const corpora = targetFolder?.corpora || 'user'
    const name = targetFolder?.name || (id === 'root' ? 'My Drive' : `Folder (${id.slice(0, 8)}...)`)
    runScan(id, corpora, name)
  }

  const handleNewScan = () => {
    reset()
  }

  const targetId = targetFolder?.id || 'root'
  const isTargetReady = targetId === 'root' || (targetId && targetId.trim().length > 0)
  const targetLabel = targetFolder?.name || (targetId === 'root' ? 'My Drive' : `Folder (${targetId.slice(0, 8)}...)`)

  // Show results if we have data
  if (data) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Scan}
          title="Smart Scan"
          subtitle={`Analysed ${data.folder_name || targetLabel}`}
          faIcon={faCircleCheck}
          variant="emerald"
          actions={
            <div className="flex items-center gap-2">
              <Button
                onClick={handleNewScan}
                variant="outline"
                className="h-11 px-4 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                <FolderSearch className="mr-2 h-4 w-4" />
                Change Folder
              </Button>
              <Button
                onClick={handleStartScan}
                className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/40 text-xs"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Scan Again
              </Button>
            </div>
          }
        />
        <ScanResults data={data} />
      </div>
    )
  }

  // Show initial or configuring state
  return (
    <div className="space-y-6">
      <Hero
        icon={Scan}
        title="Smart Scan"
        subtitle="Comprehensive cleanup and carbon intelligence scan for your Google Drive"
        faIcon={faMagnifyingGlassChart}
        variant="primary"
        actions={
          <Button
            onClick={handleStartScan}
            disabled={loading || !isTargetReady}
            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-900/40"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faHourglassHalf} className="animate-spin mr-2 text-blue-300" />
                Scanning {targetLabel}...
              </>
            ) : (
              `Start Smart Scan (${targetLabel})`
            )}
          </Button>
        }
      />

      {/* Target Folder Attachment / Selection Card */}
      <FolderSelector
        value={targetFolder}
        onChange={setTargetFolder}
        recentFolders={recentFolders}
        disabled={loading}
      />

      {loading && (
        <div className="p-8 border border-blue-500/30 rounded-2xl bg-slate-900/80 backdrop-blur-md text-center shadow-xl relative overflow-hidden">
          {/* Animated top progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-pulse w-full shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <FontAwesomeIcon icon={faHourglassHalf} className="animate-spin text-xl text-blue-400" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-1">
                {scanProgress?.filesProcessed > 0
                  ? `${scanProgress.filesProcessed.toLocaleString()} Files Indexed`
                  : `Connecting to ${targetLabel}...`}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {scanProgress?.statusText || `Analyzing ${targetLabel} across folders, duplicates, and carbon footprint.`}
              </p>
            </div>

            {scanProgress?.filesProcessed > 0 && (
              <div className="pt-2 flex justify-center">
                <Button
                  onClick={stopAndAnalyze}
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-xl border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs font-semibold transition-all active:scale-95"
                >
                  <span>Stop & Review Current Files ({scanProgress.filesProcessed.toLocaleString()})</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 border border-red-500/30 rounded-2xl bg-red-950/20 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1 text-sm">Scan Failed</h3>
              <p className="text-xs text-red-300 mb-2">{error}</p>
              <p className="text-xs text-slate-400">
                Tip: Ensure you have read access to the specified folder ID or URL, and that the folder is not in the trash.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="p-8 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <p className="text-slate-300 mb-4 text-sm">
            Smart Scan will comprehensively analyse <strong className="text-white">{targetLabel}</strong> for:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-slate-300 text-xs">
            <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Duplicate files (byte-exact and name matches)</li>
            <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Large files (&gt;100MB, &gt;500MB, &gt;1GB)</li>
            <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Old & abandoned files (&gt;1 year, &gt;2 years, &gt;5 years)</li>
            <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Empty files and folders</li>
            <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Temporary & cache files (.DS_Store, logs, temps)</li>
            <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Google Workspace files (unused Docs, Sheets, Slides, Forms)</li>
            <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Data ROT analysis (Redundant, Obsolete, Trivial clutter index)</li>
            <li className="flex items-center gap-2"><FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Cloud Carbon Footprint (CO₂ emissions & green achievements)</li>
          </ul>
        </div>
      )}
    </div>
  )
}

