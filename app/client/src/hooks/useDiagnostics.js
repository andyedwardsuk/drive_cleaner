import { useState, useCallback, useEffect } from 'react'
import { diagnosticsService } from '@/services/diagnosticsService'

export function useDiagnostics() {
  const [isRunning, setIsRunning] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const [lastRunAt, setLastRunAt] = useState(null)

  const runDiagnostics = useCallback(async () => {
    setIsRunning(true)
    setError(null)
    try {
      const res = await diagnosticsService.runFullDiagnostics()
      setReport(res)
      setLastRunAt(new Date().toISOString())
      return res
    } catch (err) {
      console.error('Diagnostics execution error:', err)
      setError(err.message || 'Failed to complete system diagnostics')
      return null
    } finally {
      setIsRunning(false)
    }
  }, [])

  // Auto-run once on hook initialization
  useEffect(() => {
    runDiagnostics()
  }, [runDiagnostics])

  const downloadReportJson = useCallback(() => {
    if (!report) return
    const sanitized = {
      title: 'Drive Cleaner - System Telemetry & Diagnostics Report',
      generatedAt: new Date().toISOString(),
      report,
    }
    const blob = new Blob([JSON.stringify(sanitized, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `drive-cleaner-telemetry-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [report])

  return {
    isRunning,
    report,
    error,
    lastRunAt,
    runDiagnostics,
    downloadReportJson,
  }
}
