import React, { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, RotateCcw, X, Clock, HardDrive, CheckCircle2 } from 'lucide-react'
import fileActionsService from '@/services/fileActionsService'
import { addHistoryEvent } from '@/lib/tracking/historyStorage'

export function SafetyVaultBanner() {
  const [batchInfo, setBatchInfo] = useState(null)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoredSuccess, setRestoredSuccess] = useState(false)

  const checkStatus = useCallback(async () => {
    try {
      const status = await fileActionsService.getSafetyVaultStatus()
      if (status && status.hasActiveBatch && status.batch) {
        setBatchInfo(status.batch)
      } else {
        setBatchInfo(null)
      }
    } catch (err) {
      console.warn('Safety Vault check error:', err)
      setBatchInfo(null)
    }
  }, [])

  useEffect(() => {
    checkStatus()

    const handleVaultUpdated = () => checkStatus()
    window.addEventListener('drive_cleaner_safety_vault_updated', handleVaultUpdated)
    window.addEventListener('focus', checkStatus)

    return () => {
      window.removeEventListener('drive_cleaner_safety_vault_updated', handleVaultUpdated)
      window.removeEventListener('focus', checkStatus)
    }
  }, [checkStatus])

  if (!batchInfo) return null

  const formatBytes = (bytes) => {
    if (!bytes) return ''
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatTimeAgo = (isoString) => {
    if (!isoString) return ''
    const elapsedMs = Date.now() - new Date(isoString).getTime()
    const minutes = Math.floor(elapsedMs / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const handleRestore = async () => {
    setIsRestoring(true)
    try {
      const res = await fileActionsService.restoreSafetyVaultBatch()
      if (res && res.success) {
        setRestoredSuccess(true)

        // Log restoration to audit history
        addHistoryEvent({
          type: 'restore',
          title: `Restored ${res.restoredCount || batchInfo.count} files via Safety Vault`,
          folderName: batchInfo.folderName || 'Drive Folder',
          filesCount: res.restoredCount || batchInfo.count,
          bytesAffected: batchInfo.totalBytes || 0,
          files: (batchInfo.fileIds || []).map((id) => ({
            fileId: id,
            fileName: 'Restored File',
          })),
        })

        // Notify client views that files were restored
        window.dispatchEvent(
          new CustomEvent('drive_cleaner_files_restored', {
            detail: { fileIds: res.restoredIds || batchInfo.fileIds },
          })
        )

        setTimeout(() => {
          setBatchInfo(null)
          setRestoredSuccess(false)
        }, 2500)
      } else {
        alert(res?.error || 'Failed to restore files from Safety Vault')
      }
    } catch (err) {
      console.error('Safety Vault restoration failed:', err)
      alert(`Error restoring Safety Vault batch: ${err.message}`)
    } finally {
      setIsRestoring(false)
    }
  }

  const handleDismiss = async () => {
    setBatchInfo(null)
    try {
      await fileActionsService.dismissSafetyVaultBatch()
    } catch (err) {
      console.warn('Failed to dismiss Safety Vault:', err)
    }
  }

  return (
    <div className="w-full bg-gradient-to-r from-emerald-950/70 via-slate-900/90 to-blue-950/70 border-b border-emerald-500/30 px-4 py-2.5 backdrop-blur-xl animate-in slide-in-from-top-3 duration-300 z-20">
      <div className="container mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            {restoredSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-semibold text-emerald-300">
              {restoredSuccess ? 'Batch Restored!' : 'Safety Vault Active:'}
            </span>
            <span className="text-slate-200">
              {restoredSuccess ? (
                `Successfully untrashed ${batchInfo.count} files back to your Drive.`
              ) : (
                <>
                  Last cleanup moved <strong>{batchInfo.count} items</strong>
                  {batchInfo.totalBytes ? ` (${formatBytes(batchInfo.totalBytes)})` : ''} to Drive Trash.
                </>
              )}
            </span>
            {!restoredSuccess && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/60">
                <Clock className="w-3 h-3 text-slate-400" />
                {formatTimeAgo(batchInfo.timestamp)} • 48h 1-click restore
              </span>
            )}
          </div>
        </div>

        {/* Right Actions */}
        {!restoredSuccess && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleRestore}
              disabled={isRestoring}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/40 transition-colors disabled:opacity-50 text-xs shadow-sm cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
              {isRestoring ? 'Restoring...' : '1-Click Undo'}
            </button>
            <button
              onClick={handleDismiss}
              disabled={isRestoring}
              title="Dismiss Safety Vault"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SafetyVaultBanner
