import { useState, useEffect, useCallback, useMemo } from 'react'
import { trashGovernanceService } from '@/services/trashGovernanceService'

export function useTrashGovernance() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [overview, setOverview] = useState({
    summary: {
      totalCount: 0,
      totalBytes: 0,
      totalBytesFormatted: '0 B',
      criticalCount: 0,
      approachingCount: 0,
      midwayCount: 0,
      freshCount: 0,
      accidentalCandidatesCount: 0,
      retentionPeriodDays: 30
    },
    categoryBreakdown: {
      counts: {},
      bytes: {},
      formattedBytes: {}
    },
    files: []
  })

  const [activeTab, setActiveTab] = useState('all') // 'all', 'expiring', 'large', 'recent', 'accidental'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('remaining_asc') // 'remaining_asc', 'size_desc', 'name_asc', 'days_desc'
  const [selectedIds, setSelectedIds] = useState(new Set())

  const [isRestoring, setIsRestoring] = useState(false)
  const [isPurging, setIsPurging] = useState(false)
  const [isEmptying, setIsEmptying] = useState(false)
  const [actionMessage, setActionMessage] = useState(null)

  const showToast = (msg, type = 'success') => {
    setActionMessage({ text: msg, type })
    setTimeout(() => setActionMessage(null), 4500)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await trashGovernanceService.fetchTrashOverview()
      setOverview(data)
      setSelectedIds(new Set())
    } catch (err) {
      console.error('Failed to load trash overview:', err)
      setError(err.message || 'Failed to audit Google Drive Trash')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Toggle single file selection
  const toggleSelect = useCallback((fileId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }, [])

  // Deselect all
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // Filter & sort files
  const filteredFiles = useMemo(() => {
    let list = overview.files || []

    // 1. Tab filter
    if (activeTab === 'expiring') {
      list = list.filter((f) => f.urgencyTier === 'critical')
    } else if (activeTab === 'large') {
      list = list.filter((f) => f.fileSize >= 50 * 1024 * 1024)
    } else if (activeTab === 'recent') {
      list = list.filter((f) => f.daysInTrash <= 3)
    } else if (activeTab === 'accidental') {
      list = list.filter((f) => f.isAccidentalCandidate)
    }

    // 2. Category filter
    if (categoryFilter !== 'all') {
      list = list.filter((f) => f.category === categoryFilter)
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((f) => f.title.toLowerCase().includes(q))
    }

    // 4. Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'remaining_asc') {
        if (a.daysRemaining !== b.daysRemaining) return a.daysRemaining - b.daysRemaining
        return b.fileSize - a.fileSize
      }
      if (sortBy === 'size_desc') {
        return b.fileSize - a.fileSize
      }
      if (sortBy === 'days_desc') {
        return b.daysInTrash - a.daysInTrash
      }
      if (sortBy === 'name_asc') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })
  }, [overview.files, activeTab, categoryFilter, searchQuery, sortBy])

  // Select all currently visible files
  const selectAllVisible = useCallback(() => {
    const visibleIds = filteredFiles.map((f) => f.id)
    setSelectedIds(new Set(visibleIds))
  }, [filteredFiles])

  // Restore selected files
  const restoreSelected = useCallback(async () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    setIsRestoring(true)
    try {
      const res = await trashGovernanceService.restoreTrashFiles(ids)
      showToast(`Successfully restored ${res.restoredCount} file${res.restoredCount === 1 ? '' : 's'} back to Google Drive!`)
      await loadData()
    } catch (err) {
      showToast(err.message || 'Failed to restore files', 'error')
    } finally {
      setIsRestoring(false)
    }
  }, [selectedIds, loadData])

  // Restore a single file
  const restoreSingle = useCallback(async (fileId) => {
    setIsRestoring(true)
    try {
      const res = await trashGovernanceService.restoreTrashFiles([fileId])
      showToast(`Restored file back to Google Drive!`)
      await loadData()
    } catch (err) {
      showToast(err.message || 'Failed to restore file', 'error')
    } finally {
      setIsRestoring(false)
    }
  }, [loadData])

  // Permanently purge selected files
  const purgeSelectedPermanently = useCallback(async () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    setIsPurging(true)
    try {
      const res = await trashGovernanceService.purgeTrashFilesPermanently(ids)
      showToast(`Permanently deleted ${res.purgedCount} file${res.purgedCount === 1 ? '' : 's'} from Trash. Quota recovered!`)
      await loadData()
    } catch (err) {
      showToast(err.message || 'Failed to permanently purge files', 'error')
    } finally {
      setIsPurging(false)
    }
  }, [selectedIds, loadData])

  // Permanently purge a single file
  const purgeSinglePermanently = useCallback(async (fileId) => {
    setIsPurging(true)
    try {
      await trashGovernanceService.purgeTrashFilesPermanently([fileId])
      showToast(`Permanently purged item from Trash. Quota recovered!`)
      await loadData()
    } catch (err) {
      showToast(err.message || 'Failed to permanently purge file', 'error')
    } finally {
      setIsPurging(false)
    }
  }, [loadData])

  // Empty all drive trash
  const emptyDriveTrashPermanently = useCallback(async () => {
    setIsEmptying(true)
    try {
      await trashGovernanceService.emptyDriveTrashPermanently()
      showToast('All Google Drive Trash has been permanently emptied!')
      await loadData()
    } catch (err) {
      showToast(err.message || 'Failed to empty Trash', 'error')
    } finally {
      setIsEmptying(false)
    }
  }, [loadData])

  // Export CSV Manifest
  const exportManifestCSV = useCallback(() => {
    if (!overview.files || overview.files.length === 0) return

    const headers = [
      'File ID',
      'Title',
      'MIME Type',
      'Category',
      'Size (Bytes)',
      'Size Formatted',
      'Days in Trash',
      'Days Remaining Before Purge',
      'Urgency Tier',
      'Accidental Candidate',
      'Drive Link'
    ]

    const rows = overview.files.map((f) => [
      `"${f.id}"`,
      `"${(f.title || '').replace(/"/g, '""')}"`,
      `"${f.mimeType}"`,
      `"${f.category}"`,
      f.fileSize,
      `"${f.fileSizeFormatted}"`,
      f.daysInTrash,
      f.daysRemaining,
      `"${f.urgencyTier}"`,
      f.isAccidentalCandidate ? 'YES' : 'NO',
      `"${f.alternateLink || ''}"`
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `drive_cleaner_trash_manifest_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [overview.files])

  return {
    loading,
    error,
    overview,
    activeTab,
    setActiveTab,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedIds,
    toggleSelect,
    selectAllVisible,
    deselectAll,
    filteredFiles,
    isRestoring,
    isPurging,
    isEmptying,
    actionMessage,
    restoreSelected,
    restoreSingle,
    purgeSelectedPermanently,
    purgeSinglePermanently,
    emptyDriveTrashPermanently,
    exportManifestCSV,
    loadData
  }
}
