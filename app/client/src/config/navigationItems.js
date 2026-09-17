import {
  Home,
  Scan,
  Copy,
  FileDigit,
  Clock,
  FolderX,
  FileQuestion,
  Share2,
  Trash2,
  FolderTree,
  FolderSync,
  Building2,
  FileSpreadsheet,
  Tag,
  Star,
  ShieldAlert,
  Activity,
  UserX,
  BarChart3,
  FileClock,
  Leaf,
  Layers,
  Archive,
  History,
  Kanban,
  Settings,
  Info,
  Film,
} from 'lucide-react'

export const NAVIGATION_CATEGORIES = [
  {
    id: 'core',
    title: 'Core',
    collapsible: false,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: Home,
        description: 'Drive overview, folder explorer, and storage telemetry',
        keywords: ['home', 'root', 'overview', 'files', 'browse'],
      },
      {
        id: 'smart-scan',
        label: 'Smart Scan',
        path: '/smart-scan',
        icon: Scan,
        description: 'Comprehensive multi-analyzer hygiene & ROT scan',
        keywords: ['scan', 'analyze', 'hygiene', 'audit', 'health'],
      },
    ],
  },
  {
    id: 'cleanup',
    title: 'Cleanup Tools',
    collapsible: true,
    items: [
      {
        id: 'duplicates',
        label: 'Duplicate Files',
        path: '/duplicates',
        icon: Copy,
        description: 'Find identical copies and reclaim redundant space',
        keywords: ['dupes', 'clones', 'copy', 'md5', 'redundant'],
      },
      {
        id: 'large-files',
        label: 'Large Files',
        path: '/large-files',
        icon: FileDigit,
        description: 'Identify storage-heavy files over 100MB / 1GB',
        keywords: ['heavy', 'huge', 'size', 'storage', 'space'],
      },
      {
        id: 'old-files',
        label: 'Old Files',
        path: '/old-files',
        icon: Clock,
        description: 'Filter untouched files older than 1 to 5+ years',
        keywords: ['stale', 'aged', 'archive', 'ancient', 'inactive'],
      },
      {
        id: 'empty-items',
        label: 'Empty Items',
        path: '/empty-items',
        icon: FolderX,
        description: 'Prune zero-byte files and empty directory trees',
        keywords: ['zero', 'blank', 'empty folders', 'prune'],
      },
      {
        id: 'temp-files',
        label: 'Temporary Files',
        path: '/temp-files',
        icon: FileQuestion,
        description: 'Detect orphaned cache, tmp, and log remnants',
        keywords: ['tmp', 'cache', 'scratch', 'orphan', 'junk'],
      },
      {
        id: 'shared-files',
        label: 'Shared Files',
        path: '/shared-files',
        icon: Share2,
        description: 'Audit external collaborator links and public shares',
        keywords: ['sharing', 'external', 'public', 'permissions'],
      },
      {
        id: 'media-optimizer',
        label: 'Media Optimiser',
        path: '/media-optimizer',
        icon: Film,
        description: 'Compress 4K video hogs, RAW images, and bursts',
        keywords: ['photos', 'video', 'heic', '4k', 'compress'],
      },
      {
        id: 'trash-governance',
        label: 'Cloud Trash',
        path: '/trash-governance',
        icon: Trash2,
        description: 'Permanent bin purge and auto-expiration policy',
        keywords: ['bin', 'purge', 'empty', 'delete', 'lifecycle'],
      },
    ],
  },
  {
    id: 'organization',
    title: 'Organisation',
    collapsible: true,
    items: [
      {
        id: 'my-folders',
        label: 'My Folders',
        path: '/my-folders',
        icon: FolderTree,
        description: 'Visual folder tree explorer and hierarchy navigator',
        keywords: ['directories', 'tree', 'folders', 'structure'],
      },
      {
        id: 'folder-reorganizer',
        label: 'Folder Reorganiser',
        path: '/folder-reorganizer',
        icon: FolderSync,
        description: 'Smart rule-based auto-sorting into year/type folders',
        keywords: ['reorganize', 'sort', 'architect', 'archive tree'],
      },
      {
        id: 'shared-drives',
        label: 'Shared Drives',
        path: '/shared-drives',
        icon: Building2,
        description: 'Team drive hygiene, storage quotas, and member audits',
        keywords: ['team drives', 'enterprise', 'shared drive', 'corpora'],
      },
      {
        id: 'workspace-files',
        label: 'Google Workspace',
        path: '/workspace-files',
        icon: FileSpreadsheet,
        description: 'Audit Google Docs, Sheets, Slides, and Forms',
        keywords: ['docs', 'sheets', 'slides', 'forms', 'gsuite'],
      },
      {
        id: 'drive-labels',
        label: 'Drive Labels',
        path: '/drive-labels',
        icon: Tag,
        description: 'Apply governance, confidentiality, and taxonomy metadata',
        keywords: ['taxonomy', 'metadata', 'retention', 'confidential'],
      },
      {
        id: 'starred',
        label: 'Starred Items',
        path: '/starred',
        icon: Star,
        description: 'Quick access to priority marked assets',
        keywords: ['favorites', 'starred', 'important', 'pinned'],
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Governance',
    collapsible: true,
    items: [
      {
        id: 'security-audit',
        label: 'Security Audit',
        path: '/security-audit',
        icon: ShieldAlert,
        description: 'Exposure risk assessment, anyone-with-link scanner',
        keywords: ['security', 'exposure', 'risk', 'public links', 'audit'],
      },
      {
        id: 'changes-stream',
        label: 'Changes Stream',
        path: '/changes-stream',
        icon: Activity,
        description: 'Live Drive Changes API delta synchronisation engine',
        keywords: ['sync', 'stream', 'delta', 'webhooks', 'api engine'],
      },
      {
        id: 'rot-analysis',
        label: 'ROT Analysis',
        path: '/rot-analysis',
        icon: FileClock,
        description: 'Redundant, Obsolete, and Trivial data classification',
        keywords: ['rot', 'obsolete', 'trivial', 'redundant', 'compliance'],
      },
      {
        id: 'carbon',
        label: 'Carbon Footprint',
        path: '/carbon',
        icon: Leaf,
        description: 'CO2 carbon emission analytics for cloud storage',
        keywords: ['green', 'carbon', 'co2', 'emissions', 'sustainability'],
      },
    ],
  },
  {
    id: 'insights',
    title: 'Insights & Impact',
    collapsible: true,
    items: [
      {
        id: 'storage-analytics',
        label: 'Storage Analytics',
        path: '/storage-analytics',
        icon: BarChart3,
        description: 'Quota telemetry, MIME type charts, and storage graphs',
        keywords: ['charts', 'pie', 'telemetry', 'quota', 'analytics'],
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations & Settings',
    collapsible: true,
    items: [
      {
        id: 'bulk-actions',
        label: 'Bulk Actions',
        path: '/bulk-actions',
        icon: Layers,
        description: 'Batch file operations, migrations, and label tags',
        keywords: ['batch', 'multi', 'bulk', 'rules'],
      },
      {
        id: 'kanban',
        label: 'Kanban Workflow',
        path: '/kanban',
        icon: Kanban,
        description: 'Interactive triage board for file lifecycle review',
        keywords: ['board', 'triage', 'todo', 'kanban', 'cards'],
      },
      {
        id: 'archive',
        label: 'Auto-Archive',
        path: '/archive',
        icon: Archive,
        description: 'Cold storage rules and automated zip bundling',
        keywords: ['zip', 'cold storage', 'archive', 'compress'],
      },
      {
        id: 'history',
        label: 'Audit History',
        path: '/history',
        icon: History,
        description: 'Execution logs, undo timeline, and purge records',
        keywords: ['logs', 'timeline', 'audit trail', 'undo', 'activity'],
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        description: 'Preferences, colour mode, thresholds, and triggers',
        keywords: ['config', 'theme', 'dark mode', 'preferences', 'triggers'],
      },
      {
        id: 'about',
        label: 'About',
        path: '/about',
        icon: Info,
        description: 'Version specifications, release notes, and architecture',
        keywords: ['version', 'build', 'specs', 'credits'],
      },
    ],
  },
]

// Flattened list of all actionable tools for search & quick lookup
export const ALL_TOOLS = NAVIGATION_CATEGORIES.flatMap((category) =>
  category.items.map((item) => ({
    ...item,
    categoryTitle: category.title,
    categoryId: category.id,
  }))
)

/**
 * Get route info by pathname
 */
export function getRouteInfo(pathname) {
  const cleanPath = pathname === '/' ? '/dashboard' : pathname
  const tool = ALL_TOOLS.find((t) => t.path === cleanPath)
  if (tool) return tool

  // Default fallback
  return {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    categoryTitle: 'Core',
    description: 'Drive overview and storage telemetry',
  }
}
