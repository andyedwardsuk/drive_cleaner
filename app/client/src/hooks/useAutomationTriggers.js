import { useState, useEffect, useCallback } from 'react'
import triggerService from '@/services/triggerService'
import { addHistoryEvent } from '@/lib/tracking/historyStorage'

const STORAGE_KEY = 'drive_cleaner_automation_config_v1'

const DEFAULT_CONFIG = {
  autoScanEnabled: true,
  autoScanFrequency: 'weekly',
  emailDigestEnabled: true,
  emailDigestDay: 'monday',
  emailDigestHour: 9,
  recipientEmail: '',
  quotaAlertEnabled: true,
  quotaThresholdPercent: 85
}

function loadStoredConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch (e) {
    console.warn('Failed to load automation config from localStorage:', e)
  }
  return DEFAULT_CONFIG
}

function saveStoredConfig(cfg) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
  } catch (e) {
    console.warn('Failed to save automation config:', e)
  }
}

export function useAutomationTriggers() {
  const [config, setConfig] = useState(loadStoredConfig)
  const [serverStatus, setServerStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isRunningAudit, setIsRunningAudit] = useState(false)
  const [actionMessage, setActionMessage] = useState(null) // { type: 'success'|'error', text: string }

  const refreshStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await triggerService.getStatus()
      if (res.success) {
        setServerStatus(res)
      }
    } catch (e) {
      console.warn('Could not fetch trigger status:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  const updateConfig = useCallback((partial) => {
    setConfig((prev) => {
      const updated = { ...prev, ...partial }
      saveStoredConfig(updated)
      return updated
    })
  }, [])

  const syncTriggersWithServer = useCallback(async (customConfig = null) => {
    setIsSyncing(true)
    setActionMessage(null)
    const activeCfg = customConfig || config

    try {
      const res = await triggerService.syncTriggers(activeCfg)
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: 'Google Apps Script time-driven triggers synchronized successfully!'
        })

        addHistoryEvent({
          type: 'settings',
          title: 'Synchronized Automation Triggers with Google Apps Script',
          filesCount: res.activeTriggers?.length || 0,
          bytesAffected: 0
        })

        await refreshStatus()
      } else {
        throw new Error(res.error || 'Failed to sync triggers')
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Failed to sync triggers: ' + err.message
      })
    } finally {
      setIsSyncing(false)
    }
  }, [config, refreshStatus])

  const sendTestDigest = useCallback(async (targetEmail) => {
    setIsSendingEmail(true)
    setActionMessage(null)
    try {
      const email = targetEmail || config.recipientEmail
      const res = await triggerService.sendTestEmail(email)
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Test digest email dispatched to ${res.recipient}!`
        })

        addHistoryEvent({
          type: 'notification',
          title: `Dispatched test cleanup digest email to ${res.recipient}`,
          filesCount: 1,
          bytesAffected: 0
        })
      } else {
        throw new Error(res.error || 'Failed to send email')
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Failed to dispatch email: ' + err.message
      })
    } finally {
      setIsSendingEmail(false)
    }
  }, [config.recipientEmail])

  const runManualAudit = useCallback(async () => {
    setIsRunningAudit(true)
    setActionMessage(null)
    try {
      const res = await triggerService.runAuditNow()
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Immediate background audit completed! Storage used: ${res.auditRecord?.storageUsedGb || '15'} GB (${res.auditRecord?.percentUsed || 15}%)`
        })

        addHistoryEvent({
          type: 'scan',
          title: 'Manual execution of Scheduled Background Audit',
          filesCount: 0,
          bytesAffected: 0
        })

        await refreshStatus()
      } else {
        throw new Error(res.error || 'Audit execution failed')
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Audit failed: ' + err.message
      })
    } finally {
      setIsRunningAudit(false)
    }
  }, [refreshStatus])

  return {
    config,
    updateConfig,
    serverStatus,
    isLoading,
    isSyncing,
    isSendingEmail,
    isRunningAudit,
    actionMessage,
    clearActionMessage: () => setActionMessage(null),
    syncTriggersWithServer,
    sendTestDigest,
    runManualAudit,
    refreshStatus
  }
}

export default useAutomationTriggers
