import { useState, useMemo } from 'react'
import {
  Users,
  Globe,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { faShareNodes } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import FileTable from '@/components/FileTable'
import { useSecurityAudit } from '@/hooks/useSecurityAudit'
import { useNavigate } from '@tanstack/react-router'
import SharingAuditorCard from '@/components/sharing/SharingAuditorCard'
import { cn } from '@/lib/utils'

// Format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

// Determine file category from MIME type or file extension
function getFileCategory(mimeType = '', fileName = '') {
  const lowerMime = (mimeType || '').toLowerCase()
  const lowerName = (fileName || '').toLowerCase()
  if (lowerMime === 'application/vnd.google-apps.folder') return 'Folder'
  if (lowerMime.includes('pdf') || lowerName.endsWith('.pdf')) return 'PDF'
  if (
    lowerMime.includes('spreadsheet') ||
    lowerMime.includes('excel') ||
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.sheet')
  )
    return 'Spreadsheet'
  if (
    lowerMime.includes('document') ||
    lowerMime.includes('word') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc')
  )
    return 'Document'
  if (
    lowerMime.includes('presentation') ||
    lowerMime.includes('powerpoint') ||
    lowerName.endsWith('.pptx')
  )
    return 'Presentation'
  if (lowerMime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/.test(lowerName))
    return 'Image'
  if (lowerMime.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/.test(lowerName))
    return 'Video'
  if (lowerMime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(lowerName))
    return 'Audio'
  if (
    lowerMime.includes('zip') ||
    lowerMime.includes('archive') ||
    lowerMime.includes('compressed') ||
    /\.(zip|tar|gz|rar|7z)$/.test(lowerName)
  )
    return 'Archive'
  if (
    lowerMime.includes('text') ||
    /\.(txt|md|log|json|xml|html|js|jsx|ts|tsx)$/.test(lowerName)
  )
    return 'Text'
  return 'Other'
}

export default function SharedFilesView() {
  const navigate = useNavigate()
  const {
    loading,
    error,
    refresh,
    report,
    publicLinks = [],
    externalDomainShares = [],
    staleCollaborators = [],
    allShared = [],
  } = useSecurityAudit()

  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'public', 'by_me', 'with_me', 'external', 'stale'

  // Process and normalize files from the live security audit report
  const {
    normalizedAll,
    publicFiles,
    sharedByMe,
    sharedWithMe,
    externalDomainFiles,
    staleFiles,
  } = useMemo(() => {
    const rawFiles = report?.allShared || allShared || []

    const pub = []
    const byMe = []
    const withMe = []
    const extDom = []
    const stale = []
    const allList = []

    rawFiles.forEach((file) => {
      const fileId = file.fileId || file.id || ''
      const fileName = file.fileName || file.title || 'Untitled'
      const mimeType = file.mimeType || ''
      const sizeBytes = Number(file.sizeBytes || file.fileSizeBytes || file.size || 0)
      const fileSize = formatBytes(sizeBytes)
      const fileCategory = getFileCategory(mimeType, fileName)
      const modifiedDate = file.modifiedDate
        ? new Date(file.modifiedDate).toLocaleDateString()
        : 'Unknown'
      const createdDate = file.createdDate
        ? new Date(file.createdDate).toLocaleDateString()
        : 'Unknown'
      const ownerNames = file.ownerNames || 'You'
      const isPublic = !!file.isPublic
      const sharingStatus = isPublic ? 'Public' : 'Shared'
      const driveLink =
        file.driveLink || (fileId ? `https://drive.google.com/file/d/${fileId}/view` : '')
      const parentName = file.parentName || 'My Drive'

      const isOwner =
        !file.ownerNames ||
        file.ownerNames.toLowerCase() === 'you' ||
        file.ownerNames.toLowerCase() === 'me' ||
        file.ownerNames.includes('(me)') ||
        file.ownerNames.toLowerCase() === 'owner' ||
        (file.collaborators &&
          file.collaborators.length > 0 &&
          !file.collaborators.some((c) => c.role === 'owner'))

      const normalized = {
        ...file,
        fileId,
        fileName,
        fileSize,
        fileSizeBytes: sizeBytes,
        fileCategory,
        modifiedDate,
        createdDate,
        ownerNames,
        sharingStatus,
        parentName,
        driveLink,
        mimeType,
        starred: !!file.starred,
        isPublic,
        isSharedByMe: isOwner,
        isSharedWithMe: !isOwner,
        hasExternalShares: !!file.hasExternalShares,
        isStaleShare: !!file.isStaleShare,
      }

      allList.push(normalized)
      if (isPublic) pub.push(normalized)
      if (isOwner) byMe.push(normalized)
      if (!isOwner) withMe.push(normalized)
      if (file.hasExternalShares || (file.externalDomains && file.externalDomains.length > 0)) {
        extDom.push(normalized)
      }
      if (file.isStaleShare) stale.push(normalized)
    })

    return {
      normalizedAll: allList,
      publicFiles: pub,
      sharedByMe: byMe,
      sharedWithMe: withMe,
      externalDomainFiles: extDom,
      staleFiles: stale,
    }
  }, [report?.allShared, allShared])

  // Filtered files for table display
  const displayedFiles = useMemo(() => {
    switch (activeFilter) {
      case 'public':
        return publicFiles
      case 'by_me':
        return sharedByMe
      case 'with_me':
        return sharedWithMe
      case 'external':
        return externalDomainFiles
      case 'stale':
        return staleFiles
      case 'all':
      default:
        return normalizedAll
    }
  }, [activeFilter, normalizedAll, publicFiles, sharedByMe, sharedWithMe, externalDomainFiles, staleFiles])

  // Aggregate bytes
  const publicBytes = useMemo(() => publicFiles.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0), [publicFiles])
  const sharedByMeBytes = useMemo(() => sharedByMe.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0), [sharedByMe])
  const sharedWithMeBytes = useMemo(() => sharedWithMe.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0), [sharedWithMe])
  const totalSharedBytes = useMemo(() => normalizedAll.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0), [normalizedAll])

  const filterTabs = [
    { id: 'all', label: 'All Shared', count: normalizedAll.length, icon: Users },
    {
      id: 'public',
      label: 'Public Links',
      count: publicFiles.length,
      icon: Globe,
      alert: publicFiles.length > 0,
    },
    { id: 'by_me', label: 'Shared by Me', count: sharedByMe.length, icon: ArrowUpRight },
    { id: 'with_me', label: 'Shared with Me', count: sharedWithMe.length, icon: ArrowDownLeft },
    {
      id: 'external',
      label: 'External Domains',
      count: externalDomainFiles.length,
      icon: ShieldAlert,
    },
    {
      id: 'stale',
      label: 'Stale Shares (>180d)',
      count: staleFiles.length,
      icon: Clock,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Hero
        icon={Users}
        title="Shared Files & Permission Auditor"
        subtitle="Audit sharing exposure, detect public links, distinguish ownership, and clean up unneeded shared items"
        badge="Active"
        faIcon={faShareNodes}
        variant="cyan"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/smart-scan' })}
              className="h-11 px-4 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              <Search className="w-4 h-4 mr-2" />
              Configure Scope
            </Button>
            <Button
              onClick={refresh}
              disabled={loading}
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/40 text-xs transition-all active:scale-95"
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
              {loading ? 'Auditing Sharing...' : 'Refresh Audit'}
            </Button>
          </div>
        }
      />

      {/* Sharing Overview Metric Cards */}
      <SharingAuditorCard
        publicCount={publicFiles.length}
        publicBytes={publicBytes}
        sharedByMeCount={sharedByMe.length}
        sharedByMeBytes={sharedByMeBytes}
        sharedWithMeCount={sharedWithMe.length}
        sharedWithMeBytes={sharedWithMeBytes}
        totalSharedCount={normalizedAll.length}
        totalSharedBytes={totalSharedBytes}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* Empty State Banner if zero shared items */}
      {!loading && normalizedAll.length === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-semibold text-emerald-200">No Shared Files Detected: </span>
            Your scanned Drive items have no external collaborators or public web links active.
          </div>
        </div>
      )}

      {/* Filter Tabs & Active Pool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeFilter === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30'
                    : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    tab.alert
                      ? 'bg-red-500 text-white font-bold'
                      : isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-slate-300 border-slate-800 bg-slate-950 px-3 py-1 rounded-lg">
            Showing {displayedFiles.length} files (
            {formatBytes(displayedFiles.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0))})
          </Badge>
        </div>
      </div>

      {/* Candidate File Table with Row Selection & Safe Trash */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-xl">
        <FileTable data={displayedFiles} loading={loading} />
      </div>
    </div>
  )
}

