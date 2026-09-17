/**
 * App Version Information
 * Auto-generated build timestamp for cache debugging
 */

export const APP_VERSION = '3.1.0'
export const BUILD_TIMESTAMP = new Date().toISOString()
export const FEATURES = [
  'Smart Scan',
  'Enhanced Metadata',
  'Dashboard',
  'Storage Analytics',
  'Google Workspace Files',
  'My Folders',
  'Shared Drives Hygiene Hub',
  'Google Photos & Media Optimization Center',
  'Sharing Permissions & Security Audit Hub',
  'Incremental Sync & Drive Changes API Engine',
  'UI Theme Overhaul & Accessibility Modernization',
  'Cloud Trash Lifecycle & Permanent Purge Governance',
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
