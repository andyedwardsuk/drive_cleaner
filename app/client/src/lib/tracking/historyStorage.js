/**
 * History Storage Module
 * Manages persistent audit logs of scans, trash operations, and restorations.
 */

const HISTORY_STORAGE_KEY = 'drive_cleaner_history_events'

/**
 * Generate realistic seed events for first-time users
 */
function generateSeedHistoryEvents() {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  return [
    {
      id: 'evt-seed-1',
      type: 'trash',
      title: 'Batch Trash Operation: Temporary Files',
      timestamp: new Date(now - 2 * hour).toISOString(),
      folderName: 'My Drive',
      filesCount: 4,
      bytesAffected: 28416000,
      status: 'success',
      files: [
        { fileId: 'f-temp-1', fileName: '~$Financial_Forecast_Draft.tmp', fileSize: '1.2 MB', sizeBytes: 1258291 },
        { fileId: 'f-temp-2', fileName: '.DS_Store', fileSize: '14.0 KB', sizeBytes: 14336 },
        { fileId: 'f-temp-3', fileName: 'npm-debug.log', fileSize: '4.8 MB', sizeBytes: 5033164 },
        { fileId: 'f-temp-4', fileName: 'Cache_Dump_2023.bak', fileSize: '21.1 MB', sizeBytes: 22124544 },
      ],
    },
    {
      id: 'evt-seed-2',
      type: 'scan',
      title: 'Smart Scan Completed: Root Folder',
      timestamp: new Date(now - 3 * hour).toISOString(),
      folderName: 'My Drive (Root)',
      filesCount: 156,
      bytesAffected: 524288000,
      status: 'success',
      details: {
        totalSpace: '5.24 GB',
        largeFilesFound: 3,
        duplicatesFound: 8,
        rotScore: 68,
      },
    },
    {
      id: 'evt-seed-3',
      type: 'trash',
      title: 'Cleaned Duplicate Copies',
      timestamp: new Date(now - 1 * day - 4 * hour).toISOString(),
      folderName: 'Marketing Media',
      filesCount: 2,
      bytesAffected: 18454937,
      status: 'success',
      files: [
        { fileId: 'f-dup-1', fileName: 'Hero_Banner_Final (Copy 1).png', fileSize: '9.2 MB', sizeBytes: 9646899 },
        { fileId: 'f-dup-2', fileName: 'Team_Offsite_Video (Copy).mp4', fileSize: '8.4 MB', sizeBytes: 8808038 },
      ],
    },
    {
      id: 'evt-seed-4',
      type: 'restore',
      title: 'Restored File from Trash (Undo)',
      timestamp: new Date(now - 1 * day - 3 * hour).toISOString(),
      folderName: 'Marketing Media',
      filesCount: 1,
      bytesAffected: 8808038,
      status: 'success',
      files: [
        { fileId: 'f-dup-2', fileName: 'Team_Offsite_Video (Copy).mp4', fileSize: '8.4 MB', sizeBytes: 8808038 },
      ],
    },
    {
      id: 'evt-seed-5',
      type: 'scan',
      title: 'Targeted Folder Scan: Project Archival',
      timestamp: new Date(now - 3 * day).toISOString(),
      folderName: 'Project Archival',
      filesCount: 84,
      bytesAffected: 1284505600,
      status: 'success',
      details: {
        totalSpace: '1.28 GB',
        largeFilesFound: 5,
        duplicatesFound: 2,
        rotScore: 82,
      },
    },
  ]
}

/**
 * Retrieve all history events
 * @returns {Array} Array of event objects
 */
export function getHistoryEvents() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
      // Seed default events
      const seed = generateSeedHistoryEvents()
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
  } catch (err) {
    console.warn('Failed to load history events from localStorage:', err)
  }
  return generateSeedHistoryEvents()
}

/**
 * Save history events to localStorage
 * @param {Array} events - Array of events
 */
export function saveHistoryEvents(events) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(events))
    }
  } catch (err) {
    console.warn('Failed to save history events to localStorage:', err)
  }
}

/**
 * Add a new history event to the top of the log
 * @param {Object} eventData - { type, title, folderName, filesCount, bytesAffected, files, details, status }
 * @returns {Object} Newly created event
 */
export function addHistoryEvent(eventData) {
  const events = getHistoryEvents()
  const newEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    status: 'success',
    ...eventData,
  }

  const updated = [newEvent, ...events].slice(0, 100) // Keep latest 100 events
  saveHistoryEvents(updated)

  // Dispatch window event so history views can reactively update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('drive_cleaner_history_updated', { detail: newEvent }))
  }

  return newEvent
}

/**
 * Clear all history events
 */
export function clearHistoryEvents() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify([]))
    }
  } catch (err) {
    console.warn('Failed to clear history events:', err)
  }
}

/**
 * Export history as formatted JSON file
 * @param {Array} events - Events to export
 */
export function exportHistoryAsJSON(events) {
  const jsonContent = JSON.stringify(events, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `drive-cleaner-audit-history-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  window.URL.revokeObjectURL(url)
}

/**
 * Export history as CSV file
 * @param {Array} events - Events to export
 */
export function exportHistoryAsCSV(events) {
  const headers = ['Timestamp', 'Event Type', 'Title', 'Folder', 'Files Count', 'Bytes Affected', 'Status']
  const rows = events.map((e) => [
    e.timestamp,
    e.type,
    `"${(e.title || '').replace(/"/g, '""')}"`,
    `"${(e.folderName || '').replace(/"/g, '""')}"`,
    e.filesCount || 0,
    e.bytesAffected || 0,
    e.status || 'success',
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `drive-cleaner-audit-history-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
