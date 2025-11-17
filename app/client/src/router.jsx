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

// Create root route
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Create individual routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardView,
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
  duplicatesRoute,
  largeFilesRoute,
  oldFilesRoute,
  emptyItemsRoute,
  tempFilesRoute,
  sharedFilesRoute,
  bulkActionsRoute,
  myFoldersRoute,
  historyRoute,
  settingsRoute,
  aboutRoute,
])

// Create router instance
export const router = createRouter({ routeTree })
