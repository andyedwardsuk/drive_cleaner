import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderTree,
  FolderOpen,
  FolderCheck,
  FolderGit2,
  FolderArchive,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Check,
  Briefcase,
  User,
  Image as ImageIcon,
  Archive,
  FileText,
  Clock,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Sliders,
  ExternalLink,
  Edit2
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolder, faXmark } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { useFolderReorganizer } from '@/hooks/useFolderReorganizer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, formatBytes } from '@/lib/utils'

function getFileIcon(mimeType, title) {
  const m = (mimeType || '').toLowerCase()
  const t = (title || '').toLowerCase()
  if (m.includes('spreadsheet') || t.endsWith('.xlsx') || t.endsWith('.csv') || t.endsWith('.gsheet')) {
    return <FileText className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
  }
  if (m.includes('image/') || t.endsWith('.png') || t.endsWith('.jpg') || t.endsWith('.jpeg')) {
    return <ImageIcon className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
  }
  if (m.includes('presentation') || t.endsWith('.pptx') || t.endsWith('.gslides')) {
    return <FileText className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
  }
  if (m.includes('zip') || m.includes('archive') || t.endsWith('.zip') || t.endsWith('.tar') || t.endsWith('.gz')) {
    return <Archive className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
  }
  return <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
}

export default function SmartReorganizerView() {
  const {
    analysis,
    isLoading,
    isReorganizing,
    isRestoring,
    reorgProgress,
    undoToast,
    history,
    fetchAnalysis,
    executePlan,
    undoReorganization,
    dismissUndo
  } = useFolderReorganizer()

  const [activeTab, setActiveTab] = useState('tree') // 'tree' | 'clusters' | 'anomalies'
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pendingPlan, setPendingPlan] = useState(null)
  const [successBanner, setSuccessBanner] = useState('')

  // Interactive decision controls state
  const [selectedFilesByCluster, setSelectedFilesByCluster] = useState({})
  const [customTargets, setCustomTargets] = useState({})
  const [editingTargetClusterId, setEditingTargetClusterId] = useState(null)
  const [targetInputValues, setTargetInputValues] = useState({})
  const [expandedClusters, setExpandedClusters] = useState({})

  const healthScore = analysis?.healthScore ?? 100
  const rating = analysis?.rating || (isLoading ? 'Analyzing...' : 'Optimal')
  const metrics = analysis?.metrics || {
    totalFolders: 0,
    totalFiles: 0,
    maxDepth: 1,
    orphanedRootFiles: 0,
    genericFolderCount: 0
  }

  // Helpers for cluster files and selection
  const getClusterFiles = (cluster) => {
    if (cluster.files && cluster.files.length > 0) return cluster.files
    return (cluster.sampleFiles || []).map((name, idx) => ({
      id: `${cluster.id}_sample_${idx}`,
      title: name,
      mimeType: '',
      fileSize: 0
    }))
  }

  const getSelectedFileIds = (cluster) => {
    if (selectedFilesByCluster[cluster.id] !== undefined) {
      return selectedFilesByCluster[cluster.id]
    }
    return getClusterFiles(cluster).map((f) => f.id)
  }

  const toggleFileInCluster = (clusterId, fileId, allFiles) => {
    setSelectedFilesByCluster((prev) => {
      const current = prev[clusterId] !== undefined ? prev[clusterId] : allFiles.map((f) => f.id)
      const next = current.includes(fileId)
        ? current.filter((id) => id !== fileId)
        : [...current, fileId]
      return { ...prev, [clusterId]: next }
    })
  }

  const selectAllInCluster = (clusterId, allFiles) => {
    setSelectedFilesByCluster((prev) => ({
      ...prev,
      [clusterId]: allFiles.map((f) => f.id)
    }))
  }

  const clearAllInCluster = (clusterId) => {
    setSelectedFilesByCluster((prev) => ({
      ...prev,
      [clusterId]: []
    }))
  }

  const getTargetForCluster = (cluster) => {
    return customTargets[cluster.id] || cluster.suggestedPath
  }

  const startEditingTarget = (cluster) => {
    setEditingTargetClusterId(cluster.id)
    setTargetInputValues((prev) => ({
      ...prev,
      [cluster.id]: getTargetForCluster(cluster)
    }))
  }

  const saveTargetForCluster = (clusterId) => {
    const val = (targetInputValues[clusterId] || '').trim()
    if (val) {
      setCustomTargets((prev) => ({ ...prev, [clusterId]: val }))
    }
    setEditingTargetClusterId(null)
  }

  const toggleExpandCluster = (clusterId) => {
    setExpandedClusters((prev) => ({ ...prev, [clusterId]: !prev[clusterId] }))
  }

  const handleReviewCluster = (cluster) => {
    const targetPath = getTargetForCluster(cluster)
    const allFiles = getClusterFiles(cluster)
    const selectedIds = getSelectedFileIds(cluster)
    const selectedFiles = allFiles.filter((f) => selectedIds.includes(f.id))

    if (selectedFiles.length === 0) return

    setPendingPlan({
      clusterId: cluster.id,
      clusterName: cluster.name,
      title: `Move ${selectedFiles.length} files into ${targetPath}`,
      targetPath: targetPath,
      selectedFiles: selectedFiles,
      allFiles: allFiles,
      moves: selectedFiles.map((f) => ({
        fileId: f.id,
        targetPath: targetPath
      }))
    })
    setConfirmModalOpen(true)
  }

  const toggleModalFile = (fileId) => {
    if (!pendingPlan) return
    const currentMoves = pendingPlan.moves || []
    const isChecked = currentMoves.some((m) => m.fileId === fileId)
    let nextMoves
    if (isChecked) {
      nextMoves = currentMoves.filter((m) => m.fileId !== fileId)
    } else {
      nextMoves = [...currentMoves, { fileId: fileId, targetPath: pendingPlan.targetPath }]
    }
    setPendingPlan({
      ...pendingPlan,
      moves: nextMoves
    })
  }

  const updateModalTargetPath = (newPath) => {
    if (!pendingPlan) return
    setPendingPlan({
      ...pendingPlan,
      targetPath: newPath,
      moves: (pendingPlan.moves || []).map((m) => ({ ...m, targetPath: newPath }))
    })
  }

  const handleApplyFullStructure = () => {
    const allMoves = []
    ;(analysis?.clusters || []).forEach((c) => {
      const allFiles = getClusterFiles(c)
      const selectedIds = getSelectedFileIds(c)
      const target = getTargetForCluster(c)
      allFiles
        .filter((f) => selectedIds.includes(f.id))
        .forEach((f) => {
          allMoves.push({ fileId: f.id, targetPath: target })
        })
    })

    if (allMoves.length === 0) {
      setSuccessBanner('No reorganisation needed — your Drive hierarchy is in good order!')
      setTimeout(() => setSuccessBanner(''), 4000)
      return
    }

    setPendingPlan({
      clusterId: 'full_structure',
      clusterName: 'Full Drive Hierarchy Reorganisation',
      title: 'Full Drive Hierarchy Reorganisation',
      targetPath: 'Optimal Drive Architecture',
      moves: allMoves,
      selectedFiles: allMoves.map((m, idx) => ({ id: m.fileId, title: `File ${idx + 1}` })),
      allFiles: allMoves.map((m, idx) => ({ id: m.fileId, title: `File ${idx + 1}` }))
    })
    setConfirmModalOpen(true)
  }

  const handleConfirmReorganization = async () => {
    if (!pendingPlan) return
    const res = await executePlan(pendingPlan)
    if (res.success) {
      setConfirmModalOpen(false)
      setPendingPlan(null)
      setSuccessBanner(`Successfully reorganised files into "${res.record.targetFolder}"!`)
      setTimeout(() => setSuccessBanner(''), 5000)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <Hero
        title="Smart Folder Reorganiser & Hierarchy Architect"
        subtitle="Transform chaotic folder structures into intelligent, maintainable hierarchies using AI pattern recognition, category clustering, and 1-click reversible moves."
        icon={FolderTree}
      />

      {/* Success Notification Alert */}
      {successBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300"
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
          <span className="text-sm font-medium">{successBanner}</span>
        </motion.div>
      )}

      {/* Top Structure Health Banner */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-sm backdrop-blur-md">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-center">
          {/* Health Score Gauge */}
          <div className="md:col-span-4 flex items-center gap-5 border-b md:border-b-0 md:border-r border-border/40 pb-5 md:pb-0 md:pr-5">
            <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-primary/10 border border-primary/20 shadow-inner">
              <div className="text-center">
                <span className="text-3xl font-black tracking-tight text-primary">
                  {healthScore}
                </span>
                <span className="text-xs font-semibold text-muted-foreground block -mt-1">
                  / 100
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Structure Health</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs font-medium',
                    healthScore >= 80
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  )}
                >
                  {rating}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {healthScore >= 80
                  ? 'Your Google Drive is well structured and easy to navigate.'
                  : 'Deep nesting and orphaned root files are slowing down searches and cluttering Drive.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5">
              <span className="text-xs text-muted-foreground">Max Depth</span>
              <div className="mt-1 text-lg font-bold flex items-baseline gap-1">
                <span>{metrics.maxDepth}</span>
                <span className="text-[11px] text-amber-400 font-normal">lvls (Opt: 3-4)</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5">
              <span className="text-xs text-muted-foreground">Root Clutter</span>
              <div className="mt-1 text-lg font-bold flex items-baseline gap-1">
                <span>{metrics.orphanedRootFiles}</span>
                <span className="text-[11px] text-muted-foreground font-normal">orphans</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5">
              <span className="text-xs text-muted-foreground">Generic Folders</span>
              <div className="mt-1 text-lg font-bold flex items-baseline gap-1">
                <span>{metrics.genericFolderCount}</span>
                <span className="text-[11px] text-muted-foreground font-normal">folders</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5">
              <span className="text-xs text-muted-foreground">Total Density</span>
              <div className="mt-1 text-lg font-bold flex items-baseline gap-1">
                <span>{metrics.totalFolders}</span>
                <span className="text-[11px] text-muted-foreground font-normal">dirs / {metrics.totalFiles} files</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === 'tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tree')}
            className="gap-2 text-xs"
          >
            <FolderTree className="h-4 w-4" />
            Hierarchy Architect (Before vs After)
          </Button>

          <Button
            variant={activeTab === 'clusters' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('clusters')}
            className="gap-2 text-xs"
          >
            <Sparkles className="h-4 w-4" />
            Smart File Clusters
            <Badge variant="secondary" className="ml-1 text-xs">
              {analysis?.clusters?.length || 4}
            </Badge>
          </Button>

          <Button
            variant={activeTab === 'anomalies' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('anomalies')}
            className="gap-2 text-xs"
          >
            <AlertCircle className="h-4 w-4" />
            Anomalies & History
            <Badge variant="secondary" className="ml-1 text-xs">
              {history.length}
            </Badge>
          </Button>
        </div>

        <Button
          size="sm"
          variant="outline"
          disabled={isLoading}
          onClick={() => fetchAnalysis()}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Re-Analyse Drive
        </Button>
      </div>

      {/* TAB 1: Hierarchy Architect (Before vs After) */}
      {activeTab === 'tree' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CURRENT DRIVE STRUCTURE */}
            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "rounded-lg p-2",
                    healthScore < 60 ? "bg-rose-500/10 text-rose-400" : (healthScore < 80 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400")
                  )}>
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Current Drive Structure</h4>
                    <p className="text-xs text-muted-foreground">
                      {isLoading ? 'Scanning folders...' : `${metrics.totalFolders} ${metrics.totalFolders === 1 ? 'folder' : 'folders'}, max depth: ${metrics.maxDepth}`}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    healthScore < 60 ? "border-rose-500/30 text-rose-400" : (healthScore < 80 ? "border-amber-500/30 text-amber-400" : "border-emerald-500/30 text-emerald-400")
                  )}
                >
                  {rating}
                </Badge>
              </div>

              {/* Dynamic Real Tree: Current */}
              <div className="font-mono text-xs text-muted-foreground space-y-2 py-2 max-h-[380px] overflow-y-auto pr-1">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <FolderOpen className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{analysis?.currentTree?.rootName || 'My Drive'} /</span>
                  <Badge variant="outline" className="text-[10px] text-rose-400 ml-auto border-rose-500/30 flex-shrink-0">
                    {metrics.orphanedRootFiles} {metrics.orphanedRootFiles === 1 ? 'file' : 'files'} in root
                  </Badge>
                </div>

                {isLoading ? (
                  <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                    Scanning Drive folder structure...
                  </div>
                ) : (!analysis?.currentTree?.folders || analysis.currentTree.folders.length === 0) ? (
                  <div className="pl-5 py-4 space-y-2 border-l border-border/40 ml-2">
                    <p className="text-xs text-slate-300">
                      No subfolders detected in this location.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      All files are currently stored directly in the root directory. Creating a multi-level folder structure will improve your Drive health score.
                    </p>
                  </div>
                ) : (
                  <div className="pl-5 space-y-2 border-l border-border/40 ml-2">
                    {analysis.currentTree.folders.slice(0, 20).map((folder) => (
                      <div key={folder.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-300">
                          <FolderOpen className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{folder.name}</span>
                          {folder.isGeneric && (
                            <span className="text-[10px] text-amber-400/90 font-medium flex-shrink-0">(generic name)</span>
                          )}
                          {folder.depth > 3 && (
                            <span className="text-[10px] text-rose-400 flex-shrink-0">(depth: {folder.depth})</span>
                          )}
                        </div>

                        {folder.children && folder.children.length > 0 && (
                          <div className="pl-4 space-y-1 border-l border-border/40 ml-1.5 text-slate-400">
                            {folder.children.slice(0, 8).map((child) => (
                              <div key={child.id} className="flex items-center gap-2">
                                <span className="text-muted-foreground">├─</span>
                                <FolderOpen className="h-3 w-3 text-amber-400 flex-shrink-0" />
                                <span className="truncate">{child.name}</span>
                                {child.isGeneric && (
                                  <span className="text-[10px] text-amber-400/90 flex-shrink-0">(generic)</span>
                                )}
                                {child.depth > 3 && (
                                  <span className="text-[10px] text-rose-400 flex-shrink-0">(depth: {child.depth})</span>
                                )}
                              </div>
                            ))}
                            {folder.children.length > 8 && (
                              <div className="text-[10px] text-muted-foreground pl-4">
                                + {folder.children.length - 8} more subfolders
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {analysis.currentTree.folders.length > 20 && (
                      <div className="text-[11px] text-muted-foreground pt-1 pl-1">
                        + {analysis.currentTree.folders.length - 20} more folders in Drive
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI PROPOSED CLEAN HIERARCHY */}
            <div className="rounded-2xl border border-primary/40 bg-card/60 p-6 space-y-4 backdrop-blur-sm relative overflow-hidden shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">AI Proposed Clean Hierarchy</h4>
                    <p className="text-xs text-muted-foreground">Optimal 3-level depth, clear separation</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-xs">
                  Optimal Structure
                </Badge>
              </div>

              {/* Dynamic Real Tree: Proposed */}
              <div className="font-mono text-xs text-muted-foreground space-y-2 py-2 max-h-[380px] overflow-y-auto pr-1">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <FolderCheck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{analysis?.currentTree?.rootName || 'My Drive'} /</span>
                  <span className="text-[10px] text-emerald-400 ml-auto flex-shrink-0">0 orphans</span>
                </div>

                <div className="pl-5 space-y-2 border-l border-primary/30 ml-2">
                  {(analysis?.proposedStructure || []).map((cat, idx) => {
                    const iconMap = {
                      briefcase: <Briefcase className="h-3.5 w-3.5 text-indigo-400" />,
                      user: <User className="h-3.5 w-3.5 text-emerald-400" />,
                      image: <ImageIcon className="h-3.5 w-3.5 text-sky-400" />,
                      archive: <Archive className="h-3.5 w-3.5 text-amber-400" />
                    }
                    const colorMap = {
                      briefcase: 'text-indigo-300',
                      user: 'text-emerald-300',
                      image: 'text-sky-300',
                      archive: 'text-amber-300'
                    }
                    const IconComp = iconMap[cat.icon] || <FolderCheck className="h-3.5 w-3.5 text-primary" />
                    const textColor = colorMap[cat.icon] || 'text-primary'

                    return (
                      <div key={idx} className="space-y-1">
                        <div className={cn("flex items-center gap-2 font-semibold", textColor)}>
                          {IconComp}
                          <span className="flex items-center gap-1.5 truncate">
                            <FontAwesomeIcon icon={faFolder} className="w-3.5 h-3.5 text-blue-400" /> {cat.path} /
                          </span>
                        </div>
                        {cat.children && cat.children.length > 0 && (
                          <div className="pl-5 space-y-1 border-l border-border/30 ml-2 text-slate-400">
                            {cat.children.map((child, cIdx) => (
                              <div key={cIdx} className="flex items-center gap-1.5 truncate">
                                <span>{cIdx === cat.children.length - 1 ? '└─' : '├─'}</span>
                                <FontAwesomeIcon icon={faFolder} className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                <span className="truncate">{child.path.replace(cat.path + '/', '')} /</span>
                                {child.count ? (
                                  <span className="text-[10px] text-muted-foreground flex-shrink-0">({child.count} files)</span>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Apply Full Structure CTA */}
              <div className="pt-3 border-t border-border/40 flex justify-end">
                <Button
                  onClick={handleApplyFullStructure}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                >
                  <FolderCheck className="h-4 w-4" />
                  Apply Proposed Hierarchy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Smart File Clusters */}
      {activeTab === 'clusters' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/30 p-4">
            <h3 className="text-base font-semibold">Detected Natural File Clusters</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Drive Cleaner automatically groups files scattered across random folders into meaningful topics. You have full control: review every candidate file, uncheck any items that should stay, and customize the target destination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(analysis?.clusters || []).map((cluster) => {
              const allFiles = getClusterFiles(cluster)
              const selectedIds = getSelectedFileIds(cluster)
              const targetPath = getTargetForCluster(cluster)
              const isExpanded = !!expandedClusters[cluster.id]
              const isEditingTarget = editingTargetClusterId === cluster.id
              const displayFiles = isExpanded ? allFiles : allFiles.slice(0, 5)

              return (
                <motion.div
                  key={cluster.id}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-4 shadow-sm backdrop-blur-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{cluster.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {allFiles.length} files • {cluster.confidence}% AI confidence
                        </p>
                      </div>

                      {/* Target Folder Badge / Inline Editor */}
                      {!isEditingTarget ? (
                        <button
                          type="button"
                          onClick={() => startEditingTarget(cluster)}
                          title="Click to edit destination folder"
                          className="group flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300 hover:border-indigo-500/60 hover:bg-indigo-500/20 transition-colors"
                        >
                          <span className="font-mono text-[11px] truncate max-w-[150px]">
                            {targetPath}
                          </span>
                          <Edit2 className="h-3 w-3 text-indigo-400 group-hover:text-indigo-200 flex-shrink-0" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={targetInputValues[cluster.id] || ''}
                            onChange={(e) =>
                              setTargetInputValues((prev) => ({ ...prev, [cluster.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTargetForCluster(cluster.id)
                              if (e.key === 'Escape') setEditingTargetClusterId(null)
                            }}
                            className="h-7 w-36 rounded border border-primary/50 bg-background/90 px-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => saveTargetForCluster(cluster.id)}
                            className="h-7 px-2 text-[11px]"
                          >
                            Save
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Quick Preset Paths (shown when editing target) */}
                    {isEditingTarget && (
                      <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-muted/30 border border-border/40">
                        <span className="text-[10px] text-muted-foreground block w-full">Quick suggestions:</span>
                        {['Personal/Travel', 'Work/Projects', 'Personal/Finance', 'Media & Assets', 'Archive'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setTargetForCluster(cluster.id, preset)
                              setEditingTargetClusterId(null)
                            }}
                            className="text-[10px] rounded bg-muted/60 px-1.5 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Keyword Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {(cluster.keywords || []).map((kw) => (
                        <span
                          key={kw}
                          className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>

                    {/* Interactive Candidate Files Checklist */}
                    <div className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-border/30">
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                          Files to Move ({selectedIds.length} of {allFiles.length})
                        </span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() => selectAllInCluster(cluster.id, allFiles)}
                            className="text-primary hover:underline"
                          >
                            Select All
                          </button>
                          <span className="text-muted-foreground">•</span>
                          <button
                            type="button"
                            onClick={() => clearAllInCluster(cluster.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                        {displayFiles.map((file) => {
                          const isChecked = selectedIds.includes(file.id)
                          return (
                            <label
                              key={file.id}
                              className={cn(
                                "flex items-center gap-2.5 p-1.5 rounded-md hover:bg-muted/40 cursor-pointer select-none transition-colors",
                                isChecked ? "text-slate-200" : "text-muted-foreground/60 line-through"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFileInCluster(cluster.id, file.id, allFiles)}
                                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                              />
                              {getFileIcon(file.mimeType, file.title)}
                              <span className="truncate flex-1 text-xs">{file.title}</span>
                              {file.fileSize > 0 && (
                                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                  {formatBytes(file.fileSize)}
                                </span>
                              )}
                            </label>
                          )
                        })}
                      </div>

                      {allFiles.length > 5 && (
                        <div className="pt-1 text-center">
                          <button
                            type="button"
                            onClick={() => toggleExpandCluster(cluster.id)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium"
                          >
                            {isExpanded ? (
                              <>Show fewer files</>
                            ) : (
                              <>Show all {allFiles.length} files ({allFiles.length - 5} more) <ChevronDown className="h-3 w-3" /></>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                      From: {(cluster.currentLocations || []).join(', ')}
                    </span>
                    <Button
                      size="sm"
                      disabled={selectedIds.length === 0}
                      onClick={() => handleReviewCluster(cluster)}
                      className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      Review & Move ({selectedIds.length})
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Anomalies & Reorganization History */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          {/* Generic Folder Anomalies */}
          <div className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-4 backdrop-blur-sm">
            <div>
              <h3 className="text-base font-semibold">Generic & Duplicate Folders</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Folders with meaningless or duplicate names that should be consolidated.
              </p>
            </div>

            <div className="space-y-2.5">
              {(analysis?.genericFolders || []).map((folder, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="font-semibold text-foreground">{folder.name}</span>
                      <span className="text-muted-foreground ml-2">({folder.path})</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleApplyCluster({
                        id: 'generic_' + idx,
                        name: `Consolidated ${folder.name}`,
                        suggestedPath: 'Work/Projects/Active',
                        fileCount: 8,
                        sampleFiles: ['Project Files', 'Meeting Notes']
                      })
                    }
                    className="text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    Consolidate
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* History & Reversible Restore */}
          <div className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-4 backdrop-blur-sm">
            <div>
              <h3 className="text-base font-semibold">Reorganization History & Restore Points</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Every reorganization move is tracked. You can revert files to their exact pre-move locations at any time.
              </p>
            </div>

            {history.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs">
                No reorganizations recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4 text-xs',
                      item.restored && 'opacity-60'
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{item.title}</span>
                        {item.restored ? (
                          <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">
                            Restored
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                            Active Hierarchy
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {item.fileCount} files • {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {!item.restored && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isRestoring}
                        onClick={() => undoReorganization(item.id)}
                        className="gap-1.5 text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Revert Locations
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Review & Confirmation Modal */}
      <AnimatePresence>
        {confirmModalOpen && pendingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <FolderCheck className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate">Review & Move Files</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {pendingPlan.clusterName || 'Custom Reorganization Plan'}
                    </p>
                  </div>
                </div>

                {/* Target Destination Control */}
                <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Destination Folder:</span>
                    <span className="text-[11px] text-primary font-mono">{pendingPlan.targetPath}</span>
                  </div>
                  <input
                    type="text"
                    value={pendingPlan.targetPath || ''}
                    onChange={(e) => updateModalTargetPath(e.target.value)}
                    placeholder="e.g. Personal/Travel or Work/Projects/Active"
                    className="w-full h-8 rounded border border-border bg-background px-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-muted-foreground">Presets:</span>
                    {['Personal/Travel', 'Work/Projects/Active', 'Personal/Finance', 'Media & Assets', 'Archive'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => updateModalTargetPath(preset)}
                        className="text-[10px] rounded bg-muted/60 px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted font-mono"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File List with Checkboxes */}
                <div className="rounded-xl border border-border/40 bg-muted/10 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/30">
                    <span className="text-[11px] font-semibold text-foreground">
                      Files Included in Move ({pendingPlan.moves?.length || 0} of {pendingPlan.allFiles?.length || pendingPlan.moves?.length || 0})
                    </span>
                    <span className="text-[10px] text-muted-foreground">Uncheck any file to exclude</span>
                  </div>

                  <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                    {(pendingPlan.allFiles || pendingPlan.selectedFiles || []).map((file) => {
                      const isIncluded = (pendingPlan.moves || []).some((m) => m.fileId === file.id)
                      return (
                        <label
                          key={file.id}
                          className={cn(
                            "flex items-center gap-2.5 p-1.5 rounded-md hover:bg-muted/40 cursor-pointer select-none transition-colors",
                            isIncluded ? "text-slate-200" : "text-muted-foreground/50 line-through"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isIncluded}
                            onChange={() => toggleModalFile(file.id)}
                            className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                          />
                          {getFileIcon(file.mimeType, file.title)}
                          <span className="truncate flex-1 text-xs">{file.title}</span>
                          {file.fileSize > 0 && (
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">
                              {formatBytes(file.fileSize)}
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Reversible guarantee notice */}
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                  <span>100% Reversible — Drive Cleaner saves original locations for instant 1-click restore.</span>
                </div>

                {isReorganizing && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Moving files...</span>
                      <span>{reorgProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${reorgProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/40 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isReorganizing}
                  onClick={() => setConfirmModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isReorganizing || (pendingPlan.moves?.length || 0) === 0}
                  onClick={handleConfirmReorganization}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  {isReorganizing ? (
                    <>
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      Moving {pendingPlan.moves?.length || 0} Files...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Execute Move ({pendingPlan.moves?.length || 0} Files)
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Undo Toast */}
      <AnimatePresence>
        {undoToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-xl border border-primary/40 bg-card/95 px-5 py-4 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/20 p-2 text-primary">
                <FolderCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Moved {undoToast.movedCount} files to clean hierarchy
                </p>
                <p className="text-xs text-muted-foreground">
                  {undoToast.countdown}s remaining to undo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isRestoring}
                onClick={() => undoReorganization()}
                className="text-xs gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Undo Move
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissUndo}
                className="h-8 w-8 p-0 text-muted-foreground flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
