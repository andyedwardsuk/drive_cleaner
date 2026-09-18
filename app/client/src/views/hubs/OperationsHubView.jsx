import { useState, useEffect } from 'react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import {
  Layers,
  Kanban,
  Archive,
  Zap,
  Activity,
  History,
} from 'lucide-react'
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
    icon: Layers,
    component: BulkActionsView,
  },
  {
    id: 'kanban',
    label: 'Kanban Triage',
    icon: Kanban,
    badge: 'Triage',
    component: KanbanLabelsView,
  },
  {
    id: 'archive',
    label: 'Auto-Archive',
    icon: Archive,
    component: AutoArchiveView,
  },
  {
    id: 'triggers',
    label: 'Automation Triggers',
    icon: Zap,
    badge: 'Cron',
    component: AutomationTriggersView,
  },
  {
    id: 'sync',
    label: 'Live Sync Stream',
    icon: Activity,
    badge: 'Engine',
    component: IncrementalSyncView,
  },
  {
    id: 'history',
    label: 'Audit History',
    icon: History,
    component: HistoryView,
  },
]

export default function OperationsHubView() {
  const router = useRouterState()
  const navigate = useNavigate()

  // Extract ?tab= query parameter or default to 'bulk'
  const searchTab = router.location.search?.tab || new URLSearchParams(window.location.search).get('tab')
  const initialTab = searchTab || 'bulk'
  const [activeTab, setActiveTab] = useState(
    OPERATIONS_TABS.some((t) => t.id === initialTab) ? initialTab : 'bulk'
  )

  // Synchronize when query string changes
  useEffect(() => {
    const tabParam = router.location.search?.tab || new URLSearchParams(window.location.search).get('tab')
    if (tabParam && OPERATIONS_TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [router.location.search])

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
      <div className="p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-xl flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth glass-specular-sm">
        {OPERATIONS_TABS.map((tab) => {
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
