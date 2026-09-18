import { create } from 'zustand'
import { addHistoryEvent } from '@/lib/tracking/historyStorage'

/**
 * Check if running inside Google Apps Script environment
 */
const isGAS = typeof google !== 'undefined' && google?.script?.run

const RECENT_FOLDERS_KEY = 'drive_cleaner_recent_folders'

function getSavedRecentFolders() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(RECENT_FOLDERS_KEY)
      if (raw) return JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load recent folders', e)
  }
  return [
    { id: 'root', name: 'My Drive (Root)', corpora: 'user', date: new Date().toISOString() }
  ]
}

function saveRecentFolderToStorage(folder) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const list = getSavedRecentFolders().filter((f) => f.id !== folder.id)
      const updated = [
        {
          id: folder.id,
          name: folder.name || (folder.id === 'root' ? 'My Drive (Root)' : `Folder (${folder.id.slice(0, 8)}...)`),
          corpora: folder.corpora || 'user',
          date: new Date().toISOString()
        },
        ...list
      ].slice(0, 8)
      localStorage.setItem(RECENT_FOLDERS_KEY, JSON.stringify(updated))
      return updated
    }
  } catch (e) {
    console.warn('Failed to save recent folder', e)
  }
  return []
}

/**
 * Global Zustand store for Smart Scan data
 */
