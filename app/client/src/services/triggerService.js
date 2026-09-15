/**
 * Trigger & Automation Service
 * Interacts with Google Apps Script TriggerManager via google.script.run,
 * with local development simulation.
 */

export const triggerService = {
  /**
   * Synchronize project triggers with user configuration
   * @param {Object} config - { autoScanEnabled, autoScanFrequency, emailDigestEnabled, emailDigestDay, emailDigestHour, userEmail }
   * @returns {Promise<{success: boolean, activeTriggers: Array, message: string}>}
   */
  syncTriggers: (config) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to sync triggers'))
          })
          .withFailureHandler((err) => {
            console.error('GAS syncAutomationTriggers error:', err)
            reject(err)
          })
          .syncAutomationTriggers(config)
      } else {
        console.log('[Dev Simulation] Syncing triggers:', config)
        setTimeout(() => {
          const simulatedTriggers = []
          if (config.autoScanEnabled) {
            simulatedTriggers.push({
              id: 'trig_mock_audit_1',
              handler: 'runScheduledAudit',
              frequency: config.autoScanFrequency || 'weekly'
            })
          }
          if (config.emailDigestEnabled) {
            simulatedTriggers.push({
              id: 'trig_mock_digest_2',
              handler: 'sendScheduledDigestEmail',
              day: config.emailDigestDay || 'monday',
              hour: config.emailDigestHour || 9
            })
          }
          resolve({
            success: true,
            activeTriggers: simulatedTriggers,
            message: 'Simulated: Google Apps Script triggers synchronized successfully.'
          })
        }, 500)
      }
    })
  },

  /**
   * Fetch current automation status and active triggers
   * @returns {Promise<{success: boolean, config: Object, lastAudit: Object, activeTriggers: Array, hasAuditTrigger: boolean, hasDigestTrigger: boolean}>}
   */
  getStatus: () => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to get trigger status'))
          })
          .withFailureHandler((err) => {
            console.error('GAS getAutomationStatus error:', err)
            reject(err)
          })
          .getAutomationStatus()
      } else {
        console.log('[Dev Simulation] Fetching trigger status')
        setTimeout(() => {
          resolve({
            success: true,
            config: {
              autoScanEnabled: true,
              autoScanFrequency: 'weekly',
              emailDigestEnabled: true,
              emailDigestDay: 'monday',
              emailDigestHour: 9,
              quotaAlertEnabled: true,
              quotaThresholdPercent: 85
            },
            lastAudit: {
              timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
              status: 'SUCCESS',
              storageUsedGb: '14.8',
              percentUsed: 14.8
            },
            activeTriggers: [
              { id: 'trig_sim_1', handler: 'runScheduledAudit', eventType: 'CLOCK' },
              { id: 'trig_sim_2', handler: 'sendScheduledDigestEmail', eventType: 'CLOCK' }
            ],
            hasAuditTrigger: true,
            hasDigestTrigger: true
          })
        }, 300)
      }
    })
  },

  /**
   * Send a test digest email
   * @param {string} [recipientEmail]
   * @returns {Promise<{success: boolean, recipient: string, timestamp: string}>}
   */
  sendTestEmail: (recipientEmail) => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to send test email'))
          })
          .withFailureHandler((err) => {
            console.error('GAS sendTestDigestEmail error:', err)
            reject(err)
          })
          .sendTestDigestEmail(recipientEmail)
      } else {
        console.log('[Dev Simulation] Sending test digest email to:', recipientEmail)
        setTimeout(() => {
          resolve({
            success: true,
            recipient: recipientEmail || 'user@example.com',
            timestamp: new Date().toISOString(),
            message: `Simulated: Digest email sent to ${recipientEmail || 'your email'}!`
          })
        }, 700)
      }
    })
  },

  /**
   * Trigger an immediate silent audit
   * @returns {Promise<{success: boolean, auditRecord: Object}>}
   */
  runAuditNow: () => {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((res) => {
            if (res && res.success !== false) resolve(res)
            else reject(new Error(res?.error || 'Failed to run audit'))
          })
          .withFailureHandler((err) => {
            console.error('GAS runScheduledAuditNow error:', err)
            reject(err)
          })
          .runScheduledAuditNow()
      } else {
        console.log('[Dev Simulation] Running immediate audit')
        setTimeout(() => {
          resolve({
            success: true,
            auditRecord: {
              timestamp: new Date().toISOString(),
              status: 'SUCCESS',
              storageUsedGb: '15.2',
              percentUsed: 15.2
            }
          })
        }, 800)
      }
    })
  }
}

export default triggerService
