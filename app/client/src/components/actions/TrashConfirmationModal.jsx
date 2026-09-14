import { AlertTriangle, Trash2, Star, Users, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function TrashConfirmationModal({
  isOpen,
  files = [],
  onConfirm,
  onCancel,
  isTrashing = false,
}) {
  if (!isOpen || files.length === 0) return null

  const totalBytes = files.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const starredFiles = files.filter((f) => f.starred)
  const sharedFiles = files.filter((f) => f.sharingStatus && f.sharingStatus !== 'Private')
  const largeFiles = files.filter((f) => (f.fileSizeBytes || 0) > 500 * 1024 * 1024)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-xl p-6 overflow-hidden border rounded-2xl bg-card/95 border-glass-border shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 text-red-400 rounded-xl bg-red-500/10 border border-red-500/20">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Move to Trash</h2>
            <p className="text-sm text-gray-400">Review selected files before trashing</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs font-medium text-gray-400">Total Items</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-white">{files.length}</span>
              <span className="text-xs text-gray-400">files</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs font-medium text-emerald-300">Space to Reclaim</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span className="text-xl font-bold text-emerald-400">{formatBytes(totalBytes)}</span>
            </div>
          </div>
        </div>

        {/* Safety Warnings */}
        {(starredFiles.length > 0 || sharedFiles.length > 0 || largeFiles.length > 0) && (
          <div className="p-3.5 mb-4 space-y-2 border rounded-xl bg-amber-500/10 border-amber-500/30 text-amber-200 text-xs">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Safety Attention:</span>
            </div>
            {starredFiles.length > 0 && (
              <div className="flex items-center gap-1.5 pl-6 text-amber-200/90">
                <Star className="w-3.5 h-3.5 text-yellow-400" />
                <span>
                  <strong>{starredFiles.length}</strong> starred {starredFiles.length === 1 ? 'file' : 'files'} included.
                </span>
              </div>
            )}
            {sharedFiles.length > 0 && (
              <div className="flex items-center gap-1.5 pl-6 text-amber-200/90">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  <strong>{sharedFiles.length}</strong> shared {sharedFiles.length === 1 ? 'file' : 'files'} included. Collaborators will lose access.
                </span>
              </div>
            )}
            {largeFiles.length > 0 && (
              <div className="flex items-center gap-1.5 pl-6 text-amber-200/90">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  <strong>{largeFiles.length}</strong> very large {largeFiles.length === 1 ? 'file' : 'files'} (&gt;500 MB).
                </span>
              </div>
            )}
          </div>
        )}

        {/* Preview List */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-400">File Preview</span>
            <span className="text-xs text-gray-500">Showing up to 5 items</span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-sm border rounded-xl p-2 bg-black/20 border-white/5">
            {files.slice(0, 5).map((file) => (
              <div key={file.fileId} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/5">
                <span className="truncate max-w-[280px] text-gray-200 font-medium">
                  {file.fileName}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {file.starred && <Badge variant="outline" className="text-[10px] text-yellow-400 border-yellow-500/30">⭐ Starred</Badge>}
                  {file.sharingStatus && file.sharingStatus !== 'Private' && (
                    <Badge variant="outline" className="text-[10px] text-blue-400 border-blue-500/30">👥 Shared</Badge>
                  )}
                  <span className="text-xs text-gray-400">{file.fileSize || formatBytes(file.fileSizeBytes || 0)}</span>
                </div>
              </div>
            ))}
            {files.length > 5 && (
              <div className="pt-1 text-center text-xs text-gray-500 italic">
                ...and {files.length - 5} more files
              </div>
            )}
          </div>
        </div>

        {/* Info Note */}
        <p className="text-xs text-gray-400 mb-6 bg-white/5 p-2.5 rounded-lg border border-white/5">
          ℹ️ Items will be moved to <strong>Google Drive Trash</strong>. You can restore them anytime using the Undo button or directly in Google Drive.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isTrashing}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isTrashing}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 shadow-lg shadow-red-600/20"
          >
            {isTrashing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Trashing...
              </span>
            ) : (
              `Move ${files.length} ${files.length === 1 ? 'File' : 'Files'} to Trash`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TrashConfirmationModal
