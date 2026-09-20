import { useState, useEffect } from 'react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFolderTree,
  faSitemap,
  faBuildings,
  faFileSpreadsheet,
  faTags,
} from '@fortawesome/pro-duotone-svg-icons'
import { cn } from '@/lib/utils'

// View Components
import MyFoldersView from '../MyFoldersView'
import SmartReorganizerView from '../SmartReorganizerView'
import SharedDrivesView from '../SharedDrivesView'
import GoogleWorkspaceView from '../GoogleWorkspaceView'
import DriveLabelsView from '../DriveLabelsView'

const ORGANISATION_TABS = [
  {
    id: 'folders',
    label: 'Folder Explorer',
    faIcon: faFolderTree,
    component: MyFoldersView,
  },
  {
    id: 'reorganizer',
    label: 'Smart Reorganiser',
    faIcon: faSitemap,
    component: SmartReorganizerView,
  },
  {
    id: 'shared-drives',
    label: 'Shared Drives',
    faIcon: faBuildings,
    component: SharedDrivesView,
  },
  {
    id: 'workspace',
    label: 'Google Workspace',
    faIcon: faFileSpreadsheet,
    component: GoogleWorkspaceView,
  },
  {
    id: 'labels',
    label: 'Drive Labels',
    faIcon: faTags,
    component: DriveLabelsView,
  },
]

export default function OrganisationHubView() {
  const router = useRouterState()
  const navigate = useNavigate()

  const getResolvedTab = () => {
    const searchTab = router.location.search?.tab
    if (searchTab && ORGANISATION_TABS.some((t) => t.id === searchTab)) return searchTab
    try {
      const hash = window.location.hash || ''
      const qIdx = hash.indexOf('?')
      if (qIdx !== -1) {
        const hashTab = new URLSearchParams(hash.slice(qIdx)).get('tab')
        if (hashTab && ORGANISATION_TABS.some((t) => t.id === hashTab)) return hashTab
      }
    } catch (e) {
      // ignore
    }
    const winTab = new URLSearchParams(window.location.search).get('tab')
    if (winTab && ORGANISATION_TABS.some((t) => t.id === winTab)) return winTab
    return 'folders'
  }

  const [activeTab, setActiveTab] = useState(getResolvedTab())

  // Synchronize when route search or hash changes
  useEffect(() => {
    const resolved = getResolvedTab()
    if (resolved && resolved !== activeTab) {
      setActiveTab(resolved)
    }
  }, [router.location.search, router.location.hash])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    navigate({ search: { tab: tabId }, replace: true })
  }

  const currentTabObj =
    ORGANISATION_TABS.find((t) => t.id === activeTab) || ORGANISATION_TABS[0]
  const ActiveComponent = currentTabObj.component

  return (
    <div className="space-y-6">
      {/* 2026 Segmented Navigation Bar */}
      <div className="p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-xl grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-1.5 glass-specular-sm">
        {ORGANISATION_TABS.map((tab) => {
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
