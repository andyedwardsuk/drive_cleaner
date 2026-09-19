import { useState, useCallback, useEffect, useRef } from 'react'
import fileActionsService from '@/services/fileActionsService'
import { useDailyImpact } from './useDailyImpact'
import { addHistoryEvent } from '@/lib/tracking/historyStorage'
import { getSettings } from '@/lib/settings/settingsStorage'

export function useFileActions() {
  const [selectedFileIds, setSelectedFileIds] = useState(new Set())
  const [isTrashing, setIsTrashing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [filesPendingTrash, setFilesPendingTrash] = useState([])
  const [undoToast, setUndoToast] = useState(null) // { files: [], countdown: number }

  const [trashProgress, setTrashProgress] = useState(null) // { processed: number, total: number, percent: number }

  const timerRef = useRef(null)
  const { recordCleanupAction } = useDailyImpact()

  // Selection controls
  const toggleSelect = useCallback((fileId) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }, [])

  const selectAll = useCallback((fileIds) => {
    setSelectedFileIds(new Set(fileIds))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedFileIds(new Set())
  }, [])

  // Modal open/close
  const requestTrash = useCallback((files) => {
    if (!files || files.length === 0) return
    setFilesPendingTrash(files)
    setConfirmModalOpen(true)
  }, [])

  const cancelTrash = useCallback(() => {
    setConfirmModalOpen(false)
    setFilesPendingTrash([])
    setTrashProgress(null)
  }, [])

  // Cleanup undo timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Execute trash operation
  const executeTrash = useCallback(async (onSuccess) => {
    if (filesPendingTrash.length === 0) return

    setIsTrashing(true)
    const filesToTrash = [...filesPendingTrash]
    const fileIds = filesToTrash.map((f) => f.fileId)
    const totalBytes = filesToTrash.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)

    setTrashProgress({ processed: 0, total: fileIds.length, percent: 0 })

    try {
      const payload = {
        fileIds,
        totalBytes,
        folderName: filesToTrash[0]?.parentName || 'Drive Folder',
      }

      const result = await fileActionsService.trashFiles(payload, (prog) => {
        setTrashProgress(prog)
      })

      if (result.success || (result.trashedCount > 0)) {
        // Record in Daily Impact Tracker & streaks
        recordCleanupAction({
          filesDeleted: result.trashedCount,
          bytesSaved: totalBytes,
        })

        // Log to persistent audit history
        addHistoryEvent({
          type: 'trash',
          title: `Moved ${result.trashedCount} ${result.trashedCount === 1 ? 'file' : 'files'} to Trash`,
          folderName: filesToTrash[0]?.parentName || 'Drive Folder',
          filesCount: result.trashedCount,
          bytesAffected: totalBytes,
          files: filesToTrash.map((f) => ({
            fileId: f.fileId,
            fileName: f.fileName,
            fileSize: f.fileSize,
            sizeBytes: f.fileSizeBytes || 0,
            mimeType: f.mimeType,
          })),
        })

        // Clear selection
        clearSelection()
        setConfirmModalOpen(false)
        setFilesPendingTrash([])

        // Notify app that files were trashed
        window.dispatchEvent(
          new CustomEvent('drive_cleaner_files_trashed', {
            detail: { fileIds: result.trashedIds || fileIds },
          })
        )

        // Dispatch Safety Vault update event so banners/caches refresh
        window.dispatchEvent(new CustomEvent('drive_cleaner_safety_vault_updated'))

        // Setup undo toast with configured duration
        const userSettings = getSettings()
        const undoSeconds = userSettings?.safety?.undoTimeoutSeconds || 10
        if (timerRef.current) clearInterval(timerRef.current)
        setUndoToast({
          files: filesToTrash.filter((f) => (result.trashedIds || fileIds).includes(f.fileId)),
          countdown: undoSeconds,
          totalBytes,
        })

        timerRef.current = setInterval(() => {
          setUndoToast((prev) => {
            if (!prev || prev.countdown <= 1) {
              clearInterval(timerRef.current)
              return null
            }
            return { ...prev, countdown: prev.countdown - 1 }
          })
        }, 1000)

        if (result.errors && result.errors.length > 0) {
          console.warn(`Some files (${result.errors.length}) could not be moved to trash:`, result.errors)
        }

        onSuccess?.(result)
      } else {
        const errMsg = result.errors?.[0]?.error || 'Failed to move files to trash'
        alert(`Error moving files to trash: ${errMsg}`)
      }
    } catch (err) {
      console.error('Failed to trash files:', err)
      alert(`Error moving files to trash: ${err.message}`)
    } finally {
      setIsTrashing(false)
      setTrashProgress(null)
    }
  }, [filesPendingTrash, recordCleanupAction, clearSelection])

  // Execute restore operation (undo)
  const executeRestore = useCallback(async () => {
    if (!undoToast || !undoToast.files || undoToast.files.length === 0) return

    setIsRestoring(true)
    const filesToRestore = undoToast.files
    const fileIds = filesToRestore.map((f) => f.fileId)

    setTrashProgress({ processed: 0, total: fileIds.length, percent: 0 })

    try {
      const result = await fileActionsService.untrashFiles(fileIds, (prog) => {
        setTrashProgress(prog)
      })

      if (result.success || (result.restoredCount > 0)) {
        if (timerRef.current) clearInterval(timerRef.current)
        setUndoToast(null)

        // Log restoration to audit history
        addHistoryEvent({
          type: 'restore',
          title: `Restored ${result.restoredCount} ${result.restoredCount === 1 ? 'file' : 'files'} from Trash`,
          folderName: filesToRestore[0]?.parentName || 'Drive Folder',
          filesCount: result.restoredCount,
          bytesAffected: undoToast.totalBytes || 0,
          files: filesToRestore.map((f) => ({
            fileId: f.fileId,
            fileName: f.fileName,
            fileSize: f.fileSize,
            sizeBytes: f.fileSizeBytes || 0,
            mimeType: f.mimeType,
          })),
        })

        // Notify app that files were restored
        window.dispatchEvent(
          new CustomEvent('drive_cleaner_files_restored', {
            detail: { files: filesToRestore },
          })
        )

        // Dispatch Safety Vault update
        window.dispatchEvent(new CustomEvent('drive_cleaner_safety_vault_updated'))
      } else {
        const errMsg = result.errors?.[0]?.error || 'Failed to restore files from trash'
        alert(`Error restoring files: ${errMsg}`)
      }
    } catch (err) {
      console.error('Failed to restore files:', err)
      alert(`Error restoring files: ${err.message}`)
    } finally {
      setIsRestoring(false)
      setTrashProgress(null)
    }
  }, [undoToast])

  const dismissUndo = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setUndoToast(null)
  }, [])

  return {
    selectedFileIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isTrashing,
    isRestoring,
    trashProgress,
    confirmModalOpen,
    filesPendingTrash,
    requestTrash,
    cancelTrash,
    executeTrash,
    undoToast,
    executeRestore,
    dismissUndo,
  }
}

export default useFileActions
