import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Film,
  Music,
  Folder,
  Eye,
  MoreVertical,
  ArrowRight,
  Trash2,
  Clock,
  HardDrive,
  Check,
} from 'lucide-react'
import { useFilePreview } from '@/hooks/useFilePreview'
import { useKanbanBoard, KANBAN_COLUMNS } from '@/hooks/useKanbanBoard'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays}d ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
    return `${(diffDays / 365).toFixed(1)}y ago`
  } catch {
    return ''
  }
}

function getFileIcon(mimeType = '') {
  if (mimeType.includes('image')) return ImageIcon
  if (mimeType.includes('video')) return Film
  if (mimeType.includes('audio')) return Music
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('sheet'))
    return FileSpreadsheet
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('pdf'))
    return FileText
  if (mimeType.includes('script') || mimeType.includes('json') || mimeType.includes('html'))
    return FileCode
  if (mimeType.includes('folder')) return Folder
  return FileText
}

export default function KanbanCard({ card, columnCards = [] }) {
  const { openPreview } = useFilePreview()
  const { moveCard, removeCard } = useKanbanBoard()
  const [isDragging, setIsDragging] = useState(false)

  const Icon = getFileIcon(card.mimeType)
  const otherColumns = KANBAN_COLUMNS.filter((col) => col.id !== card.columnId)

  const handleDragStart = (e) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', card.fileId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'p-3.5 rounded-xl border bg-slate-900/80 border-glass-border shadow-md backdrop-blur-sm cursor-grab active:cursor-grabbing hover:border-blue-500/40 transition-all group',
        isDragging && 'opacity-40 ring-2 ring-blue-500'
      )}
    >
      {/* Card Header: Icon + Title + Menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="p-1.5 rounded-lg bg-slate-800 text-blue-400 flex-shrink-0 mt-0.5">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => openPreview(card, columnCards)}
              className="text-left font-medium text-sm text-gray-200 hover:text-blue-400 transition-colors line-clamp-2 leading-snug cursor-pointer"
              title="Click to preview file"
            >
              {card.fileName}
            </button>
          </div>
        </div>

        {/* Quick Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Move To</DropdownMenuLabel>
            {otherColumns.map((target) => (
              <DropdownMenuItem
                key={target.id}
                onClick={() => moveCard(card.fileId, target.id)}
                className="gap-2"
              >
                <span>{target.icon}</span>
                <span>{target.title}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => openPreview(card, columnCards)}
              className="gap-2"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              Preview & Inspect
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => removeCard(card.fileId)}
              className="gap-2 text-gray-400 focus:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              Remove from Board
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card Body: Metadata Tags */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1 font-mono text-gray-300">
          <HardDrive className="w-3 h-3 text-gray-500" />
          {formatBytes(card.sizeBytes)}
        </span>

        {card.parentName && (
          <span className="flex items-center gap-1 truncate max-w-[130px]" title={card.parentName}>
            <Folder className="w-3 h-3 text-gray-500 flex-shrink-0" />
            <span className="truncate">{card.parentName}</span>
          </span>
        )}

        {card.modifiedDate && (
          <span className="flex items-center gap-1 text-gray-400 ml-auto">
            <Clock className="w-3 h-3 text-gray-500" />
            {formatRelativeTime(card.modifiedDate)}
          </span>
        )}
      </div>

      {/* Card Quick Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-glass-border/60 text-xs">
        <button
          type="button"
          onClick={() => openPreview(card, columnCards)}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>

        {/* Quick Shift Button (shifts to logical next column) */}
        {card.columnId === 'inbox' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => moveCard(card.fileId, 'keep')}
              className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              title="Move to Keep"
            >
              Keep
            </button>
            <button
              type="button"
              onClick={() => moveCard(card.fileId, 'trash')}
              className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Stage for Trash"
            >
              Trash
            </button>
          </div>
        )}

        {card.columnId === 'keep' && (
          <button
            type="button"
            onClick={() => moveCard(card.fileId, 'archive')}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Archive</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {card.columnId === 'archive' && (
          <button
            type="button"
            onClick={() => moveCard(card.fileId, 'trash')}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
          >
            <span>Trash</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {card.columnId === 'trash' && (
          <button
            type="button"
            onClick={() => moveCard(card.fileId, 'inbox')}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Re-triage</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}
