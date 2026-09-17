import { useState, useEffect } from 'react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import {
  FolderTree,
  FolderSync,
  Building2,
  FileSpreadsheet,
  Tag,
} from 'lucide-react'
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
    icon: FolderTree,
    component: MyFoldersView,
  },
  {
    id: 'reorganizer',
    label: 'Smart Reorganiser',
    icon: FolderSync,
    badge: 'Hierarchy',
    component: SmartReorganizerView,
  },
  {
    id: 'shared-drives',
    label: 'Shared Drives',
    icon: Building2,
    badge: 'Enterprise',
    component: SharedDrivesView,
  },
  {
    id: 'workspace',
    label: 'Google Workspace',
    icon: FileSpreadsheet,
    component: GoogleWorkspaceView,
  },
  {
    id: 'labels',
    label: 'Drive Labels',
    icon: Tag,
    component: DriveLabelsView,
  },
]

export default function OrganisationHubView() {
  const router = useRouterState()
  const navigate = useNavigate()

  // Extract ?tab= query parameter or default to 'folders'
  const searchParams = new URLSearchParams(window.location.search)
  const initialTab = searchParams.get('tab') || 'folders'
  const [activeTab, setActiveTab] = useState(
    ORGANISATION_TABS.some((t) => t.id === initialTab) ? initialTab : 'folders'
  )

  // Synchronize when query string changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam && ORGANISATION_TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [router.location.pathname, router.location.search])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tabId)
    window.history.replaceState({}, '', url.toString())
  }

  const currentTabObj =
    ORGANISATION_TABS.find((t) => t.id === activeTab) || ORGANISATION_TABS[0]
  const ActiveComponent = currentTabObj.component

  return (
    <div className="space-y-6">
      {/* 2026 Segmented Navigation Bar */}
      <div className="p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-xl flex items-center gap-1.5 overflow-x-auto custom-scrollbar glass-specular-sm">
        {ORGANISATION_TABS.map((tab) => {
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
