/**
 * Trash Lifecycle & Permanent Purge Governance Service
 *
 * Bridges to Google Apps Script TrashGovernanceManager via google.script.run,
 * with comprehensive local development simulation and live remediation feedback.
 */

// Helper to format file sizes
function formatBytes(bytes) {
  if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initial realistic mock data for local development
let MOCK_TRASH_FILES = [
  {
    id: 'trash_01',
    title: 'Drone_Footage_Cornwall_Coast_4K_Raw.mov',
    mimeType: 'video/quicktime',
    category: 'video',
    fileSize: 2576980377, // 2.40 GB
    fileSizeFormatted: '2.40 GB',
    createdDate: '2024-05-10T14:20:00Z',
    modifiedDate: '2024-05-12T18:30:00Z',
    trashedDate: new Date(Date.now() - (26 * 24 * 60 * 60 * 1000)).toISOString(), // 26 days ago -> 4 days left
    daysInTrash: 26,
    daysRemaining: 4,
    urgencyTier: 'critical',
    isAccidentalCandidate: false,
    alternateLink: 'https://drive.google.com/file/d/trash_01/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_02',
    title: 'Customer_Acquisition_Financial_Model_2024.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: 'spreadsheet',
    fileSize: 18450000, // 17.60 MB
    fileSizeFormatted: '17.60 MB',
    createdDate: '2024-04-02T10:15:00Z',
    modifiedDate: '2024-06-01T09:40:00Z',
    trashedDate: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString(), // 1 day ago -> 29 days left
    daysInTrash: 1,
    daysRemaining: 29,
    urgencyTier: 'fresh',
    isAccidentalCandidate: true, // Accidental candidate: spreadsheet trashed yesterday!
    alternateLink: 'https://drive.google.com/file/d/trash_02/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_03',
    title: 'Company_Internal_Infrastructure_Backup_2024.zip',
    mimeType: 'application/zip',
    category: 'archive',
    fileSize: 1420000000, // 1.32 GB
    fileSizeFormatted: '1.32 GB',
    createdDate: '2024-01-20T08:00:00Z',
    modifiedDate: '2024-01-20T08:00:00Z',
    trashedDate: new Date(Date.now() - (28 * 24 * 60 * 60 * 1000)).toISOString(), // 28 days ago -> 2 days left
    daysInTrash: 28,
    daysRemaining: 2,
    urgencyTier: 'critical',
    isAccidentalCandidate: false,
    alternateLink: 'https://drive.google.com/file/d/trash_03/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_04',
    title: 'Product_Launch_Keynote_Deck_Q3.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    category: 'presentation',
    fileSize: 48500000, // 46.25 MB
    fileSizeFormatted: '46.25 MB',
    createdDate: '2024-05-18T16:00:00Z',
    modifiedDate: '2024-05-25T11:20:00Z',
    trashedDate: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(), // 2 days ago -> 28 days left
    daysInTrash: 2,
    daysRemaining: 28,
    urgencyTier: 'fresh',
    isAccidentalCandidate: true, // Keynote deck trashed 2 days ago
    alternateLink: 'https://drive.google.com/file/d/trash_04/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_05',
    title: 'Client_Consulting_Contract_Signed_2023.pdf',
    mimeType: 'application/pdf',
    category: 'document',
    fileSize: 6800000, // 6.48 MB
    fileSizeFormatted: '6.48 MB',
    createdDate: '2023-11-10T12:00:00Z',
    modifiedDate: '2023-11-15T15:30:00Z',
    trashedDate: new Date(Date.now() - (18 * 24 * 60 * 60 * 1000)).toISOString(), // 18 days ago -> 12 days left
    daysInTrash: 18,
    daysRemaining: 12,
    urgencyTier: 'approaching',
    isAccidentalCandidate: false,
    alternateLink: 'https://drive.google.com/file/d/trash_05/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_06',
    title: 'Screen_Recording_Architecture_Walkthrough_2024-04-18.mp4',
    mimeType: 'video/mp4',
    category: 'video',
    fileSize: 890000000, // 848.77 MB
    fileSizeFormatted: '848.77 MB',
    createdDate: '2024-04-18T09:00:00Z',
    modifiedDate: '2024-04-18T10:15:00Z',
    trashedDate: new Date(Date.now() - (25 * 24 * 60 * 60 * 1000)).toISOString(), // 25 days ago -> 5 days left
    daysInTrash: 25,
    daysRemaining: 5,
    urgencyTier: 'critical',
    isAccidentalCandidate: false,
    alternateLink: 'https://drive.google.com/file/d/trash_06/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_07',
    title: 'Brand_Identity_Vector_Logos_Master.zip',
    mimeType: 'application/zip',
    category: 'archive',
    fileSize: 125000000, // 119.21 MB
    fileSizeFormatted: '119.21 MB',
    createdDate: '2024-02-14T11:00:00Z',
    modifiedDate: '2024-02-14T11:00:00Z',
    trashedDate: new Date(Date.now() - (12 * 24 * 60 * 60 * 1000)).toISOString(), // 12 days ago -> 18 days left
    daysInTrash: 12,
    daysRemaining: 18,
    urgencyTier: 'midway',
    isAccidentalCandidate: false,
    alternateLink: 'https://drive.google.com/file/d/trash_07/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_08',
    title: 'Executive_Board_Meeting_Audio_Transcript.wav',
    mimeType: 'audio/wav',
    category: 'audio',
    fileSize: 340000000, // 324.25 MB
    fileSizeFormatted: '324.25 MB',
    createdDate: '2024-03-30T17:00:00Z',
    modifiedDate: '2024-03-30T18:45:00Z',
    trashedDate: new Date(Date.now() - (27 * 24 * 60 * 60 * 1000)).toISOString(), // 27 days ago -> 3 days left
    daysInTrash: 27,
    daysRemaining: 3,
    urgencyTier: 'critical',
    isAccidentalCandidate: false,
    alternateLink: 'https://drive.google.com/file/d/trash_08/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_09',
    title: 'Q1_Tax_Receipts_And_Invoices_Scanned.pdf',
    mimeType: 'application/pdf',
    category: 'document',
    fileSize: 42000000, // 40.05 MB
    fileSizeFormatted: '40.05 MB',
    createdDate: '2024-04-05T14:30:00Z',
    modifiedDate: '2024-04-05T14:30:00Z',
    trashedDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(), // 3 days ago -> 27 days left
    daysInTrash: 3,
    daysRemaining: 27,
    urgencyTier: 'fresh',
    isAccidentalCandidate: true, // Recent tax receipt scan
    alternateLink: 'https://drive.google.com/file/d/trash_09/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_10',
    title: 'Obsolete_Node_Modules_Tarball.tar.gz',
    mimeType: 'application/gzip',
    category: 'archive',
    fileSize: 480000000, // 457.76 MB
    fileSizeFormatted: '457.76 MB',
    createdDate: '2024-02-01T08:00:00Z',
    modifiedDate: '2024-02-01T08:00:00Z',
    trashedDate: new Date(Date.now() - (16 * 24 * 60 * 60 * 1000)).toISOString(), // 16 days ago -> 14 days left
    daysInTrash: 16,
    daysRemaining: 14,
    urgencyTier: 'approaching',
    isAccidentalCandidate: false,
    alternateLink: 'https://drive.google.com/file/d/trash_10/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_11',
    title: 'Unedited_Podcast_Episode_34_Interview.flac',
    mimeType: 'audio/flac',
    category: 'audio',
    fileSize: 290000000, // 276.56 MB
    fileSizeFormatted: '276.56 MB',
    createdDate: '2024-05-02T19:00:00Z',
    modifiedDate: '2024-05-02T20:15:00Z',
    trashedDate: new Date(Date.now() - (19 * 24 * 60 * 60 * 1000)).toISOString(), // 19 days ago -> 11 days left
    daysInTrash: 19,
    daysRemaining: 11,
    urgencyTier: 'approaching',
    isAccidentalCandidate: false,
    alternateLink: 'https://drive.google.com/file/d/trash_11/view',
    thumbnailLink: null,
    ownerNames: ['You']
  },
  {
    id: 'trash_12',
    title: 'Design_System_Figma_Exports_Retina.png',
    mimeType: 'image/png',
    category: 'image',
    fileSize: 34500000, // 32.90 MB
    fileSizeFormatted: '32.90 MB',
    createdDate: '2024-05-20T11:00:00Z',
    modifiedDate: '2024-05-20T11:00:00Z',
    trashedDate: new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)).toISOString(), // 8 days ago -> 22 days left
    daysInTrash: 8,
    daysRemaining: 22,
    urgencyTier: 'fresh',
    isAccidentalCandidate: false,
    alternateLink: 'https://drive.google.com/file/d/trash_12/view',
    thumbnailLink: null,
    ownerNames: ['You']
  }
];

