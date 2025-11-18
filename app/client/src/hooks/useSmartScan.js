import { useState, useCallback } from 'react'

/**
 * Custom hook for Smart Scan functionality
 * Handles calling the Google Apps Script runSmartScan function
 * and managing loading/error states
 *
 * @returns {Object} Hook state and functions
 * @property {Object|null} data - Smart Scan results
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message if any
 * @property {Function} runScan - Function to trigger a scan
 * @property {Function} reset - Function to reset state
 */
export function useSmartScan() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isGAS = typeof google !== 'undefined' && google?.script?.run

  /**
   * Run Smart Scan on a folder
   * @param {string} folderId - Folder ID to scan (default: 'root')
   * @param {string} corpora - Corpora type ('user' or 'drive')
   */
  const runScan = useCallback(
    (folderId = 'root', corpora = 'user') => {
      // Development mode - return mock data
      if (!isGAS) {
        setLoading(true)
        setTimeout(() => {
          setData({
            success: true,
            scan_date: new Date().toISOString(),
            folder_name: 'My Drive',
            total_files_scanned: 156,
            total_space_used_bytes: 5242880000,
            total_potential_savings_bytes: 524288000,
            large_files: {
              count: 3,
              total_size_bytes: 2147483648,
              items: [
                {
                  file_id: '1abc',
                  file_name: 'Large Video.mp4',
                  mime_type: 'video/mp4',
                  size_bytes: 1073741824,
                  matched_criteria: ['over_1gb'],
                  safety_level: 'review',
                },
              ],
              category_name: 'Large Files',
              category_type: 'large_files',
            },
            old_files: {
              count: 12,
              total_size_bytes: 104857600,
              items: [
                {
                  file_id: '2def',
                  file_name: 'Old Report 2020.pdf',
                  mime_type: 'application/pdf',
                  size_bytes: 2097152,
                  age_years: 5.2,
                  matched_criteria: ['over_5yr'],
                  safety_level: 'review',
                },
              ],
              category_name: 'Old Files',
              category_type: 'old_files',
            },
            duplicates: {
              count: 8,
              groups: [
                {
                  file_name: 'Screenshot.png',
                  duplicate_count: 3,
                  total_size_bytes: 6291456,
                  items: [
                    {
                      file_id: '3ghi',
                      file_name: 'Screenshot.png',
                      size_bytes: 2097152,
                      created_date: '2024-01-15',
                    },
                  ],
                },
              ],
              category_name: 'Duplicates',
              category_type: 'duplicates',
            },
            empty_items: {
              count: 5,
              total_size_bytes: 0,
              items: [
                {
                  file_id: '4jkl',
                  file_name: 'Empty Folder',
                  mime_type: 'application/vnd.google-apps.folder',
                  matched_criteria: ['empty_folder'],
                  safety_level: 'safe',
                },
              ],
              category_name: 'Empty Items',
              category_type: 'empty_items',
            },
            temp_files: {
              count: 2,
              total_size_bytes: 1048576,
              items: [
                {
                  file_id: '5mno',
                  file_name: '.DS_Store',
                  size_bytes: 524288,
                  matched_criteria: ['exact_name'],
                  safety_level: 'safe',
                },
              ],
              category_name: 'Temporary Files',
              category_type: 'temp_files',
            },
            recommendations: [
              {
                priority: 'high',
                category: 'temp_files',
                message: 'Delete 2 temporary files to free up 1.00 MB',
                action: 'delete',
                file_count: 2,
                space_savings_bytes: 1048576,
              },
            ],
          })
          setLoading(false)
        }, 2000)
        return
      }

      // Production mode - call Google Apps Script
      setLoading(true)
      setError(null)
      setData(null)

      google.script.run
        .withSuccessHandler((result) => {
          setLoading(false)
          if (result && result.success) {
            setData(result)
          } else {
            setError(result?.error || 'Scan failed')
            setData(null)
          }
        })
        .withFailureHandler((err) => {
          setLoading(false)
          setError(err.message || 'Failed to run Smart Scan')
          setData(null)
          console.error('Smart Scan error:', err)
        })
        .runSmartScan(folderId, corpora)
    },
    [isGAS]
  )

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    runScan,
    reset,
  }
}
