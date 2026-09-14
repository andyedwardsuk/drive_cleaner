import { RotateCcw, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UndoToast({
  undoToast,
  onUndo,
  onDismiss,
  isRestoring = false,
}) {
  if (!undoToast) return null

  const formatBytes = (bytes) => {
    if (!bytes) return ''
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const count = undoToast.files?.length || 0
  const size = formatBytes(undoToast.totalBytes)

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-4 py-3 px-5 rounded-2xl bg-zinc-900/95 border border-zinc-700/80 shadow-2xl backdrop-blur-xl text-white">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-100">
              Moved {count} {count === 1 ? 'file' : 'files'} {size && `(${size})`} to Trash
            </div>
            <div className="text-xs text-gray-400">
              Undo available for next {undoToast.countdown}s
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <Button
            size="sm"
            variant="secondary"
            onClick={onUndo}
            disabled={isRestoring}
            className="bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30 text-xs font-semibold px-3 py-1.5 h-auto rounded-xl flex items-center gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
            {isRestoring ? 'Restoring...' : `Undo (${undoToast.countdown}s)`}
          </Button>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default UndoToast
