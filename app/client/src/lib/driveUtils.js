/**
 * Google Drive URL and ID utilities
 */

/**
 * Extracts a clean Google Drive folder ID from a URL or raw ID string
 * Supports:
 * - https://drive.google.com/drive/folders/{folderId}
 * - https://drive.google.com/drive/u/{n}/folders/{folderId}
 * - https://drive.google.com/open?id={folderId}
 * - https://drive.google.com/file/d/{folderId}/view
 * - Raw folder ID (e.g. 1aBcDeFgHiJkLmNoPqRsTuVwXyZ)
 * - 'root' or empty string -> 'root'
 *
 * @param {string} input - Folder URL or ID
 * @returns {string} Clean folder ID
 */
export function extractFolderId(input) {
  if (!input) return 'root'
  const trimmed = input.trim()
  if (!trimmed || trimmed.toLowerCase() === 'root') return 'root'

  // If no slashes and no query params, assume already an ID
  if (!trimmed.includes('/') && !trimmed.includes('?')) {
    return trimmed
  }

  // Pattern 1: /folders/{id} or /folders/{id}?usp=...
  const foldersMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  if (foldersMatch && foldersMatch[1]) {
    return foldersMatch[1]
  }

  // Pattern 2: id={id}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1]
  }

  // Pattern 3: /d/{id}
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (dMatch && dMatch[1]) {
    return dMatch[1]
  }

  return trimmed
}

/**
 * Generates an official Google Drive web URL for a folder
 * @param {string} folderId
 * @returns {string} URL to Google Drive
 */
export function getDriveFolderUrl(folderId) {
  if (!folderId || folderId === 'root') {
    return 'https://drive.google.com/drive/my-drive'
  }
  return `https://drive.google.com/drive/folders/${folderId}`
}

/**
 * Validates whether an ID looks like a valid Drive ID (or 'root')
 * @param {string} id
 * @returns {boolean}
 */
export function isValidDriveId(id) {
  if (!id) return false
  if (id.toLowerCase() === 'root') return true
  // Google Drive IDs are typically alphanumeric with hyphens/underscores, min 10 chars
  return /^[a-zA-Z0-9_-]{10,}$/.test(id)
}
