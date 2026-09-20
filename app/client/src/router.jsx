import { createRouter, createRoute, createRootRoute, createHashHistory, Navigate, redirect } from '@tanstack/react-router'
import RootLayout from './layouts/RootLayout'

// Import 5 Primary Hub Views
import DashboardView from './views/DashboardView'
import CleanupHubView from './views/hubs/CleanupHubView'
import OrganisationHubView from './views/hubs/OrganisationHubView'
import SecurityHubView from './views/hubs/SecurityHubView'
import OperationsHubView from './views/hubs/OperationsHubView'

// General Preferences & Legal Views
import SettingsView from './views/SettingsView'
import AboutView from './views/AboutView'
import PrivacyView from './views/PrivacyView'
import TermsView from './views/TermsView'

// Create root route with fallback redirection to /dashboard
const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => <Navigate to="/dashboard" />,
})

// Index redirects to dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
  },
})

// 1. Dashboard Hub
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardView,
})

// 2. Cleanup Center Hub
const cleanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clean',
  validateSearch: (search) => ({
    tab: search.tab || 'smart-scan',
  }),
  component: CleanupHubView,
})

// 3. Organisation Studio Hub
const organiseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organise',
  validateSearch: (search) => ({
    tab: search.tab || 'folders',
  }),
  component: OrganisationHubView,
})

// 4. Security & Governance Hub
const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/security',
  validateSearch: (search) => ({
    tab: search.tab || 'audit',
  }),
  component: SecurityHubView,
})

// 5. Operations & Automation Hub
const operationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/operations',
  validateSearch: (search) => ({
    tab: search.tab || 'bulk',
  }),
  component: OperationsHubView,
})

// General Preferences Routes
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsView,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutView,
})

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: PrivacyView,
})

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsView,
})

// -------------------------------------------------------------
// BACKWARDS-COMPATIBLE ROUTE ALIASES (Preserves 100% of URLs)
// -------------------------------------------------------------

// Cleanup Aliases -> /clean?tab=...
const smartScanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/smart-scan',
  beforeLoad: () => {
    throw redirect({ to: '/clean', search: { tab: 'smart-scan' } })
  },
})

const duplicatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/duplicates',
  beforeLoad: () => {
    throw redirect({ to: '/clean', search: { tab: 'duplicates' } })
  },
})

const largeFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/large-files',
  beforeLoad: () => {
    throw redirect({ to: '/clean', search: { tab: 'large-files' } })
  },
})

const oldFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/old-files',
  beforeLoad: () => {
    throw redirect({ to: '/clean', search: { tab: 'old-files' } })
  },
})

const emptyItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/empty-items',
  beforeLoad: () => {
    throw redirect({ to: '/clean', search: { tab: 'empty-items' } })
  },
})

const tempFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/temp-files',
  beforeLoad: () => {
    throw redirect({ to: '/clean', search: { tab: 'temp-files' } })
  },
})

const mediaOptimizerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/media-optimizer',
  beforeLoad: () => {
    throw redirect({ to: '/clean', search: { tab: 'media-optimizer' } })
  },
})

const trashGovernanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trash-governance',
  beforeLoad: () => {
    throw redirect({ to: '/clean', search: { tab: 'trash-governance' } })
  },
})

// Organisation Aliases -> /organise?tab=...
const myFoldersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-folders',
  beforeLoad: () => {
    throw redirect({ to: '/organise', search: { tab: 'folders' } })
  },
})

const smartReorganizerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/smart-reorganizer',
  beforeLoad: () => {
    throw redirect({ to: '/organise', search: { tab: 'reorganizer' } })
  },
})

const folderReorganizerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/folder-reorganizer',
  beforeLoad: () => {
    throw redirect({ to: '/organise', search: { tab: 'reorganizer' } })
  },
})

const sharedDrivesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shared-drives',
  beforeLoad: () => {
    throw redirect({ to: '/organise', search: { tab: 'shared-drives' } })
  },
})

const workspaceFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workspace-files',
  beforeLoad: () => {
    throw redirect({ to: '/organise', search: { tab: 'workspace' } })
  },
})

const driveLabelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/drive-labels',
  beforeLoad: () => {
    throw redirect({ to: '/organise', search: { tab: 'labels' } })
  },
})

const labelsManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/labels-management',
  beforeLoad: () => {
    throw redirect({ to: '/organise', search: { tab: 'labels' } })
  },
})

// Security Aliases -> /security?tab=...
const securityAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/security-audit',
  beforeLoad: () => {
    throw redirect({ to: '/security', search: { tab: 'audit' } })
  },
})

const sharedFilesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shared-files',
  beforeLoad: () => {
    throw redirect({ to: '/security', search: { tab: 'sharing' } })
  },
})

const rotAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rot-analysis',
  beforeLoad: () => {
    throw redirect({ to: '/security', search: { tab: 'rot' } })
  },
})

const carbonFootprintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/carbon-footprint',
  beforeLoad: () => {
    throw redirect({ to: '/security', search: { tab: 'carbon' } })
  },
})

const storageAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/storage-analytics',
  beforeLoad: () => {
    throw redirect({ to: '/security', search: { tab: 'carbon' } })
  },
})

const dailyImpactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily-impact',
  beforeLoad: () => {
    throw redirect({ to: '/security', search: { tab: 'carbon' } })
  },
})

// Operations Aliases -> /operations?tab=...
const bulkActionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bulk-actions',
  beforeLoad: () => {
    throw redirect({ to: '/operations', search: { tab: 'bulk' } })
  },
})

const kanbanLabelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kanban-labels',
  beforeLoad: () => {
    throw redirect({ to: '/operations', search: { tab: 'kanban' } })
  },
})

const autoArchiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auto-archive',
  beforeLoad: () => {
    throw redirect({ to: '/operations', search: { tab: 'archive' } })
  },
})

const automationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/automation',
  beforeLoad: () => {
    throw redirect({ to: '/operations', search: { tab: 'triggers' } })
  },
})

const incrementalSyncRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/incremental-sync',
  beforeLoad: () => {
    throw redirect({ to: '/operations', search: { tab: 'sync' } })
  },
})

const changesStreamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/changes-stream',
  beforeLoad: () => {
    throw redirect({ to: '/operations', search: { tab: 'sync' } })
  },
})

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  beforeLoad: () => {
    throw redirect({ to: '/operations', search: { tab: 'history' } })
  },
})

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  // 5 Primary Hub Routes
  dashboardRoute,
  cleanRoute,
  organiseRoute,
  securityRoute,
  operationsRoute,
  // General & Legal
  settingsRoute,
  aboutRoute,
  privacyRoute,
  termsRoute,
  // Backwards-Compatible Aliases
  smartScanRoute,
  duplicatesRoute,
  largeFilesRoute,
  oldFilesRoute,
  emptyItemsRoute,
  tempFilesRoute,
  mediaOptimizerRoute,
  trashGovernanceRoute,
  myFoldersRoute,
  smartReorganizerRoute,
  folderReorganizerRoute,
  sharedDrivesRoute,
  workspaceFilesRoute,
  driveLabelsRoute,
  labelsManagementRoute,
  securityAuditRoute,
  sharedFilesRoute,
  rotAnalysisRoute,
  carbonFootprintRoute,
  storageAnalyticsRoute,
  dailyImpactRoute,
  bulkActionsRoute,
  kanbanLabelsRoute,
  autoArchiveRoute,
  automationRoute,
  incrementalSyncRoute,
  changesStreamRoute,
  historyRoute,
])

// Create hash history for seamless iframe and Google Apps Script compatibility
const hashHistory = createHashHistory()

// Create router instance
export const router = createRouter({
  routeTree,
  history: hashHistory,
  defaultNotFoundComponent: () => <Navigate to="/dashboard" />,
})
