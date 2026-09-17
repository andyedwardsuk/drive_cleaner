import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trash2,
  Download,
  RotateCcw,
  MoreHorizontal,
  HardDrive,
  Plus,
  Archive,
} from 'lucide-react'
import KanbanCard from './KanbanCard'
import { useKanbanBoard } from '@/hooks/useKanbanBoard'
import { useFileActions } from '@/hooks/useFileActions'
import { useArchiveEngine } from '@/hooks/useArchiveEngine'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

function exportColumnAsCSV(cards, columnTitle) {
  if (cards.length === 0) return
  const headers = ['File Name', 'Size Bytes', 'MIME Type', 'Folder', 'Drive Link', 'Modified Date']
  const rows = cards.map((c) => [
    `"${c.fileName || ''}"`,
    c.sizeBytes || 0,
    `"${c.mimeType || ''}"`,
    `"${c.parentName || ''}"`,
    `"${c.driveLink || ''}"`,
    `"${c.modifiedDate || ''}"`,
  ])
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `kanban_${columnTitle.toLowerCase().replace(/\s+/g, '_')}_files.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function KanbanColumn({ column, cards = [] }) {
  const { moveCard, clearColumn } = useKanbanBoard()
  const { requestTrash } = useFileActions()
  const { executeArchive, isArchiving } = useArchiveEngine()
  const [isOver, setIsOver] = useState(false)

  const totalBytes = cards.reduce((acc, c) => acc + (c.sizeBytes || 0), 0)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsOver(false)
    const fileId = e.dataTransfer.getData('text/plain')
    if (fileId) {
      moveCard(fileId, column.id)
    }
  }

  const handleBatchTrash = () => {
    if (cards.length === 0) return
    requestTrash(cards)
  }

  const handleBatchArchive = async () => {
    if (cards.length === 0) return
    const res = await executeArchive(cards)
    if (res.success) {
      clearColumn(column.id)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col h-[740px] rounded-2xl border bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-200',
        isOver
          ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30 shadow-xl'
          : 'border-slate-800/80 shadow-md'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{column.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white truncate">{column.title}</h3>
              <Badge variant="outline" className={cn('text-xs px-1.5 py-0', column.badgeClass)}>
                {cards.length}
              </Badge>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{formatBytes(totalBytes)}</div>
          </div>
        </div>

        {/* Column Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => exportColumnAsCSV(cards, column.title)}
              disabled={cards.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => clearColumn(column.id)}
              disabled={cards.length === 0}
              className="gap-2 text-gray-400 focus:text-red-400"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Special Column Action Bar */}
      {column.id === 'trash' && cards.length > 0 && (
        <div className="mb-3">
          <Button
            size="sm"
            onClick={handleBatchTrash}
            className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
            Batch Trash ({cards.length})
          </Button>
        </div>
      )}

      {column.id === 'archive' && cards.length > 0 && (
        <div className="mb-3 space-y-2">
          <Button
            size="sm"
            disabled={isArchiving}
            onClick={handleBatchArchive}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-900/20"
          >
            <Archive className="w-4 h-4" />
            Archive to Drive ({cards.length})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportColumnAsCSV(cards, 'Archive')}
            className="w-full gap-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 font-medium text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Archive Manifest
          </Button>
        </div>
      )}

      {/* Cards List Container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
        {cards.length > 0 ? (
          cards.map((card) => (
            <KanbanCard key={card.fileId} card={card} columnCards={cards} />
          ))
        ) : (
          <div className="h-44 flex flex-col items-center justify-center border-2 border-dashed border-gray-700/60 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500">Drag files here</p>
            <p className="text-[11px] text-gray-600 mt-1">{column.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
