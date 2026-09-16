import { useState, useEffect, useCallback, useMemo } from 'react'
import { sharedDrivesService } from '@/services/sharedDrivesService'

export function useSharedDrives() {
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isWorkspace, setIsWorkspace] = useState(true)

  // Selected drive for deep audit inspection
  const [selectedDriveId, setSelectedDriveId] = useState(null)
  const [auditReport, setAuditReport] = useState(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState(null)

  // Load drives list
  const loadDrives = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await sharedDrivesService.getSharedDrivesList()
      const list = res.sharedDrives || []
      setDrives(list)
      setIsWorkspace(res.isWorkspace !== false)
      if (list.length > 0 && !selectedDriveId) {
        setSelectedDriveId(list[0].id)
      }
    } catch (err) {
      console.error('Failed to load Shared Drives:', err)
      setError(err.message || 'Failed to load Shared Drives')
    } finally {
      setLoading(false)
    }
  }, [selectedDriveId])

  useEffect(() => {
    loadDrives()
  }, [loadDrives])

  // Load audit report when selectedDriveId changes
  useEffect(() => {
    if (!selectedDriveId) {
      setAuditReport(null)
      return
    }

    let isCancelled = false
    setAuditLoading(true)
    setAuditError(null)

    sharedDrivesService
      .auditSharedDrive(selectedDriveId)
      .then((report) => {
        if (!isCancelled) {
          setAuditReport(report)
          // Update drive's hygiene score in list if available
          if (report.hygieneScore !== undefined) {
            setDrives((prev) =>
              prev.map((d) =>
                d.id === selectedDriveId ? { ...d, hygieneScore: report.hygieneScore } : d
              )
            )
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Audit failed for drive ' + selectedDriveId + ':', err)
          setAuditError(err.message || 'Audit failed')
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setAuditLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [selectedDriveId])

  // Portfolio-wide metrics
  const portfolioMetrics = useMemo(() => {
    const totalDrives = drives.length
    let totalStorageBytes = 0
    let highRiskCount = 0
    let dormantCount = 0

    drives.forEach((d) => {
      totalStorageBytes += d.totalBytes || 0
      if ((d.hygieneScore !== undefined && d.hygieneScore < 60) || (d.riskFlags?.externalExposureCount > 0)) {
        highRiskCount++
      }
      if (d.isDormant || d.daysSinceLastActive >= 180) {
        dormantCount++
      }
    })

    return {
      totalDrives,
      totalStorageBytes,
      highRiskCount,
      dormantCount
    }
  }, [drives])

  const selectedDrive = useMemo(() => {
    return drives.find((d) => d.id === selectedDriveId) || null
  }, [drives, selectedDriveId])

  return {
    drives,
    loading,
    error,
    isWorkspace,
    portfolioMetrics,
    selectedDriveId,
    selectedDrive,
    setSelectedDriveId,
    auditReport,
    auditLoading,
    auditError,
    refresh: loadDrives
  }
}