function buildMockOverview() {
  let totalBytes = 0;
  let criticalCount = 0;
  let approachingCount = 0;
  let midwayCount = 0;
  let freshCount = 0;
  let accidentalCandidatesCount = 0;

  const categoryCounts = {
    video: 0,
    image: 0,
    audio: 0,
    spreadsheet: 0,
    presentation: 0,
    document: 0,
    archive: 0,
    other: 0
  };

  const categoryBytes = {
    video: 0,
    image: 0,
    audio: 0,
    spreadsheet: 0,
    presentation: 0,
    document: 0,
    archive: 0,
    other: 0
  };

  for (let i = 0; i < MOCK_TRASH_FILES.length; i++) {
    const f = MOCK_TRASH_FILES[i];
    totalBytes += f.fileSize;
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
    categoryBytes[f.category] = (categoryBytes[f.category] || 0) + f.fileSize;

    if (f.urgencyTier === 'critical') criticalCount++;
    else if (f.urgencyTier === 'approaching') approachingCount++;
    else if (f.urgencyTier === 'midway') midwayCount++;
    else freshCount++;

    if (f.isAccidentalCandidate) accidentalCandidatesCount++;
  }

  return {
    success: true,
    summary: {
      totalCount: MOCK_TRASH_FILES.length,
      totalBytes: totalBytes,
      totalBytesFormatted: formatBytes(totalBytes),
      criticalCount: criticalCount,
      approachingCount: approachingCount,
      midwayCount: midwayCount,
      freshCount: freshCount,
      accidentalCandidatesCount: accidentalCandidatesCount,
      retentionPeriodDays: 30
    },
    categoryBreakdown: {
      counts: categoryCounts,
      bytes: categoryBytes,
      formattedBytes: Object.keys(categoryBytes).reduce((acc, k) => {
        acc[k] = formatBytes(categoryBytes[k]);
        return acc;
      }, {})
    },
    files: [...MOCK_TRASH_FILES]
  };
}

