import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Archive,
  FolderArchive,
  Calendar,
  Sparkles,
  History,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HardDrive,
  Search,
  Check,
  Clock,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Film,
  FileCode,
  FolderOpen,
  ArrowRight,
  Shield,
  Layers,
  CheckSquare,
  Square
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { useArchiveEngine } from '@/hooks/useArchiveEngine'
import { useKanbanBoard } from '@/hooks/useKanbanBoard'
import { useSmartScan } from '@/hooks/useSmartScan'
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
  if (mimeType.includes('spreadsheet') || mimeType.includes('sheet')) return FileSpreadsheet
  if (mimeType.includes('video')) return Film
  if (mimeType.includes('folder')) return FolderOpen
  if (mimeType.includes('code') || mimeType.includes('json') || mimeType.includes('javascript')) return FileCode
  return FileText
}

export default function AutoArchiveView() {
  const {
    sessions,
    config,
    updateConfig,
    isArchiving,
    isRestoring,
    archiveProgress,
    undoToast,
    executeArchive,
    restoreArchiveSession,
    undoLastArchive,
    dismissUndo,
    totalArchivedFiles,
    totalArchivedBytes
  } = useArchiveEngine()

  const { cards: kanbanCards } = useKanbanBoard()
  const { data: scanData } = useSmartScan()
  const { openPreview } = useFilePreview()

  const [activeTab, setActiveTab] = useState('kanban') // 'kanban' | 'age' | 'rot' | 'history'
  const [selectedFileIds, setSelectedFileIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [ageDaysThreshold, setAgeDaysThreshold] = useState(365)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [targetFolderNameInput, setTargetFolderNameInput] = useState(config.targetFolderName || '_DriveCleaner_Archive')
  const [organizeByYearToggle, setOrganizeByYearToggle] = useState(config.organizeByYear !== false)
  const [archiveSuccessMessage, setArchiveSuccessMessage] = useState('')

  // 1. Kanban Archive candidates (cards in 'archive' column)
  const kanbanArchiveCandidates = useMemo(() => {
    return kanbanCards
      .filter((c) => c.columnId === 'archive')
      .map((c) => ({
        fileId: c.fileId,
        fileName: c.fileName,
        fileSize: c.fileSize,
        sizeBytes: c.sizeBytes || 0,
        mimeType: c.mimeType,
        modifiedDate: c.modifiedDate,
        parentName: c.parentName || 'My Drive',
        driveLink: c.driveLink,
        sourceLabel: 'Kanban Board'
      }))
  }, [kanbanCards])

  // 2. Age & Inactivity candidates from Smart Scan raw files or sample data
  const ageArchiveCandidates = useMemo(() => {
    const rawFiles = scanData?.rawFiles || []
    const now = Date.now()
    const thresholdMs = ageDaysThreshold * 24 * 60 * 60 * 1000

    if (rawFiles.length > 0) {
      return rawFiles
        .filter((f) => {
          const modTime = new Date(f.modifiedDate || f.lastModified || 0).getTime()
          return modTime > 0 && (now - modTime) >= thresholdMs
        })
        .map((f) => ({
          fileId: f.id || f.fileId,
          fileName: f.title || f.fileName || f.name,
          fileSize: f.fileSize || formatBytes(f.fileSizeNumber || f.sizeBytes || 0),
          sizeBytes: f.fileSizeNumber || f.sizeBytes || 0,
          mimeType: f.mimeType,
          modifiedDate: f.modifiedDate,
          parentName: f.parentName || 'Drive Folder',
          driveLink: f.alternateLink || f.driveLink,
          sourceLabel: `Unmodified > ${ageDaysThreshold} days`
        }))
    }

    // Fallback seed candidates if scan hasn't loaded yet
    return [
      {
        fileId: 'mock_old_doc_1',
        fileName: 'FY2022_Budget_Analysis_Final.xlsx',
        fileSize: '8.4 MB',
        sizeBytes: 8808038,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        modifiedDate: '2023-01-14T10:20:00Z',
        parentName: 'Finance / Archives',
        sourceLabel: 'Inactive > 3 years'
      },
      {
        fileId: 'mock_old_doc_2',
        fileName: 'Project_Atlas_Sprint_Retrospective_2022.pdf',
        fileSize: '14.2 MB',
        sizeBytes: 14889779,
        mimeType: 'application/pdf',
        modifiedDate: '2022-11-04T15:30:00Z',
        parentName: 'Engineering',
        sourceLabel: 'Inactive > 3 years'
      },
      {
        fileId: 'mock_old_doc_3',
        fileName: 'Client_Pitch_Deck_v3_Archive.pptx',
        fileSize: '32.1 MB',
        sizeBytes: 33659289,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        modifiedDate: '2023-05-18T09:12:00Z',
        parentName: 'Marketing',
        sourceLabel: 'Inactive > 2 years'
      }
    ]
  }, [scanData, ageDaysThreshold])

  // 3. ROT Analyzer Stale candidates
  const rotArchiveCandidates = useMemo(() => {
    const rotStale = scanData?.categories?.rot?.staleFiles || []
    if (rotStale.length > 0) {
      return rotStale.map((f) => ({
        fileId: f.fileId || f.id,
        fileName: f.fileName || f.name,
        fileSize: f.fileSize || formatBytes(f.fileSizeBytes || f.sizeBytes || 0),
        sizeBytes: f.fileSizeBytes || f.sizeBytes || 0,
        mimeType: f.mimeType,
        modifiedDate: f.modifiedDate,
        parentName: f.parentName || 'Drive Folder',
        driveLink: f.driveLink,
        sourceLabel: 'ROT Analyzer (Stale)'
      }))
    }

    return [
      {
        fileId: 'mock_rot_file_1',
        fileName: 'Legacy_Onboarding_Handbook_2021.docx',
        fileSize: '4.8 MB',
        sizeBytes: 5033164,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        modifiedDate: '2021-09-02T11:00:00Z',
        parentName: 'HR / Docs',
        sourceLabel: 'ROT Stale'
      },
      {
        fileId: 'mock_rot_file_2',
        fileName: 'Q1_2022_Raw_Survey_Export.csv',
        fileSize: '19.5 MB',
        sizeBytes: 20447232,
        mimeType: 'text/csv',
        modifiedDate: '2022-04-10T14:45:00Z',
        parentName: 'Surveys',
        sourceLabel: 'ROT Stale'
      }
    ]
  }, [scanData])

  // Current candidate pool depending on active tab
  const currentPool = useMemo(() => {
    if (activeTab === 'kanban') return kanbanArchiveCandidates
    if (activeTab === 'age') return ageArchiveCandidates
    if (activeTab === 'rot') return rotArchiveCandidates
    return []
  }, [activeTab, kanbanArchiveCandidates, ageArchiveCandidates, rotArchiveCandidates])

  // Filtered pool by search
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return currentPool
    const q = searchQuery.toLowerCase()
    return currentPool.filter(
      (f) => f.fileName?.toLowerCase().includes(q) || f.parentName?.toLowerCase().includes(q)
    )
  }, [currentPool, searchQuery])

  // Selection handlers
  const handleToggleSelect = (id) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedFileIds.size === filteredCandidates.length && filteredCandidates.length > 0) {
      setSelectedFileIds(new Set())
    } else {
      setSelectedFileIds(new Set(filteredCandidates.map((f) => f.fileId)))
    }
  }

  const selectedFilesList = useMemo(() => {
    return filteredCandidates.filter((f) => selectedFileIds.has(f.fileId))
  }, [filteredCandidates, selectedFileIds])

  const selectedTotalBytes = useMemo(() => {
    return selectedFilesList.reduce((acc, f) => acc + (f.sizeBytes || 0), 0)
  }, [selectedFilesList])

  // Execute archive action
  const handleConfirmArchive = async () => {
    if (selectedFilesList.length === 0) return

    updateConfig({
      targetFolderName: targetFolderNameInput,
      organizeByYear: organizeByYearToggle
    })

    const res = await executeArchive(selectedFilesList, {
      targetFolderName: targetFolderNameInput,
      organizeByYear: organizeByYearToggle
    })

    if (res.success) {
      setConfirmModalOpen(false)
      setSelectedFileIds(new Set())
      setArchiveSuccessMessage(
        `Successfully archived ${res.session.fileCount} files to "${res.session.folderName}"!`
      )
      setTimeout(() => setArchiveSuccessMessage(''), 5000)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <Hero
        title="Smart Auto-Archive Engine"
        subtitle="Migrate inactive, stale, and tagged files into structured Google Drive archive folders with year partitioning and reversible 1-click restore."
        icon={Archive}
      />

      {/* Top Aggregate Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Archived Files</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <FolderArchive className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{totalArchivedFiles}</div>
          <p className="mt-1 text-xs text-muted-foreground">Moved out of active directories</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Storage Archived</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{formatBytes(totalArchivedBytes)}</div>
          <p className="mt-1 text-xs text-muted-foreground">Preserved in cold storage</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Staged Candidates</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{filteredCandidates.length}</div>
          <p className="mt-1 text-xs text-muted-foreground">In active source tab</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Target Drive Destination</span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <FolderOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 truncate text-base font-semibold">
            {config.targetFolderName || '_DriveCleaner_Archive'}
            {config.organizeByYear ? `/${new Date().getFullYear()}` : ''}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Automatic subfolder organisation</p>
        </motion.div>
      </div>

      {/* Success alert */}
      {archiveSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400"
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{archiveSuccessMessage}</span>
        </motion.div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('kanban')
              setSelectedFileIds(new Set())
            }}
            className="flex items-center gap-2"
          >
            <Archive className="h-4 w-4" />
            Kanban Staged
            <Badge variant="secondary" className="ml-1 text-xs">
              {kanbanArchiveCandidates.length}
            </Badge>
          </Button>

          <Button
            variant={activeTab === 'age' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('age')
              setSelectedFileIds(new Set())
            }}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Age & Inactivity
            <Badge variant="secondary" className="ml-1 text-xs">
              {ageArchiveCandidates.length}
            </Badge>
          </Button>

          <Button
            variant={activeTab === 'rot' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('rot')
              setSelectedFileIds(new Set())
            }}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            ROT Stale Files
            <Badge variant="secondary" className="ml-1 text-xs">
              {rotArchiveCandidates.length}
            </Badge>
          </Button>

          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setActiveTab('history')
              setSelectedFileIds(new Set())
            }}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Archive History
            <Badge variant="secondary" className="ml-1 text-xs">
              {sessions.length}
            </Badge>
          </Button>
        </div>

        {/* Search bar (for candidate tabs) */}
        {activeTab !== 'history' && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search staged files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        )}
      </div>

      {/* Age rule sub-filter pill bar */}
      {activeTab === 'age' && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-3 text-sm">
          <span className="font-medium text-muted-foreground">Inactivity Threshold:</span>
          {[
            { label: 'Older than 1 Year (365d)', days: 365 },
            { label: 'Older than 2 Years (730d)', days: 730 },
            { label: 'Older than 3 Years (1095d)', days: 1095 }
          ].map((item) => (
            <Button
              key={item.days}
              size="sm"
              variant={ageDaysThreshold === item.days ? 'secondary' : 'ghost'}
              onClick={() => setAgeDaysThreshold(item.days)}
              className="text-xs"
            >
              {item.label}
            </Button>
          ))}
        </div>
      )}

      {/* Tab 1, 2, 3: Candidate Review Table */}
      {activeTab !== 'history' && (
        <div className="space-y-4">
          {/* Action Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-xs"
              >
                {selectedFileIds.size > 0 && selectedFileIds.size === filteredCandidates.length ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground" />
                )}
                {selectedFileIds.size === filteredCandidates.length && filteredCandidates.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
              <span className="text-xs text-muted-foreground">
                {selectedFileIds.size} of {filteredCandidates.length} selected ({formatBytes(selectedTotalBytes)})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                disabled={selectedFileIds.size === 0 || isArchiving}
                onClick={() => setConfirmModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Archive className="h-4 w-4" />
                Archive Selected ({selectedFileIds.size})
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
            {filteredCandidates.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <FolderArchive className="mx-auto h-12 w-12 opacity-30" />
                <p className="mt-3 text-base font-medium">No candidate files found in this category</p>
                <p className="mt-1 text-xs">
                  {activeTab === 'kanban'
                    ? 'Move files to the "Archive" column on the Kanban board to review them here.'
                    : 'Adjust your search query or threshold filter.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border/50 bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="w-10 px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedFileIds.size > 0 &&
                            selectedFileIds.size === filteredCandidates.length
                          }
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
                        />
                      </th>
                      <th className="px-4 py-3">File Name</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Current Location</th>
                      <th className="px-4 py-3">Rule / Tag</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredCandidates.map((file) => {
                      const Icon = getFileIcon(file.mimeType)
                      const isSelected = selectedFileIds.has(file.fileId)
                      return (
                        <tr
                          key={file.fileId}
                          className={cn(
                            'transition-colors hover:bg-muted/30',
                            isSelected && 'bg-primary/5'
                          )}
                        >
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(file.fileId)}
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="rounded-md bg-muted/50 p-2 text-muted-foreground">
                                <Icon className="h-4 w-4" />
                              </div>
                              <button
                                onClick={() => openPreview(file, filteredCandidates)}
                                className="truncate text-left font-medium hover:text-primary hover:underline max-w-[280px] sm:max-w-md"
                              >
                                {file.fileName}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {file.fileSize}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[160px]">
                            {file.parentName}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-xs text-indigo-400 border-indigo-500/30 bg-indigo-500/5">
                              {file.sourceLabel}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openPreview(file, filteredCandidates)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              title="Inspect & Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Archive History & Reversible Restore */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/30 p-4">
            <h3 className="text-base font-semibold">Archive Audit & Restore History</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Review all past archival operations. Any archived batch can be restored back to its original parent folders with a single click.
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card/20 py-16 text-center text-muted-foreground">
              <History className="mx-auto h-12 w-12 opacity-30" />
              <p className="mt-3 text-base font-medium">No archive sessions recorded yet</p>
              <p className="mt-1 text-xs">When you archive files, your historical logs and restore points will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm transition-all',
                    session.restored && 'opacity-60 bg-muted/20'
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FolderArchive className="h-5 w-5 text-indigo-400" />
                      <span className="font-semibold">{session.folderName}</span>
                      {session.restored ? (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-xs">
                          Restored
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs">
                          Active Archive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session.fileCount} {session.fileCount === 1 ? 'file' : 'files'} ({formatBytes(session.totalBytes)}) • {new Date(session.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {session.folderUrl && session.folderUrl !== '#' && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="text-xs gap-1.5"
                      >
                        <a href={session.folderUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          View in Drive
                        </a>
                      </Button>
                    )}

                    {!session.restored && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isRestoring}
                        onClick={() => restoreArchiveSession(session.id)}
                        className="text-xs gap-1.5 text-amber-400 hover:text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore to Originals
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                  <Archive className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Archive {selectedFilesList.length} Files?</h3>
                  <p className="text-xs text-muted-foreground">
                    Total volume: {formatBytes(selectedTotalBytes)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4 text-xs">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">
                    Destination Folder Name:
                  </label>
                  <Input
                    value={targetFolderNameInput}
                    onChange={(e) => setTargetFolderNameInput(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-medium text-muted-foreground">
                    Subdivide by Current Year ({new Date().getFullYear()}):
                  </span>
                  <input
                    type="checkbox"
                    checked={organizeByYearToggle}
                    onChange={(e) => setOrganizeByYearToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>Original folder mappings are saved for instant 1-click restore.</span>
              </div>

              {isArchiving && (
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Archiving files...</span>
                    <span>{archiveProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${archiveProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isArchiving}
                  onClick={() => setConfirmModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isArchiving}
                  onClick={handleConfirmArchive}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  {isArchiving ? (
                    <>
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      Archiving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Confirm & Archive
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
            className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-xl border border-indigo-500/40 bg-card/95 px-5 py-4 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Archived {undoToast.session.fileCount} files
                </p>
                <p className="text-xs text-muted-foreground">
                  Moved to {undoToast.session.folderName} ({undoToast.countdown}s remaining)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={undoLastArchive}
                className="text-xs gap-1.5 border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Undo
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
