/**
 * Security & Permissions Audit Service
 *
 * Bridges to Google Apps Script SecurityAuditManager via google.script.run,
 * with comprehensive local development simulation and live remediation feedback.
 */

let MOCK_SECURITY_ITEMS = [
  {
    fileId: 'sec_file_01',
    id: 'sec_file_01',
    title: 'API_Secret_Keys_Production_Credentials.json',
    fileName: 'API_Secret_Keys_Production_Credentials.json',
    mimeType: 'application/json',
    sizeBytes: 14500,
    modifiedDate: '2024-03-10T11:20:00Z',
    createdDate: '2024-01-15T09:00:00Z',
    daysSinceModified: 190,
    ownerNames: 'You',
    driveLink: 'https://drive.google.com/file/d/sec_file_01/view',
    isPublic: true,
    hasExternalShares: true,
    externalDomains: ['consulting-agency.com', 'freelance-dev.io'],
    isStaleShare: true,
    isSensitive: true,
    sensitiveKeyword: 'secret',
    riskSeverity: 'critical',
    collaborators: [
      {
        permissionId: 'perm_anyone_01',
        name: 'Anyone with the link',
        email: '',
        role: 'reader',
        type: 'anyone',
        isExternal: true
      },
      {
        permissionId: 'perm_ext_01',
        name: 'Dev Contractor (contractor@freelance-dev.io)',
        email: 'contractor@freelance-dev.io',
        role: 'writer',
        type: 'user',
        isExternal: true
      }
    ]
  },
  {
    fileId: 'sec_file_02',
    id: 'sec_file_02',
    title: 'Q3_Investor_Financial_Projections_Final.xlsx',
    fileName: 'Q3_Investor_Financial_Projections_Final.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeBytes: 4200000,
    modifiedDate: '2024-02-18T16:45:00Z',
    createdDate: '2024-02-01T10:30:00Z',
    daysSinceModified: 212,
    ownerNames: 'You',
    driveLink: 'https://drive.google.com/file/d/sec_file_02/view',
    isPublic: true,
    hasExternalShares: true,
    externalDomains: ['venturecapital-partners.com'],
    isStaleShare: true,
    isSensitive: true,
    sensitiveKeyword: 'financial',
    riskSeverity: 'critical',
    collaborators: [
      {
        permissionId: 'perm_anyone_02',
        name: 'Anyone with the link',
        email: '',
        role: 'reader',
        type: 'anyone',
        isExternal: true
      },
      {
        permissionId: 'perm_ext_02',
        name: 'Partner (investor@venturecapital-partners.com)',
        email: 'investor@venturecapital-partners.com',
        role: 'writer',
        type: 'user',
        isExternal: true
      }
    ]
  },
  {
    fileId: 'sec_file_03',
    id: 'sec_file_03',
    title: 'Client_Master_Services_Agreement_NDA_Signed.pdf',
    fileName: 'Client_Master_Services_Agreement_NDA_Signed.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 890000,
    modifiedDate: '2023-11-20T14:10:00Z',
    createdDate: '2023-11-15T08:00:00Z',
    daysSinceModified: 300,
    ownerNames: 'You',
    driveLink: 'https://drive.google.com/file/d/sec_file_03/view',
    isPublic: true,
    hasExternalShares: false,
    externalDomains: [],
    isStaleShare: true,
    isSensitive: true,
    sensitiveKeyword: 'nda',
    riskSeverity: 'critical',
    collaborators: [
      {
        permissionId: 'perm_anyone_03',
        name: 'Anyone with the link',
        email: '',
        role: 'reader',
        type: 'anyone',
        isExternal: true
      }
    ]
  },
  {
    fileId: 'sec_file_04',
    id: 'sec_file_04',
    title: 'Brand_Identity_Guidelines_2024.pdf',
    fileName: 'Brand_Identity_Guidelines_2024.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 18500000,
    modifiedDate: '2024-04-05T12:00:00Z',
    createdDate: '2024-03-20T14:00:00Z',
    daysSinceModified: 164,
    ownerNames: 'You',
    driveLink: 'https://drive.google.com/file/d/sec_file_04/view',
    isPublic: false,
    hasExternalShares: true,
    externalDomains: ['creative-agency.co'],
    isStaleShare: false,
    isSensitive: false,
    sensitiveKeyword: null,
    riskSeverity: 'medium',
    collaborators: [
      {
        permissionId: 'perm_ext_04',
        name: 'Designer (lead@creative-agency.co)',
        email: 'lead@creative-agency.co',
        role: 'writer',
        type: 'user',
        isExternal: true
      }
    ]
  },
  {
    fileId: 'sec_file_05',
    id: 'sec_file_05',
    title: 'Employee_Compensation_and_Salary_Review_2023.xlsx',
    fileName: 'Employee_Compensation_and_Salary_Review_2023.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeBytes: 1200000,
    modifiedDate: '2023-12-15T15:30:00Z',
    createdDate: '2023-12-01T09:00:00Z',
    daysSinceModified: 275,
    ownerNames: 'You',
    driveLink: 'https://drive.google.com/file/d/sec_file_05/view',
    isPublic: false,
    hasExternalShares: true,
    externalDomains: ['consulting-agency.com'],
    isStaleShare: true,
    isSensitive: true,
    sensitiveKeyword: 'salary',
    riskSeverity: 'high',
    collaborators: [
      {
        permissionId: 'perm_ext_05',
        name: 'Auditor (payroll@consulting-agency.com)',
        email: 'payroll@consulting-agency.com',
        role: 'reader',
        type: 'user',
        isExternal: true
      }
    ]
  },
  {
    fileId: 'sec_file_06',
    id: 'sec_file_06',
    title: 'Product_Architecture_Whitepaper_Draft.docx',
    fileName: 'Product_Architecture_Whitepaper_Draft.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sizeBytes: 640000,
    modifiedDate: '2024-05-10T18:00:00Z',
    createdDate: '2024-05-01T11:00:00Z',
    daysSinceModified: 129,
    ownerNames: 'You',
    driveLink: 'https://drive.google.com/file/d/sec_file_06/view',
    isPublic: false,
    hasExternalShares: true,
    externalDomains: ['consulting-agency.com'],
    isStaleShare: false,
    isSensitive: false,
    sensitiveKeyword: null,
    riskSeverity: 'low',
    collaborators: [
      {
        permissionId: 'perm_ext_06',
        name: 'Technical Advisor (advisor@consulting-agency.com)',
        email: 'advisor@consulting-agency.com',
        role: 'reader',
        type: 'user',
        isExternal: true
      }
    ]
  }
]

