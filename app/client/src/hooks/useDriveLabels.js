import { useState, useEffect, useCallback, useMemo } from 'react'
import labelsService from '@/services/labelsService'
import { addHistoryEvent } from '@/lib/tracking/historyStorage'

const STORAGE_KEY_LABELS = 'drive_cleaner_labels_registry_v1'
const STORAGE_KEY_FILE_MAP = 'drive_cleaner_file_labels_v1'

const PRESET_LABELS = [
  {
    id: 'label_confidential',
    name: 'Confidential',
    color: 'rose',
    icon: 'shield',
    category: 'security',
    description: 'Restricted internal or sensitive data',
    fileCount: 14
  },
  {
    id: 'label_legal_hold',
    name: 'Legal Hold',
    color: 'amber',
    icon: 'scale',
    category: 'compliance',
    description: 'Preserve indefinitely for audit or compliance',
    fileCount: 8
  },
  {
    id: 'label_archive_staged',
    name: 'Archive Staged',
    color: 'indigo',
    icon: 'archive',
    category: 'lifecycle',
    description: 'Ready to be migrated to cold storage',
    fileCount: 22
  },
  {
    id: 'label_green_cleaned',
    name: 'Green Cleaned',
    color: 'emerald',
    icon: 'leaf',
    category: 'sustainability',
    description: 'Audited and optimized for cloud carbon footprint',
    fileCount: 45
  },
  {
    id: 'label_financial',
    name: 'Financial',
    color: 'sky',
    icon: 'dollar',
    category: 'department',
    description: 'Budgets, invoices, accounting, and tax records',
    fileCount: 19
  },
  {
    id: 'label_internal_only',
    name: 'Internal Only',
    color: 'purple',
    icon: 'lock',
    category: 'security',
    description: 'Do not share outside company domain',
    fileCount: 31
  }
]

function loadStoredLabels() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LABELS)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load labels from localStorage:', e)
  }
  return PRESET_LABELS
}

function saveStoredLabels(labels) {
  try {
    localStorage.setItem(STORAGE_KEY_LABELS, JSON.stringify(labels))
    window.dispatchEvent(new CustomEvent('drive_cleaner_labels_updated', { detail: labels }))
  } catch (e) {
    console.warn('Failed to save labels:', e)
  }
}

function loadStoredFileMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILE_MAP)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to load fileMap from localStorage:', e)
  }
  return {
    mock_file_1: ['label_confidential'],
    mock_file_2: ['label_financial'],
    mock_file_3: ['label_archive_staged']
  }
}

function saveStoredFileMap(map) {
  try {
    localStorage.setItem(STORAGE_KEY_FILE_MAP, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent('drive_cleaner_file_map_updated', { detail: map }))
  } catch (e) {
    console.warn('Failed to save fileMap:', e)
  }
}

