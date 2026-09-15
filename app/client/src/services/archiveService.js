/**
 * Archive Service
 * Handles archiving and unarchiving (restoring) files via Google Apps Script google.script.run,
 * with realistic local development simulation.
 */

export const archiveService = {
  /**
   * Move files to Google Drive Archive folder
   * @param {Object} options - { fileIds: string[], targetFolderName?: string, targetFolderId?: string, organizeByYear?: boolean }
   * @returns {Promise<{success: boolean, archivedCount: number, failedCount: number, archivedIds: string[], targetFolderName: string, targetFolderId: string, targetFolderUrl: string, parentMappings: Array, errors: Array}>}
   */
  archiveFiles: (options) => {
    return new Promise((resolve, reject) => {
      const fileIds = options?.fileIds || []
      if (fileIds.length === 0) {
        return resolve({
          success: true,
          archivedCount: 0,
          failedCount: 0,
          archivedIds: [],
          targetFolderName: options?.targetFolderName || '_DriveCleaner_Archive',
          targetFolderId: 'local_archive_root',
          targetFolderUrl: '#',
          parentMappings: [],
          errors: []
        })
      }

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              reject(new Error(response?.error || 'Failed to archive files'))
            }
          })
          .withFailureHandler((error) => {
            console.error('GAS archiveFiles error:', error)
            reject(error)
          })
          .archiveFiles(options)
      } else {
        // Local Vite Dev environment simulation
        console.log('[Dev Simulation] Archiving files:', options)
        const yearStr = String(new Date().getFullYear())
        const folderName = options?.organizeByYear !== false
          ? `${options?.targetFolderName || '_DriveCleaner_Archive'}/${yearStr}`
          : (options?.targetFolderName || '_DriveCleaner_Archive')

        setTimeout(() => {
          resolve({
            success: true,
            archivedCount: fileIds.length,
            failedCount: 0,
            archivedIds: fileIds,
            targetFolderName: folderName,
            targetFolderId: 'mock_archive_folder_' + Date.now(),
            targetFolderUrl: 'https://drive.google.com/drive/folders/mock_archive',
            parentMappings: fileIds.map((id) => ({
              fileId: id,
              originalParentId: 'root',
              allOriginalParents: ['root'],
              archivedParentId: 'mock_archive_folder'
            })),
            errors: []
          })
        }, 600)
      }
    })
  },

  /**
   * Restore files from Google Drive Archive back to original parent folders (Undo operation)
   * @param {Object} options - { items: Array<{ fileId: string, originalParentId: string }> }
   * @returns {Promise<{success: boolean, restoredCount: number, failedCount: number, restoredIds: string[], errors: Array}>}
   */
  unarchiveFiles: (options) => {
    return new Promise((resolve, reject) => {
      const items = options?.items || []
      if (items.length === 0) {
        return resolve({ success: true, restoredCount: 0, failedCount: 0, restoredIds: [], errors: [] })
      }

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              reject(new Error(response?.error || 'Failed to restore archived files'))
            }
          })
          .withFailureHandler((error) => {
            console.error('GAS unarchiveFiles error:', error)
            reject(error)
          })
          .unarchiveFiles(options)
      } else {
        // Local Vite Dev environment simulation
        console.log('[Dev Simulation] Unarchiving files:', options)
        setTimeout(() => {
          resolve({
            success: true,
            restoredCount: items.length,
            failedCount: 0,
            restoredIds: items.map((it) => (typeof it === 'string' ? it : it.fileId)),
            errors: []
          })
        }, 500)
      }
    })
  }
}

export default archiveService
