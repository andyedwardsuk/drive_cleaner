import { useState, useCallback, useEffect } from 'react'

/**
 * Custom hook for fetching Google Drive quota information
 * Handles calling the Google Apps Script getDriveQuota function
 * and managing loading/error states
 *
 * @returns {Object} Hook state and functions
 * @property {Object|null} data - Quota data
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message if any
 * @property {Function} fetchQuota - Function to fetch quota
 * @property {Function} reset - Function to reset state
 */
export function useQuota() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isGAS = typeof google !== 'undefined' && google?.script?.run

  /**
   * Fetch Drive quota information
   */
  const fetchQuota = useCallback(() => {
    // Development mode - return mock data
    if (!isGAS) {
      setLoading(true)
      setTimeout(() => {
        setData({
          success: true,
          data: {
            limit: 17179869184, // 16 GB in bytes
            usage: 12079595520, // ~11.25 GB
            usageInDrive: 10737418240, // 10 GB
            usageInDriveTrash: 1073741824, // 1 GB
            available: 5100273664, // ~4.75 GB
            percentUsed: 70.35,
            userEmail: 'user@example.com',
          },
        })
        setLoading(false)
        setError(null)
      }, 1000)
      return
    }

    // Production mode - call Google Apps Script
    setLoading(true)
    setError(null)

    google.script.run
      .withSuccessHandler((response) => {
        console.log('Quota response:', response)
        setData(response)
        setLoading(false)
      })
      .withFailureHandler((err) => {
        console.error('Quota error:', err)
        setError(err.message || 'Failed to fetch quota information')
        setLoading(false)
      })
      .getDriveQuota()
  }, [isGAS])

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])

  // Auto-fetch on mount
  useEffect(() => {
    fetchQuota()
  }, [fetchQuota])

  return {
    data,
    loading,
    error,
    fetchQuota,
    reset,
  }
}
