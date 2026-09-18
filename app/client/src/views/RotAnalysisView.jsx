import { useState, useMemo } from 'react'
import {
  Flame,
  Search,
  Filter,
  ExternalLink,
  RefreshCw,
  Clock,
  Sparkles,
  Award,
  Trash2,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  HelpCircle,
  ShieldAlert,
  Skull,
  Layers,
  LayoutGrid,
  List,
  Eye
} from 'lucide-react'
import { faFireFlameCurved } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useSmartScan } from '@/hooks/useSmartScan'
import { useFilePreview } from '@/hooks/useFilePreview'
import FilePreviewModal from '@/components/preview/FilePreviewModal'
import { WaSkeleton } from '@/components/ui/webawesome'
import TableSkeleton from '@/components/ui/TableSkeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0 || !bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Format days elapsed to readable string
 */
function formatDays(days) {
  if (days === null || days === undefined) return 'Never'
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}m ago`
  return `${(days / 365).toFixed(1)}y ago`
}

/**
 * Freshness visual helper
 */
function getFreshnessBadge(level) {
  switch (level) {
    case 'fresh':
      return { label: 'Fresh', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '🟢' }
    case 'aging':
      return { label: 'Aging', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: '🟡' }
    case 'stale':
      return { label: 'Stale', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: '🟠' }
    case 'rotting':
      return { label: 'Rotting', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: '🔴' }
    case 'decayed':
    default:
      return { label: 'Decayed', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: '⚫' }
  }
}

/**
 * Visual Circular Gauge for Clutter Index
 */
function ClutterGauge({ score, target = 20 }) {
  const radius = 54
  const strokeWidth = 10
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  let scoreColor = '#22c55e' // green
  let statusText = 'Excellent (Minimal)'
  if (score > 60) {
    scoreColor = '#ef4444' // red
    statusText = 'Critical Hoarding'
  } else if (score > 40) {
    scoreColor = '#f97316' // orange
    statusText = 'Needs Cleanup'
  } else if (score > 25) {
    scoreColor = '#eab308' // yellow
    statusText = 'Moderate'
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-800/80"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold tracking-tight text-white">{score}</span>
          <span className="text-[11px] font-medium text-slate-400">/ 100</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <div className="flex items-center justify-center gap-1.5 font-semibold text-sm" style={{ color: scoreColor }}>
          <span>{statusText}</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Target: &lt;{target} (Minimalist)</p>
      </div>
    </div>
  )
}

/**
 * Digital Hoarding Assessment Card
 */
function HoardingScoreCard({ hoardingScore }) {
  if (!hoardingScore) return null

  const { total_score, rating, components } = hoardingScore
  const maxSub = 25

  return (
    <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{rating?.icon || '📦'}</span>
            <div>
              <h3 className="font-semibold text-base text-slate-100">Digital Hoarding Assessment</h3>
              <p className="text-xs text-slate-400">Based on Digital Hoarding Questionnaire (DHQ)</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`px-2.5 py-1 text-xs font-semibold ${
              rating?.level === 'Minimal'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : rating?.level === 'Mild'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : rating?.level === 'Moderate'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : rating?.level === 'Significant'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {rating?.level} ({total_score}/100)
          </Badge>
        </div>

        <p className="text-xs text-gray-300 mb-4 bg-white/5 p-2.5 rounded-lg border border-white/5">
          {rating?.description || 'Assessment of Drive accumulation patterns.'}
        </p>

        {/* 4 Subscales */}
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">Clutter Volume</span>
              <span className="text-gray-400 font-mono">{components?.clutter_volume || 0}/{maxSub}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${((components?.clutter_volume || 0) / maxSub) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">Disorganization</span>
              <span className="text-gray-400 font-mono">{components?.disorganization || 0}/{maxSub}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${((components?.disorganization || 0) / maxSub) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">Accumulation Inertia</span>
              <span className="text-gray-400 font-mono">{components?.accumulation || 0}/{maxSub}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${((components?.accumulation || 0) / maxSub) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">Version Attachment</span>
              <span className="text-gray-400 font-mono">{components?.attachment || 0}/{maxSub}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${((components?.attachment || 0) / maxSub) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Data ROT Analysis View Component
 */
export default function RotAnalysisView() {
  const { data, loading, runScan } = useSmartScan()
  const { previewFile, isPreviewOpen, openPreview, closePreview } = useFilePreview()
  const [activeTab, setActiveTab] = useState('all') // 'all', 'redundant', 'obsolete', 'trivial'
  const [viewMode, setViewMode] = useState('list') // 'list', 'grid'
  const [searchQuery, setSearchQuery] = useState('')
  const [freshnessFilter, setFreshnessFilter] = useState('all') // 'all', 'fresh', 'aging', 'stale', 'rotting', 'decayed'

  const rot = data?.rot_analysis || null

  const handlePreview = (item) => {
    openPreview({
      id: item.file_id || item.id,
      name: item.file_name || item.name,
      size: item.size_bytes || item.size || 0,
      mimeType: item.mime_type || item.mimeType || 'application/octet-stream',
      modifiedTime: item.modified_date || item.modifiedTime,
      webViewLink: item.drive_link || item.webViewLink,
      parentName: item.parent_name,
    })
  }

  // Filter items
  const filteredItems = useMemo(() => {
    if (!rot?.items) return []

    return rot.items.filter((item) => {
      // Tab filter
      if (activeTab === 'redundant' && !item.rot_types.includes('redundant')) return false
      if (activeTab === 'obsolete' && !item.rot_types.includes('obsolete')) return false
      if (activeTab === 'trivial' && !item.rot_types.includes('trivial')) return false

      // Freshness filter
      if (freshnessFilter !== 'all' && item.freshness_level !== freshnessFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const nameMatch = item.file_name?.toLowerCase().includes(q)
        const parentMatch = item.parent_name?.toLowerCase().includes(q)
        const reasonMatch = item.details?.some(d => d.toLowerCase().includes(q))
        if (!nameMatch && !parentMatch && !reasonMatch) return false
      }

      return true
    })
  }, [rot?.items, activeTab, freshnessFilter, searchQuery])

  if (loading && (!rot || rot.count === 0)) {
    return (
      <div className="space-y-6 pb-12">
        <Hero
          icon={Flame}
          title="Data ROT Analysis & Hoarding Assessment"
          subtitle="Identify Redundant, Obsolete, and Trivial files and gamify your cleanup with psychological clutter scoring."
          faIcon={faFireFlameCurved}
          variant="rose"
          actions={
            <Button disabled size="lg" className="rounded-xl w-[170px] shrink-0">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin shrink-0" />
              Analysing...
            </Button>
          }
        />

        {/* Top Shimmer Progress Line */}
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-pulse w-full" />
        </div>

        {/* Hero Metrics Row Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 space-y-4">
            <WaSkeleton className="h-5 w-32" />
            <div className="flex justify-center py-6">
              <WaSkeleton className="h-32 w-32 rounded-full" />
            </div>
            <WaSkeleton className="h-4 w-full" />
          </div>
          <div className="md:col-span-2 p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 space-y-4">
            <div className="flex justify-between items-center">
              <WaSkeleton className="h-6 w-48" />
              <WaSkeleton className="h-6 w-24 rounded-full" />
            </div>
            <WaSkeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-3 gap-3 pt-4">
              <WaSkeleton className="h-16 rounded-xl" />
              <WaSkeleton className="h-16 rounded-xl" />
              <WaSkeleton className="h-16 rounded-xl" />
            </div>
          </div>
        </div>

        {/* ROT Category Summary Cards Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 space-y-3">
              <div className="flex justify-between items-center">
                <WaSkeleton className="h-4 w-28" />
                <WaSkeleton className="h-4 w-4 rounded" />
              </div>
              <WaSkeleton className="h-8 w-20" />
              <WaSkeleton className="h-3 w-36" />
            </div>
          ))}
        </div>

        {/* Freshness Gradient Decay Skeleton */}
        <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center">
            <WaSkeleton className="h-5 w-48" />
            <WaSkeleton className="h-4 w-24" />
          </div>
          <WaSkeleton className="h-3.5 w-full rounded-full" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <WaSkeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>

        {/* ROT File Table Skeleton */}
        <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/60">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <WaSkeleton className="h-9 w-64 rounded-xl" />
            <WaSkeleton className="h-9 w-32 rounded-xl" />
          </div>
          <Table>
            <TableHeader className="bg-slate-950/60">
              <TableRow className="border-slate-800/80">
                <TableHead className="w-10"></TableHead>
                <TableHead>File Name & Location</TableHead>
                <TableHead>ROT Class</TableHead>
                <TableHead>Freshness / Age</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton rows={8} cols={6} />
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (!rot || rot.count === 0) {
    return (
      <div className="space-y-6 pb-12">
        <Hero
          icon={Flame}
          title="Data ROT Analysis & Hoarding Assessment"
          subtitle="Enterprise Redundant, Obsolete, and Trivial governance for Drive"
          faIcon={faFireFlameCurved}
          variant="rose"
          actions={
            <Button onClick={() => runScan('root', 'user')} size="lg" className="rounded-xl w-[170px] shrink-0">
              <RefreshCw className="w-4 h-4 mr-2 shrink-0" />
              Run Smart Scan
            </Button>
          }
        />
        <div className="p-12 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm text-center">
          <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">No Data ROT Detected</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm">
            Run a Smart Scan to evaluate your Google Drive files for redundant duplicates, obsolete items, and trivial clutter.
          </p>
          <Button onClick={() => runScan('root', 'user')} className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-medium hover:opacity-90 rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Smart Scan Now
          </Button>
        </div>
      </div>
    )
  }

  const dist = rot.freshness_distribution || {}

  return (
    <div className="space-y-6 pb-12">
      <Hero
        icon={Flame}
        title="Data ROT Analysis & Hoarding Assessment"
        subtitle="Identify Redundant, Obsolete, and Trivial files and gamify your cleanup with psychological clutter scoring."
        faIcon={faFireFlameCurved}
        variant="rose"
      />

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ClutterGauge
          score={rot.clutter_index?.score || 0}
          target={rot.clutter_index?.target || 20}
        />
        <div className="md:col-span-2">
          <HoardingScoreCard hoardingScore={rot.hoarding_score} />
        </div>
      </div>

      {/* ROT Category Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Redundant */}
        <div
          onClick={() => setActiveTab('redundant')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'redundant'
              ? 'bg-blue-500/10 border-blue-500 shadow-md ring-1 ring-blue-500/50'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">R • Redundant</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{rot.breakdown?.redundant?.count || 0}</div>
          <p className="text-xs text-slate-400 mt-1">
            {formatBytes(rot.breakdown?.redundant?.total_size_bytes)} potential savings
          </p>
          <div className="text-[11px] text-slate-400 mt-2">Duplicates & superseded version iterations</div>
        </div>

        {/* Obsolete */}
        <div
          onClick={() => setActiveTab('obsolete')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'obsolete'
              ? 'bg-orange-500/10 border-orange-500 shadow-md ring-1 ring-orange-500/50'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">O • Obsolete</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{rot.breakdown?.obsolete?.count || 0}</div>
          <p className="text-xs text-slate-400 mt-1">
            {formatBytes(rot.breakdown?.obsolete?.total_size_bytes)} stagnant space
          </p>
          <div className="text-[11px] text-slate-400 mt-2">Untouched for 12+ months & superseded</div>
        </div>

        {/* Trivial */}
        <div
          onClick={() => setActiveTab('trivial')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'trivial'
              ? 'bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/50'
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">T • Trivial</span>
            <FileQuestion className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{rot.breakdown?.trivial?.count || 0}</div>
          <p className="text-xs text-slate-400 mt-1">
            {formatBytes(rot.breakdown?.trivial?.total_size_bytes)} low-value stubs
          </p>
          <div className="text-[11px] text-slate-400 mt-2">Screenshots, untitled files & stubs &lt;10KB</div>
        </div>
      </div>

      {/* Freshness Gradient Decay Timeline */}
      <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">File Freshness & Decay Gradient</h3>
            <p className="text-xs text-slate-400">Visual model of data gravity — files become harder to clean the longer they sit.</p>
          </div>
          <div className="text-xs text-slate-400">
            Average File Age: <span className="text-slate-200 font-semibold">{rot.clutter_index?.average_age_days || 0} days</span>
          </div>
        </div>

        {/* Segmented Color Bar */}
        <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-950/70 border border-slate-800 mb-4">
          <div style={{ width: `${dist.fresh?.percentage || 0}%` }} className="bg-emerald-500 h-full transition-all" title="Fresh" />
          <div style={{ width: `${dist.aging?.percentage || 0}%` }} className="bg-amber-400 h-full transition-all" title="Aging" />
          <div style={{ width: `${dist.stale?.percentage || 0}%` }} className="bg-orange-500 h-full transition-all" title="Stale" />
          <div style={{ width: `${dist.rotting?.percentage || 0}%` }} className="bg-rose-500 h-full transition-all" title="Rotting" />
          <div style={{ width: `${dist.decayed?.percentage || 0}%` }} className="bg-slate-500 h-full transition-all" title="Decayed" />
        </div>

        {/* Freshness Filter Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'fresh', label: 'Fresh (0-3m)', color: 'border-emerald-500/40 text-emerald-400', count: dist.fresh?.count || 0, icon: '🟢' },
            { id: 'aging', label: 'Aging (3-6m)', color: 'border-amber-500/40 text-amber-400', count: dist.aging?.count || 0, icon: '🟡' },
            { id: 'stale', label: 'Stale (6-12m)', color: 'border-orange-500/40 text-orange-400', count: dist.stale?.count || 0, icon: '🟠' },
            { id: 'rotting', label: 'Rotting (1-2y)', color: 'border-rose-500/40 text-rose-400', count: dist.rotting?.count || 0, icon: '🔴' },
            { id: 'decayed', label: 'Decayed (2y+)', color: 'border-slate-500/40 text-slate-300', count: dist.decayed?.count || 0, icon: '⚫' },
          ].map((stage) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => setFreshnessFilter(freshnessFilter === stage.id ? 'all' : stage.id)}
              className={`p-2.5 rounded-xl border text-xs flex flex-col items-start transition-all ${
                freshnessFilter === stage.id
                  ? 'bg-slate-800 border-slate-600 ring-1 ring-slate-500'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-medium text-slate-300 flex items-center gap-1">
                  <span>{stage.icon}</span> {stage.label}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-100">{stage.count} files</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gamification & Milestone Banner */}
      <div className="p-5 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-blue-950/30 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">Next Milestone: Reach &quot;Mild&quot; Clutter Status</h4>
            <p className="text-xs text-slate-400">
              Clean up 4 more ROT items ({formatBytes(rot.total_size_bytes)}) to reduce your Clutter Index by ~15 points and unlock the <span className="text-purple-300 font-semibold">Data Minimalist 🏅</span> badge.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs">
            🌱 Spring Cleaner Ready
          </Badge>
        </div>
      </div>

      {/* Actionable ROT Items Section */}
      <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/10 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ROT ({rot.count})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('redundant')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'redundant'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Redundant ({rot.breakdown?.redundant?.count || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('obsolete')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'obsolete'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Obsolete ({rot.breakdown?.obsolete?.count || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trivial')}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'trivial'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trivial ({rot.breakdown?.trivial?.count || 0})
            </button>
          </div>

          {/* Search & View Mode */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ROT files or reasons..."
                className="pl-9 h-11 rounded-xl text-xs bg-slate-950/70 border-slate-800 text-white"
              />
            </div>
            <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl p-1 h-11">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                title="Heatmap Card Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {filteredItems.length} of {rot.count} flagged files</span>
          {freshnessFilter !== 'all' && (
            <button
              onClick={() => setFreshnessFilter('all')}
              className="text-rose-400 hover:underline text-xs"
            >
              Clear freshness filter ({freshnessFilter})
            </button>
          )}
        </div>

        {/* Grid Mode */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item) => {
              const freshBadge = getFreshnessBadge(item.freshness_level)
              const isRotting = item.freshness_level === 'rotting'
              const isDecayed = item.freshness_level === 'decayed'

              return (
                <div
                  key={item.file_id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isDecayed
                      ? 'bg-slate-900/80 border-slate-700/80 opacity-80'
                      : isRotting
                      ? 'bg-rose-950/20 border-rose-900/40 opacity-90'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {isDecayed && (
                    <div className="absolute right-2 top-2 opacity-20 text-2xl select-none">☠️</div>
                  )}
                  {isRotting && (
                    <div className="absolute right-2 top-2 opacity-20 text-2xl select-none">💀</div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${freshBadge.color}`}>
                        {freshBadge.icon} {freshBadge.label}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDays(item.days_inactive)}
                      </span>
                    </div>

                    <h5 className="text-xs font-semibold text-slate-100 line-clamp-2 mb-1" title={item.file_name}>
                      {item.file_name}
                    </h5>
                    <p className="text-[11px] text-slate-400 truncate mb-2">{item.parent_name}</p>

                    <div className="space-y-1">
                      {item.details?.map((detail, i) => (
                        <p key={i} className="text-[11px] text-amber-300/90 line-clamp-2">
                          • {detail}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300">{formatBytes(item.size_bytes)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePreview(item)}
                        title="Quick Preview"
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {item.drive_link ? (
                        <a
                          href={item.drive_link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded text-blue-400 hover:text-blue-300 hover:bg-slate-800 transition-colors"
                          title="Open in Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List Table Mode */}
        {viewMode === 'list' && (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800/80 hover:bg-transparent">
                  <TableHead className="w-[38%] text-slate-300 text-xs">File Name</TableHead>
                  <TableHead className="text-slate-300 text-xs">ROT Classification</TableHead>
                  <TableHead className="text-slate-300 text-xs">Freshness</TableHead>
                  <TableHead className="text-slate-300 text-xs text-right">Size</TableHead>
                  <TableHead className="w-[100px] text-right text-slate-300 text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const freshBadge = getFreshnessBadge(item.freshness_level)
                  return (
                    <TableRow key={item.file_id} className="border-slate-800/60 hover:bg-slate-800/40">
                      <TableCell className="font-medium text-xs text-slate-200">
                        <div className="font-semibold text-slate-100">{item.file_name}</div>
                        <div className="text-[11px] text-slate-400">{item.parent_name}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-wrap gap-1 mb-1">
                          {item.rot_types?.map((t) => (
                            <Badge
                              key={t}
                              variant="outline"
                              className={`text-[10px] uppercase tracking-wider px-1.5 py-0 ${
                                t === 'redundant'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  : t === 'obsolete'
                                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.details?.[0] || 'Flagged for review'}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${freshBadge.color}`}>
                            {freshBadge.icon} {freshBadge.label}
                          </Badge>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDays(item.days_inactive)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono text-slate-300">
                        {formatBytes(item.size_bytes)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handlePreview(item)}
                            title="Quick Preview"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {item.drive_link ? (
                            <a
                              href={item.drive_link}
                              target="_blank"
                              rel="noreferrer"
                              title="Open in Drive"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        file={previewFile}
      />
    </div>
  )
}
