/**
 * File Actions Service
 * Handles progressive batch trashing, untrashing (restoring), and Safety Vault recovery
 * via Google Apps Script google.script.run, with graceful simulation in local Vite development.
 */

const CHUNK_SIZE = 25

export const fileActionsService = {
  /**
   * Move files to Google Drive Trash in progressive chunks
   * @param {Array<string>|Object} payload - Array of file IDs or { fileIds, totalBytes, folderName }
   * @param {Function} [onProgress] - Callback ({ processed, total, percent })
   * @returns {Promise<{success: boolean, trashedCount: number, failedCount: number, trashedIds: string[], errors: Array}>}
   */
  trashFiles: async (payload, onProgress) => {
    let fileIds = []
    let totalBytes = 0
    let folderName = 'Drive Folder'

    if (Array.isArray(payload)) {
      fileIds = payload.map(item => (typeof item === 'string' ? item : item?.fileId || item?.file_id || item?.id)).filter((id) => Boolean(id) && typeof id === 'string')
    } else if (payload && Array.isArray(payload.fileIds)) {
      fileIds = payload.fileIds.map(item => (typeof item === 'string' ? item : item?.fileId || item?.file_id || item?.id)).filter((id) => Boolean(id) && typeof id === 'string')
      totalBytes = payload.totalBytes || 0
      folderName = payload.folderName || 'Drive Folder'
    }

    if (!fileIds || fileIds.length === 0) {
      return { success: true, trashedCount: 0, failedCount: 0, trashedIds: [], errors: [] }
    }

    const total = fileIds.length
    let allTrashed = []
    let allErrors = []

    // If running in local Vite development
    if (typeof google === 'undefined' || !google.script || !google.script.run) {
      console.log('[Dev Simulation] Progressive batch trashing:', total, 'files')
      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = fileIds.slice(i, i + CHUNK_SIZE)
        await new Promise((r) => setTimeout(r, 200))
        allTrashed = allTrashed.concat(chunk)
        if (onProgress) {
          onProgress({
            processed: allTrashed.length,
            total,
            percent: Math.round((allTrashed.length / total) * 100),
          })
        }
      }
      return {
        success: true,
        trashedCount: allTrashed.length,
        failedCount: 0,
        trashedIds: allTrashed,
        errors: [],
      }
    }

    // Google Apps Script environment: process in sequential chunks of 25
    for (let i = 0; i < total; i += CHUNK_SIZE) {
      const chunk = fileIds.slice(i, i + CHUNK_SIZE)
      const chunkPayload = {
        fileIds: chunk,
        totalBytes,
        folderName,
      }

      const chunkResult = await new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((res) => resolve(res))
          .withFailureHandler((err) => reject(err))
          .trashFiles(JSON.stringify(chunkPayload))
      }).catch((err) => {
        console.error(`Error in chunk ${Math.floor(i / CHUNK_SIZE)}:`, err)
        return {
          success: false,
          trashedCount: 0,
          failedCount: chunk.length,
          trashedIds: [],
          errors: chunk.map((id) => ({ id, error: err.message || 'Chunk network error' })),
        }
      })

      if (chunkResult.trashedIds) {
        allTrashed = allTrashed.concat(chunkResult.trashedIds)
      }
      if (chunkResult.errors) {
        allErrors = allErrors.concat(chunkResult.errors)
      }

      if (onProgress) {
        onProgress({
          processed: allTrashed.length,
          total,
          percent: Math.round((allTrashed.length / total) * 100),
        })
      }
    }

    return {
      success: allTrashed.length > 0 || (allErrors.length === 0 && total === 0),
      trashedCount: allTrashed.length,
      failedCount: allErrors.length,
      trashedIds: allTrashed,
      errors: allErrors,
    }
  },

  /**
   * Restore files from Google Drive Trash (Undo operation) in progressive chunks
   * @param {Array<string>} fileIds - Array of file IDs to untrash
   * @param {Function} [onProgress] - Callback ({ processed, total, percent })
   * @returns {Promise<{success: boolean, restoredCount: number, failedCount: number, restoredIds: string[], errors: Array}>}
   */
  untrashFiles: async (payload, onProgress) => {
    const fileIds = (Array.isArray(payload) ? payload : [payload])
      .map(item => (typeof item === 'string' ? item : item?.fileId || item?.file_id || item?.id))
      .filter((id) => Boolean(id) && typeof id === 'string')

    if (fileIds.length === 0) {
      return { success: true, restoredCount: 0, failedCount: 0, restoredIds: [], errors: [] }
    }

    const total = fileIds.length
    let allRestored = []
    let allErrors = []

    // Local Vite dev simulation
    if (typeof google === 'undefined' || !google.script || !google.script.run) {
      console.log('[Dev Simulation] Progressive batch untrashing:', total, 'files')
      for (let i = 0; i < total; i += CHUNK_SIZE) {
        const chunk = fileIds.slice(i, i + CHUNK_SIZE)
        await new Promise((r) => setTimeout(r, 150))
        allRestored = allRestored.concat(chunk)
        if (onProgress) {
          onProgress({
            processed: allRestored.length,
            total,
            percent: Math.round((allRestored.length / total) * 100),
          })
        }
      }
      return {
        success: true,
        restoredCount: allRestored.length,
        failedCount: 0,
        restoredIds: allRestored,
        errors: [],
      }
    }

    // Google Apps Script environment: process in sequential chunks of 25
    for (let i = 0; i < total; i += CHUNK_SIZE) {
      const chunk = fileIds.slice(i, i + CHUNK_SIZE)

      const chunkResult = await new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler((res) => resolve(res))
          .withFailureHandler((err) => reject(err))
          .untrashFiles(JSON.stringify(chunk))
      }).catch((err) => {
        console.error(`Error restoring chunk ${Math.floor(i / CHUNK_SIZE)}:`, err)
        return {
          success: false,
          restoredCount: 0,
          failedCount: chunk.length,
          restoredIds: [],
          errors: chunk.map((id) => ({ id, error: err.message || 'Chunk restore network error' })),
        }
      })

      if (chunkResult.restoredIds) {
        allRestored = allRestored.concat(chunkResult.restoredIds)
      }
      if (chunkResult.errors) {
        allErrors = allErrors.concat(chunkResult.errors)
      }

      if (onProgress) {
        onProgress({
          processed: allRestored.length,
          total,
          percent: Math.round((allRestored.length / total) * 100),
        })
      }
    }

    return {
      success: allRestored.length > 0 || (allErrors.length === 0 && total === 0),
      restoredCount: allRestored.length,
      failedCount: allErrors.length,
      restoredIds: allRestored,
      errors: allErrors,
    }
  },

  /**
   * Retrieves active Safety Vault status
   * @returns {Promise<{ hasActiveBatch: boolean, batch: Object|null }>}
   */
  getSafetyVaultStatus: () => {
    return new Promise((resolve) => {
      if (typeof google === 'undefined' || !google.script || !google.script.run) {
        return resolve({ hasActiveBatch: false, batch: null })
      }
      google.script.run
        .withSuccessHandler((res) => resolve(res || { hasActiveBatch: false, batch: null }))
        .withFailureHandler(() => resolve({ hasActiveBatch: false, batch: null }))
        .getSafetyVaultStatus()
    })
  },

  /**
   * Restores all files in the current Safety Vault batch
   * @returns {Promise<Object>}
   */
  restoreSafetyVaultBatch: () => {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.script || !google.script.run) {
        return resolve({ success: true, restoredCount: 0, restoredIds: [] })
      }
      google.script.run
        .withSuccessHandler((res) => resolve(res))
        .withFailureHandler((err) => reject(err))
        .restoreSafetyVaultBatch()
    })
  },

  /**
   * Dismisses the current active Safety Vault batch
   * @returns {Promise<Object>}
   */
  dismissSafetyVaultBatch: () => {
    return new Promise((resolve) => {
      if (typeof google === 'undefined' || !google.script || !google.script.run) {
        return resolve({ success: true })
      }
      google.script.run
        .withSuccessHandler((res) => resolve(res))
        .withFailureHandler(() => resolve({ success: false }))
        .dismissSafetyVaultBatch()
    })
  },
}

export default fileActionsService
