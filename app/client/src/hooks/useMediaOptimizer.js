import { useState, useEffect, useCallback, useMemo } from 'react'
import { mediaOptimizerService } from '@/services/mediaOptimizerService'
import { archiveService } from '@/services/archiveService'
import { useFileActions } from './useFileActions'

export function useMediaOptimizer() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [report, setReport] = useState({
    summary: {},
    videos: [],
    photoBursts: [],
    compressionCandidates: [],
    allMedia: []
  })

  const [filterMode, setFilterMode] = useState('all') // 'all', 'videos', 'bursts', 'compression', 'audio'
  const [layoutMode, setLayoutMode] = useState('grid') // 'grid', 'table'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null)

  const { requestTrash } = useFileActions()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await mediaOptimizerService.analyzeMediaFiles()
      setReport(data)
    } catch (err) {
      console.error('Failed to load media report:', err)
      setError(err.message || 'Failed to analyze media files')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Toggle selection
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

  const selectAll = useCallback((ids) => {
    setSelectedIds(new Set(ids))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // 1-Click: Select Burst Tailings (all duplicate burst shots excluding the designated Best Shot)
  const selectBurstTailings = useCallback(() => {
    const tailingsIds = []
    ;(report.photoBursts || []).forEach((burst) => {
      ;(burst.items || []).forEach((item) => {
        if (!item.isBestShot) {
          tailingsIds.push(item.fileId)
        }
      })
    })
    setSelectedIds(new Set(tailingsIds))
    setActionSuccessMessage(`Selected ${tailingsIds.length} burst duplicate shots for cleanup.`)
    setTimeout(() => setActionSuccessMessage(null), 3500)
  }, [report.photoBursts])

  // Select all compression candidates
  const selectCompressionCandidates = useCallback(() => {
    const compIds = (report.compressionCandidates || []).map((c) => c.fileId)
    setSelectedIds(new Set(compIds))
    setActionSuccessMessage(`Selected ${compIds.length} compression candidates.`)
    setTimeout(() => setActionSuccessMessage(null), 3500)
  }, [report.compressionCandidates])

  // Filter items based on filterMode & searchQuery
  const filteredMedia = useMemo(() => {
    let list = report.allMedia || []
    if (filterMode === 'videos') {
      list = report.videos || []
    } else if (filterMode === 'bursts') {
      list = (report.photoBursts || []).flatMap((b) => b.items)
    } else if (filterMode === 'compression') {
      list = report.compressionCandidates || []
    } else if (filterMode === 'audio') {
      list = (report.allMedia || []).filter((m) => m.mediaType === 'audio')
    }

    if (!searchQuery.trim()) return list

    const q = searchQuery.toLowerCase()
    return list.filter((m) => {
      return (
        m.fileName.toLowerCase().includes(q) ||
        (m.cameraModel && m.cameraModel.toLowerCase().includes(q)) ||
        (m.resolutionCategory && m.resolutionCategory.toLowerCase().includes(q)) ||
        (m.compression?.targetFormat && m.compression.targetFormat.toLowerCase().includes(q))
      )
    })
  }, [report, filterMode, searchQuery])

  // Export CSV Manifest
  const handleExportManifest = useCallback(() => {
    if (!report.allMedia || report.allMedia.length === 0) return

    const headers = [
      'File Name',
      'Media Type',
      'Extension',
      'Size (Bytes)',
      'Dimensions',
      'Resolution',
      'Duration',
      'Bitrate',
      'Camera Model',
      'Compression Recommendation',
      'Target Format',
      'Estimated Savings (Bytes)',
      'Drive Link'
    ]

    const rows = report.allMedia.map((m) => [
      `"${(m.fileName || '').replace(/"/g, '""')}"`,
      m.mediaType || '',
      m.extension || '',
      m.sizeBytes || 0,
      `"${m.dimensions || ''}"`,
      m.resolutionCategory || '',
      m.durationFormatted || '',
      m.bitrateFormatted || '',
      `"${m.cameraModel || ''}"`,
      `"${(m.compression?.reason || '').replace(/"/g, '""')}"`,
      `"${m.compression?.targetFormat || ''}"`,
      m.compression?.estimatedSavingsBytes || 0,
      m.driveLink || ''
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `drive_cleaner_media_optimization_manifest_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [report.allMedia])

  // Batch trash selected
  const trashSelected = useCallback(() => {
    const filesToTrash = (report.allMedia || []).filter((m) => selectedIds.has(m.fileId))
    if (filesToTrash.length === 0) return
    requestTrash(filesToTrash)
  }, [report.allMedia, selectedIds, requestTrash])

  // Batch archive selected
  const archiveSelected = useCallback(async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    try {
      await archiveService.archiveFiles({
        fileIds: ids,
        targetFolderName: '_DriveCleaner_Archive/Media_Optimized'
      })
      setActionSuccessMessage(`Successfully staged ${ids.length} files to Archive/Media_Optimized.`)
      clearSelection()
      setTimeout(() => setActionSuccessMessage(null), 4000)
    } catch (err) {
      console.error('Failed to archive media items:', err)
    }
  }, [selectedIds, clearSelection])

  return {
    loading,
    error,
    refresh: loadData,
    summary: report.summary || {},
    videos: report.videos || [],
    photoBursts: report.photoBursts || [],
    compressionCandidates: report.compressionCandidates || [],
    allMedia: report.allMedia || [],
    filteredMedia,
    filterMode,
    setFilterMode,
    layoutMode,
    setLayoutMode,
    searchQuery,
    setSearchQuery,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    selectBurstTailings,
    selectCompressionCandidates,
    handleExportManifest,
    trashSelected,
    archiveSelected,
    actionSuccessMessage
  }
}
