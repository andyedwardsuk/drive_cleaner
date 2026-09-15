import { useState, useEffect, useCallback, useRef } from 'react'
import archiveService from '@/services/archiveService'
import { useDailyImpact } from './useDailyImpact'
import { addHistoryEvent } from '@/lib/tracking/historyStorage'
import { getSettings } from '@/lib/settings/settingsStorage'

const STORAGE_KEY_SESSIONS = 'drive_cleaner_archive_sessions_v1'
const STORAGE_KEY_CONFIG = 'drive_cleaner_archive_config_v1'

const DEFAULT_CONFIG = {
  targetFolderName: '_DriveCleaner_Archive',
  organizeByYear: true,
  ageThresholdDays: 365
}

function loadStoredSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to parse archive sessions from localStorage:', e)
  }
  return []
}

function saveStoredSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions))
    window.dispatchEvent(new CustomEvent('drive_cleaner_archive_updated', { detail: sessions }))
  } catch (e) {
    console.warn('Failed to save archive sessions:', e)
  }
}

function loadStoredConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch (e) {
    console.warn('Failed to load archive config:', e)
  }
  return DEFAULT_CONFIG
}

function saveStoredConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config))
  } catch (e) {
    console.warn('Failed to save archive config:', e)
  }
}

export function useArchiveEngine() {
  const [sessions, setSessions] = useState(loadStoredSessions)
  const [config, setConfig] = useState(loadStoredConfig)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [archiveProgress, setArchiveProgress] = useState(0)
  const [undoToast, setUndoToast] = useState(null) // { session: Object, countdown: number }

  const timerRef = useRef(null)
  const { recordCleanupAction } = useDailyImpact()

  // Sync state on external custom events
  useEffect(() => {
    const handleUpdate = () => {
      setSessions(loadStoredSessions())
    }
    window.addEventListener('drive_cleaner_archive_updated', handleUpdate)
    return () => window.removeEventListener('drive_cleaner_archive_updated', handleUpdate)
  }, [])

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const updateConfig = useCallback((newPartial) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newPartial }
      saveStoredConfig(updated)
      return updated
    })
  }, [])

  /**
   * Execute archiving of given files
   * @param {Array<Object>} filesToArchive - Array of file objects
   * @param {Object} options - Override options
   */
  const executeArchive = useCallback(async (filesToArchive, options = {}) => {
    if (!filesToArchive || filesToArchive.length === 0) return { success: false }

    setIsArchiving(true)
    setArchiveProgress(10)

    const fileIds = filesToArchive.map((f) => f.fileId || f.id)
    const effectiveTargetName = options.targetFolderName || config.targetFolderName
    const effectiveYearOption = options.organizeByYear !== undefined ? options.organizeByYear : config.organizeByYear

    try {
      setArchiveProgress(40)
      const res = await archiveService.archiveFiles({
        fileIds,
        targetFolderName: effectiveTargetName,
        targetFolderId: options.targetFolderId,
        organizeByYear: effectiveYearOption
      })

      setArchiveProgress(90)

      if (res.success) {
        const totalBytes = filesToArchive.reduce(
          (sum, f) => sum + (f.sizeBytes || f.fileSizeBytes || parseInt(f.fileSize) || 0),
          0
        )

        const newSession = {
          id: 'archive_session_' + Date.now(),
          timestamp: new Date().toISOString(),
          folderName: res.targetFolderName,
          folderId: res.targetFolderId,
          folderUrl: res.targetFolderUrl,
          fileCount: res.archivedCount,
          totalBytes,
          parentMappings: res.parentMappings || [],
          restored: false,
          files: filesToArchive.map((f) => ({
            fileId: f.fileId || f.id,
            fileName: f.fileName || f.title || f.name,
            fileSize: f.fileSize || `${Math.round((f.sizeBytes || 0) / 1024)} KB`,
            sizeBytes: f.sizeBytes || f.fileSizeBytes || 0,
            mimeType: f.mimeType || 'application/octet-stream',
            originalParentId: f.parentId || 'root'
          }))
        }

        const updatedSessions = [newSession, ...loadStoredSessions()]
        saveStoredSessions(updatedSessions)
        setSessions(updatedSessions)

        // Record cleanup impact
        recordCleanupAction({
          filesArchived: res.archivedCount,
          bytesSaved: totalBytes
        })

        // Log to persistent audit history
        addHistoryEvent({
          type: 'archive',
          title: `Archived ${res.archivedCount} ${res.archivedCount === 1 ? 'file' : 'files'} to ${res.targetFolderName}`,
          folderName: res.targetFolderName,
          filesCount: res.archivedCount,
          bytesAffected: totalBytes,
          files: newSession.files
        })

        // Start undo countdown toast
        const userSettings = getSettings()
        const duration = (userSettings?.safeTrash?.undoDurationSeconds || 10)

        setUndoToast({
          session: newSession,
          countdown: duration
        })

        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
          setUndoToast((current) => {
            if (!current || current.countdown <= 1) {
              clearInterval(timerRef.current)
              timerRef.current = null
              return null
            }
            return { ...current, countdown: current.countdown - 1 }
          })
        }, 1000)

        setArchiveProgress(100)
        setIsArchiving(false)

        return { success: true, session: newSession, result: res }
      } else {
        throw new Error(res.error || 'Failed to archive files')
      }
    } catch (err) {
      console.error('Error executing archive:', err)
      setIsArchiving(false)
      setArchiveProgress(0)
      return { success: false, error: err.message }
    }
  }, [config, recordCleanupAction])

  /**
   * Restore an entire archive session back to original parents
   */
  const restoreArchiveSession = useCallback(async (sessionId) => {
    const currentSessions = loadStoredSessions()
    const targetSession = currentSessions.find((s) => s.id === sessionId)
    if (!targetSession || targetSession.restored) return { success: false }

    setIsRestoring(true)
    try {
      const items = (targetSession.parentMappings && targetSession.parentMappings.length > 0)
        ? targetSession.parentMappings
        : targetSession.files.map((f) => ({
            fileId: f.fileId,
            originalParentId: f.originalParentId || 'root'
          }))

      const res = await archiveService.unarchiveFiles({ items })
      if (res.success) {
        const updated = currentSessions.map((s) =>
          s.id === sessionId ? { ...s, restored: true, restoredAt: new Date().toISOString() } : s
        )
        saveStoredSessions(updated)
        setSessions(updated)

        // History event
        addHistoryEvent({
          type: 'restore',
          title: `Restored ${res.restoredCount} archived files from ${targetSession.folderName}`,
          folderName: targetSession.folderName,
          filesCount: res.restoredCount,
          bytesAffected: targetSession.totalBytes,
          files: targetSession.files
        })

        if (undoToast && undoToast.session.id === sessionId) {
          setUndoToast(null)
          if (timerRef.current) clearInterval(timerRef.current)
        }

        setIsRestoring(false)
        return { success: true, restoredCount: res.restoredCount }
      } else {
        throw new Error(res.error || 'Failed to restore archive')
      }
    } catch (err) {
      console.error('Error restoring archive session:', err)
      setIsRestoring(false)
      return { success: false, error: err.message }
    }
  }, [undoToast])

  const undoLastArchive = useCallback(async () => {
    if (!undoToast || !undoToast.session) return
    const sessionId = undoToast.session.id
    await restoreArchiveSession(sessionId)
    setUndoToast(null)
  }, [undoToast, restoreArchiveSession])

  const dismissUndo = useCallback(() => {
    setUndoToast(null)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  // Derived aggregate metrics
  const totalArchivedFiles = sessions
    .filter((s) => !s.restored)
    .reduce((sum, s) => sum + (s.fileCount || 0), 0)

  const totalArchivedBytes = sessions
    .filter((s) => !s.restored)
    .reduce((sum, s) => sum + (s.totalBytes || 0), 0)

  return {
    sessions,
    config,
    updateConfig,
    isArchiving,
    isRestoring,
    archiveProgress,
    undoToast,
    executeArchive,
    restoreArchiveSession,
    undoLastArchive,
    dismissUndo,
    totalArchivedFiles,
    totalArchivedBytes
  }
}

export default useArchiveEngine
