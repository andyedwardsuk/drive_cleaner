import { useState, useEffect } from 'react'
import { useRouterState, useNavigate } from '@tanstack/react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShieldCheck,
  faShareNodes,
  faFileShield,
  faLeaf,
} from '@fortawesome/pro-duotone-svg-icons'
import { cn } from '@/lib/utils'

// View Components
import SecurityAuditView from '../SecurityAuditView'
import SharedFilesView from '../SharedFilesView'
import RotAnalysisView from '../RotAnalysisView'
import CarbonFootprintView from '../CarbonFootprintView'

const SECURITY_TABS = [
  {
    id: 'audit',
    label: 'Security & Exposure',
    faIcon: faShieldCheck,
    component: SecurityAuditView,
  },
  {
    id: 'sharing',
    label: 'External Collaborators',
    faIcon: faShareNodes,
    component: SharedFilesView,
  },
  {
    id: 'rot',
    label: 'ROT Classification',
    faIcon: faFileShield,
    component: RotAnalysisView,
  },
  {
    id: 'carbon',
    label: 'Carbon Footprint',
    faIcon: faLeaf,
    component: CarbonFootprintView,
  },
]

export default function SecurityHubView() {
  const router = useRouterState()
  const navigate = useNavigate()

  const getResolvedTab = () => {
    const searchTab = router.location.search?.tab
    if (searchTab && SECURITY_TABS.some((t) => t.id === searchTab)) return searchTab
    try {
      const hash = window.location.hash || ''
      const qIdx = hash.indexOf('?')
      if (qIdx !== -1) {
        const hashTab = new URLSearchParams(hash.slice(qIdx)).get('tab')
        if (hashTab && SECURITY_TABS.some((t) => t.id === hashTab)) return hashTab
      }
    } catch (e) {
      // ignore
    }
    const winTab = new URLSearchParams(window.location.search).get('tab')
    if (winTab && SECURITY_TABS.some((t) => t.id === winTab)) return winTab
    return 'audit'
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
    SECURITY_TABS.find((t) => t.id === activeTab) || SECURITY_TABS[0]
  const ActiveComponent = currentTabObj.component

  return (
    <div className="space-y-6">
      {/* 2026 Segmented Navigation Bar */}
      <div className="p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-xl grid grid-cols-2 xl:grid-cols-4 gap-1.5 glass-specular-sm">
        {SECURITY_TABS.map((tab) => {
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
