/**
 * Shared Drives (Team Drive) Service
 * Interacts with Google Apps Script SharedDrivesManager via google.script.run,
 * with comprehensive local development simulation.
 */

const MOCK_SHARED_DRIVES = [
  {
    id: 'teamdrive_marketing_01',
    name: 'Marketing & Brand Assets',
    createdDate: '2023-01-15T09:30:00Z',
    hygieneScore: 68,
    fileCount: 420,
    folderCount: 38,
    totalBytes: 84.5 * 1024 * 1024 * 1024, // 84.5 GB
    daysSinceLastActive: 3,
    isDormant: false,
    riskFlags: {
      externalExposureCount: 8,
      staleLargeFileCount: 14,
      isDormant: false
    },
    capabilities: { canManageMembers: true, canDeleteDrive: false }
  },
  {
    id: 'teamdrive_engineering_02',
    name: 'Engineering & Architecture Vault',
    createdDate: '2022-06-10T14:20:00Z',
    hygieneScore: 92,
    fileCount: 890,
    folderCount: 64,
    totalBytes: 142.2 * 1024 * 1024 * 1024, // 142.2 GB
    daysSinceLastActive: 1,
    isDormant: false,
    riskFlags: {
      externalExposureCount: 0,
      staleLargeFileCount: 5,
      isDormant: false
    },
    capabilities: { canManageMembers: true, canDeleteDrive: false }
  },
  {
    id: 'teamdrive_legal_03',
    name: 'Legal & M&A Compliance Archive',
    createdDate: '2021-03-22T11:15:00Z',
    hygieneScore: 48,
    fileCount: 184,
    folderCount: 16,
    totalBytes: 31.8 * 1024 * 1024 * 1024, // 31.8 GB
    daysSinceLastActive: 210,
    isDormant: true,
    riskFlags: {
      externalExposureCount: 3,
      staleLargeFileCount: 9,
      isDormant: true
    },
    capabilities: { canManageMembers: false, canDeleteDrive: false }
  },
  {
    id: 'teamdrive_dormant_04',
    name: 'Old Product Backups [2022]',
    createdDate: '2020-08-04T16:45:00Z',
    hygieneScore: 35,
    fileCount: 76,
    folderCount: 9,
    totalBytes: 98.4 * 1024 * 1024 * 1024, // 98.4 GB
    daysSinceLastActive: 380,
    isDormant: true,
    riskFlags: {
      externalExposureCount: 1,
      staleLargeFileCount: 28,
      isDormant: true
    },
    capabilities: { canManageMembers: true, canDeleteDrive: true }
  },
  {
    id: 'teamdrive_sales_05',
    name: 'Customer Success & Deliverables',
    createdDate: '2023-10-01T08:00:00Z',
    hygieneScore: 84,
    fileCount: 310,
    folderCount: 25,
    totalBytes: 24.6 * 1024 * 1024 * 1024, // 24.6 GB
    daysSinceLastActive: 2,
    isDormant: false,
    riskFlags: {
      externalExposureCount: 4,
      staleLargeFileCount: 2,
      isDormant: false
    },
    capabilities: { canManageMembers: true, canDeleteDrive: false }
  }
]

