import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Clock,
  Mail,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Send,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faLightbulb } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { useAutomationTriggers } from '@/hooks/useAutomationTriggers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function AutomationTriggersView() {
  const {
    config,
    updateConfig,
    serverStatus,
    isLoading,
    isSyncing,
    isSendingEmail,
    isRunningAudit,
    actionMessage,
    clearActionMessage,
    syncTriggersWithServer,
    sendTestDigest,
    runManualAudit,
    refreshStatus
  } = useAutomationTriggers()

  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [recipientInput, setRecipientInput] = useState(config.recipientEmail || '')

  const handleRecipientBlur = () => {
    updateConfig({ recipientEmail: recipientInput })
  }

  const activeTriggersCount = serverStatus?.activeTriggers?.length || 0

  return (
    <div className="space-y-8 pb-16">
      <Hero
        title="Scheduled Audits & Automation Triggers"
        subtitle="Automate Drive hygiene with Google Apps Script time-driven triggers for silent scans, weekly email digests, and quota alerts."
        icon={Zap}
      />

      {/* Action Notification Alert */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'flex items-center justify-between rounded-xl border p-4 shadow-sm backdrop-blur-sm',
              actionMessage.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
            )}
          >
            <div className="flex items-center gap-3">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-400" />
              )}
              <span className="text-sm font-medium">{actionMessage.text}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearActionMessage}
              className="h-8 px-2 text-xs hover:bg-transparent"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Installed Triggers</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">{activeTriggersCount} Active</div>
          <p className="mt-1 text-xs text-muted-foreground">Google Apps Script project triggers</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Background Audit</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold flex items-center gap-2">
            {config.autoScanEnabled ? (
              <>
                <span className="text-emerald-400">●</span>
                <span className="capitalize">{config.autoScanFrequency || 'Weekly'}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Disabled</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Silent storage hygiene check</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Weekly Digest Email</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold flex items-center gap-2">
            {config.emailDigestEnabled ? (
              <>
                <span className="text-emerald-400">●</span>
                <span className="capitalize">{config.emailDigestDay || 'Monday'}s</span>
              </>
            ) : (
              <span className="text-muted-foreground">Disabled</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Delivered at {config.emailDigestHour || 9}:00 AM</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Quota Guard</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">
            {config.quotaAlertEnabled ? `${config.quotaThresholdPercent || 85}%` : 'Off'}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Threshold warning trigger</p>
        </motion.div>
      </div>

      {/* Sync Banner Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              Google Apps Script Automation Engine
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Changes made below will configure live Apps Script project triggers to run in the background 24/7 without needing the web app open.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isLoading || isSyncing}
            onClick={refreshStatus}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            Check Status
          </Button>
          <Button
            size="sm"
            disabled={isSyncing}
            onClick={() => syncTriggersWithServer()}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
          >
            {isSyncing ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                Syncing Triggers...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Sync Triggers to Apps Script
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Trigger Configuration Panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* PANEL 1: Automated Background Audit */}
        <div className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-5 shadow-sm backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Background Silent Audit</h3>
                <p className="text-xs text-muted-foreground">
                  Periodically monitors storage quota, DHQ score, and hygiene delta.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => updateConfig({ autoScanEnabled: !config.autoScanEnabled })}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5',
                config.autoScanEnabled ? 'bg-indigo-600' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full bg-white transition-transform',
                  config.autoScanEnabled ? 'translate-x-6' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Scan Frequency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'daily', label: 'Daily', desc: 'Every night' },
                { id: 'weekly', label: 'Weekly', desc: 'Every Monday' },
                { id: 'biweekly', label: 'Bi-Weekly', desc: 'Every 2 wks' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateConfig({ autoScanFrequency: opt.id })}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all text-xs',
                    config.autoScanFrequency === opt.id
                      ? 'border-indigo-500 bg-indigo-500/15 text-foreground font-semibold ring-1 ring-indigo-500/30'
                      : 'border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  <div>{opt.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Manual Run Action */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Last audit: {serverStatus?.lastAudit?.timestamp ? new Date(serverStatus.lastAudit.timestamp).toLocaleDateString() : 'Pending first run'}
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={isRunningAudit}
              onClick={runManualAudit}
              className="gap-2 text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
            >
              {isRunningAudit ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  Running Audit...
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Run Audit Now
                </>
              )}
            </Button>
          </div>
        </div>

        {/* PANEL 2: Weekly Email Cleanup Digest */}
        <div className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-5 shadow-sm backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Weekly Cleanup Digest</h3>
                <p className="text-xs text-muted-foreground">
                  Receive an automated hygiene summary in your Gmail inbox.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => updateConfig({ emailDigestEnabled: !config.emailDigestEnabled })}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5',
                config.emailDigestEnabled ? 'bg-emerald-600' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full bg-white transition-transform',
                  config.emailDigestEnabled ? 'translate-x-6' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Delivery Day
              </label>
              <select
                value={config.emailDigestDay || 'monday'}
                onChange={(e) => updateConfig({ emailDigestDay: e.target.value })}
                className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="monday">Monday Morning</option>
                <option value="friday">Friday Wrap-up</option>
                <option value="sunday">Sunday Prep</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Delivery Time
              </label>
              <select
                value={config.emailDigestHour || 9}
                onChange={(e) => updateConfig({ emailDigestHour: parseInt(e.target.value) })}
                className="w-full h-9 rounded-lg border border-border bg-muted/30 px-3 text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value={8}>08:00 AM</option>
                <option value={9}>09:00 AM</option>
                <option value={10}>10:00 AM</option>
                <option value={18}>06:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Custom Recipient Email (Optional)
            </label>
            <Input
              placeholder="Defaults to active Google Account"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onBlur={handleRecipientBlur}
              className="h-9 text-xs"
            />
          </div>

          {/* Action Buttons for Email */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewModalOpen(true)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview Digest HTML
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isSendingEmail}
              onClick={() => sendTestDigest(recipientInput)}
              className="gap-2 text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
            >
              {isSendingEmail ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>
        </div>

        {/* PANEL 3: Storage Quota Guard Alert */}
        <div className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-5 shadow-sm backdrop-blur-sm lg:col-span-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Storage Quota Guard</h3>
                <p className="text-xs text-muted-foreground">
                  Proactively notifies you when your Google Drive storage exceeds your safety boundary before hitting Google limits.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => updateConfig({ quotaAlertEnabled: !config.quotaAlertEnabled })}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5',
                config.quotaAlertEnabled ? 'bg-amber-600' : 'bg-muted'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full bg-white transition-transform',
                  config.quotaAlertEnabled ? 'translate-x-6' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Warning Threshold: {config.quotaThresholdPercent || 85}%
              </label>
              <span className="text-xs text-amber-400 font-medium">
                {config.quotaAlertEnabled ? 'Active Guard' : 'Disabled'}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[75, 80, 85, 90, 95].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateConfig({ quotaThresholdPercent: val })}
                  className={cn(
                    'p-2.5 rounded-lg border text-center transition-all text-xs font-semibold',
                    (config.quotaThresholdPercent || 85) === val
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30'
                      : 'border-border/40 bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  {val}%
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              When Google Drive usage crosses this boundary during scheduled background audits, a high-priority alert is immediately dispatched with recommended large and stale file cleanups.
            </p>
          </div>
        </div>
      </div>

      {/* Live Email Digest Preview Modal */}
      <AnimatePresence>
        {previewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl border border-border bg-slate-900 p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Weekly Digest Email Preview</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPreviewModalOpen(false)}
                  className="h-8 w-8 p-0 text-muted-foreground flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                </Button>
              </div>

              {/* Email Content Container */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs font-sans">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 space-y-6 text-slate-100">
                  <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-center text-white space-y-1">
                    <h2 className="text-xl font-bold">Google Drive Cleaner</h2>
                    <p className="text-xs text-blue-100">Weekly Storage & Hygiene Summary</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Total Storage Usage:</span>
                      <span className="font-semibold text-slate-200">14.8 GB / 100 GB (14.8%)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 w-[15%]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Cleanliness Score</div>
                      <div className="text-2xl font-black text-emerald-400 mt-1">92 / 100</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Drive Health (DHQ) rating</div>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Carbon Saved</div>
                      <div className="text-2xl font-black text-indigo-400 mt-1">~0.15 kg</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Est. emissions avoided</div>
                    </div>
                  </div>

                  <div className="rounded-lg border-l-4 border-sky-400 bg-slate-900/80 p-3.5 text-xs text-slate-300 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-sky-300">
                      <FontAwesomeIcon icon={faLightbulb} className="w-3.5 h-3.5 text-amber-400" />
                      <span>Recommendation of the Week:</span>
                    </div>
                    You have staged items in your <strong>Auto-Archive</strong> and <strong>Kanban Labels</strong> queue ready to be reviewed. Archiving unused spreadsheets and old recordings keeps your active searches fast!
                  </div>

                  <div className="text-center pt-2">
                    <div className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/30">
                      Open Drive Cleaner Dashboard &rarr;
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewModalOpen(false)}
                  className="text-xs"
                >
                  Close Preview
                </Button>
                <Button
                  size="sm"
                  disabled={isSendingEmail}
                  onClick={() => {
                    sendTestDigest(recipientInput)
                    setPreviewModalOpen(false)
                  }}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send to My Inbox Now
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
