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
  FEATURE_SHARED_FILES: true,
  FEATURE_SETTINGS: true,

  // Phase 2 (v0.3.0)
  FEATURE_STORAGE_ANALYTICS: true,
  FEATURE_HISTORY: true,

  // Phase 3 (v0.4.0) - Coming Soon
  FEATURE_DUPLICATES: true,

  // Phase 4 (v0.5.0) - Now Available
  FEATURE_EMPTY_ITEMS: true,
  FEATURE_TEMP_FILES: true,
  FEATURE_WORKSPACE_FILES: true,
  FEATURE_ROT_ANALYSIS: true,
  FEATURE_CARBON_FOOTPRINT: true,
  FEATURE_DAILY_IMPACT: true,

  // Phase 5 (v0.6.0) - Now Available
  FEATURE_BULK_ACTIONS: true,
  FEATURE_FILE_PREVIEW: true,

  // Phase 6 (v0.7.0) - Now Available
  FEATURE_KANBAN_LABELS: true,

  // Phase 7 (v2.3.0) - Smart Auto-Archive Engine
  FEATURE_AUTO_ARCHIVE: true,

  // Phase 8 (v2.4.0) - Scheduled Audit & Automation Triggers
  FEATURE_AUTOMATION_TRIGGERS: true,

  // Phase 9 (v2.5.0) - Smart Folder Reorganizer
  FEATURE_SMART_REORGANIZER: true,

  // Phase 10 (v2.6.0) - Drive Labels & Taxonomy Hub
  FEATURE_DRIVE_LABELS: true,
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
    FEATURE_WORKSPACE_FILES: 'v0.5.0',

    // v0.6.0
    FEATURE_BULK_ACTIONS: 'v0.6.0',
    FEATURE_FILE_PREVIEW: 'v0.6.0',

    // v0.7.0
    FEATURE_KANBAN_LABELS: 'v0.7.0',

    // v2.3.0
    FEATURE_AUTO_ARCHIVE: 'v2.3.0',

    // v2.4.0
    FEATURE_AUTOMATION_TRIGGERS: 'v2.4.0',

    // v2.5.0
    FEATURE_SMART_REORGANIZER: 'v2.5.0',

    // v2.6.0
    FEATURE_DRIVE_LABELS: 'v2.6.0',
  }

  return versionMap[flagName] || 'Future'
}