function recalculateMockScore(items) {
  const publicLinks = items.filter((i) => i.isPublic)
  const sensitiveFiles = items.filter((i) => i.isSensitive)
  const externalShares = items.filter((i) => i.hasExternalShares)
  const staleShares = items.filter((i) => i.isStaleShare)

  const publicPenalty = Math.min(45, publicLinks.length * 15)
  const sensitivePenalty = Math.min(30, sensitiveFiles.length * 10)
  const externalPenalty = Math.min(20, externalShares.length * 5)
  const stalePenalty = Math.min(15, staleShares.length * 3)

  const totalPenalties = publicPenalty + sensitivePenalty + externalPenalty + stalePenalty
  const securityHealthScore = Math.max(10, 100 - totalPenalties)

  let riskRating = 'Hardened'
  if (securityHealthScore < 50) {
    riskRating = 'Critical Risk'
  } else if (securityHealthScore < 75) {
    riskRating = 'Moderate Risk'
  } else if (securityHealthScore < 90) {
    riskRating = 'Good'
  }

  // Domain breakdown
  const domainMap = {}
  externalShares.forEach((item) => {
    ;(item.externalDomains || []).forEach((dom) => {
      if (!domainMap[dom]) {
        domainMap[dom] = { domain: dom, count: 0, fileIds: [] }
      }
      domainMap[dom].count++
      domainMap[dom].fileIds.push(item.fileId)
    })
  })

  const domainBreakdown = Object.values(domainMap).sort((a, b) => b.count - a.count)

  return {
    success: true,
    securityHealthScore,
    riskRating,
    primaryDomain: 'andyedwards.uk',
    summary: {
      totalSharedFiles: items.length,
      publicLinkCount: publicLinks.length,
      externalDomainCount: domainBreakdown.length,
      externalFilesCount: externalShares.length,
      staleShareCount: staleShares.length,
      sensitiveFileCount: sensitiveFiles.length
    },
    domainBreakdown,
    publicLinks,
    externalDomainShares: externalShares,
    staleCollaborators: staleShares,
    sensitiveFiles,
    allShared: items
  }
}

