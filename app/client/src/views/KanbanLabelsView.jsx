import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Kanban,
  Download,
  RotateCcw,
  Search,
  Filter,
  Sparkles,
  Inbox,
  CheckCircle2,
  Package,
  Trash2,
  HardDrive,
  RefreshCw,
} from 'lucide-react'
import Hero from '@/components/Hero'
import KanbanColumn from '@/components/kanban/KanbanColumn'
import { useKanbanBoard } from '@/hooks/useKanbanBoard'
import { useSmartScan } from '@/hooks/useSmartScan'
import { useFileActions } from '@/hooks/useFileActions'
import { TrashConfirmationModal } from '@/components/actions/TrashConfirmationModal'
import { UndoToast } from '@/components/actions/UndoToast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function KanbanLabelsView() {
  const { cards, columns, importFromScan, resetDemoCards } = useKanbanBoard()
  const { data: scanData } = useSmartScan()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [importNotification, setImportNotification] = useState('')

  const {
    isTrashing,
    confirmModalOpen,
    filesPendingTrash,
    cancelTrash,
    executeTrash,
    undoToast,
    executeRestore,
    dismissUndo,
  } = useFileActions()

  // Filter cards by search and type
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const nameMatch = card.fileName?.toLowerCase().includes(q)
        const folderMatch = card.parentName?.toLowerCase().includes(q)
        if (!nameMatch && !folderMatch) return false
      }

      if (typeFilter !== 'all') {
        const mime = card.mimeType || ''
        if (typeFilter === 'document' && !mime.includes('document') && !mime.includes('pdf') && !mime.includes('word'))
          return false
        if (typeFilter === 'spreadsheet' && !mime.includes('sheet') && !mime.includes('excel') && !mime.includes('spreadsheet'))
          return false
        if (typeFilter === 'image' && !mime.includes('image'))
          return false
        if (typeFilter === 'video' && !mime.includes('video'))
          return false
      }

      return true
    })
  }, [cards, searchQuery, typeFilter])

  const handleImport = () => {
    if (!scanData) {
      setImportNotification('Please run a Smart Scan first to import flagged files.')
      setTimeout(() => setImportNotification(''), 3000)
      return
    }

    const count = importFromScan(scanData)
    if (count > 0) {
      setImportNotification(`Successfully imported ${count} flagged files into Needs Review!`)
    } else {
      setImportNotification('All flagged files from Smart Scan are already on the board.')
    }
    setTimeout(() => setImportNotification(''), 3500)
  }

  // Calculate summary metrics
  const totalBytes = cards.reduce((acc, c) => acc + (c.sizeBytes || 0), 0)
  const trashCards = cards.filter((c) => c.columnId === 'trash')
  const trashBytes = trashCards.reduce((acc, c) => acc + (c.sizeBytes || 0), 0)
  const archiveCards = cards.filter((c) => c.columnId === 'archive')
  const archiveBytes = archiveCards.reduce((acc, c) => acc + (c.sizeBytes || 0), 0)
  const keepCards = cards.filter((c) => c.columnId === 'keep')

  return (
    <div className="space-y-6">
      <Hero
        icon={Kanban}
        title="Google Drive Labels & Kanban Board"
        subtitle="Visual drag-and-drop workflow to triage, organize, stage for archival, and bulk cleanup files."
        badge="v2.2.0 Active"
        illustration="📋"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleImport}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Import from Smart Scan
            </Button>
            <Button
              variant="outline"
              onClick={resetDemoCards}
              className="gap-2 text-gray-300 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Cards
            </Button>
          </div>
        }
      />

      {/* Notification banner */}
      {importNotification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-200 text-sm flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>{importNotification}</span>
        </motion.div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card/40 border border-glass-border backdrop-blur-md">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
            <Inbox className="w-4 h-4" />
            TOTAL ON BOARD
          </div>
          <div className="text-2xl font-bold text-white">{cards.length} files</div>
          <div className="text-xs text-gray-400 mt-0.5">{formatBytes(totalBytes)} total space</div>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-glass-border backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            KEPT / RETAINED
          </div>
          <div className="text-2xl font-bold text-white">{keepCards.length} files</div>
          <div className="text-xs text-emerald-400/80 mt-0.5">Verified to preserve</div>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-glass-border backdrop-blur-md">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
            <Package className="w-4 h-4" />
            STAGED FOR ARCHIVE
          </div>
          <div className="text-2xl font-bold text-white">{archiveCards.length} files</div>
          <div className="text-xs text-gray-400 mt-0.5">{formatBytes(archiveBytes)} cold storage</div>
        </div>

        <div className="p-4 rounded-xl bg-card/40 border border-glass-border backdrop-blur-md">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
            <Trash2 className="w-4 h-4" />
            PENDING TRASH
          </div>
          <div className="text-2xl font-bold text-white">{trashCards.length} files</div>
          <div className="text-xs text-rose-400/80 mt-0.5">{formatBytes(trashBytes)} potential savings</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-card/40 border border-glass-border backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search cards on board..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900/60 border-glass-border text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'document', label: 'Docs & PDFs' },
            { id: 'spreadsheet', label: 'Sheets' },
            { id: 'image', label: 'Images' },
            { id: 'video', label: 'Videos' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setTypeFilter(type.id)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                typeFilter === type.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-800/60 text-gray-300 hover:text-white hover:bg-slate-800'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Column Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colCards = filteredCards.filter((card) => card.columnId === col.id)
          return (
            <KanbanColumn
              key={col.id}
              column={col}
              cards={colCards}
            />
          )
        })}
      </div>

      {/* Trash confirmation dialog & undo toast */}
      <TrashConfirmationModal
        open={confirmModalOpen}
        files={filesPendingTrash}
        onConfirm={executeTrash}
        onCancel={cancelTrash}
        isTrashing={isTrashing}
      />

      {undoToast && (
        <UndoToast
          files={undoToast.files}
          countdown={undoToast.countdown}
          totalBytes={undoToast.totalBytes}
          onUndo={executeRestore}
          onDismiss={dismissUndo}
        />
      )}
    </div>
  )
}
