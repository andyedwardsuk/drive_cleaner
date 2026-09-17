import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Scan,
  BarChart3,
  RefreshCw,
  HardDrive,
  Clock,
  FolderOpen,
  Trash2,
  FileSpreadsheet,
  Flame,
  Leaf,
  Star,
  Layers,
  FolderHeart,
  History,
  Kanban,
  Archive,
  Zap,
  FolderTree,
  Tag,
  Users,
  Film,
  ShieldAlert,
  Activity,
  ArchiveRestore,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react'
import NavItem from './NavItem'
import SidebarSection from './SidebarSection'
import { Badge } from '@/components/ui/badge'
import { isFeatureEnabled, getFeatureBadge } from '@/config/featureFlags'
import { APP_VERSION } from '@/version'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const router = useRouterState()
  const currentPath = router.location.pathname

  const navigationSections = useMemo(
    () => [
      {
        id: 'core',
        title: 'Core',
        collapsible: false,
        items: [
          {
            icon: Home,
            label: 'Dashboard',
            path: '/dashboard',
            flag: 'FEATURE_DASHBOARD',
          },
          {
            icon: Scan,
            label: 'Smart Scan',
            path: '/smart-scan',
            flag: 'FEATURE_SMART_SCAN',
          },
        ],
      },
      {
        id: 'cleanup',
        title: 'Cleanup Tools',
        collapsible: true,
        items: [
          {
            icon: RefreshCw,
            label: 'Duplicates',
            path: '/duplicates',
            flag: 'FEATURE_DUPLICATES',
          },
          {
            icon: HardDrive,
            label: 'Large Files',
            path: '/large-files',
            flag: 'FEATURE_LARGE_FILES',
          },
          {
            icon: Clock,
            label: 'Old Files',
            path: '/old-files',
            flag: 'FEATURE_OLD_FILES',
          },
          {
            icon: FolderOpen,
            label: 'Empty Items',
            path: '/empty-items',
            flag: 'FEATURE_EMPTY_ITEMS',
          },
          {
            icon: Trash2,
            label: 'Temporary Files',
            path: '/temp-files',
            flag: 'FEATURE_TEMP_FILES',
          },
          {
            icon: FileSpreadsheet,
            label: 'Workspace Files',
            path: '/workspace-files',
            flag: 'FEATURE_WORKSPACE_FILES',
          },
          {
            icon: Flame,
            label: 'Data ROT Analysis',
            path: '/rot-analysis',
            flag: 'FEATURE_ROT_ANALYSIS',
          },
          {
            icon: Film,
            label: 'Media Optimiser',
            path: '/media-optimizer',
            flag: 'FEATURE_MEDIA_OPTIMIZER',
          },
        ],
      },
      {
        id: 'organisation',
        title: 'Organisation',
        collapsible: true,
        items: [
          {
            icon: FolderHeart,
            label: 'My Folders',
            path: '/my-folders',
            flag: 'FEATURE_MY_FOLDERS',
          },
          {
            icon: FolderTree,
            label: 'Folder Reorganiser',
            path: '/smart-reorganizer',
            flag: 'FEATURE_SMART_REORGANIZER',
          },
          {
            icon: Users,
            label: 'Shared Drives',
            path: '/shared-drives',
            flag: 'FEATURE_SHARED_DRIVES_HUB',
          },
          {
            icon: Tag,
            label: 'Drive Labels',
            path: '/labels-management',
            flag: 'FEATURE_DRIVE_LABELS',
          },
          {
            icon: Kanban,
            label: 'Kanban Labels',
            path: '/kanban-labels',
            flag: 'FEATURE_KANBAN_LABELS',
          },
          {
            icon: Archive,
            label: 'Auto-Archive',
            path: '/auto-archive',
            flag: 'FEATURE_AUTO_ARCHIVE',
          },
        ],
      },
      {
        id: 'security',
        title: 'Security & Governance',
        collapsible: true,
        items: [
          {
            icon: ShieldAlert,
            label: 'Security Audit',
            path: '/security-audit',
            flag: 'FEATURE_SECURITY_AUDIT',
          },
          {
            icon: Star,
            label: 'Shared Files',
            path: '/shared-files',
            flag: 'FEATURE_SHARED_FILES',
          },
          {
            icon: ArchiveRestore,
            label: 'Trash Governance',
            path: '/trash-governance',
            flag: 'FEATURE_TRASH_GOVERNANCE',
          },
          {
            icon: Activity,
            label: 'Incremental Sync',
            path: '/incremental-sync',
            flag: 'FEATURE_INCREMENTAL_SYNC',
          },
        ],
      },
      {
        id: 'insights',
        title: 'Insights & Impact',
        collapsible: true,
        items: [
          {
            icon: BarChart3,
            label: 'Storage Analytics',
            path: '/storage-analytics',
            flag: 'FEATURE_STORAGE_ANALYTICS',
          },
          {
            icon: Leaf,
            label: 'Carbon Footprint',
            path: '/carbon-footprint',
            flag: 'FEATURE_CARBON_FOOTPRINT',
          },
          {
            icon: Flame,
            label: 'Daily Impact',
            path: '/daily-impact',
            flag: 'FEATURE_DAILY_IMPACT',
          },
        ],
      },
      {
        id: 'operations',
        title: 'Operations & Settings',
        collapsible: true,
        items: [
          {
            icon: Layers,
            label: 'Bulk Actions',
            path: '/bulk-actions',
            flag: 'FEATURE_BULK_ACTIONS',
          },
          {
            icon: Zap,
            label: 'Automation & Triggers',
            path: '/automation',
            flag: 'FEATURE_AUTOMATION_TRIGGERS',
          },
          {
            icon: History,
            label: 'History',
            path: '/history',
            flag: 'FEATURE_HISTORY',
          },
          {
            icon: Settings,
            label: 'Settings',
            path: '/settings',
            flag: 'FEATURE_SETTINGS',
          },
          {
            icon: Info,
            label: 'About',
            path: '/about',
            flag: 'FEATURE_ABOUT',
          },
        ],
      },
    ],
    []
  )

  const [openSections, setOpenSections] = useState(() => {
    const initial = {
      cleanup: true,
      organisation: false,
      security: false,
      insights: false,
      operations: false,
    }
    const matchingSection = navigationSections.find(
      (s) => s.collapsible && s.items.some((i) => i.path === currentPath)
    )
    if (matchingSection) {
      initial[matchingSection.id] = true
    }
    return initial
  })

  // Auto-expand section when user navigates to a route in a collapsed section
  useEffect(() => {
    const matchingSection = navigationSections.find(
      (s) => s.collapsible && s.items.some((i) => i.path === currentPath)
    )
    if (matchingSection && !openSections[matchingSection.id]) {
      setOpenSections((prev) => ({
        ...prev,
        [matchingSection.id]: true,
      }))
    }
  }, [currentPath, navigationSections])

  const toggleSection = (id) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Filter items if searching
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navigationSections
    const query = searchQuery.toLowerCase()

    return navigationSections
      .map((section) => {
        const matchingItems = section.items.filter((item) =>
          item.label.toLowerCase().includes(query)
        )
        return {
          ...section,
          items: matchingItems,
        }
      })
      .filter((section) => section.items.length > 0)
  }, [navigationSections, searchQuery])

  // Collapsed dock state
  const [hoveredTooltip, setHoveredTooltip] = useState(null)
  const [activeFlyout, setActiveFlyout] = useState(null)
  const closeTimerRef = useRef(null)

  // Map category hubs
  const categoryHubs = useMemo(() => {
    const icons = {
      cleanup: RefreshCw,
      organisation: FolderTree,
      security: ShieldAlert,
      insights: BarChart3,
      operations: Layers,
    }
    return navigationSections
      .filter((s) => s.collapsible)
      .map((s) => ({
        ...s,
        icon: icons[s.id] || Layers,
      }))
  }, [navigationSections])

  const handleCategoryMouseEnter = (category, e) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    const rect = e.currentTarget.getBoundingClientRect()
    setActiveFlyout({
      category,
      top: rect.top,
    })
    setHoveredTooltip(null)
  }

  const handleCategoryMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveFlyout(null)
    }, 200)
  }

  const handleFlyoutMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }

  const handleFlyoutMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setActiveFlyout(null)
    }, 200)
  }

  const handleItemMouseEnter = (label, e) => {
    if (activeFlyout) return
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredTooltip({
      label,
      top: rect.top + rect.height / 2,
    })
  }

  const handleItemMouseLeave = () => {
    setHoveredTooltip(null)
  }

  useEffect(() => {
    if (!collapsed) {
      setActiveFlyout(null)
      setHoveredTooltip(null)
    }
  }, [collapsed])

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? '4.5rem' : '16rem',
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'relative h-screen flex flex-col select-none',
          'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
          'border-r border-slate-800/80',
          'backdrop-blur-xl shrink-0 z-30'
        )}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className={cn(
            'flex items-center border-b border-slate-800/80 p-3',
            collapsed ? 'justify-center' : 'justify-between'
          )}>
            <AnimatePresence mode="wait">
              {!collapsed ? (
                <motion.div
                  key="full-header"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2.5 min-w-0"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                    <Scan className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                      Drive Cleaner
                    </h1>
                    <p className="text-[11px] text-slate-400 leading-tight">v{APP_VERSION}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="mini-logo"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCollapsed(false)}
                  title="Expand sidebar"
                  className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20"
                >
                  <Scan className="h-4.5 w-4.5 text-white" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Toggle Collapse Button (Only shown in expanded state header) */}
            {!collapsed && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="p-1.5 rounded-lg transition-colors hover:bg-slate-800/60 text-slate-400 hover:text-white shrink-0 ml-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>
            )}
          </div>

          {/* Expanded View Content */}
          {!collapsed ? (
            <>
              {/* Quick Filter Tool Input */}
              <div className="px-3 pt-3 pb-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter tools..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear filter"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation List */}
              <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 custom-scrollbar">
                {filteredSections.map((section) => {
                  const hasActiveItem = section.items.some((i) => i.path === currentPath)
                  const isSectionOpen = searchQuery.trim() ? true : (openSections[section.id] ?? true)

                  return (
                    <SidebarSection
                      key={section.id}
                      title={section.title}
                      count={section.items.length}
                      collapsible={section.collapsible && !searchQuery.trim()}
                      isOpen={isSectionOpen}
                      onToggle={() => toggleSection(section.id)}
                      hasActiveItem={hasActiveItem}
                      collapsed={false}
                    >
                      {section.items.map((item) => (
                        <NavItem
                          key={item.path}
                          icon={item.icon}
                          label={item.label}
                          path={item.path}
                          disabled={!isFeatureEnabled(item.flag)}
                          badge={getFeatureBadge(item.flag)}
                          collapsed={false}
                        />
                      ))}
                    </SidebarSection>
                  )
                })}
              </nav>
            </>
          ) : (
            /* MINIMISED ICON DOCK */
            <div className="flex-1 flex flex-col items-center py-3 px-2 space-y-2 overflow-y-auto custom-scrollbar">
              {/* Expand Toggle Chevron */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCollapsed(false)}
                title="Expand sidebar"
                className="w-10 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>

              <div className="w-8 h-px bg-slate-800/80 my-1" />

              {/* Core 1-Click Shortcuts */}
              <Link
                to="/dashboard"
                onMouseEnter={(e) => handleItemMouseEnter('Dashboard', e)}
                onMouseLeave={handleItemMouseLeave}
                title="Dashboard"
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative group',
                  currentPath === '/dashboard'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <Home className="h-4.5 w-4.5" />
                {currentPath === '/dashboard' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-400 rounded-r-full" />
                )}
              </Link>

              <Link
                to="/smart-scan"
                onMouseEnter={(e) => handleItemMouseEnter('Smart Scan', e)}
                onMouseLeave={handleItemMouseLeave}
                title="Smart Scan"
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative group',
                  currentPath === '/smart-scan'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <Scan className="h-4.5 w-4.5" />
                {currentPath === '/smart-scan' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-400 rounded-r-full" />
                )}
              </Link>

              <div className="w-8 h-px bg-slate-800/80 my-1" />

              {/* Category Hub Tiles (with instant flyout on hover/click) */}
              {categoryHubs.map((cat) => {
                const Icon = cat.icon
                const hasActive = cat.items.some((i) => i.path === currentPath)
                const isHovered = activeFlyout?.category?.id === cat.id

                return (
                  <div key={cat.id} className="relative">
                    <button
                      type="button"
                      onMouseEnter={(e) => handleCategoryMouseEnter(cat, e)}
                      onMouseLeave={handleCategoryMouseLeave}
                      onClick={() => {
                        // Clicking expands the sidebar and opens that category
                        setCollapsed(false)
                        setOpenSections((prev) => ({
                          ...prev,
                          [cat.id]: true,
                        }))
                      }}
                      title={cat.title}
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative group',
                        hasActive
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/20'
                          : isHovered
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      {/* Count badge pill */}
                      <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-3.5 rounded-full text-[9px] font-bold bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
                        {cat.items.length}
                      </span>
                      {/* Active indicator dot */}
                      {hasActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-400 rounded-r-full" />
                      )}
                    </button>
                  </div>
                )
              })}

              <div className="w-8 h-px bg-slate-800/80 my-1 mt-auto" />

              {/* Bottom Direct Shortcuts: Settings & About */}
              <Link
                to="/settings"
                onMouseEnter={(e) => handleItemMouseEnter('Settings', e)}
                onMouseLeave={handleItemMouseLeave}
                title="Settings"
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 relative group',
                  currentPath === '/settings'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <Settings className="h-4.5 w-4.5" />
                {currentPath === '/settings' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-400 rounded-r-full" />
                )}
              </Link>
            </div>
          )}
        </div>
      </motion.aside>

      {/* FLOATING HOVER TOOLTIP (UNCLIPPED, FIXED POSITION) */}
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
            className="fixed z-[100] px-3 py-1.5 bg-slate-900/95 border border-slate-800 text-white text-xs font-medium rounded-xl shadow-2xl backdrop-blur-md pointer-events-none whitespace-nowrap"
          >
            {hoveredTooltip.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING CATEGORY FLYOUT MENU (UNCLIPPED, FIXED POSITION) */}
      <AnimatePresence>
        {collapsed && activeFlyout && (
          <motion.div
            key={activeFlyout.category.id}
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
            className="fixed z-[100] w-64 p-2 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-1 text-left"
          >
            {/* Category Header */}
            <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white tracking-wide">
                {activeFlyout.category.title}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                {activeFlyout.category.items.length} tools
              </span>
            </div>

            {/* Tool Items List */}
            <div className="space-y-0.5 max-h-[320px] overflow-y-auto custom-scrollbar">
              {activeFlyout.category.items.map((item) => {
                const Icon = item.icon
                const isActive = currentPath === item.path
                const enabled = isFeatureEnabled(item.flag)
                const badge = getFeatureBadge(item.flag)

                if (!enabled) {
                  return (
                    <div
                      key={item.path}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed opacity-50"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-slate-600" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setActiveFlyout(null)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                      isActive
                        ? 'bg-blue-500/15 text-blue-300 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200')} />
                    <span className="truncate flex-1">{item.label}</span>
                    {badge && (
                      <Badge className="ml-auto text-[9px] px-1.5 py-0 bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {badge}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

