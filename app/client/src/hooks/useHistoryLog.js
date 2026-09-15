import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getHistoryEvents,
  clearHistoryEvents,
  exportHistoryAsJSON,
  exportHistoryAsCSV,
} from '@/lib/tracking/historyStorage'

const CO2_KG_PER_GB = 0.05

export function useHistoryLog() {
  const [events, setEvents] = useState([])
  const [eventTypeFilter, setEventTypeFilter] = useState('all') // 'all', 'scan', 'trash', 'restore'
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // 'all', 'today', '7days', '30days'

  const refresh = useCallback(() => {
    setEvents(getHistoryEvents())
  }, [])

  useEffect(() => {
    refresh()

    const handleUpdate = () => {
      refresh()
    }

    window.addEventListener('drive_cleaner_history_updated', handleUpdate)
    return () => {
      window.removeEventListener('drive_cleaner_history_updated', handleUpdate)
    }
  }, [refresh])

  // Filter events
  const filteredEvents = useMemo(() => {
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    return events.filter((evt) => {
      // Type filter
      if (eventTypeFilter !== 'all' && evt.type !== eventTypeFilter) {
        return false
      }

      // Date filter
      if (dateFilter !== 'all') {
        const evtTime = new Date(evt.timestamp).getTime()
        if (dateFilter === 'today' && now - evtTime > oneDay) return false
        if (dateFilter === '7days' && now - evtTime > 7 * oneDay) return false
        if (dateFilter === '30days' && now - evtTime > 30 * oneDay) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const titleMatch = evt.title?.toLowerCase().includes(q)
        const folderMatch = evt.folderName?.toLowerCase().includes(q)
        const fileMatch = evt.files?.some((f) => f.fileName?.toLowerCase().includes(q))
        if (!titleMatch && !folderMatch && !fileMatch) return false
      }

      return true
    })
  }, [events, eventTypeFilter, searchQuery, dateFilter])

  // Aggregate statistics across lifetime history
  const stats = useMemo(() => {
    let scansCount = 0
    let filesTrashedCount = 0
    let bytesReclaimed = 0

    events.forEach((evt) => {
      if (evt.type === 'scan') {
        scansCount += 1
      } else if (evt.type === 'trash') {
        filesTrashedCount += evt.filesCount || 0
        bytesReclaimed += evt.bytesAffected || 0
      } else if (evt.type === 'restore') {
        filesTrashedCount = Math.max(0, filesTrashedCount - (evt.filesCount || 0))
        bytesReclaimed = Math.max(0, bytesReclaimed - (evt.bytesAffected || 0))
      }
    })

    const gbReclaimed = bytesReclaimed / (1024 * 1024 * 1024)
    const co2SavedKg = Number((gbReclaimed * CO2_KG_PER_GB).toFixed(4))

    return {
      totalEvents: events.length,
      scansCount,
      filesTrashedCount,
      bytesReclaimed,
      co2SavedKg,
    }
  }, [events])

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear your local activity history log?')) {
      clearHistoryEvents()
      refresh()
    }
  }, [refresh])

  const handleExportJSON = useCallback(() => {
    exportHistoryAsJSON(filteredEvents)
  }, [filteredEvents])

  const handleExportCSV = useCallback(() => {
    exportHistoryAsCSV(filteredEvents)
  }, [filteredEvents])

  return {
    events: filteredEvents,
    allEvents: events,
    stats,
    eventTypeFilter,
    setEventTypeFilter,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    clearHistory: handleClearHistory,
    exportJSON: handleExportJSON,
    exportCSV: handleExportCSV,
    refresh,
  }
}

export default useHistoryLog
