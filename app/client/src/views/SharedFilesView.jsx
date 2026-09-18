import { useState, useMemo } from 'react'
import {
  Users,
  Globe,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Search,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import { faShareNodes } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import FileTable from '@/components/FileTable'
import { useSmartScan } from '@/hooks/useSmartScan'
import { useNavigate } from '@tanstack/react-router'
import SharingAuditorCard from '@/components/sharing/SharingAuditorCard'

// Format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function SharedFilesView() {
  const navigate = useNavigate()
  const { scanData, isScanning, startScan } = useSmartScan()
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'public', 'by_me', 'with_me', 'private'

  // Extract shared files from scanData or provide realistic sample data
  const { allShared, publicFiles, sharedByMe, sharedWithMe, privateFiles } = useMemo(() => {
    const rawFiles = scanData?.files || []

    if (rawFiles.length === 0) {
      // Realistic initial sample files for immediate testing
      const sample = [
        {
          fileId: 'shared-pub-1',
          fileName: 'Product_Roadmap_2024_Public_Deck.pdf',
          fileSize: '14.8 MB',
          fileSizeBytes: 15518924,
          fileCategory: 'PDF',
          modifiedDate: '2024-02-18',
          ownerNames: 'Me',
          sharingStatus: 'Public',
          parentName: 'Product Strategy',
          mimeType: 'application/pdf',
          isPublic: true,
          isSharedByMe: true,
          isSharedWithMe: false,
        },
        {
          fileId: 'shared-pub-2',
          fileName: 'Brand_Assets_Logo_Pack.zip',
          fileSize: '48.2 MB',
          fileSizeBytes: 50541363,
          fileCategory: 'Archive',
          modifiedDate: '2023-11-05',
          ownerNames: 'Me',
          sharingStatus: 'Public',
          parentName: 'Marketing Media',
          mimeType: 'application/zip',
          isPublic: true,
          isSharedByMe: true,
          isSharedWithMe: false,
        },
        {
          fileId: 'shared-byme-1',
          fileName: 'Q3_Financial_Projections.xlsx',
          fileSize: '3.4 MB',
          fileSizeBytes: 3565158,
          fileCategory: 'Spreadsheet',
          modifiedDate: '2024-01-22',
          ownerNames: 'Me',
          sharingStatus: 'Shared',
          parentName: 'Finance',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          isPublic: false,
          isSharedByMe: true,
          isSharedWithMe: false,
        },
        {
          fileId: 'shared-byme-2',
          fileName: 'Client_Contract_NDA_Template.docx',
          fileSize: '820 KB',
          fileSizeBytes: 839680,
          fileCategory: 'Document',
          modifiedDate: '2023-09-14',
          ownerNames: 'Me',
          sharingStatus: 'Shared',
          parentName: 'Legal',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          isPublic: false,
          isSharedByMe: true,
          isSharedWithMe: false,
        },
        {
          fileId: 'shared-withme-1',
          fileName: 'External_Consultant_Audit_Report.pdf',
          fileSize: '22.1 MB',
          fileSizeBytes: 23173529,
          fileCategory: 'PDF',
          modifiedDate: '2023-07-30',
          ownerNames: 'Sarah Jenkins (external@consulting.co)',
          sharingStatus: 'Shared',
          parentName: 'Audits',
          mimeType: 'application/pdf',
          isPublic: false,
          isSharedByMe: false,
          isSharedWithMe: true,
        },
        {
          fileId: 'shared-withme-2',
          fileName: 'Vendor_Hardware_Quotes_2023.xlsx',
          fileSize: '1.9 MB',
          fileSizeBytes: 1992294,
          fileCategory: 'Spreadsheet',
          modifiedDate: '2023-05-12',
          ownerNames: 'Procurement Vendor (orders@hardware-sys.com)',
          sharingStatus: 'Shared',
          parentName: 'IT Operations',
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          isPublic: false,
          isSharedByMe: false,
          isSharedWithMe: true,
        },
        {
          fileId: 'priv-1',
          fileName: 'Personal_Notes_Draft.txt',
          fileSize: '12 KB',
          fileSizeBytes: 12288,
          fileCategory: 'Text',
          modifiedDate: '2024-03-01',
          ownerNames: 'Me',
          sharingStatus: 'Private',
          parentName: 'Notes',
          mimeType: 'text/plain',
          isPublic: false,
          isSharedByMe: false,
          isSharedWithMe: false,
        },
      ]

      const pub = sample.filter((f) => f.isPublic)
      const byMe = sample.filter((f) => f.isSharedByMe)
      const withMe = sample.filter((f) => f.isSharedWithMe)
      const priv = sample.filter((f) => f.sharingStatus === 'Private')
      const allSh = sample.filter((f) => f.sharingStatus !== 'Private')

      return {
        allShared: allSh,
        publicFiles: pub,
        sharedByMe: byMe,
        sharedWithMe: withMe,
        privateFiles: priv,
      }
    }

    // Process actual files from scan
    const pub = []
    const byMe = []
    const withMe = []
    const priv = []
    const allSh = []

    rawFiles.forEach((file) => {
      const isShared = file.shared || (file.sharingStatus && file.sharingStatus !== 'Private')
      const isPublic = file.sharingStatus === 'Public'

      // Check if user is owner
      const isOwner =
        !file.ownerNames ||
        file.ownerNames.toLowerCase() === 'me' ||
        file.ownerNames.includes('(me)') ||
        !file.ownerNames.includes('@')

      const enhancedFile = {
        ...file,
        isPublic,
        isSharedByMe: isShared && isOwner,
        isSharedWithMe: isShared && !isOwner,
      }

      if (isPublic) pub.push(enhancedFile)
      if (enhancedFile.isSharedByMe) byMe.push(enhancedFile)
      if (enhancedFile.isSharedWithMe) withMe.push(enhancedFile)
      if (!isShared) priv.push(enhancedFile)
      if (isShared) allSh.push(enhancedFile)
    })

    return {
      allShared: allSh,
      publicFiles: pub,
      sharedByMe: byMe,
      sharedWithMe: withMe,
      privateFiles: priv,
    }
  }, [scanData])

  // Filtered files for table display
  const displayedFiles = useMemo(() => {
    switch (activeFilter) {
      case 'public':
        return publicFiles
      case 'by_me':
        return sharedByMe
      case 'with_me':
        return sharedWithMe
      case 'private':
        return privateFiles
      case 'all':
      default:
        return allShared
    }
  }, [activeFilter, allShared, publicFiles, sharedByMe, sharedWithMe, privateFiles])

  // Aggregate bytes
  const publicBytes = publicFiles.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)
  const sharedByMeBytes = sharedByMe.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)
  const sharedWithMeBytes = sharedWithMe.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)
  const totalSharedBytes = allShared.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)

  const filterTabs = [
    { id: 'all', label: 'All Shared', count: allShared.length, icon: Users },
    {
      id: 'public',
      label: 'Public Links',
      count: publicFiles.length,
      icon: Globe,
      alert: publicFiles.length > 0,
    },
    { id: 'by_me', label: 'Shared by Me', count: sharedByMe.length, icon: ArrowUpRight },
    { id: 'with_me', label: 'Shared with Me', count: sharedWithMe.length, icon: ArrowDownLeft },
    { id: 'private', label: 'Private Only', count: privateFiles.length, icon: Lock },
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
              Configure Folder
            </Button>
            <Button
              onClick={startScan}
              disabled={isScanning}
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/40 text-xs"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isScanning ? 'Scanning Drive...' : 'Re-Scan Drive'}
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
        totalSharedCount={allShared.length}
        totalSharedBytes={totalSharedBytes}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

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
        <FileTable data={displayedFiles} />
      </div>
    </div>
  )
}
