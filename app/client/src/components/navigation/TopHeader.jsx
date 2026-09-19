import { useRouterState, Link } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Search,
  Scan,
  ChevronRight,
  Sparkles,
  Command,
  Database,
  ExternalLink,
} from 'lucide-react'
import { getRouteInfo } from '@/config/navigationItems'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLicense } from '@/hooks/useLicense'

export default function TopHeader({ onOpenCommandPalette, onOpenUpgrade }) {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const routeInfo = getRouteInfo(currentPath)
  const CurrentIcon = routeInfo.icon
  const { isPro, monthlyUsage } = useLicense()

  return (
    <header className="sticky top-0 z-30 h-14 w-full bg-slate-950/70 backdrop-blur-2xl border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between transition-all">
      {/* Left: Dynamic Breadcrumb Path */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <span>Drive Cleaner</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        <span className="text-xs font-medium text-slate-400 truncate hidden sm:inline">
          {routeInfo.categoryTitle}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden sm:inline" />
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/50 border border-slate-700/40 text-xs font-semibold text-slate-100 truncate">
          {routeInfo.faIcon ? (
            <FontAwesomeIcon icon={routeInfo.faIcon} className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          ) : (
            <CurrentIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          )}
          <span className="truncate">{routeInfo.label}</span>
        </div>
      </div>

      {/* Center: Command Palette Trigger Bar */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-blue-500/50 hover:bg-slate-800/80 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-sm hover:shadow-blue-500/10 group max-w-sm w-full mx-4"
      >
        <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors shrink-0" />
        <span className="flex-1 text-left truncate">Search tools, run actions, or jump...</span>
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 font-semibold group-hover:border-blue-500/40">
          <span>⌘</span>
          <span>K</span>
        </div>
      </button>

      {/* Right: Status Beacon & Quick Scan Action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Search tools (⌘K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Commercial Plan / Quota Badge */}
        {isPro ? (
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/35 text-amber-300 text-xs font-semibold hover:border-amber-400 transition-all shadow-sm cursor-pointer"
            title="Drive Cleaner Professional Active (Click for License Details)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold tracking-wide">PRO</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 text-slate-300 hover:text-white text-xs transition-all cursor-pointer group"
            title={`Free Plan: ${monthlyUsage?.cleaned || 0} / ${monthlyUsage?.limit || 100} files cleaned this month. Click to upgrade.`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <span className="text-[11px] font-medium hidden sm:inline">Free Plan</span>
            <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-300">
              {monthlyUsage ? `${monthlyUsage.cleaned}/${monthlyUsage.limit}` : '0/100'}
            </span>
          </button>
        )}

        {/* Live Google Drive API Beacon */}
        <div
          title="Google Drive API Live Connection"
          className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="hidden lg:inline text-[11px] font-semibold">Drive API Active</span>
          <span className="lg:hidden text-[11px] font-semibold">Live</span>
        </div>

        {/* 1-Click Smart Scan Trigger */}
        <Link
          to="/smart-scan"
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active-spring',
            currentPath === '/smart-scan'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:border-blue-500/50'
          )}
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Quick Scan</span>
        </Link>
      </div>
    </header>
  )
}
