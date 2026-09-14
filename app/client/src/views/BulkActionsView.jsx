import { useState, useMemo } from 'react'
import {
  Layers,
  FileQuestion,
  Copy,
  FolderMinus,
  Sparkles,
  Archive,
  Search,
  CheckCircle2,
} from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import FileTable from '@/components/FileTable'
import { useSmartScan } from '@/hooks/useSmartScan'
import { useNavigate } from '@tanstack/react-router'

// Format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function BulkActionsView() {
  const navigate = useNavigate()
  const { scanData, isScanning, startScan } = useSmartScan()
  const [activeCategory, setActiveCategory] = useState('all')

  // Extract candidate files from scan analyzers
  const candidates = useMemo(() => {
    const rawFiles = scanData?.files || []
    const analyzers = scanData?.analyzers || {}

    // Temp files
    const tempFiles = (analyzers.tempFiles?.items || []).map((f) => ({
      ...f,
      candidateReason: 'Temporary / Cache File',
      candidateCategory: 'temp',
    }))

    // Duplicates (take non-originals / redundant copies)
    const duplicateFiles = []
    if (analyzers.duplicates?.groups) {
      analyzers.duplicates.groups.forEach((group) => {
        // First file is treated as original; remaining are redundant copies
        if (group.files && group.files.length > 1) {
          group.files.slice(1).forEach((file) => {
            duplicateFiles.push({
              ...file,
              candidateReason: `Duplicate of "${group.files[0].fileName || 'Original'}"`,
              candidateCategory: 'duplicates',
            })
          })
        }
      })
    } else if (analyzers.duplicates?.items) {
      analyzers.duplicates.items.forEach((f) => {
        duplicateFiles.push({
          ...f,
          candidateReason: 'Redundant Duplicate',
          candidateCategory: 'duplicates',
        })
      })
    }

    // Empty items
    const emptyFiles = (analyzers.emptyItems?.items || []).map((f) => ({
      ...f,
      candidateReason: 'Empty item (0 bytes)',
      candidateCategory: 'empty',
    }))

    // ROT dead weight
    const rotFiles = (analyzers.rotAnalysis?.files || [])
      .filter((f) => (f.rotScore || 0) >= 60)
      .map((f) => ({
        ...f,
        candidateReason: `High ROT Score (${f.rotScore || 0}/100)`,
        candidateCategory: 'rot',
      }))

    // Large & old files (over 50MB and older than 1 year)
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000
    const largeOldFiles = rawFiles
      .filter((f) => {
        const size = f.fileSizeBytes || 0
        const modified = new Date(f.modifiedDate || 0).getTime()
        return size > 50 * 1024 * 1024 && modified < oneYearAgo
      })
      .map((f) => ({
        ...f,
        candidateReason: 'Large file (>50MB) unedited in >1 yr',
        candidateCategory: 'largeOld',
      }))

    // Fallback sample data if no scan has been run yet
    if (
      tempFiles.length === 0 &&
      duplicateFiles.length === 0 &&
      emptyFiles.length === 0 &&
      rotFiles.length === 0 &&
      rawFiles.length === 0
    ) {
      return {
        all: [
          {
            fileId: 'sample-temp-1',
            fileName: '~$Quarterly_Planning_Draft.tmp',
            fileSize: '1.2 MB',
            fileSizeBytes: 1258291,
            fileCategory: 'Document',
            modifiedDate: '2023-08-12',
            ownerNames: 'Me',
            sharingStatus: 'Private',
            parentName: 'Project X',
            mimeType: 'application/octet-stream',
            candidateReason: 'Temporary / Cache File',
            candidateCategory: 'temp',
          },
          {
            fileId: 'sample-temp-2',
            fileName: '.DS_Store',
            fileSize: '14.0 KB',
            fileSizeBytes: 14336,
            fileCategory: 'System',
            modifiedDate: '2023-01-05',
            ownerNames: 'Me',
            sharingStatus: 'Private',
            parentName: 'Assets',
            mimeType: 'application/octet-stream',
            candidateReason: 'Temporary / Cache File',
            candidateCategory: 'temp',
          },
          {
            fileId: 'sample-dup-1',
            fileName: 'Company_Logo_Final_v2 (Copy).png',
            fileSize: '8.4 MB',
            fileSizeBytes: 8808038,
            fileCategory: 'Image',
            modifiedDate: '2022-11-20',
            ownerNames: 'Me',
            sharingStatus: 'Private',
            parentName: 'Branding',
            mimeType: 'image/png',
            candidateReason: 'Duplicate of "Company_Logo_Final_v2.png"',
            candidateCategory: 'duplicates',
          },
          {
            fileId: 'sample-empty-1',
            fileName: 'Unused_Template_Note.txt',
            fileSize: '0 B',
            fileSizeBytes: 0,
            fileCategory: 'Text',
            modifiedDate: '2021-04-15',
            ownerNames: 'Me',
            sharingStatus: 'Private',
            parentName: 'Templates',
            mimeType: 'text/plain',
            candidateReason: 'Empty item (0 bytes)',
            candidateCategory: 'empty',
          },
          {
            fileId: 'sample-rot-1',
            fileName: 'Old_Marketing_Roadmap_2020.pdf',
            fileSize: '42.6 MB',
            fileSizeBytes: 44669337,
            fileCategory: 'PDF',
            modifiedDate: '2020-03-10',
            ownerNames: 'Me',
            sharingStatus: 'Private',
            parentName: 'Archive 2020',
            mimeType: 'application/pdf',
            candidateReason: 'High ROT Score (85/100)',
            candidateCategory: 'rot',
          },
        ],
        temp: [],
        duplicates: [],
        empty: [],
        rot: [],
        largeOld: [],
      }
    }

    // Deduplicate all by fileId
    const seen = new Set()
    const all = []
    ;[...tempFiles, ...duplicateFiles, ...emptyFiles, ...rotFiles, ...largeOldFiles].forEach(
      (f) => {
        if (!seen.has(f.fileId)) {
          seen.add(f.fileId)
          all.push(f)
        }
      }
    )

    return {
      all,
      temp: tempFiles,
      duplicates: duplicateFiles,
      empty: emptyFiles,
      rot: rotFiles,
      largeOld: largeOldFiles,
    }
  }, [scanData])

  // Current display files based on category filter
  const displayedFiles = useMemo(() => {
    if (activeCategory === 'all') return candidates.all || []
    return candidates[activeCategory] || []
  }, [candidates, activeCategory])

  const totalBytes = displayedFiles.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)

  const presetCards = [
    {
      id: 'all',
      title: 'All Candidates',
      icon: Sparkles,
      count: candidates.all?.length || 0,
      size: formatBytes(
        (candidates.all || []).reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)
      ),
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
      description: 'Consolidated cleanup candidates across all categories',
    },
    {
      id: 'temp',
      title: 'Temp & Cache',
      icon: FileQuestion,
      count: candidates.temp?.length || 0,
      size: formatBytes(
        (candidates.temp || []).reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)
      ),
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      description: 'Temporary files, swap files, .tmp, and system caches',
    },
    {
      id: 'duplicates',
      title: 'Duplicate Copies',
      icon: Copy,
      count: candidates.duplicates?.length || 0,
      size: formatBytes(
        (candidates.duplicates || []).reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)
      ),
      color: 'from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30',
      description: 'Redundant copies where an original already exists',
    },
    {
      id: 'empty',
      title: 'Empty Items',
      icon: FolderMinus,
      count: candidates.empty?.length || 0,
      size: formatBytes(
        (candidates.empty || []).reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)
      ),
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      description: '0-byte blank documents and empty container folders',
    },
    {
      id: 'rot',
      title: 'ROT Dead Weight',
      icon: Archive,
      count: candidates.rot?.length || 0,
      size: formatBytes(
        (candidates.rot || []).reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0)
      ),
      color: 'from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30',
      description: 'Redundant, obsolete, or trivial files with high ROT score',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Hero
        icon={Layers}
        title="Bulk Actions Hub"
        subtitle="Review cleanup candidates across categories, select presets, and execute safe batch trashing with undo"
        badge="Active"
        illustration="⚡"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate({ to: '/smart-scan' })}
              className="border-glass-border hover:bg-white/10"
            >
              <Search className="w-4 h-4 mr-2" />
              Configure Folder
            </Button>
            <Button
              size="lg"
              onClick={startScan}
              disabled={isScanning}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isScanning ? 'Scanning Drive...' : 'Re-Scan Drive'}
            </Button>
          </div>
        }
      />

      {/* Preset Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {presetCards.map((preset) => {
          const Icon = preset.icon
          const isActive = activeCategory === preset.id

          return (
            <button
              key={preset.id}
              onClick={() => setActiveCategory(preset.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden backdrop-blur-md ${
                isActive
                  ? 'bg-card/90 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/30'
                  : 'bg-card/40 border-glass-border hover:bg-card/70 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${preset.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isActive && (
                  <CheckCircle2 className="w-4 h-4 text-primary animate-in zoom-in-50" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white truncate">{preset.title}</h3>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-gray-200">{preset.count}</span>
                  <span className="text-gray-400">files</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-emerald-400 font-medium">{preset.size}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Pool Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card/40 border border-glass-border backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              {presetCards.find((p) => p.id === activeCategory)?.title || 'Selected Candidates'}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {displayedFiles.length} candidate items
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Select specific items or use the table header checkbox to bulk select and trash.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
            Potential Savings: <strong className="text-emerald-400">{formatBytes(totalBytes)}</strong>
          </div>
        </div>
      </div>

      {/* Interactive Candidate File Table */}
      <div className="p-4 rounded-2xl bg-card/30 border border-glass-border backdrop-blur-sm">
        <FileTable data={displayedFiles} />
      </div>
    </div>
  )
}
