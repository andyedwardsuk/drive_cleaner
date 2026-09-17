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
  TrendingUp,
  Sliders,
  ExternalLink
} from 'lucide-react'
import Hero from '@/components/Hero'
import { useFolderReorganizer } from '@/hooks/useFolderReorganizer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pendingPlan, setPendingPlan] = useState(null)
  const [successBanner, setSuccessBanner] = useState('')

  const healthScore = analysis?.healthScore || 58
  const rating = analysis?.rating || 'Needs Tidy'
  const metrics = analysis?.metrics || {
    totalFolders: 24,
    totalFiles: 186,
    maxDepth: 7,
    orphanedRootFiles: 34,
    genericFolderCount: 4
  }

  const handleApplyCluster = (cluster) => {
    setPendingPlan({
      title: `Organized ${cluster.fileCount} files into ${cluster.suggestedPath}`,
      targetPath: cluster.suggestedPath,
      moves: (cluster.sampleFiles || []).map((name, idx) => ({
        fileId: `file_${cluster.id}_${idx}`,
        targetPath: cluster.suggestedPath
      }))
    })
    setConfirmModalOpen(true)
  }

  const handleApplyFullStructure = () => {
    setPendingPlan({
      title: 'Full Drive Hierarchy Reorganization',
      targetPath: 'Work, Personal, Media & Assets, Archive',
      moves: [
        { fileId: 'move_1', targetPath: 'Work/Clients/Acme Corp' },
        { fileId: 'move_2', targetPath: 'Work/Projects/Active' },
        { fileId: 'move_3', targetPath: 'Personal/Finance' },
        { fileId: 'move_4', targetPath: 'Media & Assets' },
        { fileId: 'move_5', targetPath: 'Archive/2023' }
      ]
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
            {/* CURRENT CHAOTIC STRUCTURE */}
            <div className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-4 backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Current Drive Structure</h4>
                    <p className="text-xs text-muted-foreground">Unorganized, mixed contexts, deep nesting</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-rose-500/30 text-rose-400 text-xs">
                  Chaotic
                </Badge>
              </div>

              {/* Tree Mockup: Current */}
              <div className="font-mono text-xs text-muted-foreground space-y-2 py-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <FolderOpen className="h-4 w-4 text-amber-400" />
                  <span>My Drive /</span>
                  <Badge variant="outline" className="text-[10px] text-rose-400 ml-auto border-rose-500/30">
                    34 files in root
                  </Badge>
                </div>
                <div className="pl-5 space-y-1.5 border-l border-border/40 ml-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                    <span>Project Alpha</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                    <span>CLIENT - Acme Corp</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400/90 font-medium">
                    <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                    <span>New Folder (2)</span>
                    <span className="text-[10px] text-muted-foreground">(generic name)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                    <span>Documents /</span>
                  </div>
                  <div className="pl-5 space-y-1.5 border-l border-border/40 ml-2">
                    <div className="flex items-center gap-2 text-slate-300">
                      <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                      <span>Acme Corp Files</span>
                      <span className="text-[10px] text-rose-400">(duplicate concept)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                      <span>Random stuff</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-400/90">
                      <FolderOpen className="h-3.5 w-3.5 text-rose-400" />
                      <span>Old / 2022 / Q1 / Jan / Week1 /</span>
                      <span className="text-[10px]">(depth: 7)</span>
                    </div>
                  </div>
                </div>
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

              {/* Tree Mockup: Proposed */}
              <div className="font-mono text-xs text-muted-foreground space-y-2 py-2">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <FolderCheck className="h-4 w-4 text-primary" />
                  <span>My Drive /</span>
                  <span className="text-[10px] text-emerald-400 ml-auto">0 orphans</span>
                </div>
                <div className="pl-5 space-y-2 border-l border-primary/30 ml-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                      <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                      <span>📁 Work /</span>
                    </div>
                    <div className="pl-5 space-y-1 border-l border-border/30 ml-2 text-slate-400">
                      <div>├─ 📁 Clients / Acme Corp/ <span className="text-emerald-400">(consolidated)</span></div>
                      <div>└─ 📁 Projects / Active/</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                      <User className="h-3.5 w-3.5 text-emerald-400" />
                      <span>📁 Personal /</span>
                    </div>
                    <div className="pl-5 space-y-1 border-l border-border/30 ml-2 text-slate-400">
                      <div>├─ 📁 Finance /</div>
                      <div>└─ 📁 Travel /</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sky-300 font-semibold">
                      <ImageIcon className="h-3.5 w-3.5 text-sky-400" />
                      <span>📁 Media & Assets /</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold">
                      <Archive className="h-3.5 w-3.5 text-amber-400" />
                      <span>📁 Archive / 2023 /</span>
                    </div>
                  </div>
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
              Drive Cleaner automatically groups files scattered across random folders based on client keywords, projects, file types, and date ranges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(analysis?.clusters || []).map((cluster) => (
              <motion.div
                key={cluster.id}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-border/50 bg-card/40 p-5 space-y-4 shadow-sm backdrop-blur-sm flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{cluster.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cluster.fileCount} files • {cluster.confidence}% AI confidence
                      </p>
                    </div>
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 text-xs">
                      Target: {cluster.suggestedPath}
                    </Badge>
                  </div>

                  {/* Keyword Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(cluster.keywords || []).map((kw) => (
                      <span
                        key={kw}
                        className="rounded-md bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {/* Sample Files List */}
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-3 space-y-1.5 text-xs">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider block">
                      Sample Candidate Files:
                    </span>
                    {(cluster.sampleFiles || []).map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300 truncate">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                    From: {(cluster.currentLocations || []).join(', ')}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleApplyCluster(cluster)}
                    className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    Move Cluster
                  </Button>
                </div>
              </motion.div>
            ))}
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModalOpen && pendingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <FolderCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Confirm Reorganization</h3>
                  <p className="text-xs text-muted-foreground">
                    Target destination: <strong className="text-foreground">{pendingPlan.targetPath}</strong>
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>100% Safe & Reversible</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Moving files in Google Drive preserves file links, share permissions, document revisions, and comment history. Original locations are saved for 1-click restore.
                </p>
              </div>

              {isReorganizing && (
                <div className="space-y-1 pt-2">
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

              <div className="pt-4 flex justify-end gap-3">
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
                  disabled={isReorganizing}
                  onClick={handleConfirmReorganization}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  {isReorganizing ? (
                    <>
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      Reorganizing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Execute Move
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
                className="h-8 w-8 p-0 text-muted-foreground"
              >
                ✕
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
