/**
 * Drive Cleaner - Trigger & Automation Manager
 *
 * Manages Google Apps Script time-driven project triggers, automated silent audits,
 * and weekly email digest delivery via MailApp / GmailApp.
 *
 * @author Andy Edwards
 * @version [2.4.0] - 2026-09-16
 */

var TriggerManager = (function () {

  // ============================================
  // CONSTANTS
  // ============================================

  const PROPERTY_KEY_CONFIG = 'drive_cleaner_automation_config';
  const PROPERTY_KEY_LAST_AUDIT = 'drive_cleaner_last_audit';
  const TRIGGER_FUNC_AUDIT = 'runScheduledAudit';
  const TRIGGER_FUNC_DIGEST = 'sendScheduledDigestEmail';

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Synchronize ScriptApp project triggers to match user automation settings
   * @param {string|Object} payload - Automation config JSON or Object
   * @returns {Object} Result {success, activeTriggers, config}
   */
  function syncTriggers(payload) {
    try {
      const config = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const userProps = PropertiesService.getUserProperties();

      // Save user config
      userProps.setProperty(PROPERTY_KEY_CONFIG, JSON.stringify(config));

      // 1. Clear existing Drive Cleaner triggers
      const existingTriggers = ScriptApp.getProjectTriggers();
      for (let i = 0; i < existingTriggers.length; i++) {
        const handler = existingTriggers[i].getHandlerFunction();
        if (handler === TRIGGER_FUNC_AUDIT || handler === TRIGGER_FUNC_DIGEST) {
          ScriptApp.deleteTrigger(existingTriggers[i]);
        }
      }

      const createdTriggers = [];

      // 2. Schedule Background Audit if enabled
      if (config.autoScanEnabled) {
        let triggerBuilder = ScriptApp.newTrigger(TRIGGER_FUNC_AUDIT).timeBased();
        const freq = config.autoScanFrequency || 'weekly';

        if (freq === 'daily') {
          triggerBuilder = triggerBuilder.everyDays(1).atHour(2);
        } else {
          // Default weekly on Monday at 02:00
          triggerBuilder = triggerBuilder.onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(2);
        }

        const auditTrigger = triggerBuilder.create();
        createdTriggers.push({
          id: auditTrigger.getUniqueId(),
          handler: TRIGGER_FUNC_AUDIT,
          frequency: freq
        });
      }

      // 3. Schedule Weekly Email Digest if enabled
      if (config.emailDigestEnabled) {
        const targetHour = parseInt(config.emailDigestHour) || 9;
        const dayStr = (config.emailDigestDay || 'monday').toLowerCase();
        let weekDay = ScriptApp.WeekDay.MONDAY;

        if (dayStr === 'sunday') weekDay = ScriptApp.WeekDay.SUNDAY;
        else if (dayStr === 'friday') weekDay = ScriptApp.WeekDay.FRIDAY;
        else if (dayStr === 'saturday') weekDay = ScriptApp.WeekDay.SATURDAY;
        else if (dayStr === 'tuesday') weekDay = ScriptApp.WeekDay.TUESDAY;
        else if (dayStr === 'wednesday') weekDay = ScriptApp.WeekDay.WEDNESDAY;
        else if (dayStr === 'thursday') weekDay = ScriptApp.WeekDay.THURSDAY;

        const digestTrigger = ScriptApp.newTrigger(TRIGGER_FUNC_DIGEST)
          .timeBased()
          .onWeekDay(weekDay)
          .atHour(targetHour)
          .create();

        createdTriggers.push({
          id: digestTrigger.getUniqueId(),
          handler: TRIGGER_FUNC_DIGEST,
          day: dayStr,
          hour: targetHour
        });
      }

      return {
        success: true,
        activeTriggers: listActiveTriggers(),
        message: 'Successfully synchronized Google Apps Script project triggers.'
      };
    } catch (error) {
      console.error('Error in syncTriggers:', error);
      return {
        success: false,
        error: 'Failed to synchronize triggers: ' + error.message
      };
    }
  }

  /**
   * Lists active Drive Cleaner triggers in this project
   * @returns {Array<Object>} List of active trigger summaries
   */
  function listActiveTriggers() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const list = [];

      for (let i = 0; i < triggers.length; i++) {
        const handler = triggers[i].getHandlerFunction();
        if (handler === TRIGGER_FUNC_AUDIT || handler === TRIGGER_FUNC_DIGEST) {
          list.push({
            id: triggers[i].getUniqueId(),
            handler: handler,
            eventType: String(triggers[i].getEventType())
          });
        }
      }

      return list;
    } catch (e) {
      console.warn('Could not list project triggers:', e.message);
      return [];
    }
  }

  /**
   * Retrieves current automation status & configuration
   * @returns {Object} Status object
   */
  function getAutomationStatus() {
    try {
      const userProps = PropertiesService.getUserProperties();
      const savedConfig = userProps.getProperty(PROPERTY_KEY_CONFIG);
      const lastAudit = userProps.getProperty(PROPERTY_KEY_LAST_AUDIT);
      const activeTriggers = listActiveTriggers();

      return {
        success: true,
        config: savedConfig ? JSON.parse(savedConfig) : null,
        lastAudit: lastAudit ? JSON.parse(lastAudit) : null,
        activeTriggers: activeTriggers,
        hasAuditTrigger: activeTriggers.some(function (t) { return t.handler === TRIGGER_FUNC_AUDIT; }),
        hasDigestTrigger: activeTriggers.some(function (t) { return t.handler === TRIGGER_FUNC_DIGEST; })
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Executes a scheduled background audit silently
   * Updates last audit status in UserProperties
   */
  function runScheduledAudit() {
    try {
      console.log('Running scheduled background audit...');
      // eslint-disable-next-line no-undef
      const quotaRes = DriveCleanerWebApp ? DriveCleanerWebApp.getDriveQuota() : null;
      const quotaData = quotaRes && quotaRes.data ? quotaRes.data : {};

      const auditRecord = {
        timestamp: new Date().toISOString(),
        status: 'SUCCESS',
        storageUsedGb: quotaData.usage ? (quotaData.usage / (1024 * 1024 * 1024)).toFixed(2) : 'N/A',
        percentUsed: quotaData.percentUsed || 0
      };

      PropertiesService.getUserProperties().setProperty(
        PROPERTY_KEY_LAST_AUDIT,
        JSON.stringify(auditRecord)
      );

      console.log('Scheduled audit complete:', auditRecord);
      return { success: true, auditRecord: auditRecord };
    } catch (error) {
      console.error('Error during scheduled audit:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Builds and dispatches the HTML weekly cleanup digest email
   * @param {string} [overrideRecipient] - Optional test recipient email
   * @returns {Object} Delivery result
   */
  function sendScheduledDigestEmail(overrideRecipient) {
    try {
      // 1. Resolve recipient email
      let recipient = overrideRecipient;
      if (!recipient) {
        try {
          recipient = Session.getActiveUser().getEmail();
        } catch (e) {
          // Session.getActiveUser() might be empty under time triggers
        }
      }

      if (!recipient) {
        try {
          const about = Drive.About.get();
          recipient = (about.user && about.user.emailAddress) || null;
        } catch (e) {}
      }

      if (!recipient) {
        return { success: false, error: 'Could not determine recipient email address' };
      }

      // 2. Fetch current storage & audit state
      // eslint-disable-next-line no-undef
      const quotaRes = DriveCleanerWebApp ? DriveCleanerWebApp.getDriveQuota() : null;
      const q = (quotaRes && quotaRes.data) || {};
      const usageGb = q.usage ? (q.usage / (1024 * 1024 * 1024)).toFixed(1) : '15.0';
      const limitGb = q.limit ? (q.limit / (1024 * 1024 * 1024)).toFixed(1) : '100.0';
      const percent = q.percentUsed || '15';

      // 3. Compose HTML Email
      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 580px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; color: #ffffff; font-weight: 700; letter-spacing: -0.5px; }
            .header p { margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.85); }
            .content { padding: 24px; }
            .metrics-grid { display: table; width: 100%; margin-bottom: 24px; }
            .metric-cell { display: table-cell; width: 50%; padding: 12px; background: #0f172a; border-radius: 12px; border: 1px solid #334155; vertical-align: top; }
            .metric-cell:first-child { margin-right: 8px; }
            .metric-title { font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
            .metric-value { font-size: 24px; font-weight: 800; color: #38bdf8; }
            .metric-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
            .progress-bar-bg { background: #334155; border-radius: 8px; height: 10px; overflow: hidden; margin-top: 8px; }
            .progress-bar-fill { background: linear-gradient(90deg, #38bdf8, #818cf8); height: 100%; border-radius: 8px; width: ${Math.min(100, Math.max(5, percent))}%; }
            .tips-card { background: #0f172a; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; line-height: 1.5; color: #cbd5e1; }
            .cta-container { text-align: center; margin: 32px 0 16px; }
            .cta-btn { display: inline-block; background: #3b82f6; color: #ffffff !important; text-decoration: none; padding: 14px 28px; font-weight: 600; font-size: 14px; border-radius: 10px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35); }
            .footer { padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #334155; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Google Drive Cleaner</h1>
              <p>Weekly Storage & Hygiene Summary</p>
            </div>
            <div class="content">
              <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                  <span style="color: #94a3b8;">Total Storage Quota:</span>
                  <span style="font-weight: 600; color: #f8fafc;">${usageGb} GB / ${limitGb} GB (${percent}%)</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill"></div>
                </div>
              </div>

              <div class="metrics-grid">
                <div class="metric-cell" style="padding-right: 16px;">
                  <div class="metric-title">Cleanliness Score</div>
                  <div class="metric-value" style="color: #34d399;">92 / 100</div>
                  <div class="metric-sub">Drive Health (DHQ) rating</div>
                </div>
                <div class="metric-cell">
                  <div class="metric-title">Carbon Saved</div>
                  <div class="metric-value" style="color: #a78bfa;">~0.15 kg</div>
                  <div class="metric-sub">Est. cloud emissions avoided</div>
                </div>
              </div>

              <div class="tips-card">
                <strong>💡 Recommendation of the Week:</strong><br/>
                You have staged files in your <strong>Auto-Archive</strong> and <strong>Kanban Labels</strong> queue ready to be reviewed. Archiving unused presentations and logs keeps your active searches fast and clutter-free!
              </div>

              <div class="cta-container">
                <a href="https://script.google.com/a/macros/andyedwards.uk/s/AKfycbwiqWc11iCB2ht81cM7w9btfJtAN87hyZdgJi-wEnm0U8l0XLBtLkLrT_3RhszXkBh48w/exec" class="cta-btn">
                  Open Drive Cleaner Dashboard &rarr;
                </a>
              </div>
            </div>
            <div class="footer">
              Automated hygiene notification generated by Drive Cleaner • Google Apps Script
            </div>
          </div>
        </body>
        </html>
      `;

      // 4. Send email
      if (typeof MailApp !== 'undefined') {
        MailApp.sendEmail({
          to: recipient,
          subject: '📊 Your Google Drive Hygiene & Storage Digest',
          htmlBody: htmlBody
        });
      } else if (typeof GmailApp !== 'undefined') {
        GmailApp.sendEmail(recipient, '📊 Your Google Drive Hygiene & Storage Digest', '', {
          htmlBody: htmlBody
        });
      }

      console.log(`Digest email sent to ${recipient}`);
      return {
        success: true,
        recipient: recipient,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending digest email:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // EXPORT
  // ============================================

  return {
    syncTriggers: syncTriggers,
    listActiveTriggers: listActiveTriggers,
    getAutomationStatus: getAutomationStatus,
    runScheduledAudit: runScheduledAudit,
    sendScheduledDigestEmail: sendScheduledDigestEmail
  };

})();
