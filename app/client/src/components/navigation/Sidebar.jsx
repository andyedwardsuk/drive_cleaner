import { useState } from 'react'
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
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import NavItem from './NavItem'
import SidebarSection from './SidebarSection'
import { isFeatureEnabled, getFeatureBadge } from '@/config/featureFlags'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  const navigationSections = [
    {
      title: 'Overview',
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
      title: 'Cleanup Tools',
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
          icon: Star,
          label: 'Shared Files',
          path: '/shared-files',
          flag: 'FEATURE_SHARED_FILES',
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
      title: 'Management',
      items: [
        {
          icon: Layers,
          label: 'Bulk Actions',
          path: '/bulk-actions',
          flag: 'FEATURE_BULK_ACTIONS',
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
        {
          icon: Zap,
          label: 'Automation & Triggers',
          path: '/automation',
          flag: 'FEATURE_AUTOMATION_TRIGGERS',
        },
        {
          icon: FolderTree,
          label: 'Folder Reorganizer',
          path: '/smart-reorganizer',
          flag: 'FEATURE_SMART_REORGANIZER',
        },
        {
          icon: Tag,
          label: 'Drive Labels',
          path: '/labels-management',
          flag: 'FEATURE_DRIVE_LABELS',
        },
        {
          icon: Users,
          label: 'Shared Drives',
          path: '/shared-drives',
          flag: 'FEATURE_SHARED_DRIVES_HUB',
        },
        {
          icon: FolderHeart,
          label: 'My Folders',
          path: '/my-folders',
          flag: 'FEATURE_MY_FOLDERS',
        },
        {
          icon: History,
          label: 'History',
          path: '/history',
          flag: 'FEATURE_HISTORY',
        },
      ],
    },
    {
      title: 'Settings',
      items: [
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
  ]

  return (
    <motion.aside
      initial={false}
      animate={{
        width: collapsed ? '5rem' : '16rem',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'relative h-screen flex flex-col',
        'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
        'border-r border-glass-border',
        'backdrop-blur-xl'
      )}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-glass-surface backdrop-blur-sm pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-glass-border">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Scan className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Drive Cleaner</h1>
                  <p className="text-xs text-gray-400">v2.7.0</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-glass-hover text-gray-400 hover:text-white',
              collapsed && 'mx-auto'
            )}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {navigationSections.map((section) => (
            <SidebarSection key={section.title} title={section.title} collapsed={collapsed}>
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
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-glass-border">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-500 text-center"
            >
              Made with Claude Code
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
