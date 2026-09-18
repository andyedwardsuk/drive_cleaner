import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Film,
  Image as ImageIcon,
  Music,
  Sparkles,
  Zap,
  HardDrive,
  Copy,
  Layers,
  ArrowDownCircle,
  Download,
  Trash2,
  Archive,
  RefreshCw,
  Search,
  CheckCircle2,
  Star,
  Check,
  LayoutGrid,
  List,
  AlertCircle,
  Clock,
  Play,
  Maximize2,
  ExternalLink,
  ChevronRight,
  TrendingDown
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhotoFilm } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { useMediaOptimizer } from '@/hooks/useMediaOptimizer'
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

export default function MediaOptimizerView() {
  const {
    loading,
    error,
    refresh,
    summary,
    videos,
    photoBursts,
    compressionCandidates,
    allMedia,
    filteredMedia,
    filterMode,
    setFilterMode,
    layoutMode,
    setLayoutMode,
    searchQuery,
    setSearchQuery,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    selectBurstTailings,
    selectCompressionCandidates,
    handleExportManifest,
    trashSelected,
    archiveSelected,
    actionSuccessMessage
  } = useMediaOptimizer()

  const { openPreview } = useFilePreview()

  const isAllSelected = filteredMedia.length > 0 && filteredMedia.every((m) => selectedIds.has(m.fileId))

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection()
    } else {
      selectAll(filteredMedia.map((m) => m.fileId))
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Header */}
      <Hero
        title="Media Optimiser"
        subtitle="Analyse heavy 4K videos, cluster rapid photo bursts, and identify uncompressed RAW assets"
        faIcon={faPhotoFilm}
        variant="purple"
      />

      {/* Action Toast */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-medium">{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Media Storage */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Media Storage</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {formatBytes(summary.totalMediaBytes || 0)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{summary.totalMediaCount || 0} media files scanned</span>
            </div>
          </div>
        </div>

        {/* Potential Compression Savings */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Reclaimable Space</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {formatBytes(summary.totalPotentialSavingsBytes || 0)}
            </div>
            <div className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Up to {summary.potentialSavingsPercent || 0}% storage reduction</span>
            </div>
          </div>
        </div>

        {/* Photo Bursts */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Photo Bursts</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-300 tracking-tight">
              {summary.burstGroupCount || 0} Bursts
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{summary.burstTailingsCount || 0} duplicate tailings eligible</span>
            </div>
          </div>
        </div>

        {/* Video Consumers */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Video Storage</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-purple-300 tracking-tight">
              {formatBytes(summary.videoTotalBytes || 0)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{summary.videoCount || 0} video assets analysed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & View Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode('all')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              filterMode === 'all'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            )}
          >
            <span>All Media</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-950/70 text-slate-300">
              {allMedia.length}
            </Badge>
          </button>

          <button
            onClick={() => setFilterMode('videos')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              filterMode === 'videos'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            )}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video Consumers</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-950/70 text-slate-300">
              {videos.length}
            </Badge>
          </button>

          <button
            onClick={() => setFilterMode('bursts')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              filterMode === 'bursts'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Photo Bursts & Duplicates</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-950/70 text-slate-300">
              {photoBursts.length}
            </Badge>
          </button>

          <button
            onClick={() => setFilterMode('compression')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              filterMode === 'compression'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compression Candidates</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-950/70 text-slate-300">
              {compressionCandidates.length}
            </Badge>
          </button>

          <button
            onClick={() => setFilterMode('audio')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              filterMode === 'audio'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            )}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Audio</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-950/70 text-slate-300">
              {allMedia.filter((m) => m.mediaType === 'audio').length}
            </Badge>
          </button>
        </div>

        {/* Search & Layout Toggles & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading}
            className="h-11 px-3.5 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={handleExportManifest}
            disabled={loading || allMedia.length === 0}
            className="h-11 px-3.5 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            Export CSV
          </Button>

          <div className="relative min-w-[200px] flex-1 md:flex-initial">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search camera, format, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 rounded-xl bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-500 text-sm focus-visible:ring-primary/40"
            />
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-950/70 border border-slate-800">
            <button
              onClick={() => setLayoutMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                layoutMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white'
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('table')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                layoutMode === 'table' ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white'
              )}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Photo Burst Grouping Inspector (when Photo Bursts tab is selected) */}
      {filterMode === 'bursts' && photoBursts.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-semibold text-amber-200">Rapid Photo Burst Detector Active</h3>
                <p className="text-xs text-amber-300/80">
                  Identified {photoBursts.length} rapid shot clusters. The sharpest shot is marked as &quot;Best Shot&quot;.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={selectBurstTailings}
              className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-600/20"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Select All Burst Tailings ({summary.burstTailingsCount})
            </Button>
          </div>

          <div className="space-y-6">
            {photoBursts.map((burst) => (
              <div
                key={burst.groupId}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        {burst.title}
                        <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300">
                          {burst.cameraModel}
                        </Badge>
                      </h4>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Total {formatBytes(burst.totalBytes)} • Reclaim {formatBytes(burst.potentialSavingsBytes)} by keeping best shot
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const ids = burst.items.filter((it) => !it.isBestShot).map((it) => it.fileId)
                        selectAll([...Array.from(selectedIds), ...ids])
                      }}
                      className="text-xs text-amber-300 hover:bg-amber-500/10"
                    >
                      Select Tailings Only
                    </Button>
                  </div>
                </div>

                {/* Burst Shots Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {burst.items.map((item) => {
                    const isSelected = selectedIds.has(item.fileId)
                    return (
                      <div
                        key={item.fileId}
                        className={cn(
                          'relative group rounded-xl overflow-hidden border transition-all cursor-pointer bg-slate-950/60',
                          item.isBestShot
                            ? 'border-amber-400/80 ring-1 ring-amber-400/40'
                            : isSelected
                            ? 'border-primary ring-2 ring-primary/40'
                            : 'border-slate-800 hover:border-slate-700'
                        )}
                        onClick={() => toggleSelect(item.fileId)}
                      >
                        {/* Thumbnail / Image Preview */}
                        <div className="aspect-[4/3] relative bg-slate-800 overflow-hidden">
                          {item.thumbnailLink ? (
                            <img
                              src={item.thumbnailLink}
                              alt={item.fileName}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}

                          {/* Best Shot Badge */}
                          {item.isBestShot && (
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500 text-slate-900 text-[10px] font-bold shadow-lg">
                              <Star className="w-3 h-3 fill-slate-900" />
                              <span>BEST SHOT</span>
                            </div>
                          )}

                          {/* Select Checkbox */}
                          <div
                            className={cn(
                              'absolute top-2 right-2 z-10 w-5 h-5 rounded-md border flex items-center justify-center transition-all',
                              isSelected
                                ? 'bg-primary border-primary text-white'
                                : 'bg-black/50 border-white/40 text-transparent group-hover:border-white'
                            )}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </div>

                          {/* Preview Trigger Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openPreview(item, allMedia)
                            }}
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Preview file"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Card Info */}
                        <div className="p-2.5">
                          <p className="text-xs font-medium text-gray-200 truncate" title={item.fileName}>
                            {item.fileName}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[11px] text-gray-400">
                            <span>{formatBytes(item.sizeBytes)}</span>
                            <span>{item.dimensions || item.resolutionCategory}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dedicated Compression Transformation Suggestions (when Compression tab is selected) */}
      {filterMode === 'compression' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-emerald-200">Space Compression Engine Projections</h3>
                <p className="text-xs text-emerald-300/80">
                  Identified {compressionCandidates.length} uncompressed assets (RAW, ProRes, WAV). Transcoding to modern web formats slashes storage consumption.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={selectCompressionCandidates}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/20"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Select All Compression Candidates ({compressionCandidates.length})
            </Button>
          </div>

          {/* Transformation Rule Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4" />
                <span>RAW Camera Photos</span>
              </div>
              <p className="text-xs text-slate-300">
                RAW sensor data (.CR2, .ARW, .NEF) converted to WebP/AVIF (90% Quality).
              </p>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>~82% Space Reclaim</span>
                <span className="text-xs font-normal text-emerald-400">(45MB → 8MB)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                <Film className="w-4 h-4" />
                <span>ProRes / Heavy Videos</span>
              </div>
              <p className="text-xs text-slate-300">
                Intra-frame video converted to modern H.265 (HEVC) or AV1 MP4.
              </p>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>~70% Space Reclaim</span>
                <span className="text-xs font-normal text-purple-400">(2.5GB → 750MB)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <Music className="w-4 h-4" />
                <span>Uncompressed Audio</span>
              </div>
              <p className="text-xs text-slate-300">
                Lossless PCM WAV/AIFF master tracks converted to 256kbps AAC/MP3.
              </p>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>~85% Space Reclaim</span>
                <span className="text-xs font-normal text-cyan-400">(900MB → 135MB)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Media Triage Grid or Table (Shown for all views when not filtered solely to burst grouping) */}
      {filterMode !== 'bursts' && (
        <div className="space-y-4">
          {/* Section Heading & Multi-Select Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Media Items</span>
                <Badge variant="outline" className="text-xs border-slate-800 text-slate-400">
                  {filteredMedia.length}
                </Badge>
              </h3>
              <button
                onClick={handleToggleSelectAll}
                className="text-xs text-primary hover:underline font-medium"
              >
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Floating Multi-Select Toolbar */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-primary/40 shadow-xl shadow-black/40"
                >
                  <span className="text-xs font-semibold text-primary px-3">
                    {selectedIds.size} selected
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={archiveSelected}
                    className="h-8 text-xs border-slate-800 hover:bg-slate-800 text-slate-200"
                  >
                    <Archive className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    Stage for Archive
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={trashSelected}
                    className="h-8 text-xs bg-red-600/90 hover:bg-red-600 text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Move to Trash
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelection}
                    className="h-8 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Grid Layout View */}
          {layoutMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item) => {
                const isSelected = selectedIds.has(item.fileId)
                const isVideo = item.mediaType === 'video'
                const isAudio = item.mediaType === 'audio'

                return (
                  <div
                    key={item.fileId}
                    className={cn(
                      'group rounded-2xl overflow-hidden border transition-all cursor-pointer bg-slate-900/60 backdrop-blur-sm flex flex-col',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40'
                        : 'border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                    )}
                    onClick={() => toggleSelect(item.fileId)}
                  >
                    {/* Media Thumbnail Container */}
                    <div className="aspect-video relative bg-slate-900 overflow-hidden">
                      {item.thumbnailLink ? (
                        <img
                          src={item.thumbnailLink}
                          alt={item.fileName}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-slate-900">
                          {isVideo ? (
                            <Film className="w-10 h-10 text-purple-400/60" />
                          ) : isAudio ? (
                            <Music className="w-10 h-10 text-cyan-400/60" />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-blue-400/60" />
                          )}
                          <span className="text-[10px] text-gray-500 uppercase mt-2 tracking-wider">
                            {item.extension}
                          </span>
                        </div>
                      )}

                      {/* Top Overlay Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
                        {item.resolutionCategory && (
                          <Badge
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-wider backdrop-blur-md px-1.5 py-0.5',
                              item.resolutionCategory.includes('4K')
                                ? 'bg-purple-600/90 text-white'
                                : 'bg-slate-900/80 text-gray-200 border border-white/10'
                            )}
                          >
                            {item.resolutionCategory}
                          </Badge>
                        )}
                        {item.isHighBitrate && (
                          <Badge className="bg-red-500/90 text-white text-[10px] font-semibold backdrop-blur-md px-1.5 py-0.5">
                            {item.bitrateFormatted}
                          </Badge>
                        )}
                      </div>

                      {/* Selection Checkbox */}
                      <div
                        className={cn(
                          'absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-md border flex items-center justify-center transition-all',
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'bg-black/50 border-white/40 text-transparent group-hover:border-white'
                        )}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>

                      {/* Bottom Overlay: Duration or Audio info */}
                      {item.durationFormatted && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[11px] font-mono">
                          {isVideo ? <Play className="w-3 h-3 fill-white" /> : <Music className="w-3 h-3" />}
                          <span>{item.durationFormatted}</span>
                        </div>
                      )}

                      {/* Preview Trigger Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openPreview(item, allMedia)
                        }}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Universal Preview"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4
                          className="text-xs font-semibold text-white truncate"
                          title={item.fileName}
                        >
                          {item.fileName}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                          <span>{formatBytes(item.sizeBytes)}</span>
                          {item.dimensions && <span>{item.dimensions}</span>}
                        </div>
                      </div>

                      {/* Compression Savings Recommendation Pill */}
                      {item.compression && (
                        <div className="pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-emerald-400 font-medium truncate pr-1">
                              Reclaim {formatBytes(item.compression.estimatedSavingsBytes)}
                            </span>
                            <span className="text-emerald-400/80 font-bold">
                              -{item.compression.savingsPercent}%
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            Target: {item.compression.targetFormat}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Table Layout View */
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800/80 bg-slate-950/80 text-slate-400 font-medium">
                    <tr>
                      <th className="p-3.5 w-10">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleToggleSelectAll}
                          className="rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary/40"
                        />
                      </th>
                      <th className="p-3.5">File Name</th>
                      <th className="p-3.5">Resolution / Dimensions</th>
                      <th className="p-3.5">Duration / Bitrate</th>
                      <th className="p-3.5">Current Size</th>
                      <th className="p-3.5">Optimization Recommendation</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {filteredMedia.map((item) => {
                      const isSelected = selectedIds.has(item.fileId)
                      return (
                        <tr
                          key={item.fileId}
                          className={cn(
                            'transition-colors hover:bg-slate-800/40 cursor-pointer',
                            isSelected && 'bg-primary/10'
                          )}
                          onClick={() => toggleSelect(item.fileId)}
                        >
                          <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(item.fileId)}
                              className="rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary/40"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              {item.thumbnailLink ? (
                                <img
                                  src={item.thumbnailLink}
                                  alt=""
                                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                                  {item.mediaType === 'video' ? (
                                    <Film className="w-4 h-4 text-purple-400" />
                                  ) : item.mediaType === 'audio' ? (
                                    <Music className="w-4 h-4 text-cyan-400" />
                                  ) : (
                                    <ImageIcon className="w-4 h-4 text-blue-400" />
                                  )}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-white truncate max-w-xs sm:max-w-sm">
                                  {item.fileName}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {item.cameraModel || item.mimeType}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {item.resolutionCategory ? (
                              <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-300">
                                {item.resolutionCategory}
                              </Badge>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                            {item.dimensions && (
                              <div className="text-[11px] text-slate-400 mt-0.5">{item.dimensions}</div>
                            )}
                          </td>
                          <td className="p-3.5">
                            {item.durationFormatted ? (
                              <div className="font-mono text-gray-200">{item.durationFormatted}</div>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                            {item.bitrateFormatted && (
                              <div className="text-[11px] text-gray-400">{item.bitrateFormatted}</div>
                            )}
                          </td>
                          <td className="p-3.5 font-medium text-white">
                            {formatBytes(item.sizeBytes)}
                          </td>
                          <td className="p-3.5">
                            {item.compression ? (
                              <div>
                                <span className="text-emerald-400 font-semibold">
                                  Save {formatBytes(item.compression.estimatedSavingsBytes)} (-{item.compression.savingsPercent}%)
                                </span>
                                <div className="text-[11px] text-gray-400 mt-0.5">
                                  {item.compression.targetFormat}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">Optimized format</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPreview(item, allMedia)}
                              className="h-8 px-2.5 text-xs text-gray-300 hover:text-white"
                              title="Preview"
                            >
                              <Maximize2 className="w-3.5 h-3.5 mr-1" />
                              Preview
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
