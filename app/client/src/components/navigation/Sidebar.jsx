import { useState, useEffect, useMemo } from 'react'
import { useRouterState } from '@tanstack/react-router'
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
            label: 'Media Optimizer',
            path: '/media-optimizer',
            flag: 'FEATURE_MEDIA_OPTIMIZER',
          },
        ],
      },
      {
        id: 'organization',
        title: 'Organization',
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
            label: 'Folder Reorganizer',
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
      organization: false,
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

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? '4.75rem' : '16rem',
      }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={cn(
        'relative h-screen flex flex-col select-none',
        'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
        'border-r border-slate-800/80',
        'backdrop-blur-xl'
      )}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Scan className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white tracking-tight leading-tight">Drive Cleaner</h1>
                  <p className="text-[11px] text-slate-400 leading-tight">v{APP_VERSION}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Collapse Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'hover:bg-slate-800/60 text-slate-400 hover:text-white',
              collapsed && 'mx-auto'
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </motion.button>
        </div>

        {/* Quick Filter Tool Input (Visible when sidebar is expanded) */}
        {!collapsed && (
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
        )}

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
                collapsed={collapsed}
              >
                {section.items.map((item) => (
                  <NavItem
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    disabled={!isFeatureEnabled(item.flag)}
                    badge={getFeatureBadge(item.flag)}
                    collapsed={collapsed}
                  />
                ))}
              </SidebarSection>
            )
          })}
        </nav>
      </div>
    </motion.aside>
  )
}

