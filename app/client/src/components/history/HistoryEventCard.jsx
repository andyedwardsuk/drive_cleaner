import { useState } from 'react'
import {
  Trash2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  HardDrive,
  Calendar,
  FolderOpen,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Helper to format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

// Relative time formatter
function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffMinutes = Math.floor(diffMs / (60 * 1000))
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function HistoryEventCard({ event }) {
  const [expanded, setExpanded] = useState(false)

  const isTrash = event.type === 'trash'
  const isRestore = event.type === 'restore'
  const isScan = event.type === 'scan'

  const iconConfig = {
    trash: {
      icon: Trash2,
      color: 'from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30',
      tag: 'Trash Operation',
      tagColor: 'bg-red-500/20 text-red-300 border-red-500/30',
      actionVerb: 'Reclaimed',
    },
    restore: {
      icon: RotateCcw,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      tag: 'Restoration',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      actionVerb: 'Restored',
    },
    scan: {
      icon: Sparkles,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
      tag: 'Smart Scan',
      tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      actionVerb: 'Scanned',
    },
  }[event.type] || {
    icon: Calendar,
    color: 'from-gray-500/20 to-slate-500/20 text-gray-400 border-gray-500/30',
    tag: 'Event',
    tagColor: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    actionVerb: 'Processed',
  }

  const Icon = iconConfig.icon
  const hasDetails = (event.files && event.files.length > 0) || event.details

  return (
    <div className="rounded-2xl border border-glass-border bg-card/40 backdrop-blur-md overflow-hidden transition-all duration-200 hover:bg-card/70 hover:border-white/20">
      {/* Main card row */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${iconConfig.color} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white">{event.title}</h3>
              <Badge variant="outline" className={`text-[10px] ${iconConfig.tagColor}`}>
                {iconConfig.tag}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
              {event.folderName && (
                <span className="flex items-center gap-1 text-gray-300">
                  <FolderOpen className="w-3 h-3 text-blue-400" />
                  {event.folderName}
                </span>
              )}
              <span>•</span>
              <span>{formatRelativeTime(event.timestamp)}</span>
              <span>•</span>
              <span className="text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Metrics & Expand Trigger */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pl-12 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-white/5 text-gray-200 border-white/10">
              {event.filesCount || 0} files
            </Badge>
            {event.bytesAffected > 0 && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  isRestore
                    ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                    : isTrash
                    ? 'text-red-300 border-red-500/30 bg-red-500/10'
                    : 'text-blue-300 border-blue-500/30 bg-blue-500/10'
                }`}
              >
                <HardDrive className="w-3 h-3 mr-1" />
                {iconConfig.actionVerb}: {formatBytes(event.bytesAffected)}
              </Badge>
            )}
          </div>

          {hasDetails && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable details drawer */}
      {expanded && hasDetails && (
        <div className="px-4 sm:px-6 pb-4 pt-1 border-t border-white/5 bg-black/20 text-xs animate-in slide-in-from-top-2 duration-200">
          {event.files && event.files.length > 0 && (
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Affected Items ({event.files.length})</span>
                <span>Size</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {event.files.map((file, idx) => (
                  <div
                    key={file.fileId || idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-gray-200 font-medium truncate max-w-[320px] sm:max-w-md">
                      {file.fileName}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-400">
                        {file.fileSize || formatBytes(file.sizeBytes || 0)}
                      </span>
                      {file.fileId && !file.fileId.startsWith('f-') && (
                        <a
                          href={`https://drive.google.com/file/d/${file.fileId}/view`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded hover:text-blue-400 transition-colors"
                          title="View in Drive"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.details && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-white/5">
              {event.details.totalSpace && (
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-gray-400 block text-[10px]">Folder Space</span>
                  <span className="font-bold text-gray-200">{event.details.totalSpace}</span>
                </div>
              )}
              {event.details.largeFilesFound !== undefined && (
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-gray-400 block text-[10px]">Large Files</span>
                  <span className="font-bold text-gray-200">{event.details.largeFilesFound} items</span>
                </div>
              )}
              {event.details.duplicatesFound !== undefined && (
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-gray-400 block text-[10px]">Duplicates</span>
                  <span className="font-bold text-gray-200">{event.details.duplicatesFound} items</span>
                </div>
              )}
              {event.details.rotScore !== undefined && (
                <div className="p-2 rounded-xl bg-white/5">
                  <span className="text-gray-400 block text-[10px]">ROT Score</span>
                  <span className="font-bold text-amber-400">{event.details.rotScore} / 100</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryEventCard
