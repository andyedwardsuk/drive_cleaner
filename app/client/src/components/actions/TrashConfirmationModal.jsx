import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrashCan,
  faStar,
  faUsers,
  faHardDrive,
  faTriangleExclamation,
  faCircleInfo,
} from '@fortawesome/pro-duotone-svg-icons'
import { WaButton, WaBadge, WaCallout } from '@/components/ui/webawesome'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-0">
      <div className="relative w-full max-w-xl p-6 overflow-hidden border rounded-3xl bg-slate-900/95 border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 text-red-400 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-inner">
            <FontAwesomeIcon icon={faTrashCan} className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Move to Trash</h2>
            <p className="text-sm text-slate-400">Review selected files before trashing</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <span className="text-xs font-medium text-slate-400">Total Items</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-white">{files.length}</span>
              <span className="text-xs text-slate-400">files</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs font-medium text-emerald-300">Space to Reclaim</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <FontAwesomeIcon icon={faHardDrive} className="w-4 h-4 text-emerald-400" />
              <span className="text-xl font-bold text-emerald-400">{formatBytes(totalBytes)}</span>
            </div>
          </div>
        </div>

        {/* Safety Warnings */}
        {(starredFiles.length > 0 || sharedFiles.length > 0 || largeFiles.length > 0) && (
          <WaCallout
            variant="warning"
            title="Safety Attention"
            faIcon={faTriangleExclamation}
          >
            <div className="space-y-1.5 mt-1">
              {starredFiles.length > 0 && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faStar} className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    <strong>{starredFiles.length}</strong> starred {starredFiles.length === 1 ? 'file' : 'files'} included.
                  </span>
                </div>
              )}
              {sharedFiles.length > 0 && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faUsers} className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    <strong>{sharedFiles.length}</strong> shared {sharedFiles.length === 1 ? 'file' : 'files'} included. Collaborators will lose access.
                  </span>
                </div>
              )}
              {largeFiles.length > 0 && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faHardDrive} className="w-3.5 h-3.5 text-purple-400" />
                  <span>
                    <strong>{largeFiles.length}</strong> very large {largeFiles.length === 1 ? 'file' : 'files'} (&gt;500 MB).
                  </span>
                </div>
              )}
            </div>
          </WaCallout>
        )}

        {/* Preview List */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-400">File Preview</span>
            <span className="text-xs text-slate-500">Showing up to 5 items</span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-sm border rounded-2xl p-2.5 bg-slate-950/60 border-slate-800">
            {files.slice(0, 5).map((file) => (
              <div key={file.fileId} className="flex items-center justify-between py-1.5 px-2.5 rounded-xl hover:bg-slate-800/40 transition-colors">
                <span className="truncate max-w-[280px] text-slate-200 font-medium text-xs">
                  {file.fileName}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {file.starred && (
                    <WaBadge variant="warning" appearance="outlined" pill>
                      Starred
                    </WaBadge>
                  )}
                  {file.sharingStatus && file.sharingStatus !== 'Private' && (
                    <WaBadge variant="brand" appearance="outlined" pill>
                      Shared
                    </WaBadge>
                  )}
                  <span className="text-xs text-slate-400">{file.fileSize || formatBytes(file.fileSizeBytes || 0)}</span>
                </div>
              </div>
            ))}
            {files.length > 5 && (
              <div className="pt-1 text-center text-xs text-slate-500 italic">
                ...and {files.length - 5} more files
              </div>
            )}
          </div>
        </div>

        {/* Info Note */}
        <WaCallout variant="neutral" appearance="plain" faIcon={faCircleInfo}>
          Items will be moved to <strong>Google Drive Trash</strong>. You can restore them anytime using the Undo button or directly in Google Drive.
        </WaCallout>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <WaButton
            variant="neutral"
            appearance="outlined"
            onClick={onCancel}
            disabled={isTrashing}
          >
            Cancel
          </WaButton>
          <WaButton
            variant="danger"
            appearance="filled"
            onClick={onConfirm}
            loading={isTrashing}
            startIcon={!isTrashing ? <FontAwesomeIcon icon={faTrashCan} className="w-4 h-4" /> : null}
          >
            {isTrashing
              ? 'Trashing...'
              : `Move ${files.length} ${files.length === 1 ? 'File' : 'Files'} to Trash`}
          </WaButton>
        </div>
      </div>
    </div>
  )
}

export default TrashConfirmationModal
