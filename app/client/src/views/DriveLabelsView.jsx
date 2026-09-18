import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tag,
  Tags,
  Shield,
  Scale,
  Archive,
  Leaf,
  DollarSign,
  Lock,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Trash2,
  Check,
  RotateCcw,
  ExternalLink,
  Layers,
  Sparkles,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Film,
  FileCode,
  FolderOpen,
  CheckSquare,
  Square
} from 'lucide-react'
import Hero from '@/components/Hero'
import { useDriveLabels } from '@/hooks/useDriveLabels'
import { useSmartScan } from '@/hooks/useSmartScan'
import { useFilePreview } from '@/hooks/useFilePreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
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

const COLOR_MAP = {
  rose: 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
  indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
  sky: 'border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20',
  purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20',
  slate: 'border-slate-500/30 bg-slate-500/10 text-slate-300 hover:bg-slate-500/20'
}

export default function DriveLabelsView() {
  const {
    labels,
    fileMap,
    totalTaggedFiles,
    confidentialCount,
    applyLabel,
    removeLabel,
    createLabel,
    getLabelsForFile
  } = useDriveLabels()

  const { data: scanData } = useSmartScan()
  const { openPreview } = useFilePreview()

  const [activeLabelFilter, setActiveLabelFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFileIds, setSelectedFileIds] = useState(new Set())
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('indigo')
  const [newLabelCategory, setNewLabelCategory] = useState('general')
  const [newLabelDesc, setNewLabelDesc] = useState('')
  const [actionNotification, setActionNotification] = useState('')

  // Candidate files from Smart Scan or mock seed
  const allFiles = useMemo(() => {
    const rawFiles = scanData?.rawFiles || []
    if (rawFiles.length > 0) {
      return rawFiles.map((f) => ({
        fileId: f.id || f.fileId,
        fileName: f.title || f.fileName || f.name,
        fileSize: f.fileSize || formatBytes(f.fileSizeNumber || f.sizeBytes || 0),
        sizeBytes: f.fileSizeNumber || f.sizeBytes || 0,
        mimeType: f.mimeType,
        parentName: f.parentName || 'Drive Folder',
        driveLink: f.alternateLink || f.driveLink
      }))
    }

    return [
      {
        fileId: 'mock_file_1',
        fileName: 'Board_Meeting_Q4_Confidential.pdf',
        fileSize: '12.4 MB',
        sizeBytes: 13002342,
        mimeType: 'application/pdf',
        parentName: 'Executive / Strategy'
      },
      {
        fileId: 'mock_file_2',
        fileName: 'FY2024_Consolidated_Financials.xlsx',
        fileSize: '8.2 MB',
        sizeBytes: 8598322,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        parentName: 'Finance / Corporate'
      },
      {
        fileId: 'mock_file_3',
        fileName: 'Customer_Contracts_Master_Archive.zip',
        fileSize: '142.5 MB',
        sizeBytes: 149422080,
        mimeType: 'application/zip',
        parentName: 'Legal / Archive'
      },
      {
        fileId: 'mock_file_4',
        fileName: 'Employee_NDA_Template_2024.docx',
        fileSize: '2.1 MB',
        sizeBytes: 2202009,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        parentName: 'HR / Templates'
      },
      {
        fileId: 'mock_file_5',
        fileName: 'Product_Roadmap_2025_Internal.gdoc',
        fileSize: '4.8 MB',
        sizeBytes: 5033164,
        mimeType: 'application/vnd.google-apps.document',
        parentName: 'Product Strategy'
      }
    ]
  }, [scanData])

  // Filter files by selected label filter and search
  const filteredFiles = useMemo(() => {
    return allFiles.filter((file) => {
      // 1. Label filter
      if (activeLabelFilter !== 'all') {
        const assigned = fileMap[file.fileId] || []
        if (!assigned.includes(activeLabelFilter)) return false
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const nameMatch = file.fileName?.toLowerCase().includes(q)
        const parentMatch = file.parentName?.toLowerCase().includes(q)
        if (!nameMatch && !parentMatch) return false
      }

      return true
    })
  }, [allFiles, activeLabelFilter, searchQuery, fileMap])

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
    if (selectedFileIds.size === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedFileIds(new Set())
    } else {
      setSelectedFileIds(new Set(filteredFiles.map((f) => f.fileId)))
    }
  }

  // Bulk Apply Label
  const handleApplyLabelToSelection = async (labelId) => {
    const fileIds = Array.from(selectedFileIds)
    if (fileIds.length === 0) return

    const targetLabel = labels.find((l) => l.id === labelId)
    await applyLabel(fileIds, labelId)

    setActionNotification(
      `Applied "${targetLabel?.name || labelId}" to ${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'}!`
    )
    setSelectedFileIds(new Set())
    setTimeout(() => setActionNotification(''), 4000)
  }

  // Create Custom Label
  const handleCreateLabelSubmit = async (e) => {
    e.preventDefault()
    if (!newLabelName.trim()) return

    const res = await createLabel({
      name: newLabelName.trim(),
      color: newLabelColor,
      category: newLabelCategory,
      description: newLabelDesc.trim()
    })

    if (res.success) {
      setCreateModalOpen(false)
      setNewLabelName('')
      setNewLabelDesc('')
      setActionNotification(`Created new Drive label "${res.label.name}"!`)
      setTimeout(() => setActionNotification(''), 4000)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <Hero
        title="Google Drive Labels & Taxonomy Hub"
        subtitle="Organise, govern, and secure files with metadata classification labels, compliance retention badges, and bulk taxonomy tagging."
        icon={Tags}
      />

      {/* Action Notification Alert */}
      {actionNotification && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-primary"
        >
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{actionNotification}</span>
        </motion.div>
      )}

      {/* Top Aggregate Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Defined Labels</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Tag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{labels.length}</div>
          <p className="mt-1 text-xs text-muted-foreground">Standard & custom taxonomy tags</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Classified Files</span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{totalTaggedFiles}</div>
          <p className="mt-1 text-xs text-muted-foreground">Files with custom labels assigned</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Confidential Items</span>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">{confidentialCount}</div>
          <p className="mt-1 text-xs text-muted-foreground">High-risk & sensitive documents</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Quick Action</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Plus className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <Button
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Label
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Register custom taxonomy badge</p>
        </motion.div>
      </div>

      {/* Label Registry Filter Chips Bar */}
      <div className="rounded-2xl border border-border/50 bg-card/40 p-4 space-y-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Filter by Taxonomy Tag:
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveLabelFilter('all')}
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
          >
            Clear Filter
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={activeLabelFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveLabelFilter('all')}
            className="text-xs h-8"
          >
            All Files ({allFiles.length})
          </Button>

          {labels.map((label) => {
            const isSelected = activeLabelFilter === label.id
            const colorClass = COLOR_MAP[label.color] || COLOR_MAP.indigo

            return (
              <button
                key={label.id}
                type="button"
                onClick={() => setActiveLabelFilter(isSelected ? 'all' : label.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-all',
                  colorClass,
                  isSelected && 'ring-2 ring-primary ring-offset-1 ring-offset-background font-bold'
                )}
              >
                <span>{label.name}</span>
                <span className="rounded-full bg-background/50 px-1.5 py-0.2 text-[10px]">
                  {label.fileCount || 0}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* File Table Management */}
      <div className="space-y-4">
        {/* Bulk Action & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-xs"
            >
              {selectedFileIds.size > 0 && selectedFileIds.size === filteredFiles.length ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground" />
              )}
              {selectedFileIds.size === filteredFiles.length && filteredFiles.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </Button>
            <span className="text-xs text-muted-foreground">
              {selectedFileIds.size} of {filteredFiles.length} selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Apply Label Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  disabled={selectedFileIds.size === 0}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  <Tag className="h-3.5 w-3.5" />
                  Apply Label ({selectedFileIds.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Select label to apply:
                </div>
                <DropdownMenuSeparator />
                {labels.map((l) => (
                  <DropdownMenuItem
                    key={l.id}
                    onClick={() => handleApplyLabelToSelection(l.id)}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <span
                      className={cn(
                        'h-2.5 w-2.5 rounded-full',
                        l.color === 'rose' && 'bg-rose-500',
                        l.color === 'amber' && 'bg-amber-500',
                        l.color === 'indigo' && 'bg-indigo-500',
                        l.color === 'emerald' && 'bg-emerald-500',
                        l.color === 'sky' && 'bg-sky-500',
                        l.color === 'purple' && 'bg-purple-500',
                        l.color === 'slate' && 'bg-slate-500'
                      )}
                    />
                    <span className="font-medium">{l.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>
          </div>
        </div>

        {/* Files Table */}
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
          {filteredFiles.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Tags className="mx-auto h-12 w-12 opacity-30" />
              <p className="mt-3 text-base font-medium">No files match the active filter</p>
              <p className="mt-1 text-xs">Try selecting a different label chip or clearing your search.</p>
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
                          selectedFileIds.size === filteredFiles.length
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
                      />
                    </th>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Assigned Labels</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredFiles.map((file) => {
                    const Icon = getFileIcon(file.mimeType)
                    const isSelected = selectedFileIds.has(file.fileId)
                    const assignedLabels = getLabelsForFile(file.fileId)

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
                              onClick={() => openPreview(file, filteredFiles)}
                              className="truncate text-left font-medium hover:text-primary hover:underline max-w-[280px] sm:max-w-md"
                            >
                              {file.fileName}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[160px]">
                          {file.parentName}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {file.fileSize}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {assignedLabels.length === 0 ? (
                              <span className="text-[11px] text-muted-foreground italic">
                                No labels
                              </span>
                            ) : (
                              assignedLabels.map((lbl) => {
                                const colorClass = COLOR_MAP[lbl.color] || COLOR_MAP.indigo
                                return (
                                  <span
                                    key={lbl.id}
                                    className={cn(
                                      'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium group',
                                      colorClass
                                    )}
                                  >
                                    <span>{lbl.name}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeLabel([file.fileId], lbl.id)}
                                      className="text-muted-foreground hover:text-foreground ml-0.5"
                                      title="Remove label"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                )
                              })
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openPreview(file, filteredFiles)}
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

      {/* Create Custom Label Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Tag className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Create Custom Drive Label</h3>
                  <p className="text-xs text-muted-foreground">
                    Define a new organisational tag with colour badge styling
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateLabelSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Label Name
                  </label>
                  <Input
                    placeholder="e.g. Client NDA, Q4 Launch, Tax Audit"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Badge Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'rose', name: 'Rose', bg: 'bg-rose-500' },
                      { id: 'amber', name: 'Amber', bg: 'bg-amber-500' },
                      { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500' },
                      { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500' },
                      { id: 'sky', name: 'Sky', bg: 'bg-sky-500' },
                      { id: 'purple', name: 'Purple', bg: 'bg-purple-500' },
                      { id: 'slate', name: 'Slate', bg: 'bg-slate-500' }
                    ].map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setNewLabelColor(col.id)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border border-border/50 p-2 text-xs transition-all',
                          newLabelColor === col.id && 'ring-2 ring-primary border-primary font-bold'
                        )}
                      >
                        <span className={cn('h-3 w-3 rounded-full', col.bg)} />
                        <span>{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Category Type
                  </label>
                  <select
                    value={newLabelCategory}
                    onChange={(e) => setNewLabelCategory(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="general">General Organisation</option>
                    <option value="security">Security & Confidentiality</option>
                    <option value="compliance">Legal & Compliance Hold</option>
                    <option value="lifecycle">Lifecycle & Archival</option>
                    <option value="department">Department / Finance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Description (Optional)
                  </label>
                  <Input
                    placeholder="Brief description of retention or usage policy"
                    value={newLabelDesc}
                    onChange={(e) => setNewLabelDesc(e.target.value)}
                    className="text-xs"
                  />
                </div>

                {/* Preview Chip */}
                <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-xs flex items-center justify-between">
                  <span className="text-muted-foreground">Badge Preview:</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 font-semibold text-xs',
                      COLOR_MAP[newLabelColor] || COLOR_MAP.indigo
                    )}
                  >
                    <span>{newLabelName.trim() || 'Label Preview'}</span>
                  </span>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Save Label
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
