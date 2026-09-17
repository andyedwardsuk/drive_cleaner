import { useState, useEffect, useCallback, useMemo } from 'react'
import { securityAuditService } from '@/services/securityAuditService'

export function useSecurityAudit() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [report, setReport] = useState({
    securityHealthScore: 100,
    riskRating: 'Hardened',
    summary: {},
    publicLinks: [],
    externalDomainShares: [],
    staleCollaborators: [],
    sensitiveFiles: [],
    allShared: [],
    domainBreakdown: []
  })

  const [activeTab, setActiveTab] = useState('public_links') // 'public_links', 'external_domains', 'stale_shares', 'sensitive_files', 'all_shared'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null)
  const [isRemediating, setIsRemediating] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await securityAuditService.auditSecurityPermissions()
      setReport(data)
    } catch (err) {
      console.error('Failed to load security audit:', err)
      setError(err.message || 'Failed to audit security permissions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const showToast = (msg) => {
    setActionSuccessMessage(msg)
    setTimeout(() => setActionSuccessMessage(null), 4000)
  }

  // Toggle selection
  const toggleSelect = useCallback((fileId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }, [])

  const selectAll = useCallback((ids) => {
    setSelectedIds(new Set(ids))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // Filtered files for current tab
  const filteredFiles = useMemo(() => {
    let list = report.allShared || []
    if (activeTab === 'public_links') {
      list = report.publicLinks || []
    } else if (activeTab === 'external_domains') {
      list = report.externalDomainShares || []
    } else if (activeTab === 'stale_shares') {
      list = report.staleCollaborators || []
    } else if (activeTab === 'sensitive_files') {
      list = report.sensitiveFiles || []
    }

    if (!searchQuery.trim()) return list

    const q = searchQuery.toLowerCase()
    return list.filter((f) => {
      return (
        f.fileName.toLowerCase().includes(q) ||
        (f.sensitiveKeyword && f.sensitiveKeyword.toLowerCase().includes(q)) ||
        (f.externalDomains && f.externalDomains.some((d) => d.toLowerCase().includes(q))) ||
        (f.collaborators && f.collaborators.some((c) => c.email && c.email.toLowerCase().includes(q)))
      )
    })
  }, [report, activeTab, searchQuery])

  // --- Remediation Actions ---

  // Revoke public access on single file
  const handleRevokePublic = useCallback(
    async (fileId) => {
      setIsRemediating(true)
      try {
        await securityAuditService.revokePublicAccess(fileId)
        showToast('Revoked public link access. File is now restricted.')
        await loadData()
      } catch (err) {
        console.error('Failed to revoke public link:', err)
      } finally {
        setIsRemediating(false)
      }
    },
    [loadData]
  )

  // Bulk revoke all public links
  const handleRevokeAllPublic = useCallback(async () => {
    const publicIds = (report.publicLinks || []).map((f) => f.fileId)
    if (publicIds.length === 0) return
    setIsRemediating(true)
    try {
      await securityAuditService.bulkRevokePublicAccess(publicIds)
      showToast(`Successfully revoked public web access on ${publicIds.length} files.`)
      clearSelection()
      await loadData()
    } catch (err) {
      console.error('Failed to bulk revoke public links:', err)
    } finally {
      setIsRemediating(false)
    }
  }, [report.publicLinks, clearSelection, loadData])

  // Revoke collaborator
  const handleRevokeCollaborator = useCallback(
    async (fileId, permissionId, collaboratorEmail) => {
      setIsRemediating(true)
      try {
        await securityAuditService.revokeCollaboratorAccess(fileId, permissionId)
        showToast(`Removed access for ${collaboratorEmail || 'collaborator'}.`)
        await loadData()
      } catch (err) {
        console.error('Failed to revoke collaborator:', err)
      } finally {
        setIsRemediating(false)
      }
    },
    [loadData]
  )

  // Bulk revoke domain
  const handleRevokeDomain = useCallback(
    async (domain, fileIds) => {
      setIsRemediating(true)
      try {
        await securityAuditService.bulkRevokeDomainAccess(domain, fileIds)
        showToast(`Revoked all collaborator permissions for domain @${domain}.`)
        await loadData()
      } catch (err) {
        console.error('Failed to bulk revoke domain:', err)
      } finally {
        setIsRemediating(false)
      }
    },
    [loadData]
  )

  // Downgrade editor to viewer
  const handleDowngradeEditor = useCallback(
    async (fileId, permissionId, email) => {
      setIsRemediating(true)
      try {
        await securityAuditService.downgradeEditorToViewer(fileId, permissionId)
        showToast(`Downgraded ${email || 'collaborator'} from Editor to Viewer.`)
        await loadData()
      } catch (err) {
        console.error('Failed to downgrade editor:', err)
      } finally {
        setIsRemediating(false)
      }
    },
    [loadData]
  )

  // Export CSV Security Manifest
  const handleExportManifest = useCallback(() => {
    if (!report.allShared || report.allShared.length === 0) return

    const headers = [
      'File Name',
      'Severity',
      'Public Access',
      'External Domains',
      'Days Inactive',
      'Sensitive Keyword',
      'Collaborator Count',
      'Collaborator Details',
      'Drive Link'
    ]

    const rows = report.allShared.map((f) => {
      const collabsStr = (f.collaborators || [])
        .map((c) => `${c.email || c.name} (${c.role})`)
        .join('; ')
      return [
        `"${(f.fileName || '').replace(/"/g, '""')}"`,
        f.riskSeverity || 'low',
        f.isPublic ? 'YES (Public Link)' : 'NO',
        `"${(f.externalDomains || []).join(', ')}"`,
        f.daysSinceModified || 0,
        `"${f.sensitiveKeyword || ''}"`,
        (f.collaborators || []).length,
        `"${collabsStr.replace(/"/g, '""')}"`,
        f.driveLink || ''
      ]
    })

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `drive_cleaner_security_audit_manifest_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [report.allShared])

  return {
    loading,
    error,
    refresh: loadData,
    report,
    securityHealthScore: report.securityHealthScore,
    riskRating: report.riskRating,
    summary: report.summary || {},
    domainBreakdown: report.domainBreakdown || [],
    publicLinks: report.publicLinks || [],
    externalDomainShares: report.externalDomainShares || [],
    staleCollaborators: report.staleCollaborators || [],
    sensitiveFiles: report.sensitiveFiles || [],
    allShared: report.allShared || [],
    filteredFiles,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    handleRevokePublic,
    handleRevokeAllPublic,
    handleRevokeCollaborator,
    handleRevokeDomain,
    handleDowngradeEditor,
    handleExportManifest,
    actionSuccessMessage,
    isRemediating
  }
}
