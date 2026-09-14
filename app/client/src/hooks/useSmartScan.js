import { create } from 'zustand'

/**
 * Check if running inside Google Apps Script environment
 */
const isGAS = typeof google !== 'undefined' && google?.script?.run

/**
 * Global Zustand store for Smart Scan data
 */
export const useSmartScanStore = create((set) => ({
  data: null,
  loading: false,
  error: null,

  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ data: null, loading: false, error: null }),

  /**
   * Run Smart Scan on a folder
   * @param {string} folderId - Folder ID to scan (default: 'root')
   * @param {string} corpora - Corpora type ('user' or 'drive')
   */
  runScan: (folderId = 'root', corpora = 'user') => {
    // Development mode - return mock data
    if (!isGAS) {
      set({ loading: true, error: null, data: null })
      setTimeout(() => {
        set({
          data: {
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
            workspace_files: {
              count: 6,
              total_size_bytes: 0,
              category_name: 'Google Workspace Files',
              category_type: 'workspace_files',
              type_breakdown: {
                document: 2,
                spreadsheet: 2,
                presentation: 1,
                form: 1
              },
              unused_breakdown: {
                six_months: 1,
                one_year: 2,
                two_years: 1
              },
              sharing_breakdown: {
                shared: 3,
                private: 3,
                unknown: 0
              },
              items: [
                {
                  file_id: 'ws1',
                  file_name: '2023 Marketing Strategy',
                  mime_type: 'application/vnd.google-apps.document',
                  workspace_type: 'document',
                  size_bytes: 0,
                  created_date: '2023-01-10T10:00:00.000Z',
                  modified_date: '2023-02-15T14:30:00.000Z',
                  last_viewed_date: '2023-03-01T09:00:00.000Z',
                  days_since_viewed: 740,
                  parent_id: 'root',
                  parent_name: 'My Drive',
                  is_shared: true,
                  matched_criteria: ['document', 'unused_two_years', 'shared'],
                  safety_level: 'review',
                  recommendation: 'Not viewed in 2+ years. Consider archiving or removing.'
                },
                {
                  file_id: 'ws2',
                  file_name: 'Budget Forecast 2024',
                  mime_type: 'application/vnd.google-apps.spreadsheet',
                  workspace_type: 'spreadsheet',
                  size_bytes: 0,
                  created_date: '2023-11-01T12:00:00.000Z',
                  modified_date: '2024-01-20T16:00:00.000Z',
                  last_viewed_date: '2024-02-10T11:00:00.000Z',
                  days_since_viewed: 395,
                  parent_id: 'root',
                  parent_name: 'Finance',
                  is_shared: true,
                  matched_criteria: ['spreadsheet', 'unused_one_year', 'shared'],
                  safety_level: 'review',
                  recommendation: 'Not viewed in 1+ year. Review relevance.'
                },
                {
                  file_id: 'ws3',
                  file_name: 'Q3 Business Review',
                  mime_type: 'application/vnd.google-apps.presentation',
                  workspace_type: 'presentation',
                  size_bytes: 0,
                  created_date: '2024-06-15T08:00:00.000Z',
                  modified_date: '2024-07-01T17:00:00.000Z',
                  last_viewed_date: '2024-07-15T10:00:00.000Z',
                  days_since_viewed: 220,
                  parent_id: 'root',
                  parent_name: 'Presentations',
                  is_shared: false,
                  matched_criteria: ['presentation', 'unused_six_months'],
                  safety_level: 'safe',
                  recommendation: 'Inactive presentation. Consider moving to archive folder.'
                },
                {
                  file_id: 'ws4',
                  file_name: 'Team Feedback Survey 2023',
                  mime_type: 'application/vnd.google-apps.form',
                  workspace_type: 'form',
                  size_bytes: 0,
                  created_date: '2023-05-10T09:00:00.000Z',
                  modified_date: '2023-06-01T12:00:00.000Z',
                  last_viewed_date: '2023-06-05T13:00:00.000Z',
                  days_since_viewed: 640,
                  parent_id: 'root',
                  parent_name: 'Surveys',
                  is_shared: true,
                  matched_criteria: ['form', 'unused_one_year', 'shared'],
                  safety_level: 'review',
                  recommendation: 'Closed survey form. Review if still needed.'
                },
                {
                  file_id: 'ws5',
                  file_name: 'Weekly Notes & Action Items',
                  mime_type: 'application/vnd.google-apps.document',
                  workspace_type: 'document',
                  size_bytes: 0,
                  created_date: '2024-08-01T10:00:00.000Z',
                  modified_date: '2024-08-15T15:00:00.000Z',
                  last_viewed_date: '2024-08-20T16:00:00.000Z',
                  days_since_viewed: 15,
                  parent_id: 'root',
                  parent_name: 'My Drive',
                  is_shared: false,
                  matched_criteria: ['document'],
                  safety_level: 'safe',
                  recommendation: null
                },
                {
                  file_id: 'ws6',
                  file_name: 'Project Inventory Tracker',
                  mime_type: 'application/vnd.google-apps.spreadsheet',
                  workspace_type: 'spreadsheet',
                  size_bytes: 0,
                  created_date: '2024-07-20T11:00:00.000Z',
                  modified_date: '2024-08-10T14:00:00.000Z',
                  last_viewed_date: '2024-08-18T09:30:00.000Z',
                  days_since_viewed: 25,
                  parent_id: 'root',
                  parent_name: 'Operations',
                  is_shared: false,
                  matched_criteria: ['spreadsheet'],
                  safety_level: 'safe',
                  recommendation: null
                }
              ]
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
              {
                priority: 'medium',
                category: 'workspace_files',
                message: '4 Google Workspace files have not been viewed in over 6 months',
                action: 'review',
                file_count: 4,
                space_savings_bytes: 0,
              },
            ],
          },
          loading: false,
        })
      }, 2000)
      return
    }

    // Production mode - call Google Apps Script
    set({ loading: true, error: null, data: null })

    google.script.run
      .withSuccessHandler((result) => {
        if (result && result.success) {
          set({ data: result, loading: false })
        } else {
          set({ error: result?.error || 'Scan failed', data: null, loading: false })
        }
      })
      .withFailureHandler((err) => {
        console.error('Smart Scan error:', err)
        set({ error: err.message || 'Failed to run Smart Scan', data: null, loading: false })
      })
      .runSmartScan(folderId, corpora)
  },
}))

/**
 * Custom hook for Smart Scan functionality backed by shared Zustand store
 *
 * @returns {Object} Hook state and functions
 * @property {Object|null} data - Smart Scan results
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message if any
 * @property {Function} runScan - Function to trigger a scan
 * @property {Function} reset - Function to reset state
 */
export function useSmartScan() {
  const data = useSmartScanStore((state) => state.data)
  const loading = useSmartScanStore((state) => state.loading)
  const error = useSmartScanStore((state) => state.error)
  const runScan = useSmartScanStore((state) => state.runScan)
  const reset = useSmartScanStore((state) => state.reset)

  return {
    data,
    loading,
    error,
    runScan,
    reset,
  }
}