const MOCK_AUDIT_DATA = {
  teamdrive_marketing_01: {
    success: true,
    driveId: 'teamdrive_marketing_01',
    hygieneScore: 68,
    summary: {
      fileCount: 420,
      folderCount: 38,
      totalBytes: 84.5 * 1024 * 1024 * 1024,
      daysSinceLastActive: 3,
      isDormant: false
    },
    riskFlags: {
      externalExposureCount: 8,
      staleLargeFileCount: 14,
      isDormant: false
    },
    categories: {
      Videos: 46.2 * 1024 * 1024 * 1024,
      Images: 22.8 * 1024 * 1024 * 1024,
      PDFs: 8.5 * 1024 * 1024 * 1024,
      Presentations: 4.8 * 1024 * 1024 * 1024,
      Documents: 2.2 * 1024 * 1024 * 1024
    },
    externalExposureFiles: [
      {
        id: 'mock_ext_01',
        name: 'Q3_Keynote_Showreel_2024_4K.mp4',
        sizeBytes: 1.8 * 1024 * 1024 * 1024,
        mimeType: 'video/mp4',
        modifiedDate: '2024-08-12T14:00:00Z',
        path: '/Brand Assets/Video',
        webViewLink: 'https://drive.google.com/file/d/mock_ext_01/view',
        sharingAccess: 'Anyone with link',
        reason: 'Public link accessible without login'
      },
      {
        id: 'mock_ext_02',
        name: 'Brand_Guidelines_External_Agency_Kit.zip',
        sizeBytes: 840 * 1024 * 1024,
        mimeType: 'application/zip',
        modifiedDate: '2024-05-18T10:30:00Z',
        path: '/Identity/Guidelines',
        webViewLink: 'https://drive.google.com/file/d/mock_ext_02/view',
        sharingAccess: 'Shared with agency-partner@outside.com',
        reason: 'Shared with external collaborator domain'
      },
      {
        id: 'mock_ext_03',
        name: 'Influencer_Campaign_Contract_Templates.docx',
        sizeBytes: 14 * 1024 * 1024,
        mimeType: 'application/vnd.google-apps.document',
        modifiedDate: '2024-03-20T09:15:00Z',
        path: '/Campaigns/Contracts',
        webViewLink: 'https://drive.google.com/file/d/mock_ext_03/view',
        sharingAccess: 'Public link (View only)',
        reason: 'Public link active for confidential templates'
      }
    ],
    staleLargeFiles: [
      {
        id: 'mock_stale_01',
        name: 'Raw_Product_Photoshoot_RAW_Dump.tar.gz',
        sizeBytes: 6.4 * 1024 * 1024 * 1024,
        mimeType: 'application/gzip',
        modifiedDate: '2023-04-10T12:00:00Z',
        path: '/Archive/Raw Photos',
        webViewLink: 'https://drive.google.com/file/d/mock_stale_01/view',
        ageDays: 524,
        reason: 'Untouched for 524 days, candidate for cold storage'
      },
      {
        id: 'mock_stale_02',
        name: 'Annual_Summit_B-Roll_Footage_2023.mov',
        sizeBytes: 4.8 * 1024 * 1024 * 1024,
        mimeType: 'video/quicktime',
        modifiedDate: '2023-07-22T18:00:00Z',
        path: '/Events/2023 Summit',
        webViewLink: 'https://drive.google.com/file/d/mock_stale_02/view',
        ageDays: 421,
        reason: 'Untouched for 421 days, candidate for archival'
      }
    ],
    auditedAt: new Date().toISOString()
  }
}

export const sharedDrivesService = {
  /**
   * Fetch accessible Google Workspace Shared Drives
   * @returns {Promise<Object>} { success: boolean, sharedDrives: Array, isWorkspace: boolean }
   */
  getSharedDrivesList: () => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to get Shared Drives'))
          })
          .withFailureHandler((err) => {
            console.error('GAS getSharedDrivesList error:', err)
            reject(err)
          })
          .getSharedDrivesList()
      } else {
        console.log('[Dev Simulation] Fetching Shared Drives list')
        setTimeout(() => {
          resolve({
            success: true,
            sharedDrives: MOCK_SHARED_DRIVES,
            isWorkspace: true,
            count: MOCK_SHARED_DRIVES.length
          })
        }, 300)
      }
    })
  },

  /**
   * Run a deep hygiene audit on a Shared Drive
   * @param {string} driveId
   * @returns {Promise<Object>} Detailed audit report
   */
  auditSharedDrive: (driveId) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to audit Shared Drive'))
          })
          .withFailureHandler((err) => {
            console.error('GAS auditSharedDrive error:', err)
            reject(err)
          })
          .auditSharedDrive(driveId)
      } else {
        console.log('[Dev Simulation] Auditing Shared Drive:', driveId)
        setTimeout(() => {
          const audit = MOCK_AUDIT_DATA[driveId] || {
            success: true,
            driveId: driveId,
            hygieneScore: 78,
            summary: {
              fileCount: 240,
              folderCount: 18,
              totalBytes: 36 * 1024 * 1024 * 1024,
              daysSinceLastActive: 45,
              isDormant: false
            },
            riskFlags: {
              externalExposureCount: 2,
              staleLargeFileCount: 4,
              isDormant: false
            },
            categories: {
              Documents: 18 * 1024 * 1024 * 1024,
              Spreadsheets: 12 * 1024 * 1024 * 1024,
              PDFs: 6 * 1024 * 1024 * 1024
            },
            externalExposureFiles: [
              {
                id: 'mock_gen_ext_1',
                name: 'Financial_Forecast_External_Consultant.xlsx',
                sizeBytes: 18 * 1024 * 1024,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                modifiedDate: '2024-06-11T11:00:00Z',
                path: '/Finance/Consulting',
                webViewLink: 'https://drive.google.com/file/d/mock_gen_ext_1/view',
                sharingAccess: 'External user access',
                reason: 'Shared with external domain'
              }
            ],
            staleLargeFiles: [
              {
                id: 'mock_gen_stale_1',
                name: 'System_Log_Database_Snapshot.tar',
                sizeBytes: 2.1 * 1024 * 1024 * 1024,
                mimeType: 'application/x-tar',
                modifiedDate: '2023-05-14T09:00:00Z',
                path: '/Backups',
                webViewLink: 'https://drive.google.com/file/d/mock_gen_stale_1/view',
                ageDays: 489,
                reason: 'Untouched for 489 days'
              }
            ],
            auditedAt: new Date().toISOString()
          }
          resolve(audit)
        }, 400)
      }
    })
  }
}
