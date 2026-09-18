import { useState, useRef, useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGaugeHigh,
  faTrashCan,
  faFolderTree,
  faShieldCheck,
  faLayerGroup,
  faGear,
  faCircleInfo,
  faChevronLeft,
  faChevronRight,
  faSparkles,
} from '@fortawesome/pro-duotone-svg-icons'
import { PRIMARY_HUBS } from '@/config/navigationItems'
import { APP_VERSION } from '@/version'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeFlyout, setActiveFlyout] = useState(null)
  const [hoveredTooltip, setHoveredTooltip] = useState(null)
  const flyoutTimeoutRef = useRef(null)

  const router = useRouterState()
  const currentPath = router.location.pathname

  // Helper to determine active hub (matches /clean, /duplicates, etc.)
  const isHubActive = (hub) => {
    if (currentPath === hub.path) return true
    if (hub.id === 'dashboard' && currentPath === '/') return true
    // Also match legacy sub-paths if navigated directly
    if (hub.id === 'clean') {
      return ['/clean', '/smart-scan', '/duplicates', '/large-files', '/old-files', '/empty-items', '/temp-files', '/media-optimizer', '/trash-governance'].includes(currentPath)
    }
    if (hub.id === 'organise') {
      return ['/organise', '/my-folders', '/smart-reorganizer', '/folder-reorganizer', '/shared-drives', '/workspace-files', '/drive-labels', '/labels-management'].includes(currentPath)
    }
    if (hub.id === 'security') {
      return ['/security', '/security-audit', '/shared-files', '/rot-analysis', '/carbon-footprint', '/carbon', '/storage-analytics', '/daily-impact'].includes(currentPath)
    }
    if (hub.id === 'operations') {
      return ['/operations', '/bulk-actions', '/kanban', '/kanban-labels', '/auto-archive', '/archive', '/automation', '/incremental-sync', '/changes-stream', '/history'].includes(currentPath)
    }
    return false
  }

  // Hover handlers for minimised flyouts
  const handleHubMouseEnter = (hub, event) => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current)
    setHoveredTooltip(null)

    if (hub.subTabs && hub.subTabs.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect()
      setActiveFlyout({
        hub,
        top: rect.top,
      })
    } else {
      const rect = event.currentTarget.getBoundingClientRect()
      setHoveredTooltip({
        label: hub.label,
        top: rect.top + rect.height / 2,
      })
    }
  }

  const handleHubMouseLeave = () => {
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyout(null)
      setHoveredTooltip(null)
    }, 200)
  }

  const handleFlyoutMouseEnter = () => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current)
  }

  const handleFlyoutMouseLeave = () => {
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyout(null)
    }, 150)
  }

  const handleItemMouseEnter = (label, event) => {
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current)
    setActiveFlyout(null)
    const rect = event.currentTarget.getBoundingClientRect()
    setHoveredTooltip({
      label,
      top: rect.top + rect.height / 2,
    })
  }

  const handleItemMouseLeave = () => {
    setHoveredTooltip(null)
  }

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative flex flex-col h-screen border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl text-slate-200 z-40 select-none shadow-2xl shrink-0 glass-specular-sm"
      >
        {/* Header Branding */}
        <div className="flex items-center justify-between h-14 px-3.5 border-b border-slate-800/80">
          {!collapsed ? (
            <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-blue-400/30 group-hover:scale-105 transition-transform shrink-0">
                <FontAwesomeIcon icon={faSparkles} className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white tracking-tight truncate flex items-center gap-1.5">
                  Drive Cleaner
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                    2026
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 truncate">Workspace Storage Hub</span>
              </div>
            </Link>
          ) : (
            <Link to="/dashboard" className="mx-auto" title="Drive Cleaner">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 border border-blue-400/30 shrink-0">
                <FontAwesomeIcon icon={faSparkles} className="w-4 h-4 text-white" />
              </div>
            </Link>
          )}

          {!collapsed && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(true)}
              title="Minimise sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>

        {/* Navigation Content */}
        {!collapsed ? (
          /* EXPANDED 5-HUB VIEW */
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
            <div className="px-2 pt-1 pb-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Workspaces</span>
              <span className="text-[10px] font-mono font-normal text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded-full">
                5 Hubs
              </span>
            </div>

            {/* Primary 5 Hubs List */}
            <div className="space-y-1.5">
              {PRIMARY_HUBS.map((hub) => {
                const active = isHubActive(hub)

                return (
                  <Link
                    key={hub.id}
                    to={hub.path}
                    className={cn(
                      'group flex items-start gap-3 p-2.5 rounded-xl transition-all duration-150 active-spring relative',
                      active
                        ? 'bg-blue-600/15 text-white border border-blue-500/40 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    )}
                  >
                    {/* Glowing active indicator bar */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full shadow-sm shadow-blue-400" />
                    )}

                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5',
                        active
                          ? 'bg-blue-500/25 text-blue-300'
                          : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                      )}
                    >
                      <FontAwesomeIcon
                        icon={hub.faIcon}
                        className="w-4 h-4"
                        style={{ '--fa-secondary-opacity': '0.45' }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn('text-xs font-bold truncate', active ? 'text-white' : 'text-slate-200')}>
                          {hub.label}
                        </span>
                        {hub.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                            {hub.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-snug">
                        {hub.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Bottom Section */}
            <div className="mt-auto pt-4 border-t border-slate-800/80 space-y-1">
              <Link
                to="/settings"
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors',
                  currentPath === '/settings'
                    ? 'bg-blue-600/15 text-blue-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                )}
              >
                <FontAwesomeIcon
                  icon={faGear}
                  className="w-4 h-4 text-slate-400"
                  style={{ '--fa-secondary-opacity': '0.45' }}
                />
                <span>Settings</span>
              </Link>
              <Link
                to="/about"
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors',
                  currentPath === '/about'
                    ? 'bg-blue-600/15 text-blue-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                )}
              >
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className="w-4 h-4 text-slate-400"
                  style={{ '--fa-secondary-opacity': '0.45' }}
                />
                <span>About</span>
              </Link>

              {/* Version pill */}
              <div className="px-3 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Drive Cleaner</span>
                <span className="font-mono font-medium text-slate-400">v{APP_VERSION}</span>
              </div>
            </div>
          </div>
        ) : (
          /* MINIMISED ICON DOCK */
          <div className="flex-1 flex flex-col items-center py-3 px-2 space-y-2 overflow-y-auto custom-scrollbar">
            {/* Expand Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              className="w-10 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
            </motion.button>

            <div className="w-8 h-px bg-slate-800/80 my-1" />

            {/* 5 Primary Hub Icons */}
            {PRIMARY_HUBS.map((hub) => {
              const active = isHubActive(hub)
              const isHovered = activeFlyout?.hub?.id === hub.id

              return (
                <div key={hub.id} className="relative">
                  <Link
                    to={hub.path}
                    onMouseEnter={(e) => handleHubMouseEnter(hub, e)}
                    onMouseLeave={handleHubMouseLeave}
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative group active-spring',
                      active
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/20'
                        : isHovered
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    )}
                  >
                    <FontAwesomeIcon
                      icon={hub.faIcon}
                      className={cn(
                        'w-4 h-4 transition-transform duration-150 group-hover:scale-110',
                        active ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                      style={{
                        '--fa-primary-color': active ? '#60a5fa' : '#cbd5e1',
                        '--fa-secondary-color': active ? '#2563eb' : '#64748b',
                        '--fa-secondary-opacity': '0.45',
                      }}
                    />
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-400 rounded-r-full" />
                    )}
                  </Link>
                </div>
              )
            })}

            <div className="w-8 h-px bg-slate-800/80 my-1 mt-auto" />

            {/* Bottom Shortcuts */}
            <Link
              to="/settings"
              onMouseEnter={(e) => handleItemMouseEnter('Settings', e)}
              onMouseLeave={handleItemMouseLeave}
              title="Settings"
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative group',
                currentPath === '/settings'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <FontAwesomeIcon
                icon={faGear}
                className={cn(
                  'w-4 h-4 transition-transform duration-150 group-hover:scale-110',
                  currentPath === '/settings' ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                )}
                style={{
                  '--fa-primary-color': currentPath === '/settings' ? '#60a5fa' : '#cbd5e1',
                  '--fa-secondary-color': currentPath === '/settings' ? '#2563eb' : '#64748b',
                  '--fa-secondary-opacity': '0.45',
                }}
              />
              {currentPath === '/settings' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-400 rounded-r-full" />
              )}
            </Link>
          </div>
        )}
      </motion.aside>

      {/* FLOATING HOVER TOOLTIP */}
      <AnimatePresence>
        {collapsed && hoveredTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.12 }}
            style={{
              top: `${hoveredTooltip.top}px`,
              left: '5.25rem',
              transform: 'translateY(-50%)',
            }}
            className="fixed z-[100] px-3 py-1.5 bg-slate-900/95 border border-slate-800 text-white text-xs font-medium rounded-xl shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap glass-specular-sm"
          >
            {hoveredTooltip.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING HUB FLYOUT MENU (WITH SUB-TABS) */}
      <AnimatePresence>
        {collapsed && activeFlyout && (
          <motion.div
            key={activeFlyout.hub.id}
            initial={{ opacity: 0, x: -8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={handleFlyoutMouseEnter}
            onMouseLeave={handleFlyoutMouseLeave}
            style={{
              top: `${Math.max(16, Math.min(window.innerHeight - 380, activeFlyout.top - 12))}px`,
              left: '5.25rem',
            }}
            className="fixed z-[100] w-64 p-2 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-1 text-left glass-specular"
          >
            {/* Flyout Header */}
            <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white tracking-wide">
                {activeFlyout.hub.label}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                {activeFlyout.hub.subTabs.length} tools
              </span>
            </div>

            {/* Sub-tabs List */}
            <div className="space-y-0.5 max-h-[320px] overflow-y-auto custom-scrollbar">
              {activeFlyout.hub.subTabs.map((subTab) => (
                <Link
                  key={subTab.id}
                  to={activeFlyout.hub.path}
                  search={{ tab: subTab.id }}
                  onClick={() => setActiveFlyout(null)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all group"
                >
                  <span className="truncate">{subTab.label}</span>
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
