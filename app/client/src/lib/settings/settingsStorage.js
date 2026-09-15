/**
 * Settings Storage Engine
 * Manages user preferences, custom cleanup thresholds, appearance, and scanning defaults.
 */

export const SETTINGS_STORAGE_KEY = 'drive_cleaner_settings_v1'
export const SETTINGS_UPDATED_EVENT = 'drive_cleaner_settings_updated'

export const DEFAULT_SETTINGS = {
  thresholds: {
    largeFileMinMB: 100, // 25, 50, 100, 250, 500, 1024
    largeFileHighMB: 500,
    largeFileExtremeMB: 1024,
    oldFileInactiveDays: 365, // 90, 180, 365, 730, 1095
    oldFileHighDays: 730,
    oldFileExtremeDays: 1825,
    rotStaleDays: 180,
    rotDecayedDays: 730,
    targetClutterIndex: 20,
  },
  scanning: {
    defaultCorpora: 'user', // 'user' (My Drive) or 'drive' (Shared Drive)
    autoIncludeWorkspace: true,
    maxFilesLimit: 2500,
    enableAutoCache: true,
  },
  appearance: {
    theme: 'dark', // 'dark', 'light', 'system'
    accentColor: 'blue', // 'blue', 'emerald', 'violet', 'amber'
    density: 'comfortable', // 'comfortable', 'compact'
  },
  safety: {
    confirmBeforeTrash: true,
    enableUndoToast: true,
    undoTimeoutSeconds: 10, // 5, 10, 15, 30
  },
  notifications: {
    streakReminders: true,
    soundEffects: false,
  },
}

/**
 * Deep merge utility for settings objects
 */
function deepMerge(target, source) {
  const result = { ...target }
  if (!source || typeof source !== 'object') return result

  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key])
    } else if (source[key] !== undefined) {
      result[key] = source[key]
    }
  }
  return result
}

/**
 * Retrieve saved settings with complete fallback to defaults
 * @returns {typeof DEFAULT_SETTINGS}
 */
export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return deepMerge(DEFAULT_SETTINGS, parsed)
    }
  } catch (err) {
    console.warn('Failed to parse saved settings, falling back to defaults:', err)
  }
  return { ...DEFAULT_SETTINGS }
}

/**
 * Save updated settings, deep merging with existing values and broadcasting update event
 * @param {Partial<typeof DEFAULT_SETTINGS>} partialSettings
 * @returns {typeof DEFAULT_SETTINGS}
 */
export function saveSettings(partialSettings) {
  try {
    const current = getSettings()
    const updated = deepMerge(current, partialSettings)
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated))

    // Broadcast update across application
    window.dispatchEvent(
      new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: updated })
    )
    return updated
  } catch (err) {
    console.error('Failed to save settings:', err)
    return getSettings()
  }
}

/**
 * Update a specific setting field
 * @param {'thresholds'|'scanning'|'appearance'|'safety'|'notifications'} section
 * @param {string} key
 * @param {*} value
 */
export function updateSettingValue(section, key, value) {
  const current = getSettings()
  const sectionObj = current[section] || {}
  const updatedSection = { ...sectionObj, [key]: value }
  return saveSettings({ [section]: updatedSection })
}

/**
 * Reset all settings back to factory defaults
 */
export function resetSettings() {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS))
    window.dispatchEvent(
      new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: DEFAULT_SETTINGS })
    )
    return { ...DEFAULT_SETTINGS }
  } catch (err) {
    console.error('Failed to reset settings:', err)
    return DEFAULT_SETTINGS
  }
}

/**
 * Export all Drive Cleaner app data (Settings, History, Habits, Recent Folders)
 */
export function exportAllAppData() {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
    settings: getSettings(),
    history: [],
    recentFolders: [],
    impact: null,
  }

  try {
    const historyStored = localStorage.getItem('drive_cleaner_history_events')
    if (historyStored) data.history = JSON.parse(historyStored)

    const recentsStored = localStorage.getItem('drive_cleaner_recent_folders')
    if (recentsStored) data.recentFolders = JSON.parse(recentsStored)

    const impactStored = localStorage.getItem('drive_cleaner_daily_impact')
    if (impactStored) data.impact = JSON.parse(impactStored)
  } catch (err) {
    console.warn('Could not collect full storage export:', err)
  }

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', jsonString)
  downloadAnchor.setAttribute(
    'download',
    `drive_cleaner_backup_${new Date().toISOString().slice(0, 10)}.json`
  )
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

/**
 * Clear local caches and reset all state
 */
export function clearAllLocalCaches() {
  try {
    localStorage.removeItem('drive_cleaner_recent_folders')
    localStorage.removeItem('drive_cleaner_last_scan_result')
    // Dispatch events to notify other hooks
    window.dispatchEvent(new CustomEvent('drive_cleaner_cache_cleared'))
    return true
  } catch (err) {
    console.error('Failed to clear caches:', err)
    return false
  }
}