export const securityAuditService = {
  /**
   * Scans and audits sharing and security permissions
   * @param {Object} [params] - { rootFolderId, corpora }
   * @returns {Promise<Object>}
   */
  auditSecurityPermissions: (params = {}) => {
    return new Promise((resolve, reject) => {
      const rootFolderId = params.rootFolderId || 'root'
      const corpora = params.corpora || 'user'

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              reject(new Error(response?.error || 'Failed to audit security permissions'))
            }
          })
          .withFailureHandler((err) => {
            console.error('GAS auditSecurityPermissions error:', err)
            reject(err)
          })
          .auditSecurityPermissions(JSON.stringify({ rootFolderId, corpora }))
      } else {
        // Local Vite Dev Simulation
        console.log('[Dev Simulation] Auditing security permissions for:', { rootFolderId, corpora })
        setTimeout(() => {
          resolve(recalculateMockScore(MOCK_SECURITY_ITEMS))
        }, 400)
      }
    })
  },

  /**
   * Revokes public link access on a single file
   * @param {string} fileId
   * @returns {Promise<Object>}
   */
  revokePublicAccess: (fileId) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              reject(new Error(response?.error || 'Failed to revoke public access'))
            }
          })
          .withFailureHandler(reject)
          .revokePublicAccess(fileId)
      } else {
        console.log('[Dev Simulation] Revoking public access for:', fileId)
        MOCK_SECURITY_ITEMS = MOCK_SECURITY_ITEMS.map((item) => {
          if (item.fileId === fileId) {
            return {
              ...item,
              isPublic: false,
              collaborators: item.collaborators.filter((c) => c.type !== 'anyone'),
              riskSeverity: item.hasExternalShares ? (item.isSensitive ? 'high' : 'medium') : 'low'
            }
          }
          return item
        })
        setTimeout(() => {
          resolve({ success: true, fileId })
        }, 300)
      }
    })
  },

  /**
   * Bulk revokes public access across multiple files
   * @param {Array<string>} fileIds
   * @returns {Promise<Object>}
   */
  bulkRevokePublicAccess: (fileIds) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              reject(new Error(response?.error || 'Failed to bulk revoke public access'))
            }
          })
          .withFailureHandler(reject)
          .bulkRevokePublicAccess(fileIds)
      } else {
        console.log('[Dev Simulation] Bulk revoking public access for:', fileIds)
        const idSet = new Set(fileIds)
        MOCK_SECURITY_ITEMS = MOCK_SECURITY_ITEMS.map((item) => {
          if (idSet.has(item.fileId)) {
            return {
              ...item,
              isPublic: false,
              collaborators: item.collaborators.filter((c) => c.type !== 'anyone'),
              riskSeverity: item.hasExternalShares ? (item.isSensitive ? 'high' : 'medium') : 'low'
            }
          }
          return item
        })
        setTimeout(() => {
          resolve({ success: true, successCount: fileIds.length, failedCount: 0 })
        }, 400)
      }
    })
  },

  /**
   * Revokes a specific collaborator permission
   * @param {string} fileId
   * @param {string} permissionId
   * @returns {Promise<Object>}
   */
  revokeCollaboratorAccess: (fileId, permissionId) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .revokeCollaboratorAccess({ fileId, permissionId })
      } else {
        console.log('[Dev Simulation] Revoking collaborator access:', { fileId, permissionId })
        MOCK_SECURITY_ITEMS = MOCK_SECURITY_ITEMS.map((item) => {
          if (item.fileId === fileId) {
            const updatedCollabs = item.collaborators.filter((c) => c.permissionId !== permissionId)
            const extDomains = new Set(
              updatedCollabs
                .filter((c) => c.isExternal && c.email)
                .map((c) => c.email.split('@')[1])
            )
            return {
              ...item,
              collaborators: updatedCollabs,
              hasExternalShares: extDomains.size > 0,
              externalDomains: Array.from(extDomains)
            }
          }
          return item
        })
        setTimeout(() => {
          resolve({ success: true, fileId, permissionId })
        }, 300)
      }
    })
  },

  /**
   * Bulk revokes all shares matching a specific domain
   * @param {string} domain
   * @param {Array<string>} fileIds
   * @returns {Promise<Object>}
   */
  bulkRevokeDomainAccess: (domain, fileIds) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .bulkRevokeDomainAccess({ domain, fileIds })
      } else {
        console.log('[Dev Simulation] Bulk revoking domain access for:', domain)
        const idSet = new Set(fileIds)
        MOCK_SECURITY_ITEMS = MOCK_SECURITY_ITEMS.map((item) => {
          if (idSet.has(item.fileId)) {
            const updatedCollabs = item.collaborators.filter(
              (c) => !(c.email && c.email.endsWith('@' + domain))
            )
            const extDomains = new Set(
              updatedCollabs
                .filter((c) => c.isExternal && c.email)
                .map((c) => c.email.split('@')[1])
            )
            return {
              ...item,
              collaborators: updatedCollabs,
              hasExternalShares: extDomains.size > 0,
              externalDomains: Array.from(extDomains)
            }
          }
          return item
        })
        setTimeout(() => {
          resolve({ success: true, domain, revokedCount: fileIds.length })
        }, 400)
      }
    })
  },

  /**
   * Downgrades editor permission to reader (viewer)
   * @param {string} fileId
   * @param {string} permissionId
   * @returns {Promise<Object>}
   */
  downgradeEditorToViewer: (fileId, permissionId) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
          .downgradeEditorToViewer({ fileId, permissionId })
      } else {
        console.log('[Dev Simulation] Downgrading editor to viewer:', { fileId, permissionId })
        MOCK_SECURITY_ITEMS = MOCK_SECURITY_ITEMS.map((item) => {
          if (item.fileId === fileId) {
            const updatedCollabs = item.collaborators.map((c) => {
              if (c.permissionId === permissionId) {
                return { ...c, role: 'reader' }
              }
              return c
            })
            return { ...item, collaborators: updatedCollabs }
          }
          return item
        })
        setTimeout(() => {
          resolve({ success: true, fileId, permissionId, newRole: 'reader' })
        }, 300)
      }
    })
  }
}
