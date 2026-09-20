import { useState, useEffect } from 'react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLayerGroup,
  faChartKanban,
  faBoxArchive,
  faBolt,
  faArrowsRotate,
  faClockRotateLeft,
} from '@fortawesome/pro-duotone-svg-icons'
import { cn } from '@/lib/utils'

// View Components
import BulkActionsView from '../BulkActionsView'
import KanbanLabelsView from '../KanbanLabelsView'
import AutoArchiveView from '../AutoArchiveView'
import AutomationTriggersView from '../AutomationTriggersView'
import IncrementalSyncView from '../IncrementalSyncView'
import HistoryView from '../HistoryView'

const OPERATIONS_TABS = [
  {
    id: 'bulk',
    label: 'Bulk Actions',
    faIcon: faLayerGroup,
    component: BulkActionsView,
  },
  {
    id: 'kanban',
    label: 'Kanban Triage',
    faIcon: faChartKanban,
    component: KanbanLabelsView,
  },
  {
    id: 'archive',
    label: 'Auto-Archive',
    faIcon: faBoxArchive,
    component: AutoArchiveView,
  },
  {
    id: 'triggers',
    label: 'Automation Triggers',
    faIcon: faBolt,
    component: AutomationTriggersView,
  },
  {
    id: 'sync',
    label: 'Live Sync Stream',
    faIcon: faArrowsRotate,
    component: IncrementalSyncView,
  },
  {
    id: 'history',
    label: 'Audit History',
    faIcon: faClockRotateLeft,
    component: HistoryView,
  },
]

export default function OperationsHubView() {
  const router = useRouterState()
  const navigate = useNavigate()

  const getResolvedTab = () => {
    const searchTab = router.location.search?.tab
    if (searchTab && OPERATIONS_TABS.some((t) => t.id === searchTab)) return searchTab
    try {
      const hash = window.location.hash || ''
      const qIdx = hash.indexOf('?')
      if (qIdx !== -1) {
        const hashTab = new URLSearchParams(hash.slice(qIdx)).get('tab')
        if (hashTab && OPERATIONS_TABS.some((t) => t.id === hashTab)) return hashTab
      }
    } catch (e) {
      // ignore
    }
    const winTab = new URLSearchParams(window.location.search).get('tab')
    if (winTab && OPERATIONS_TABS.some((t) => t.id === winTab)) return winTab
    return 'bulk'
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
    OPERATIONS_TABS.find((t) => t.id === activeTab) || OPERATIONS_TABS[0]
  const ActiveComponent = currentTabObj.component

  return (
    <div className="space-y-6">
      {/* 2026 Segmented Navigation Bar */}
      <div className="p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-xl grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-1.5 glass-specular-sm">
        {OPERATIONS_TABS.map((tab) => {
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
