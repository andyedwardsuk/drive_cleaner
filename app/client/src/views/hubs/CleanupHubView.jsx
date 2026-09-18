import { useState, useEffect } from 'react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import {
  Scan,
  Copy,
  FileDigit,
  Clock,
  FolderX,
  FileQuestion,
  Film,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// View Components
import SmartScanView from '../SmartScanView'
import DuplicatesView from '../DuplicatesView'
import LargeFilesView from '../LargeFilesView'
import OldFilesView from '../OldFilesView'
import EmptyItemsView from '../EmptyItemsView'
import TempFilesView from '../TempFilesView'
import MediaOptimizerView from '../MediaOptimizerView'
import TrashGovernanceView from '../TrashGovernanceView'

const CLEANUP_TABS = [
  {
    id: 'smart-scan',
    label: 'Smart Scan',
    icon: Scan,
    badge: 'Auto Audit',
    component: SmartScanView,
  },
  {
    id: 'duplicates',
    label: 'Duplicate Files',
    icon: Copy,
    component: DuplicatesView,
  },
  {
    id: 'large-files',
    label: 'Large Files',
    icon: FileDigit,
    component: LargeFilesView,
  },
  {
    id: 'old-files',
    label: 'Old Files',
    icon: Clock,
    component: OldFilesView,
  },
  {
    id: 'empty-items',
    label: 'Empty Items',
    icon: FolderX,
    component: EmptyItemsView,
  },
  {
    id: 'temp-files',
    label: 'Temporary Files',
    icon: FileQuestion,
    component: TempFilesView,
  },
  {
    id: 'media-optimizer',
    label: 'Media Optimiser',
    icon: Film,
    badge: '4K/Photos',
    component: MediaOptimizerView,
  },
  {
    id: 'trash-governance',
    label: 'Cloud Trash',
    icon: Trash2,
    badge: 'Purge',
    component: TrashGovernanceView,
  },
]

export default function CleanupHubView() {
  const router = useRouterState()
  const navigate = useNavigate()

  // Extract ?tab= query parameter or default to 'smart-scan'
  const searchParams = new URLSearchParams(window.location.search)
  const initialTab = searchParams.get('tab') || 'smart-scan'
  const [activeTab, setActiveTab] = useState(
    CLEANUP_TABS.some((t) => t.id === initialTab) ? initialTab : 'smart-scan'
  )

  // Synchronize when query string changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam && CLEANUP_TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [router.location.pathname, router.location.search])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tabId)
    window.history.replaceState({}, '', url.toString())
  }

  const currentTabObj = CLEANUP_TABS.find((t) => t.id === activeTab) || CLEANUP_TABS[0]
  const ActiveComponent = currentTabObj.component

  return (
    <div className="space-y-6">
      {/* 2026 Segmented Navigation Bar */}
      <div className="p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-xl flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth glass-specular-sm">
        {CLEANUP_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 active-spring shrink-0',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[9px] font-bold rounded-full border',
                    isActive
                      ? 'bg-blue-700/60 text-white border-blue-400/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active Tab View Content */}
      <div className="min-w-0">
        <ActiveComponent />
      </div>
    </div>
  )
}
