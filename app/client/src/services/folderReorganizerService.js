/**
 * Folder Reorganizer Service
 * Interacts with Google Apps Script FolderReorganizer endpoints via google.script.run,
 * with local development simulation.
 */

export const folderReorganizerService = {
  /**
   * Analyze folder structure and compute health metrics
   * @param {string} [rootFolderId='root']
   * @returns {Promise<Object>} Analysis report
   */
  analyzeStructure: (rootFolderId = 'root') => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to analyze folder structure'))
          })
          .withFailureHandler((err) => {
            console.error('GAS analyzeFolderStructure error:', err)
            reject(err)
          })
          .analyzeFolderStructure(rootFolderId)
      } else {
        console.log('[Dev Simulation] Analyzing folder structure for root:', rootFolderId)
        setTimeout(() => {
          resolve({
            success: true,
            healthScore: 58,
            rating: 'Needs Tidy',
            metrics: {
              totalFolders: 24,
              totalFiles: 186,
              maxDepth: 7,
              orphanedRootFiles: 34,
              genericFolderCount: 4,
              emptyFoldersCount: 3
            },
            genericFolders: [
              { id: 'gen_1', name: 'New Folder (2)', path: 'My Drive / New Folder (2)' },
              { id: 'gen_2', name: 'Untitled folder', path: 'Work / Untitled folder' },
              { id: 'gen_3', name: 'Random stuff', path: 'My Drive / Random stuff' }
            ],
            currentTree: {
              rootId: 'root',
              rootName: 'My Drive',
              rootFilesCount: 34,
              totalFoldersCount: 5,
              folders: [
                {
                  id: 'f_work',
                  name: 'Work',
                  depth: 1,
                  isGeneric: false,
                  children: [
                    { id: 'f_clients', name: 'Clients', depth: 2, isGeneric: false, children: [] },
                    { id: 'f_projects', name: 'Projects', depth: 2, isGeneric: false, children: [] }
                  ]
                },
                {
                  id: 'f_personal',
                  name: 'Personal',
                  depth: 1,
                  isGeneric: false,
                  children: [
                    { id: 'f_finance', name: 'Finance', depth: 2, isGeneric: false, children: [] }
                  ]
                },
                {
                  id: 'f_gen1',
                  name: 'New Folder (2)',
                  depth: 1,
                  isGeneric: true,
                  children: []
                }
              ]
            },
            clusters: [
              {
                id: 'cluster_acme_corp',
                name: 'Acme Corp Client Deliverables',
                confidence: 94,
                fileCount: 42,
                suggestedPath: 'Work/Clients/Acme Corp',
                keywords: ['acme', 'contract', 'proposal', 'brief'],
                currentLocations: ['My Drive root', 'Documents/Acme', 'New Folder (2)'],
                sampleFiles: ['Acme Master Contract 2024.pdf', 'Q3 Deliverables Brief.docx', 'Pricing Proposal.xlsx']
              },
              {
                id: 'cluster_root_orphans',
                name: 'Root Orphaned Drafts & Notes',
                confidence: 88,
                fileCount: 34,
                suggestedPath: 'Work/Projects/Active',
                keywords: ['notes', 'draft', 'scratchpad', 'meeting'],
                currentLocations: ['My Drive root'],
                sampleFiles: ['Meeting Notes - Strategy.gdoc', 'Q4 Roadmap Brainstorm.gdoc', 'Design Ideas.png']
              },
              {
                id: 'cluster_personal_finances',
                name: 'Personal Finance & Tax Docs',
                confidence: 91,
                fileCount: 26,
                suggestedPath: 'Personal/Finance',
                keywords: ['tax', 'receipt', 'invoice', 'statement'],
                currentLocations: ['Downloads folder', 'Documents/Old'],
                sampleFiles: ['2023 Tax Return.pdf', 'Mortgage Statement.pdf', 'Medical Insurance Receipt.pdf']
              },
              {
                id: 'cluster_media_assets',
                name: 'High-Res Assets & Screen Recordings',
                confidence: 92,
                fileCount: 38,
                suggestedPath: 'Media & Assets',
                keywords: ['banner', 'hero', 'recording', 'screenshot'],
                currentLocations: ['My Drive root', 'Random stuff'],
                sampleFiles: ['Product Demo v2.mp4', 'Hero Banner 4k.png', 'Logo Pack Vector.svg']
              }
            ],
            proposedStructure: [
              {
                path: 'Work',
                icon: 'briefcase',
                description: 'Client deliverables, company operations, and projects',
                children: [
                  { path: 'Work/Clients/Acme Corp', count: 42, sampleFiles: ['Acme Master Contract 2024.pdf', 'Pricing Proposal.xlsx'] },
                  { path: 'Work/Projects/Active', count: 34, sampleFiles: ['Meeting Notes - Strategy.gdoc', 'Q4 Roadmap Brainstorm.gdoc'] },
                  { path: 'Work/Operations', count: 18, sampleFiles: ['Team Handbook.pdf', 'Onboarding Checklist.gsheet'] }
                ]
              },
              {
                path: 'Personal',
                icon: 'user',
                description: 'Personal documents, travels, and receipts',
                children: [
                  { path: 'Personal/Finance', count: 26, sampleFiles: ['2023 Tax Return.pdf', 'Mortgage Statement.pdf'] },
                  { path: 'Personal/Travel', count: 14, sampleFiles: ['Boarding Pass.pdf', 'Hotel Booking.pdf'] }
                ]
              },
              {
                path: 'Media & Assets',
                icon: 'image',
                description: 'High-resolution images, recordings, and videos',
                children: [
                  { path: 'Media & Assets/Photos', count: 28, sampleFiles: ['Hero Banner 4k.png', 'Logo Pack Vector.svg'] },
                  { path: 'Media & Assets/Recordings', count: 10, sampleFiles: ['Product Demo v2.mp4'] }
                ]
              },
              {
                path: 'Archive',
                icon: 'archive',
                description: 'Completed projects and inactive files (organized by year)',
                children: [
                  { path: 'Archive/2023', count: 52, sampleFiles: ['Old Brand Guidelines.pdf'] },
                  { path: 'Archive/2022', count: 36, sampleFiles: ['Legacy System Docs.gdoc'] }
                ]
              }
            ]
          })
        }, 600)
      }
    })
  },

  /**
   * Execute a reorganization plan
   * @param {Object} plan - { moves: [{ fileId, targetPath }] }
   * @returns {Promise<Object>} Result
   */
  executePlan: (plan) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to execute reorganization plan'))
          })
          .withFailureHandler((err) => {
            console.error('GAS executeFolderReorganization error:', err)
            reject(err)
          })
          .executeFolderReorganization(plan)
      } else {
        console.log('[Dev Simulation] Executing reorganization plan:', plan)
        setTimeout(() => {
          resolve({
            success: true,
            movedCount: plan?.moves?.length || 42,
            failedCount: 0,
            restorePointId: 'reorg_sim_' + Date.now(),
            errors: []
          })
        }, 800)
      }
    })
  },

  /**
   * Restore reorganization to pre-move locations
   * @param {string} restorePointId
   * @returns {Promise<Object>} Result
   */
  restorePlan: (restorePointId) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to restore reorganization'))
          })
          .withFailureHandler((err) => {
            console.error('GAS restoreFolderReorganization error:', err)
            reject(err)
          })
          .restoreFolderReorganization(restorePointId)
      } else {
        console.log('[Dev Simulation] Restoring reorganization point:', restorePointId)
        setTimeout(() => {
          resolve({
            success: true,
            restoredCount: 42,
            failedCount: 0,
            errors: []
          })
        }, 600)
      }
    })
  }
}

export default folderReorganizerService
