/**
 * Drive Cleaner - Diagnostics & Telemetry Service
 * Bridges to Google Apps Script runSystemDiagnostics and benchmarks client-side IndexedDB & memory.
 */

import { initDB, getFileCount, getSyncMeta } from '../lib/cache/indexedDBCache'
import { APP_VERSION } from '@/version'

export const diagnosticsService = {
  /**
   * Runs complete system diagnostics (Server GAS APIs + Client IndexedDB + Browser environment)
   * @returns {Promise<Object>} Diagnostic report
   */
  runFullDiagnostics: async () => {
    const clientStartTime = performance.now()

    // 1. Client-side IndexedDB Diagnostic
    let indexedDbStatus = 'PASS'
    let indexedDbLatency = 0
    let indexedDbDetails = ''
    const idbStart = performance.now()

    try {
      await initDB()
      const count = await getFileCount()
      const token = await getSyncMeta('changeToken')
      indexedDbLatency = Math.round(performance.now() - idbStart)
      indexedDbDetails = `IndexedDB operational (${indexedDbLatency}ms). ${count} files cached, token: ${token || 'None'}.`
    } catch (idbErr) {
      indexedDbStatus = 'WARN'
      indexedDbLatency = Math.round(performance.now() - idbStart)
      indexedDbDetails = `IndexedDB limited: ${idbErr.message}`
    }

    // 2. Client-side Browser & Memory Audit
    const browserChecks = {
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      storageEstimate: null,
    }

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate()
        browserChecks.storageEstimate = {
          usageMb: ((est.usage || 0) / (1024 * 1024)).toFixed(2),
          quotaMb: ((est.quota || 0) / (1024 * 1024)).toFixed(0),
        }
      } catch (estErr) {
        console.warn('Storage estimate unavailable:', estErr)
      }
    }

    // 3. Server-side GAS Diagnostics
    const serverReport = await new Promise((resolve) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              resolve({
                success: false,
                overallStatus: 'DEGRADED',
                checks: [
                  { id: 'server_fallback', name: 'Google Apps Script Backend', status: 'WARN', latencyMs: 0, details: response?.error || 'Empty server response' }
                ],
                storageQuota: { usedKb: '0', maxKb: 500, percentUsed: '0' },
                environment: { appVersion: APP_VERSION, runtime: 'Google Apps Script', timeZone: 'UTC' }
              })
            }
          })
          .withFailureHandler((error) => {
            console.error('GAS runSystemDiagnostics error:', error)
            resolve({
              success: false,
              overallStatus: 'ERROR',
              checks: [
                { id: 'server_error', name: 'Google Apps Script Backend', status: 'FAIL', latencyMs: 0, details: error?.message || 'Server call failed' }
              ],
              storageQuota: { usedKb: '0', maxKb: 500, percentUsed: '0' },
              environment: { appVersion: APP_VERSION, runtime: 'Google Apps Script', timeZone: 'UTC' }
            })
          })
          .runSystemDiagnostics()
      } else {
        // Local Vite development simulation
        setTimeout(() => {
          resolve({
            success: true,
            overallStatus: 'HEALTHY',
            timestamp: new Date().toISOString(),
            totalDurationMs: 168,
            checks: [
              {
                id: 'drive_api',
                name: 'Google Drive API v2',
                status: 'PASS',
                latencyMs: 142,
                details: 'Drive API v2 connected (142ms). Quota & metadata access responsive.',
              },
              {
                id: 'properties_vault',
                name: 'User Properties Storage Vault',
                status: 'PASS',
                latencyMs: 18,
                details: '14 keys stored (4.20 KB / 500 KB, 0.8% used). Vault healthy.',
              },
              {
                id: 'identity_session',
                name: 'OAuth 2.0 Session & Identity',
                status: 'PASS',
                latencyMs: 5,
                details: 'Active Google session verified: dev***@workspace.internal',
              },
              {
                id: 'licensing_engine',
                name: 'Cryptographic Licensing Engine',
                status: 'PASS',
                latencyMs: 3,
                details: 'Deterministic FNV-1a checksum engine verified. Tier: PRO.',
              },
            ],
            storageQuota: {
              usedKb: '4.20',
              maxKb: 500,
              percentUsed: '0.8',
            },
            environment: {
              appVersion: APP_VERSION,
              runtime: 'Local Vite Simulation (GAS Compatible)',
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            },
          })
        }, 350)
      }
    })

    // Merge client-side checks into report
    const allChecks = [
      ...(serverReport.checks || []),
      {
        id: 'indexed_db',
        name: 'Local IndexedDB Cache Engine',
        status: indexedDbStatus,
        latencyMs: indexedDbLatency,
        details: indexedDbDetails,
      },
      {
        id: 'browser_network',
        name: 'Network Connection & Persistence',
        status: browserChecks.online ? 'PASS' : 'FAIL',
        latencyMs: 1,
        details: browserChecks.online
          ? `Online. Storage quota: ${browserChecks.storageEstimate ? `${browserChecks.storageEstimate.usageMb} MB / ${browserChecks.storageEstimate.quotaMb} MB` : 'Available'}.`
          : 'Browser offline.',
      },
    ]

    const hasFail = allChecks.some((c) => c.status === 'FAIL')
    const hasWarn = allChecks.some((c) => c.status === 'WARN')
    const overallStatus = hasFail ? 'ERROR' : (hasWarn ? 'DEGRADED' : 'HEALTHY')
    const totalClientDurationMs = Math.round(performance.now() - clientStartTime)

    return {
      success: true,
      overallStatus,
      timestamp: new Date().toISOString(),
      totalDurationMs: totalClientDurationMs,
      checks: allChecks,
      storageQuota: serverReport.storageQuota || { usedKb: '0', maxKb: 500, percentUsed: '0' },
      environment: {
        ...serverReport.environment,
        clientVersion: APP_VERSION,
        userAgent: browserChecks.userAgent,
      },
    }
  },
}
