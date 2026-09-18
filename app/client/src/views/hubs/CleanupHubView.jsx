import { useState, useEffect } from 'react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlassChart,
  faClone,
  faFileZipper,
  faClock,
  faFolderOpen,
  faBroom,
  faPhotoFilm,
  faTrashCan,
} from '@fortawesome/pro-duotone-svg-icons'
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
    faIcon: faMagnifyingGlassChart,
    component: SmartScanView,
  },
  {
    id: 'duplicates',
    label: 'Duplicates',
    faIcon: faClone,
    component: DuplicatesView,
  },
  {
    id: 'large-files',
    label: 'Large Files',
    faIcon: faFileZipper,
    component: LargeFilesView,
  },
  {
    id: 'old-files',
    label: 'Old Files',
    faIcon: faClock,
    component: OldFilesView,
  },
  {
    id: 'empty-items',
    label: 'Empty Items',
    faIcon: faFolderOpen,
    component: EmptyItemsView,
  },
  {
    id: 'temp-files',
    label: 'Temp Files',
    faIcon: faBroom,
    component: TempFilesView,
  },
  {
    id: 'media-optimizer',
    label: 'Media Optimiser',
    faIcon: faPhotoFilm,
    component: MediaOptimizerView,
  },
  {
    id: 'trash-governance',
    label: 'Cloud Trash',
    faIcon: faTrashCan,
    component: TrashGovernanceView,
  },
]

export default function CleanupHubView() {
  const router = useRouterState()
  const navigate = useNavigate()

  // Extract ?tab= query parameter or default to 'smart-scan'
  const searchTab = router.location.search?.tab || new URLSearchParams(window.location.search).get('tab')
  const initialTab = searchTab || 'smart-scan'
  const [activeTab, setActiveTab] = useState(
    CLEANUP_TABS.some((t) => t.id === initialTab) ? initialTab : 'smart-scan'
  )

  // Synchronize when query string changes
  useEffect(() => {
    const tabParam = router.location.search?.tab || new URLSearchParams(window.location.search).get('tab')
    if (tabParam && CLEANUP_TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [router.location.search])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    navigate({ search: { tab: tabId }, replace: true })
  }

  const currentTabObj = CLEANUP_TABS.find((t) => t.id === activeTab) || CLEANUP_TABS[0]
  const ActiveComponent = currentTabObj.component

  return (
    <div className="space-y-6">
      {/* 2026 Segmented Navigation Bar */}
      <div className="p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-xl grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-8 gap-1.5 glass-specular-sm">
        {CLEANUP_TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 active-spring text-center w-full min-w-0',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              )}
            >
              <FontAwesomeIcon
                icon={tab.faIcon}
                className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-white' : 'text-blue-400')}
              />
              <span className="truncate">{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    'hidden 2xl:inline-block px-1.5 py-0.2 text-[9px] font-bold rounded-full border shrink-0',
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