export const trashGovernanceService = {
  /**
   * Fetches trash lifecycle audit overview
   * @returns {Promise<Object>}
   */
  async fetchTrashOverview() {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google?.script?.run) {
        window.google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success) {
              resolve(response);
            } else {
              reject(new Error(response?.error || 'Failed to retrieve trash overview'));
            }
          })
          .withFailureHandler((err) => {
            reject(new Error(err?.message || 'Server connection failed while auditing trash'));
          })
          .getTrashGovernanceOverview();
      } else {
        // Local Vite simulation with realistic latency
        setTimeout(() => {
          resolve(buildMockOverview());
        }, 350);
      }
    });
  },

  /**
   * Restores specified files from Google Drive Trash
   * @param {Array<string>} fileIds
   * @returns {Promise<Object>}
   */
  async restoreTrashFiles(fileIds) {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google?.script?.run) {
        window.google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success) {
              resolve(response);
            } else {
              reject(new Error(response?.error || 'Failed to restore selected files'));
            }
          })
          .withFailureHandler((err) => {
            reject(new Error(err?.message || 'Server error during restore operation'));
          })
          .restoreTrashFiles(fileIds);
      } else {
        // Local simulation
        setTimeout(() => {
          const idsSet = new Set(fileIds);
          MOCK_TRASH_FILES = MOCK_TRASH_FILES.filter(f => !idsSet.has(f.id));
          resolve({
            success: true,
            restoredCount: fileIds.length,
            failedCount: 0,
            restoredIds: fileIds,
            errors: []
          });
        }, 300);
      }
    });
  },

  /**
   * Permanently and irreversibly purges specified files from Google Drive Trash
   * @param {Array<string>} fileIds
   * @returns {Promise<Object>}
   */
  async purgeTrashFilesPermanently(fileIds) {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google?.script?.run) {
        window.google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success) {
              resolve(response);
            } else {
              reject(new Error(response?.error || 'Failed to permanently purge selected files'));
            }
          })
          .withFailureHandler((err) => {
            reject(new Error(err?.message || 'Server error during permanent purge'));
          })
          .purgeTrashFilesPermanently(fileIds);
      } else {
        // Local simulation
        setTimeout(() => {
          const idsSet = new Set(fileIds);
          MOCK_TRASH_FILES = MOCK_TRASH_FILES.filter(f => !idsSet.has(f.id));
          resolve({
            success: true,
            purgedCount: fileIds.length,
            failedCount: 0,
            purgedIds: fileIds,
            errors: []
          });
        }, 300);
      }
    });
  },

  /**
   * Permanently and irreversibly empties all items in Google Drive Trash
   * @returns {Promise<Object>}
   */
  async emptyDriveTrashPermanently() {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google?.script?.run) {
        window.google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success) {
              resolve(response);
            } else {
              reject(new Error(response?.error || 'Failed to empty Google Drive Trash'));
            }
          })
          .withFailureHandler((err) => {
            reject(new Error(err?.message || 'Server error during trash emptying'));
          })
          .emptyDriveTrashPermanently();
      } else {
        // Local simulation
        setTimeout(() => {
          MOCK_TRASH_FILES = [];
          resolve({
            success: true,
            message: 'All items in Google Drive Trash permanently emptied'
          });
        }, 400);
      }
    });
  }
};
