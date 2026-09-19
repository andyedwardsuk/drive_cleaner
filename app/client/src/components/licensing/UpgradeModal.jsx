import React, { useState } from 'react'
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Zap,
  KeyRound,
  ExternalLink,
  ArrowRight,
  HardDrive,
  Lock,
} from 'lucide-react'
import { useLicense } from '@/hooks/useLicense'
import { WaButton, WaBadge } from '@/components/ui/webawesome'

export function UpgradeModal({ isOpen, onClose }) {
  const { license, isPro, monthlyUsage, activateKey, deactivateKey } = useLicense()
  const [licenseInput, setLicenseInput] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)
  const [isActivating, setIsActivating] = useState(false)

  if (!isOpen) return null

  const handleActivate = async (e) => {
    e?.preventDefault()
    if (!licenseInput.trim()) return

    setIsActivating(true)
    setStatusMessage(null)

    const res = await activateKey(licenseInput.trim())
    setIsActivating(false)

    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message || 'Pro activated successfully!' })
      setLicenseInput('')
      setTimeout(() => {
        setStatusMessage(null)
      }, 4000)
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to activate key' })
    }
  }

  const handleDeactivate = async () => {
    if (confirm('Are you sure you want to deactivate your Pro license and revert to Free tier?')) {
      await deactivateKey()
      setStatusMessage({ type: 'info', text: 'Reverted to Free tier.' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-0">
      <div className="relative w-full max-w-2xl overflow-hidden border rounded-3xl bg-slate-900/95 border-slate-800 shadow-2xl backdrop-blur-xl text-slate-100 p-6 md:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 text-center max-w-md mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-blue-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Drive Cleaner Professional</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {isPro ? 'You are on Drive Cleaner Pro' : 'Unlock Unlimited Workspace Cleanup'}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            {isPro
              ? 'Your account has full enterprise access with unlimited bulk trashing and 24/7 automation.'
              : 'Clean massive Drives without monthly caps, enable automated 24/7 triggers, and audit sharing permissions.'}
          </p>
        </div>

        {/* Current Monthly Quota Status (If Free) */}
        {!isPro && monthlyUsage && (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-blue-400" />
                Monthly Free Cleanup Quota
              </span>
              <span className="font-mono text-slate-300 font-semibold">
                {monthlyUsage.cleaned} / {monthlyUsage.limit} files used ({monthlyUsage.remaining} remaining)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  monthlyUsage.percent >= 90
                    ? 'bg-red-500'
                    : monthlyUsage.percent >= 70
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, monthlyUsage.percent))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Quota automatically resets on the 1st of each calendar month.
            </p>
          </div>
        )}

        {/* Feature Comparison Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Free Tier Card */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Free Plan
              </span>
              <span className="font-bold text-lg text-white">$0</span>
            </div>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Full Smart Scan & 5 Workspace Hubs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Storage Telemetry & ROT Analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Up to 100 files / month cleanup</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>48h Safety Vault 1-Click Undo</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span>24/7 Automated Background Triggers</span>
              </li>
            </ul>
          </div>

          {/* Pro Tier Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-indigo-950/40 border border-blue-500/40 space-y-3 relative shadow-lg shadow-blue-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
                  Professional
                </span>
                <WaBadge variant="brand" appearance="filled" pill>
                  Recommended
                </WaBadge>
              </div>
              <span className="font-bold text-lg text-white">
                $4.99 <span className="text-[10px] text-slate-400 font-normal">/ mo</span>
              </span>
            </div>
            <ul className="space-y-2 text-slate-200">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <strong className="text-white">Unlimited Bulk Cleanup</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Automated 24/7 Background Triggers</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>External Collaborators & Permission Audit</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Duplicate Auto-Resolve & Media Optimizer</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Priority Google Drive Rate-Limit Backoff</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Status Message Notification */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                : statusMessage.type === 'error'
                ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Actions & Key Activation */}
        <div className="space-y-3 pt-2">
          {!isPro ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://workspace.google.com/marketplace"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all text-center"
              >
                <span>Upgrade to Pro via Google Workspace Marketplace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Enter License Key</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Active License: <strong>{license.licenseKey || 'Professional'}</strong></span>
              </div>
              <button
                onClick={handleDeactivate}
                className="text-xs text-red-400 hover:text-red-300 underline font-medium"
              >
                Deactivate
              </button>
            </div>
          )}

          {/* License Key Activation Drawer */}
          {showKeyInput && !isPro && (
            <form onSubmit={handleActivate} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 animate-in fade-in-0">
              <label className="block text-[11px] font-semibold text-slate-400">
                Enter Activation Key (e.g. DC-PRO-XXXX-XXXX-XXXX)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  placeholder="DC-PRO-TEST-2026"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
                <WaButton
                  type="submit"
                  variant="brand"
                  appearance="filled"
                  loading={isActivating}
                  disabled={!licenseInput.trim() || isActivating}
                >
                  Activate
                </WaButton>
              </div>
              <p className="text-[10px] text-slate-500">
                Evaluation key for testing: <code className="text-blue-400 font-mono">DC-PRO-TEST-2026</code>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default UpgradeModal
