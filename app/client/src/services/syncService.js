/**
 * Drive Cleaner - Incremental Sync Service
 * Bridges to GAS Drive.Changes API backend and manages IndexedDB local state.
 * Includes realistic dev-mode simulation with delta change generation and latency telemetry.
 */

import {
  initDB,
  putFiles,
  deleteFiles,
  getAllFiles,
  getFileCount,
  saveSyncMeta,
  getSyncMeta,
  clearCache,
} from '../lib/cache/indexedDBCache'

export const syncService = {
  /**
   * Retrieves the start change token from Drive API
   * @returns {Promise<{success: boolean, changeToken: string, largestChangeId: number, timestamp: string}>}
   */
  getStartChangeToken: () => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              reject(new Error(response?.error || 'Failed to get start change token'))
            }
          })
          .withFailureHandler((error) => {
            console.error('GAS getStartChangeToken error:', error)
            reject(error)
          })
          .getStartChangeToken()
      } else {
        // Local Vite Dev environment simulation
        setTimeout(() => {
          const mockToken = '128490'
          resolve({
            success: true,
            changeToken: mockToken,
            largestChangeId: parseInt(mockToken, 10),
            timestamp: new Date().toISOString(),
          })
        }, 120)
      }
    })
  },

  /**
   * Fetches delta changes from Drive Changes API since token
   * @param {string|null} changeToken - The baseline change ID
   * @param {string} corpora - 'user' or 'drive'
   * @returns {Promise<Object>} Delta changes package
   */
  fetchIncrementalChanges: (changeToken, corpora = 'user') => {
    return new Promise((resolve, reject) => {
      const startTime = performance.now()

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              reject(new Error(response?.error || 'Failed to fetch incremental changes'))
            }
          })
          .withFailureHandler((error) => {
            console.error('GAS syncIncrementalChanges error:', error)
            reject(error)
          })
          .syncIncrementalChanges({ changeToken, corpora })
      } else {
        // Local Vite Dev environment simulation
        setTimeout(() => {
          const currentTokenNum = parseInt(changeToken || '128490', 10)
          const newTokenNum = currentTokenNum + Math.floor(Math.random() * 4) + 1
          const now = new Date()

          // If no token or first sync, generate an initial batch
          if (!changeToken) {
            resolve({
              success: true,
              isInitialSync: true,
              previousChangeId: null,
              newChangeId: String(newTokenNum),
              createdFiles: [],
              modifiedFiles: [],
              deletedFileIds: [],
              totalChanges: 0,
              syncTimeMs: Math.round(performance.now() - startTime),
              timestamp: now.toISOString(),
            })
            return
          }

          // Generate simulated deltas
          const sampleMimes = [
            'application/vnd.google-apps.document',
            'application/vnd.google-apps.spreadsheet',
            'image/jpeg',
            'video/mp4',
            'application/pdf',
          ]

          const createdFiles = [
            {
              fileId: `mock_new_${Date.now()}_1`,
              fileName: `Q3 Financial Forecast Draft ${Math.floor(Math.random() * 100)}.xlsx`,
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              fileSizeBytes: 4200000 + Math.floor(Math.random() * 8000000),
              modifiedDate: now.toISOString(),
              createdDate: now.toISOString(),
              sharingStatus: 'Private',
              shared: false,
              parentId: 'root',
              parentName: 'My Drive',
              driveLink: 'https://drive.google.com',
            },
          ]

          const modifiedFiles = [
            {
              fileId: `mock_mod_${Date.now()}_2`,
              fileName: `Architecture Design Specs v3.1.pdf`,
              mimeType: 'application/pdf',
              fileSizeBytes: 18500000,
              modifiedDate: now.toISOString(),
              createdDate: new Date(now.getTime() - 86400000 * 7).toISOString(),
              sharingStatus: 'Shared',
              shared: true,
              parentId: 'root',
              parentName: 'Engineering',
              driveLink: 'https://drive.google.com',
            },
            {
              fileId: `mock_mod_${Date.now()}_3`,
              fileName: `Brand Asset Guidelines 2026.png`,
              mimeType: 'image/png',
              fileSizeBytes: 9800000,
              modifiedDate: now.toISOString(),
              createdDate: new Date(now.getTime() - 86400000 * 30).toISOString(),
              sharingStatus: 'Private',
              shared: false,
              parentId: 'root',
              parentName: 'Marketing',
              driveLink: 'https://drive.google.com',
            },
          ]

          const deletedFileIds = [`mock_deleted_${Math.floor(Math.random() * 1000)}`]

          resolve({
            success: true,
            isInitialSync: false,
            previousChangeId: String(changeToken),
            newChangeId: String(newTokenNum),
            createdFiles,
            modifiedFiles,
            deletedFileIds,
            totalChanges: createdFiles.length + modifiedFiles.length + deletedFileIds.length,
            syncTimeMs: Math.round(performance.now() - startTime + 140),
            timestamp: now.toISOString(),
          })
        }, 180)
      }
    })
  },

  // Direct access to IndexedDB cache methods
  initDB,
  putFiles,
  deleteFiles,
  getAllFiles,
  getFileCount,
  saveSyncMeta,
  getSyncMeta,
  clearCache,
}
