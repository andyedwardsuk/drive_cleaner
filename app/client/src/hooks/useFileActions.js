import { useState, useCallback, useEffect, useRef } from 'react'
import fileActionsService from '@/services/fileActionsService'
import { useDailyImpact } from './useDailyImpact'

export function useFileActions() {
  const [selectedFileIds, setSelectedFileIds] = useState(new Set())
  const [isTrashing, setIsTrashing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [filesPendingTrash, setFilesPendingTrash] = useState([])
  const [undoToast, setUndoToast] = useState(null) // { files: [], countdown: number }

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

    try {
      const result = await fileActionsService.trashFiles(fileIds)

      if (result.success) {
        // Calculate total bytes saved
        const totalBytes = filesToTrash.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)

        // Record in Daily Impact Tracker & streaks
        recordCleanupAction({
          filesDeleted: result.trashedCount,
          bytesSaved: totalBytes,
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

        // Setup undo toast (15 second countdown)
        if (timerRef.current) clearInterval(timerRef.current)
        setUndoToast({
          files: filesToTrash,
          countdown: 15,
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

        onSuccess?.(result)
      }
    } catch (err) {
      console.error('Failed to trash files:', err)
      alert(`Error moving files to trash: ${err.message}`)
    } finally {
      setIsTrashing(false)
    }
  }, [filesPendingTrash, recordCleanupAction, clearSelection])

  // Execute restore operation (undo)
  const executeRestore = useCallback(async () => {
    if (!undoToast || !undoToast.files || undoToast.files.length === 0) return

    setIsRestoring(true)
    const filesToRestore = undoToast.files
    const fileIds = filesToRestore.map((f) => f.fileId)

    try {
      const result = await fileActionsService.untrashFiles(fileIds)

      if (result.success) {
        if (timerRef.current) clearInterval(timerRef.current)
        setUndoToast(null)

        // Notify app that files were restored
        window.dispatchEvent(
          new CustomEvent('drive_cleaner_files_restored', {
            detail: { files: filesToRestore },
          })
        )
      }
    } catch (err) {
      console.error('Failed to restore files:', err)
      alert(`Error restoring files: ${err.message}`)
    } finally {
      setIsRestoring(false)
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
