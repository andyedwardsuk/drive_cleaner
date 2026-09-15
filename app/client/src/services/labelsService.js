/**
 * Labels & Taxonomy Service
 * Interacts with Google Apps Script LabelsManager via google.script.run,
 * with local development simulation.
 */

export const labelsService = {
  /**
   * Fetch label definitions and file mappings
   * @returns {Promise<Object>} Registry object
   */
  getRegistry: () => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to get labels registry'))
          })
          .withFailureHandler((err) => {
            console.error('GAS getDriveLabelsRegistry error:', err)
            reject(err)
          })
          .getDriveLabelsRegistry()
      } else {
        console.log('[Dev Simulation] Fetching labels registry')
        setTimeout(() => {
          resolve({
            success: true,
            labels: [
              {
                id: 'label_confidential',
                name: 'Confidential',
                color: 'rose',
                icon: 'shield',
                category: 'security',
                description: 'Restricted internal or sensitive data',
                fileCount: 14
              },
              {
                id: 'label_legal_hold',
                name: 'Legal Hold',
                color: 'amber',
                icon: 'scale',
                category: 'compliance',
                description: 'Preserve indefinitely for audit or compliance',
                fileCount: 8
              },
              {
                id: 'label_archive_staged',
                name: 'Archive Staged',
                color: 'indigo',
                icon: 'archive',
                category: 'lifecycle',
                description: 'Ready to be migrated to cold storage',
                fileCount: 22
              },
              {
                id: 'label_green_cleaned',
                name: 'Green Cleaned',
                color: 'emerald',
                icon: 'leaf',
                category: 'sustainability',
                description: 'Audited and optimized for cloud carbon footprint',
                fileCount: 45
              },
              {
                id: 'label_financial',
                name: 'Financial',
                color: 'sky',
                icon: 'dollar',
                category: 'department',
                description: 'Budgets, invoices, accounting, and tax records',
                fileCount: 19
              },
              {
                id: 'label_internal_only',
                name: 'Internal Only',
                color: 'purple',
                icon: 'lock',
                category: 'security',
                description: 'Do not share outside company domain',
                fileCount: 31
              }
            ],
            fileMap: {
              mock_file_1: ['label_confidential'],
              mock_file_2: ['label_financial'],
              mock_file_3: ['label_archive_staged']
            }
          })
        }, 400)
      }
    })
  },

  /**
   * Apply label to files
   * @param {string[]} fileIds
   * @param {string} labelId
   * @returns {Promise<Object>} Result
   */
  applyLabel: (fileIds, labelId) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to apply label'))
          })
          .withFailureHandler((err) => {
            console.error('GAS applyDriveLabel error:', err)
            reject(err)
          })
          .applyDriveLabel({ fileIds, labelId })
      } else {
        console.log('[Dev Simulation] Applying label:', labelId, 'to files:', fileIds)
        setTimeout(() => {
          resolve({
            success: true,
            updatedCount: fileIds.length,
            labelId
          })
        }, 400)
      }
    })
  },

  /**
   * Remove label from files
   * @param {string[]} fileIds
   * @param {string} labelId
   * @returns {Promise<Object>} Result
   */
  removeLabel: (fileIds, labelId) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to remove label'))
          })
          .withFailureHandler((err) => {
            console.error('GAS removeDriveLabel error:', err)
            reject(err)
          })
          .removeDriveLabel({ fileIds, labelId })
      } else {
        console.log('[Dev Simulation] Removing label:', labelId, 'from files:', fileIds)
        setTimeout(() => {
          resolve({
            success: true,
            updatedCount: fileIds.length,
            labelId
          })
        }, 300)
      }
    })
  },

  /**
   * Save a custom label definition
   * @param {Object} labelData
   * @returns {Promise<Object>} Result
   */
  saveCustomLabel: (labelData) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to save label'))
          })
          .withFailureHandler((err) => {
            console.error('GAS saveCustomDriveLabel error:', err)
            reject(err)
          })
          .saveCustomDriveLabel(labelData)
      } else {
        console.log('[Dev Simulation] Saving custom label:', labelData)
        setTimeout(() => {
          resolve({
            success: true,
            label: {
              ...labelData,
              id: labelData.id || 'label_custom_' + Date.now(),
              fileCount: 0
            }
          })
        }, 400)
      }
    })
  }
}

export default labelsService
