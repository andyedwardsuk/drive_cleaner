/**
 * File Actions Service
 * Handles trashing and untrashing (restoring) files via Google Apps Script google.script.run,
 * with graceful simulation in local Vite development.
 */

export const fileActionsService = {
  /**
   * Move files to Google Drive Trash
   * @param {Array<string>} fileIds - Array of file IDs to trash
   * @returns {Promise<{success: boolean, trashedCount: number, failedCount: number, trashedIds: string[], errors: Array}>}
   */
  trashFiles: (fileIds) => {
    return new Promise((resolve, reject) => {
      if (!fileIds || fileIds.length === 0) {
        return resolve({ success: true, trashedCount: 0, failedCount: 0, trashedIds: [], errors: [] })
      }

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              reject(new Error(response?.error || 'Failed to trash files'))
            }
          })
          .withFailureHandler((error) => {
            console.error('GAS trashFiles error:', error)
            reject(error)
          })
          .trashFiles(fileIds)
      } else {
        // Local Vite Dev environment simulation
        console.log('[Dev Simulation] Trashing files:', fileIds)
        setTimeout(() => {
          resolve({
            success: true,
            trashedCount: fileIds.length,
            failedCount: 0,
            trashedIds: fileIds,
            errors: []
          })
        }, 500)
      }
    })
  },

  /**
   * Restore files from Google Drive Trash (Undo operation)
   * @param {Array<string>} fileIds - Array of file IDs to untrash
   * @returns {Promise<{success: boolean, restoredCount: number, failedCount: number, restoredIds: string[], errors: Array}>}
   */
  untrashFiles: (fileIds) => {
    return new Promise((resolve, reject) => {
      if (!fileIds || fileIds.length === 0) {
        return resolve({ success: true, restoredCount: 0, failedCount: 0, restoredIds: [], errors: [] })
      }

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              reject(new Error(response?.error || 'Failed to restore files'))
            }
          })
          .withFailureHandler((error) => {
            console.error('GAS untrashFiles error:', error)
            reject(error)
          })
          .untrashFiles(fileIds)
      } else {
        // Local Vite Dev environment simulation
        console.log('[Dev Simulation] Restoring files:', fileIds)
        setTimeout(() => {
          resolve({
            success: true,
            restoredCount: fileIds.length,
            failedCount: 0,
            restoredIds: fileIds,
            errors: []
          })
        }, 400)
      }
    })
  }
}

export default fileActionsService