export function useDriveLabels() {
  const [labels, setLabels] = useState(loadStoredLabels)
  const [fileMap, setFileMap] = useState(loadStoredFileMap)
  const [isLoading, setIsLoading] = useState(false)

  // Listen to cross-component updates
  useEffect(() => {
    const handleLabelsUpdate = (e) => setLabels(e.detail || loadStoredLabels())
    const handleMapUpdate = (e) => setFileMap(e.detail || loadStoredFileMap())

    window.addEventListener('drive_cleaner_labels_updated', handleLabelsUpdate)
    window.addEventListener('drive_cleaner_file_map_updated', handleMapUpdate)

    return () => {
      window.removeEventListener('drive_cleaner_labels_updated', handleLabelsUpdate)
      window.removeEventListener('drive_cleaner_file_map_updated', handleMapUpdate)
    }
  }, [])

  const fetchRegistry = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await labelsService.getRegistry()
      if (res.success) {
        if (res.labels && res.labels.length > 0) {
          saveStoredLabels(res.labels)
          setLabels(res.labels)
        }
        if (res.fileMap) {
          saveStoredFileMap(res.fileMap)
          setFileMap(res.fileMap)
        }
      }
    } catch (err) {
      console.warn('Could not fetch server labels registry:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const applyLabel = useCallback(async (fileIds, labelId) => {
    if (!fileIds || fileIds.length === 0 || !labelId) return { success: false }

    // Optimistic client update
    setFileMap((prev) => {
      const next = { ...prev }
      fileIds.forEach((id) => {
        const existing = next[id] ? [...next[id]] : []
        if (!existing.includes(labelId)) {
          existing.push(labelId)
          next[id] = existing
        }
      })
      saveStoredFileMap(next)
      return next
    })

    // Update label count in registry
    setLabels((prev) => {
      const targetLabel = prev.find((l) => l.id === labelId)
      const updated = prev.map((l) =>
        l.id === labelId ? { ...l, fileCount: (l.fileCount || 0) + fileIds.length } : l
      )
      saveStoredLabels(updated)

      addHistoryEvent({
        type: 'settings',
        title: `Applied label "${targetLabel?.name || labelId}" to ${fileIds.length} files`,
        filesCount: fileIds.length,
        bytesAffected: 0
      })

      return updated
    })

    try {
      await labelsService.applyLabel(fileIds, labelId)
      return { success: true }
    } catch (err) {
      console.error('Failed to sync applyLabel with server:', err)
      return { success: true } // optimistic persistence remains active
    }
  }, [])

  const removeLabel = useCallback(async (fileIds, labelId) => {
    if (!fileIds || fileIds.length === 0 || !labelId) return { success: false }

    setFileMap((prev) => {
      const next = { ...prev }
      fileIds.forEach((id) => {
        if (next[id]) {
          next[id] = next[id].filter((l) => l !== labelId)
          if (next[id].length === 0) delete next[id]
        }
      })
      saveStoredFileMap(next)
      return next
    })

    setLabels((prev) => {
      const updated = prev.map((l) =>
        l.id === labelId ? { ...l, fileCount: Math.max(0, (l.fileCount || 0) - fileIds.length) } : l
      )
      saveStoredLabels(updated)
      return updated
    })

    try {
      await labelsService.removeLabel(fileIds, labelId)
      return { success: true }
    } catch (err) {
      console.error('Failed to sync removeLabel with server:', err)
      return { success: true }
    }
  }, [])

  const createLabel = useCallback(async (labelData) => {
    const newId = labelData.id || 'label_' + labelData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const created = {
      id: newId,
      name: labelData.name,
      color: labelData.color || 'indigo',
      icon: labelData.icon || 'tag',
      category: labelData.category || 'general',
      description: labelData.description || '',
      fileCount: 0
    }

    const updated = [created, ...labels]
    saveStoredLabels(updated)
    setLabels(updated)

    addHistoryEvent({
      type: 'settings',
      title: `Created custom Drive label "${created.name}"`,
      filesCount: 0,
      bytesAffected: 0
    })

    try {
      await labelsService.saveCustomLabel(created)
      return { success: true, label: created }
    } catch (err) {
      console.error('Failed to sync custom label with server:', err)
      return { success: true, label: created }
    }
  }, [labels])

  const getLabelsForFile = useCallback((fileId) => {
    const assignedIds = fileMap[fileId] || []
    return labels.filter((l) => assignedIds.includes(l.id))
  }, [fileMap, labels])

  // Aggregate stats
  const totalTaggedFiles = useMemo(() => Object.keys(fileMap).length, [fileMap])
  const confidentialCount = useMemo(() => {
    return Object.values(fileMap).filter((arr) => arr.includes('label_confidential')).length
  }, [fileMap])

  return {
    labels,
    fileMap,
    isLoading,
    totalTaggedFiles,
    confidentialCount,
    fetchRegistry,
    applyLabel,
    removeLabel,
    createLabel,
    getLabelsForFile
  }
}

export default useDriveLabels
