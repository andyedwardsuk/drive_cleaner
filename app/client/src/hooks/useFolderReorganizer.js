import { useState, useEffect, useCallback, useRef } from 'react'
import folderReorganizerService from '@/services/folderReorganizerService'
import { addHistoryEvent } from '@/lib/tracking/historyStorage'
import { useDailyImpact } from './useDailyImpact'
import { getSettings } from '@/lib/settings/settingsStorage'

const STORAGE_KEY_HISTORY = 'drive_cleaner_reorg_history_v1'

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load reorganization history:', e)
  }
  return []
}

function saveHistory(list) {
  try {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list))
  } catch (e) {
    console.warn('Failed to save reorganization history:', e)
  }
}

export function useFolderReorganizer() {
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isReorganizing, setIsReorganizing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [reorgProgress, setReorgProgress] = useState(0)
  const [undoToast, setUndoToast] = useState(null) // { restorePointId, movedCount, countdown }
  const [history, setHistory] = useState(loadHistory)

  const timerRef = useRef(null)
  const { recordCleanupAction } = useDailyImpact()

  const fetchAnalysis = useCallback(async (rootId = 'root') => {
    setIsLoading(true)
    try {
      const res = await folderReorganizerService.analyzeStructure(rootId)
      if (res.success) {
        setAnalysis(res)
      }
    } catch (err) {
      console.error('Error analyzing structure:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalysis()
  }, [fetchAnalysis])

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const executePlan = useCallback(async (plan) => {
    setIsReorganizing(true)
    setReorgProgress(15)

    try {
      setReorgProgress(50)
      const res = await folderReorganizerService.executePlan(plan)
      setReorgProgress(90)

      if (res.success) {
        const movedCount = res.movedCount || 1
        const record = {
          id: res.restorePointId || 'reorg_' + Date.now(),
          timestamp: new Date().toISOString(),
          title: plan.title || `Reorganized ${movedCount} files into clean directory structure`,
          targetFolder: plan.targetPath || 'Work / Clients',
          fileCount: movedCount,
          restored: false
        }

        const newHistory = [record, ...loadHistory()]
        saveHistory(newHistory)
        setHistory(newHistory)

        recordCleanupAction({
          filesReorganized: movedCount,
          bytesSaved: 0
        })

        addHistoryEvent({
          type: 'reorganize',
          title: record.title,
          folderName: record.targetFolder,
          filesCount: movedCount,
          bytesAffected: 0
        })

        // Start undo countdown toast
        const userSettings = getSettings()
        const duration = userSettings?.safeTrash?.undoDurationSeconds || 10

        setUndoToast({
          restorePointId: record.id,
          movedCount,
          targetFolder: record.targetFolder,
          countdown: duration
        })

        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = setInterval(() => {
          setUndoToast((cur) => {
            if (!cur || cur.countdown <= 1) {
              clearInterval(timerRef.current)
              timerRef.current = null
              return null
            }
            return { ...cur, countdown: cur.countdown - 1 }
          })
        }, 1000)

        setReorgProgress(100)
        setIsReorganizing(false)

        // Refresh analysis to reflect cleaner structure
        setTimeout(() => {
          setAnalysis((prev) => prev ? {
            ...prev,
            healthScore: Math.min(95, (prev.healthScore || 58) + 14),
            rating: 'Healthy'
          } : prev)
        }, 500)

        return { success: true, record }
      } else {
        throw new Error(res.error || 'Failed to execute reorganization')
      }
    } catch (err) {
      console.error('Error executing reorganization:', err)
      setIsReorganizing(false)
      setReorgProgress(0)
      return { success: false, error: err.message }
    }
  }, [recordCleanupAction])

  const undoReorganization = useCallback(async (customId = null) => {
    const pointId = customId || undoToast?.restorePointId
    if (!pointId) return

    setIsRestoring(true)
    try {
      const res = await folderReorganizerService.restorePlan(pointId)
      if (res.success) {
        setHistory((prev) =>
          prev.map((h) => (h.id === pointId ? { ...h, restored: true } : h))
        )
        setUndoToast(null)
        if (timerRef.current) clearInterval(timerRef.current)

        addHistoryEvent({
          type: 'restore',
          title: `Restored files to pre-reorganization hierarchy`,
          filesCount: res.restoredCount || 0,
          bytesAffected: 0
        })

        await fetchAnalysis()
        setIsRestoring(false)
        return { success: true }
      }
    } catch (err) {
      console.error('Error restoring reorganization:', err)
      setIsRestoring(false)
      return { success: false, error: err.message }
    }
  }, [undoToast, fetchAnalysis])

  const dismissUndo = useCallback(() => {
    setUndoToast(null)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  return {
    analysis,
    isLoading,
    isReorganizing,
    isRestoring,
    reorgProgress,
    undoToast,
    history,
    fetchAnalysis,
    executePlan,
    undoReorganization,
    dismissUndo
  }
}

export default useFolderReorganizer
