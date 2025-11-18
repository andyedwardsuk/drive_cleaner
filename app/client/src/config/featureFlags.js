/**
 * Feature Flags Configuration
 * Controls which features are visible/enabled in the UI
 */

export const FEATURE_FLAGS = {
  // Core Features (v0.1.0) - Currently Available
  FEATURE_DASHBOARD: true,
  FEATURE_MY_FOLDERS: true,
  FEATURE_ABOUT: true,

  // Phase 1 (v0.2.0) - Now Available
  FEATURE_SMART_SCAN: true,
  FEATURE_LARGE_FILES: true,
  FEATURE_OLD_FILES: true,
  FEATURE_SHARED_FILES: false,
  FEATURE_SETTINGS: false,

  // Phase 2 (v0.3.0) - Coming Soon
  FEATURE_STORAGE_ANALYTICS: false,
  FEATURE_HISTORY: false,

  // Phase 3 (v0.4.0) - Coming Soon
  FEATURE_DUPLICATES: true,

  // Phase 4 (v0.5.0) - Coming Soon
  FEATURE_EMPTY_ITEMS: true,
  FEATURE_TEMP_FILES: true,

  // Phase 5 (v0.6.0) - Coming Soon
  FEATURE_BULK_ACTIONS: false,
  FEATURE_FILE_PREVIEW: false,

  // Phase 6 (v0.7.0) - Coming Soon
  FEATURE_KANBAN_LABELS: false,
}

/**
 * Check if a feature is enabled
 * @param {string} flagName - The feature flag name (e.g., 'FEATURE_DUPLICATES')
 * @returns {boolean} - True if feature is enabled
 */
export const isFeatureEnabled = (flagName) => {
  return FEATURE_FLAGS[flagName] === true
}

/**
 * Get badge text for disabled features
 * @param {string} flagName - The feature flag name
 * @returns {string|null} - Badge text or null
 */
export const getFeatureBadge = (flagName) => {
  if (FEATURE_FLAGS[flagName] === true) return null
  return 'Coming Soon'
}

/**
 * Get release version for a feature
 * @param {string} flagName - The feature flag name
 * @returns {string} - Version string (e.g., 'v0.2.0')
 */
export const getFeatureVersion = (flagName) => {
  const versionMap = {
    // v0.2.0
    FEATURE_SMART_SCAN: 'v0.2.0',
    FEATURE_LARGE_FILES: 'v0.2.0',
    FEATURE_OLD_FILES: 'v0.2.0',
    FEATURE_SHARED_FILES: 'v0.2.0',
    FEATURE_SETTINGS: 'v0.2.0',

    // v0.3.0
    FEATURE_STORAGE_ANALYTICS: 'v0.3.0',
    FEATURE_HISTORY: 'v0.3.0',

    // v0.4.0
    FEATURE_DUPLICATES: 'v0.4.0',

    // v0.5.0
    FEATURE_EMPTY_ITEMS: 'v0.5.0',
    FEATURE_TEMP_FILES: 'v0.5.0',

    // v0.6.0
    FEATURE_BULK_ACTIONS: 'v0.6.0',
    FEATURE_FILE_PREVIEW: 'v0.6.0',

    // v0.7.0
    FEATURE_KANBAN_LABELS: 'v0.7.0',
  }

  return versionMap[flagName] || 'Future'
}
