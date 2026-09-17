import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router'
import RootLayout from './layouts/RootLayout'

// Import views (we'll create these next)
import DashboardView from './views/DashboardView'
import SmartScanView from './views/SmartScanView'
import StorageAnalyticsView from './views/StorageAnalyticsView'
import DuplicatesView from './views/DuplicatesView'
import LargeFilesView from './views/LargeFilesView'
import OldFilesView from './views/OldFilesView'
import EmptyItemsView from './views/EmptyItemsView'
import TempFilesView from './views/TempFilesView'
import SharedFilesView from './views/SharedFilesView'
import BulkActionsView from './views/BulkActionsView'
import MyFoldersView from './views/MyFoldersView'
import HistoryView from './views/HistoryView'
import SettingsView from './views/SettingsView'
import AboutView from './views/AboutView'
import GoogleWorkspaceView from './views/GoogleWorkspaceView'
import RotAnalysisView from './views/RotAnalysisView'
import CarbonFootprintView from './views/CarbonFootprintView'
import DailyImpactView from './views/DailyImpactView'
import KanbanLabelsView from './views/KanbanLabelsView'
import AutoArchiveView from './views/AutoArchiveView'
import AutomationTriggersView from './views/AutomationTriggersView'
import SmartReorganizerView from './views/SmartReorganizerView'
import DriveLabelsView from './views/DriveLabelsView'
import SharedDrivesView from './views/SharedDrivesView'
import MediaOptimizerView from './views/MediaOptimizerView'
import SecurityAuditView from './views/SecurityAuditView'

// Create root route
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Create individual routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ navigate }) => {
    navigate({ to: '/dashboard' })
  },
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardView,
})

const smartScanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/smart-scan',
  component: SmartScanView,
})

const storageAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/storage-analytics',
  component: StorageAnalyticsView,
})

const carbonFootprintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/carbon-footprint',
  component: CarbonFootprintView,
})

const dailyImpactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily-impact',
  component: DailyImpactView,
})


const duplicatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/duplicates',
  component: DuplicatesView,
})

const largeFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/large-files',
  component: LargeFilesView,
})

const oldFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/old-files',
  component: OldFilesView,
})

const emptyItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/empty-items',
  component: EmptyItemsView,
})

const tempFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/temp-files',
  component: TempFilesView,
})

const workspaceFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspace-files',
  component: GoogleWorkspaceView,
})

const rotAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rot-analysis',
  component: RotAnalysisView,
})

const sharedFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shared-files',
  component: SharedFilesView,
})

const bulkActionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bulk-actions',
  component: BulkActionsView,
})

const myFoldersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-folders',
  component: MyFoldersView,
})

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryView,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsView,
})

const kanbanLabelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kanban-labels',
  component: KanbanLabelsView,
})

const autoArchiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auto-archive',
  component: AutoArchiveView,
})

const automationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/automation',
  component: AutomationTriggersView,
})

const smartReorganizerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/smart-reorganizer',
  component: SmartReorganizerView,
})

const labelsManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/labels-management',
  component: DriveLabelsView,
})

const sharedDrivesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shared-drives',
  component: SharedDrivesView,
})

const mediaOptimizerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/media-optimizer',
  component: MediaOptimizerView,
})

const securityAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/security-audit',
  component: SecurityAuditView,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutView,
})

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  smartScanRoute,
  storageAnalyticsRoute,
  carbonFootprintRoute,
  dailyImpactRoute,
  duplicatesRoute,
  largeFilesRoute,
  oldFilesRoute,
  emptyItemsRoute,
  tempFilesRoute,
  workspaceFilesRoute,
  rotAnalysisRoute,
  sharedFilesRoute,
  bulkActionsRoute,
  kanbanLabelsRoute,
  autoArchiveRoute,
  automationRoute,
  smartReorganizerRoute,
  labelsManagementRoute,
  sharedDrivesRoute,
  mediaOptimizerRoute,
  securityAuditRoute,
  myFoldersRoute,
  historyRoute,
  settingsRoute,
  aboutRoute,
])

// Create router instance
export const router = createRouter({ routeTree })
