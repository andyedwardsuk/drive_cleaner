/**
 * App Version Information
 * Auto-generated build timestamp for cache debugging
 */

export const APP_VERSION = '1.0.0'
export const BUILD_TIMESTAMP = new Date().toISOString()
export const FEATURES = [
  'Smart Scan Engine',
  'Enhanced Drive API v2 Metadata',
  'Dashboard & Quota Telemetry',
  'Storage Analytics & Visualization',
  'Google Workspace Files Hub',
  'My Folders & Multi-Folder Scoping',
  'Shared Drives (Team Drive) Hygiene Hub',
  'Google Photos & 4K Media Optimization Center',
  'Sharing Permissions & Security Exposure Audit Hub',
  'Incremental Sync & Drive Changes API Engine',
  'Cloud Trash Lifecycle & Permanent Purge Governance',
  'Smart Auto-Archive Engine & Reversible Restore',
  'Data ROT Analysis & Psychological Clutter Index',
  'Cloud Carbon Footprint & Green Gamification',
  'Kanban Triage Pipeline & Bulk Rules Engine',
  '24/7 Time-Driven Automation Triggers & HTML Digests',
  'Smart Folder Reorganizer & Hierarchy Architect',
  'Google Drive Labels & Taxonomy Studio',
  'Interactive File Preview & Deep Metadata Inspector',
  'Unified 5-Hub Spatial Architecture & Tab Navigation',
  'Global ⌘K Command Palette',
  'Font Awesome Pro Duotone Iconography',
  'Web Awesome Pro Component Integration',
  'Zero-Shift Web Awesome WaSkeleton Loading States',
  'Seamless Hash-Based SPA Routing on Google Apps Script',
]

/**
 * Log version information to console
 * Helps identify if cached or fresh code is running
 */
export function logVersionInfo() {
  const styles = {
    title: 'color: #3b82f6; font-weight: bold; font-size: 16px;',
    version: 'color: #10b981; font-weight: bold;',
    timestamp: 'color: #6b7280;',
    feature: 'color: #8b5cf6;',
  }

  console.log('%c🚀 Drive Cleaner', styles.title)
  console.log('%cVersion: ' + APP_VERSION, styles.version)
  console.log('%cBuild: ' + BUILD_TIMESTAMP, styles.timestamp)
  console.log(
    '%cFeatures: ' + FEATURES.join(', '),
    styles.feature
  )
  console.log('---')
}
