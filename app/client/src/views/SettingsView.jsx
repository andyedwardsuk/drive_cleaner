import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Sliders,
  HardDrive,
  Palette,
  ShieldCheck,
  Database,
  Check,
  RotateCcw,
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  Sparkles,
  Clock,
  Zap,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react'
import {
  faSliders,
  faHardDrive,
  faPalette,
  faShieldCheck,
  faDatabase,
  faRotateLeft,
  faDownload,
  faTrashCan,
  faTriangleExclamation,
  faCheck,
  faSparkles,
  faClock,
  faBoltLightning,
  faFolderOpen,
  faGear
} from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Hero from '@/components/Hero'
import { useSettings } from '@/hooks/useSettings'
import { WaSwitch, WaCallout, WaButton, WaBadge } from '@/components/ui/webawesome'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { APP_VERSION } from '@/version'

export default function SettingsView() {
  const {
    settings,
    thresholds,
    scanning,
    appearance,
    safety,
    updateSetting,
    updateSection,
    resetToDefaults,
    exportAllAppData,
    clearAllLocalCaches,
  } = useSettings()

  const [activeTab, setActiveTab] = useState('thresholds')
  const [saveToast, setSaveToast] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false)
  const [actionSuccessMessage, setActionSuccessMessage] = useState('')

  const triggerSaveToast = (msg = 'Settings saved') => {
    setActionSuccessMessage(msg)
    setSaveToast(true)
    setTimeout(() => {
      setSaveToast(false)
      setActionSuccessMessage('')
    }, 2500)
  }

  const handleUpdate = (section, key, value) => {
    updateSetting(section, key, value)
    triggerSaveToast()
  }

  const handleReset = () => {
    resetToDefaults()
    setShowResetConfirm(false)
    triggerSaveToast('Settings reset to defaults')
  }

  const handleClearCache = () => {
    clearAllLocalCaches()
    triggerSaveToast('Local scan cache cleared')
  }

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('drive_cleaner_history_events')
      window.dispatchEvent(new CustomEvent('drive_cleaner_history_updated'))
      setShowClearHistoryConfirm(false)
      triggerSaveToast('Audit history cleared')
    } catch (err) {
      console.error('Failed to clear history:', err)
    }
  }

  const tabs = [
    { id: 'thresholds', label: 'Thresholds & Rules', faIcon: faSliders },
    { id: 'scanning', label: 'Scan & Scope', faIcon: faHardDrive },
    { id: 'appearance', label: 'Appearance', faIcon: faPalette },
    { id: 'safety', label: 'Safety & Trash', faIcon: faShieldCheck },
    { id: 'data', label: 'Data & Privacy', faIcon: faDatabase },
  ]

  const largeSizeOptions = [
    { label: '25 MB', value: 25, desc: 'Aggressive' },
    { label: '50 MB', value: 50, desc: 'Moderate' },
    { label: '100 MB', value: 100, desc: 'Standard (Default)' },
    { label: '250 MB', value: 250, desc: 'High' },
    { label: '500 MB', value: 500, desc: 'Very Large' },
    { label: '1 GB', value: 1024, desc: 'Extreme' },
  ]

  const oldAgeOptions = [
    { label: '90 Days', value: 90, desc: '3 months' },
    { label: '180 Days', value: 180, desc: '6 months' },
    { label: '1 Year', value: 365, desc: 'Standard (Default)' },
    { label: '2 Years', value: 730, desc: 'Stale' },
    { label: '3 Years', value: 1095, desc: 'Decayed' },
  ]

  const undoDurationOptions = [
    { label: '5 seconds', value: 5 },
    { label: '10 seconds', value: 10, isDefault: true },
    { label: '15 seconds', value: 15 },
    { label: '30 seconds', value: 30 },
  ]

  return (
    <div className="space-y-6">
      {/* Zero-Layout-Shift Fixed Floating Toast */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 text-white text-sm font-medium rounded-xl shadow-2xl backdrop-blur-xl border border-blue-500/40"
            style={{
              boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            }}
          >
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
            </div>
            <span>{actionSuccessMessage || 'Preferences updated'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Hero
        faIcon={faSliders}
        variant="primary"
        title="Settings & Preferences"
        subtitle="Fine-tune cleanup thresholds, scan behaviours, visual themes, and safe trash policies."
        badge={`v${APP_VERSION} Active`}
      />

      {/* Tabs bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl backdrop-blur-md">
        {tabs.map((tab) => {
          const FaIcon = tab.faIcon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <FontAwesomeIcon icon={FaIcon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Panels with Stable Height */}
      <div className="p-6 md:p-8 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-md space-y-8 min-h-[520px]">
        {/* TAB 1: THRESHOLDS */}
        {activeTab === 'thresholds' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
                <FontAwesomeIcon icon={faSliders} className="w-5 h-5 text-blue-400" />
                Cleanup & Analysis Thresholds
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Customise the rules used by Smart Scan and category views to detect large, old, or cluttered files.
              </p>
            </div>

            {/* Large Files Cutoff */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-medium text-slate-200">
                    Large Files Minimum Size Cutoff
                  </label>
                  <p className="text-xs text-slate-400">
                    Files equal to or larger than this size will be flagged in Large Files View.
                  </p>
                </div>
                <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                  Current: {thresholds.largeFileMinMB} MB
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
                {largeSizeOptions.map((opt) => {
                  const isSelected = thresholds.largeFileMinMB === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleUpdate('thresholds', 'largeFileMinMB', opt.value)}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all',
                        isSelected
                          ? 'border-blue-500 bg-blue-500/20 text-white ring-1 ring-blue-500'
                          : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                      )}
                    >
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs text-slate-400">{opt.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Old Files Inactivity */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-medium text-slate-200">
                    Old Files Inactivity Threshold
                  </label>
                  <p className="text-xs text-slate-400">
                    Files untouched or unmodified for longer than this period qualify as Old Files.
                  </p>
                </div>
                <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                  Current: {thresholds.oldFileInactiveDays} Days
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
                {oldAgeOptions.map((opt) => {
                  const isSelected = thresholds.oldFileInactiveDays === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleUpdate('thresholds', 'oldFileInactiveDays', opt.value)}
                      className={cn(
                        'p-3 rounded-xl border text-left transition-all',
                        isSelected
                          ? 'border-amber-500 bg-amber-500/20 text-white ring-1 ring-amber-500'
                          : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                      )}
                    >
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs text-slate-400">{opt.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ROT Analysis Targets */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div>
                <label className="text-base font-medium text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Data ROT & Digital Clutter Index Target
                </label>
                <p className="text-xs text-slate-400">
                  Desired maximum clutter percentage score for clean Drive hygiene (default: 20%).
                </p>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={thresholds.targetClutterIndex || 20}
                  onChange={(e) =>
                    updateSetting('thresholds', 'targetClutterIndex', parseInt(e.target.value, 10))
                  }
                  onPointerUp={() => triggerSaveToast('Target clutter index updated')}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-sm font-semibold text-purple-300 w-16 text-right">
                  {thresholds.targetClutterIndex || 20}% target
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SCAN & SCOPE */}
        {activeTab === 'scanning' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
                <FontAwesomeIcon icon={faHardDrive} className="w-5 h-5 text-indigo-400" />
                Scan & Search Preferences
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Configure default target storage scopes and analyser behaviours.
              </p>
            </div>

            {/* Default Drive Scope */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <label className="text-base font-medium text-slate-200">
                Default Target Scope
              </label>
              <p className="text-xs text-slate-400">
                Choose whether new scans start targeting your personal My Drive or connected Shared Drives.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleUpdate('scanning', 'defaultCorpora', 'user')}
                  className={cn(
                    'p-4 rounded-xl border text-left flex items-start gap-3 transition-all',
                    scanning.defaultCorpora === 'user'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800/80'
                  )}
                >
                  <FolderOpen className="w-5 h-5 mt-0.5 text-blue-400" />
                  <div>
                    <div className="font-semibold text-sm">My Drive (Personal Storage)</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Scans your root Drive folder and quota-impacting personal files.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdate('scanning', 'defaultCorpora', 'drive')}
                  className={cn(
                    'p-4 rounded-xl border text-left flex items-start gap-3 transition-all',
                    scanning.defaultCorpora === 'drive'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800/80'
                  )}
                >
                  <HardDrive className="w-5 h-5 mt-0.5 text-indigo-400" />
                  <div>
                    <div className="font-semibold text-sm">Shared Drives (Team Storage)</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Focuses on team folders and shared corporate repositories.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Google Workspace Scan Inclusion */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-base font-medium text-slate-200">
                  Include Google Workspace Files Analysis
                </div>
                <div className="text-xs text-slate-400">
                  Analyse Docs, Sheets, and Slides for unused drafts and sharing sprawl during Smart Scan.
                </div>
              </div>
              <WaSwitch
                checked={scanning.autoIncludeWorkspace}
                onCheckedChange={(checked) =>
                  handleUpdate('scanning', 'autoIncludeWorkspace', checked)
                }
              />
            </div>

            {/* Cache Persistence */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-base font-medium text-slate-200">
                  Persist Scan Cache Across Visits
                </div>
                <div className="text-xs text-slate-400">
                  Keep scan results stored locally so navigating between views is instantaneous.
                </div>
              </div>
              <WaSwitch
                checked={scanning.enableAutoCache}
                onCheckedChange={(checked) =>
                  handleUpdate('scanning', 'enableAutoCache', checked)
                }
              />
            </div>
          </motion.div>
        )}

        {/* TAB 3: APPEARANCE */}
        {activeTab === 'appearance' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
                <FontAwesomeIcon icon={faPalette} className="w-5 h-5 text-emerald-400" />
                Appearance & Theme
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Customise Drive Cleaner's visual layout and colour mode.
              </p>
            </div>

            {/* Theme Mode */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <label className="text-base font-medium text-slate-200">
                Colour Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Optimised for low-light' },
                  { id: 'light', label: 'Light Mode', icon: Sun, desc: 'High contrast clean' },
                  { id: 'system', label: 'System Theme', icon: Monitor, desc: 'Matches device setting' },
                ].map((item) => {
                  const Icon = item.icon
                  const isSelected = (appearance.theme || 'dark') === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleUpdate('appearance', 'theme', item.id)}
                      className={cn(
                        'p-4 rounded-xl border text-left transition-all',
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/20 text-white ring-1 ring-emerald-500'
                          : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800/80'
                      )}
                    >
                      <Icon className="w-5 h-5 mb-2 text-emerald-400" />
                      <div className="font-semibold text-sm">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Table Density */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <label className="text-base font-medium text-slate-200">
                Table Display Density
              </label>
              <p className="text-xs text-slate-400">
                Choose comfortable spacing for readability or compact mode to view more files simultaneously.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleUpdate('appearance', 'density', 'comfortable')}
                  className={cn(
                    'p-3.5 rounded-xl border text-left transition-all',
                    appearance.density === 'comfortable'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800/80'
                  )}
                >
                  <div className="font-semibold text-sm">Comfortable</div>
                  <div className="text-xs text-slate-400">Standard table padding and larger icons</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdate('appearance', 'density', 'compact')}
                  className={cn(
                    'p-3.5 rounded-xl border text-left transition-all',
                    appearance.density === 'compact'
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800/80'
                  )}
                >
                  <div className="font-semibold text-sm">Compact</div>
                  <div className="text-xs text-slate-400">Higher file density for power users</div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: SAFETY */}
        {activeTab === 'safety' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
                <FontAwesomeIcon icon={faShieldCheck} className="w-5 h-5 text-emerald-400" />
                Safety & Safe Trash Policies
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Protect yourself from accidental file loss with reversible operations and confirmation prompts.
              </p>
            </div>

            {/* Confirm Before Trash */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-base font-medium text-slate-200">
                  Confirm Before Moving Files to Trash
                </div>
                <div className="text-xs text-slate-400">
                  Always show a dialog displaying affected files and reclaimed space before proceeding.
                </div>
              </div>
              <WaSwitch
                checked={safety.confirmBeforeTrash}
                onCheckedChange={(checked) =>
                  handleUpdate('safety', 'confirmBeforeTrash', checked)
                }
              />
            </div>

            {/* Undo Toast Window */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-medium text-slate-200">
                    Safe Undo Window Duration
                  </label>
                  <p className="text-xs text-slate-400">
                    How long the floating "Undo Trash" button remains active after cleaning files.
                  </p>
                </div>
                <WaBadge variant="success" appearance="outlined" pill>
                  {safety.undoTimeoutSeconds || 10} seconds
                </WaBadge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {undoDurationOptions.map((opt) => {
                  const isSelected = (safety.undoTimeoutSeconds || 10) === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleUpdate('safety', 'undoTimeoutSeconds', opt.value)}
                      className={cn(
                        'p-3 rounded-xl border text-center transition-all',
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/20 text-white'
                          : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800/80'
                      )}
                    >
                      <div className="text-sm font-semibold">{opt.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: DATA & PRIVACY */}
        {activeTab === 'data' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2.5">
                <FontAwesomeIcon icon={faDatabase} className="w-5 h-5 text-cyan-400" />
                Data, Backups & Privacy
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Export your audit data, manage local device caches, or restore factory defaults.
              </p>
            </div>

            {/* Export App Data */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-base font-medium text-slate-200">
                  Export Complete Backup Archive
                </div>
                <div className="text-xs text-slate-400">
                  Downloads a JSON file with all custom thresholds, scan history, daily habit logs, and bookmarks.
                </div>
              </div>
              <Button
                variant="outline"
                onClick={exportAllAppData}
                className="gap-2 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 h-10 rounded-xl"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </Button>
            </div>

            {/* Clear Local Cache */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-base font-medium text-slate-200">
                  Clear Local Scan Cache
                </div>
                <div className="text-xs text-slate-400">
                  Clears cached folder targets and temporary scan snapshots without removing history.
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleClearCache}
                className="gap-2 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800/60 h-10 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Cache
              </Button>
            </div>

            {/* Danger Zone */}
            <WaCallout
              variant="danger"
              appearance="outlined"
              title="Danger Zone"
              faIcon={faTriangleExclamation}
              className="p-5"
            >
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-red-500/20">
                  <div>
                    <div className="font-medium text-sm text-slate-200">
                      Reset Settings to Defaults
                    </div>
                    <div className="text-xs text-slate-400">
                      Restores all thresholds, scanning options, and UI preferences to initial state.
                    </div>
                  </div>
                  {showResetConfirm ? (
                    <div className="flex items-center gap-2">
                      <WaButton
                        variant="danger"
                        appearance="filled"
                        size="small"
                        onClick={handleReset}
                      >
                        Confirm Reset
                      </WaButton>
                      <WaButton
                        variant="neutral"
                        appearance="plain"
                        size="small"
                        onClick={() => setShowResetConfirm(false)}
                      >
                        Cancel
                      </WaButton>
                    </div>
                  ) : (
                    <WaButton
                      variant="danger"
                      appearance="outlined"
                      size="small"
                      onClick={() => setShowResetConfirm(true)}
                    >
                      Reset Defaults
                    </WaButton>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-red-500/20">
                  <div>
                    <div className="font-medium text-sm text-slate-200">
                      Wipe Scan & Action Audit History
                    </div>
                    <div className="text-xs text-slate-400">
                      Permanently deletes all historical scan events and trash logs from local storage.
                    </div>
                  </div>
                  {showClearHistoryConfirm ? (
                    <div className="flex items-center gap-2">
                      <WaButton
                        variant="danger"
                        appearance="filled"
                        size="small"
                        onClick={handleClearHistory}
                      >
                        Confirm Wipe
                      </WaButton>
                      <WaButton
                        variant="neutral"
                        appearance="plain"
                        size="small"
                        onClick={() => setShowClearHistoryConfirm(false)}
                      >
                        Cancel
                      </WaButton>
                    </div>
                  ) : (
                    <WaButton
                      variant="danger"
                      appearance="outlined"
                      size="small"
                      onClick={() => setShowClearHistoryConfirm(true)}
                    >
                      Clear History
                    </WaButton>
                  )}
                </div>
              </div>
            </WaCallout>
          </motion.div>
        )}
      </div>
    </div>
  )
}