export const useSmartScanStore = create((set, get) => ({
  data: null,
  loading: false,
  error: null,
  targetFolder: { id: 'root', name: 'My Drive', corpora: 'user' },
  recentFolders: getSavedRecentFolders(),

  scanProgress: null,
  stopAndAnalyze: () => {},
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTargetFolder: (folder) => set({ targetFolder: { ...get().targetFolder, ...folder } }),
  reset: () => set({ data: null, loading: false, error: null, scanProgress: null }),

  /**
   * Run Smart Scan on a folder
   * @param {string} [folderId] - Folder ID to scan (default: current targetFolder.id)
   * @param {string} [corpora] - Corpora type ('user' or 'drive')
   * @param {string} [folderName] - Optional name of folder
   */
  runScan: (folderId, corpora, folderName) => {
    const currentTarget = get().targetFolder
    const targetId = folderId || currentTarget.id || 'root'
    const targetCorpora = corpora || currentTarget.corpora || 'user'
    const resolvedName = folderName || currentTarget.name || (targetId === 'root' ? 'My Drive' : `Folder ${targetId.slice(0, 8)}...`)

    // Update target folder in store and save to recents
    set({ targetFolder: { id: targetId, name: resolvedName, corpora: targetCorpora } })
    const updatedRecents = saveRecentFolderToStorage({ id: targetId, name: resolvedName, corpora: targetCorpora })
    if (updatedRecents.length > 0) {
      set({ recentFolders: updatedRecents })
    }

    // Development mode - return mock data
    if (!isGAS) {
      set({
        loading: true,
        error: null,
        data: null,
        scanProgress: {
          isScanning: true,
          chunkIndex: 0,
          filesProcessed: 42,
          remainingFolders: 3,
          statusText: 'Simulating Smart Scan in local dev mode...'
        }
      })
      setTimeout(() => {
        set({
          data: {
            success: true,
            scan_date: new Date().toISOString(),
            folder_id: targetId,
            folder_name: resolvedName,
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
            rot_analysis: {
              count: 8,
              total_size_bytes: 382400000,
              category_name: 'Data ROT Analysis',
              category_type: 'rot_analysis',
              breakdown: {
                redundant: { count: 3, total_size_bytes: 188743680 },
                obsolete: { count: 4, total_size_bytes: 193400000 },
                trivial: { count: 4, total_size_bytes: 256320, detail: { screenshots: 2, untitled: 1, tiny_stubs: 1, temp_system: 0 } }
              },
              clutter_index: {
                score: 54,
                target: 20,
                average_age_days: 430,
                breakdown: {
                  rot_ratio: 48,
                  disorganization: 32,
                  inertia: 58,
                  data_gravity: 24
                }
              },
              hoarding_score: {
                total_score: 52,
                rating: {
                  level: 'Moderate',
                  color: 'yellow',
                  icon: 'moderate',
                  description: 'Noticeable digital clutter accumulating'
                },
                components: {
                  clutter_volume: 14,
                  disorganization: 12,
                  accumulation: 16,
                  attachment: 10
                }
              },
              freshness_distribution: {
                fresh: { count: 42, percentage: 27, label: 'Fresh', period: '0-3 months', color: 'emerald' },
                aging: { count: 28, percentage: 18, label: 'Aging', period: '3-6 months', color: 'amber' },
                stale: { count: 35, percentage: 22, label: 'Stale', period: '6-12 months', color: 'orange' },
                rotting: { count: 31, percentage: 20, label: 'Rotting', period: '12-24 months', color: 'rose' },
                decayed: { count: 20, percentage: 13, label: 'Decayed', period: '24+ months', color: 'slate' }
              },
              items: [
                {
                  file_id: 'rot1',
                  file_name: 'Budget 2023 - Final Final.xlsx',
                  mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  parent_name: 'Finance',
                  size_bytes: 48234496,
                  modified_date: '2023-03-12T14:00:00.000Z',
                  last_viewed_date: '2023-04-01T10:00:00.000Z',
                  drive_link: 'https://drive.google.com',
                  days_inactive: 530,
                  freshness_level: 'rotting',
                  rot_types: ['redundant', 'obsolete'],
                  rot_reasons: ['superseded_version', 'inactive_1yr'],
                  details: ['Superseded by newer version "Budget 2024.xlsx"', 'Inactive for 1.5 years']
                },
                {
                  file_id: 'rot2',
                  file_name: 'Company Deck v1 (copy).pptx',
                  mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  parent_name: 'Marketing',
                  size_bytes: 140509184,
                  modified_date: '2022-11-04T12:00:00.000Z',
                  last_viewed_date: '2022-11-04T12:00:00.000Z',
                  drive_link: 'https://drive.google.com',
                  days_inactive: 678,
                  freshness_level: 'rotting',
                  rot_types: ['redundant', 'obsolete'],
                  rot_reasons: ['superseded_version', 'inactive_1yr'],
                  details: ['Superseded by newer version "Company Deck v3"', 'Untouched for 1.8 years']
                },
                {
                  file_id: 'rot3',
                  file_name: 'Project Timeline 2021.pdf',
                  mime_type: 'application/pdf',
                  parent_name: 'Projects',
                  size_bytes: 18874368,
                  modified_date: '2021-06-20T08:00:00.000Z',
                  last_viewed_date: '2021-08-15T11:00:00.000Z',
                  drive_link: 'https://drive.google.com',
                  days_inactive: 1120,
                  freshness_level: 'decayed',
                  rot_types: ['obsolete'],
                  rot_reasons: ['decayed_2yr'],
                  details: ['Inactive for 3.1 years (historic completed project)']
                },
                {
                  file_id: 'rot4',
                  file_name: 'Screenshot 2023-04-12 at 14.30.22.png',
                  mime_type: 'image/png',
                  parent_name: 'Desktop Backup',
                  size_bytes: 1845000,
                  modified_date: '2023-04-12T14:30:22.000Z',
                  last_viewed_date: '2023-04-12T14:30:22.000Z',
                  drive_link: 'https://drive.google.com',
                  days_inactive: 520,
                  freshness_level: 'rotting',
                  rot_types: ['trivial', 'obsolete'],
                  rot_reasons: ['screenshot', 'inactive_1yr'],
                  details: ['Default screenshot naming pattern', 'Unopened in 1.4 years']
                },
                {
                  file_id: 'rot5',
                  file_name: 'Screenshot 2024-02-18 at 09.15.00.png',
                  mime_type: 'image/png',
                  parent_name: 'Desktop Backup',
                  size_bytes: 1250000,
                  modified_date: '2024-02-18T09:15:00.000Z',
                  last_viewed_date: '2024-02-18T09:15:00.000Z',
                  drive_link: 'https://drive.google.com',
                  days_inactive: 208,
                  freshness_level: 'stale',
                  rot_types: ['trivial'],
                  rot_reasons: ['screenshot'],
                  details: ['Default screenshot naming pattern']
                },
                {
                  file_id: 'rot6',
                  file_name: 'Untitled document',
                  mime_type: 'application/vnd.google-apps.document',
                  parent_name: 'My Drive',
                  size_bytes: 0,
                  modified_date: '2023-09-10T16:00:00.000Z',
                  last_viewed_date: '2023-09-10T16:00:00.000Z',
                  drive_link: 'https://drive.google.com',
                  days_inactive: 370,
                  freshness_level: 'rotting',
                  rot_types: ['trivial', 'obsolete'],
                  rot_reasons: ['untitled', 'inactive_1yr'],
                  details: ['Unlabelled default document name', 'Not accessed in 1.0 year']
                },
                {
                  file_id: 'rot7',
                  file_name: 'debug_output.log',
                  mime_type: 'text/plain',
                  parent_name: 'Development',
                  size_bytes: 1240,
                  modified_date: '2024-01-15T10:00:00.000Z',
                  last_viewed_date: '2024-01-15T10:00:00.000Z',
                  drive_link: 'https://drive.google.com',
                  days_inactive: 242,
                  freshness_level: 'stale',
                  rot_types: ['trivial'],
                  rot_reasons: ['tiny_stub'],
                  details: ['Tiny placeholder / log file (1.2 KB)']
                },
                {
                  file_id: 'rot8',
                  file_name: 'Annual Report 2020 Final v2.pdf',
                  mime_type: 'application/pdf',
                  parent_name: 'Reports',
                  size_bytes: 34000000,
                  modified_date: '2021-02-10T10:00:00.000Z',
                  last_viewed_date: '2021-03-01T15:00:00.000Z',
                  drive_link: 'https://drive.google.com',
                  days_inactive: 1290,
                  freshness_level: 'decayed',
                  rot_types: ['obsolete', 'redundant'],
                  rot_reasons: ['decayed_2yr', 'superseded_version'],
                  details: ['Untouched for 3.5 years', 'Multiple superseded versions exist']
                }
              ]
            },
            carbon_footprint: {
              storage_gb: 4.88,
              storage_bytes: 5242880000,
              annual_energy_kwh: 0.0005,
              annual_co2_kg: 0.244,
              annual_co2_tonnes: 0.000244,
              equivalents: {
                headline: '0.6 miles driven in a car',
                car_miles: 0.6,
                car_km: 1.0,
                smartphone_charges: 31,
                tree_years: 0.01,
                burgers: 0.1,
                laptop_hours: 12,
                coffee_cups: 5
              },
              breakdown_by_type: {
                videos: { count: 3, size_bytes: 2684354560, size_gb: 2.5, annual_co2_kg: 0.125, percentage: 51, label: 'Videos', icon: 'videos', color: 'rose' },
                photos: { count: 18, size_bytes: 1288490188, size_gb: 1.2, annual_co2_kg: 0.060, percentage: 25, label: 'Photos & Images', icon: 'photos', color: 'amber' },
                documents: { count: 45, size_bytes: 858993459, size_gb: 0.8, annual_co2_kg: 0.040, percentage: 16, label: 'Documents & Sheets', icon: 'documents', color: 'blue' },
                other: { count: 12, size_bytes: 411041792, size_gb: 0.38, annual_co2_kg: 0.019, percentage: 8, label: 'Archives & Other', icon: 'other', color: 'purple' }
              },
              potential_savings: {
                cleanup_gb: 0.88,
                cleanup_bytes: 944892800,
                co2_saved_kg: 0.044,
                energy_saved_kwh: 0.0001,
                equivalents: {
                  headline: '6 smartphone charges prevented',
                  car_miles: 0.1,
                  car_km: 0.2,
                  smartphone_charges: 6,
                  tree_years: 0.002,
                  burgers: 0.02
                }
              },
              eco_rating: {
                level: 'Eco Champion',
                color: 'emerald',
                icon: 'star',
                badge: 'Minimal Carbon Impact',
                message: 'Your cloud storage has an ultra-low carbon footprint.'
              },
              achievements: [
                {
                  id: 'sapling_saver',
                  name: 'Sapling Saver',
                  icon: 'sapling',
                  description: 'Potential to save 0.05 kg CO2 (~1 GB deleted)',
                  unlocked: false,
                  progress: 88
                },
                {
                  id: 'tree_planter',
                  name: 'Tree Planter',
                  icon: 'tree',
                  description: 'Offset equivalent of 1 tree for a year (21 kg CO2)',
                  unlocked: false,
                  progress: 5
                },
                {
                  id: 'carbon_neutral',
                  name: 'Drive Carbon Neutral',
                  icon: 'recycle',
                  description: 'Clean enough obsolete files to offset your entire annual Drive footprint',
                  unlocked: false,
                  progress: 35
                },
                {
                  id: 'forest_guardian',
                  name: 'Forest Guardian',
                  icon: 'forest',
                  description: 'Save 100 kg CO2 through comprehensive cleanup',
                  unlocked: false,
                  progress: 1
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
          scanProgress: null,
        })

        // Log scan event in history
        addHistoryEvent({
          type: 'scan',
          title: `Smart Scan Completed: ${resolvedName}`,
          folderName: resolvedName,
          filesCount: 156,
          bytesAffected: 524288000,
          status: 'success',
          details: {
            largeFilesFound: 3,
            duplicatesFound: 8,
            rotScore: 68,
          },
        })
      }, 2000)
      return
    }

    // Production mode - call Google Apps Script with chunked progressive runner
    set({
      loading: true,
      error: null,
      data: null,
      scanProgress: {
        isScanning: true,
        chunkIndex: 0,
        filesProcessed: 0,
        remainingFolders: 1,
        statusText: `Connecting to Google Drive (${resolvedName})...`
      }
    })

    let accumulatedFiles = []
    let shouldStop = false

    // Attach cancel / stop trigger to store
    get().stopAndAnalyze = () => {
      shouldStop = true
      set({
        scanProgress: {
          ...(get().scanProgress || {}),
          statusText: `Stopping scan. Finalizing analysis on ${accumulatedFiles.length} files...`
        }
      })
    }

    const finalizeAnalysis = (filesToAnalyze) => {
      set({
        scanProgress: {
          isScanning: true,
          chunkIndex: 0,
          filesProcessed: filesToAnalyze.length,
          remainingFolders: 0,
          statusText: `Synthesizing Smart Scan recommendations for ${filesToAnalyze.length} files...`
        }
      })

      google.script.run
        .withSuccessHandler((finishRes) => {
          let parsed = finishRes
          if (typeof finishRes === 'string') {
            try {
              parsed = JSON.parse(finishRes)
            } catch (e) {
              parsed = null
            }
          }
          if (parsed && parsed.success) {
            const folderName = get().targetFolder?.name || 'Drive Folder'
            const filesCount = parsed.total_files_scanned || filesToAnalyze.length
            const savings = parsed.total_potential_savings_bytes || 0

            addHistoryEvent({
              type: 'scan',
              title: `Smart Scan Completed: ${folderName}`,
              folderName: folderName,
              filesCount: filesCount,
              bytesAffected: savings,
              status: 'success',
              details: {
                largeFilesFound: parsed.large_files?.items?.length || 0,
                duplicatesFound: parsed.duplicates?.items?.length || 0,
                rotScore: parsed.rot_analysis?.clutter_index?.score || 0,
              },
            })

            set({ data: parsed, loading: false, scanProgress: null, error: null })
          } else {
            console.error('finishSmartScan failed:', parsed)
            set({ error: parsed?.error || 'Failed to finalize scan analysis', loading: false, scanProgress: null })
          }
        })
        .withFailureHandler((err) => {
          console.error('finishSmartScan error:', err)
          set({ error: err.message || 'Failed to finalize scan results', loading: false, scanProgress: null })
        })
        .finishSmartScan(JSON.stringify(filesToAnalyze), targetId, resolvedName)
    }

    const executeChunk = (chunkIndex, queue, pathLookup) => {
      const payload = {
        folderId: targetId,
        corpora: targetCorpora,
        chunkIndex: chunkIndex,
        queue: queue || null,
        pathLookup: pathLookup || null,
        timeBudgetMs: 45000
      }

      google.script.run
        .withSuccessHandler((rawChunkRes) => {
          let chunk = rawChunkRes
          if (typeof rawChunkRes === 'string') {
            try {
              chunk = JSON.parse(rawChunkRes)
            } catch (e) {
              console.error('Failed to parse chunk response', e)
              chunk = null
            }
          }

          if (!chunk || !chunk.success) {
            console.warn('Chunk returned unsuccessful result:', chunk)
            if (accumulatedFiles.length > 0) {
              finalizeAnalysis(accumulatedFiles)
            } else {
              set({ error: chunk?.error || 'Scan failed to access folder', loading: false, scanProgress: null })
            }
            return
          }

          const newFiles = chunk.files || []
          accumulatedFiles = accumulatedFiles.concat(newFiles)

          set({
            scanProgress: {
              isScanning: true,
              chunkIndex: chunkIndex + 1,
              filesProcessed: accumulatedFiles.length,
              remainingFolders: chunk.remainingFoldersCount || 0,
              statusText: `Indexed ${accumulatedFiles.length} files... (${chunk.remainingFoldersCount || 0} subfolders in queue)`
            }
          })

          // Check if scan is complete or user asked to stop
          if (chunk.isComplete || shouldStop) {
            finalizeAnalysis(accumulatedFiles)
          } else {
            // Process next chunk
            executeChunk(chunkIndex + 1, chunk.remainingQueue, chunk.pathLookup)
          }
        })
        .withFailureHandler((err) => {
          console.error(`Chunk ${chunkIndex} error:`, err)
          if (accumulatedFiles.length > 0) {
            console.log(`Finalizing analysis on ${accumulatedFiles.length} files despite chunk network error.`)
            finalizeAnalysis(accumulatedFiles)
          } else {
            set({ error: err.message || 'Failed to scan folder', loading: false, scanProgress: null })
          }
        })
        .runSmartScanChunk(JSON.stringify(payload))
    }

    // Launch initial chunk
    executeChunk(0, null, null)
  },
}))

/**
 * Custom hook for Smart Scan functionality backed by shared Zustand store
 *
 * @returns {Object} Hook state and functions
 * @property {Object|null} data - Smart Scan results
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message if any
 * @property {Object} targetFolder - Currently targeted folder ({ id, name, corpora })
 * @property {Array} recentFolders - List of recently targeted folders
 * @property {Function} setTargetFolder - Function to set target folder
 * @property {Function} runScan - Function to trigger a scan
 * @property {Function} reset - Function to reset state
 */
export function useSmartScan() {
  const data = useSmartScanStore((state) => state.data)
  const loading = useSmartScanStore((state) => state.loading)
  const error = useSmartScanStore((state) => state.error)
  const targetFolder = useSmartScanStore((state) => state.targetFolder)
  const recentFolders = useSmartScanStore((state) => state.recentFolders)
  const setTargetFolder = useSmartScanStore((state) => state.setTargetFolder)
  const runScan = useSmartScanStore((state) => state.runScan)
  const reset = useSmartScanStore((state) => state.reset)
  const scanProgress = useSmartScanStore((state) => state.scanProgress)
  const stopAndAnalyze = useSmartScanStore((state) => state.stopAndAnalyze)

  return {
    data,
    loading,
    error,
    targetFolder,
    recentFolders,
    setTargetFolder,
    runScan,
    reset,
    scanProgress,
    stopAndAnalyze,
  }
}

