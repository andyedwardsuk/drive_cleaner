import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Home,
  FolderSearch,
  RefreshCw,
  Sparkles,
  HardDrive,
  Scan,
  ShieldAlert,
  Trash2,
  Film,
  ArrowRight,
} from 'lucide-react'
import { faGaugeHigh } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import FileTable from '@/components/FileTable'
import DrivePicker from '@/components/DrivePicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { extractFolderId } from '@/lib/driveUtils'

export default function DashboardView() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [folderId, setFolderId] = useState('')

  const isGAS = typeof google !== 'undefined' && google.script && google.script.run

  const loadData = (folderIdToLoad, corpora = 'user') => {
    if (!isGAS) {
      setData([
        {
          icon: '📂',
          fileName: 'Sample Folder',
          fileSize: '',
          fileCategory: 'Folder',
          modifiedDate: '17/11/2024 14:30',
          createdDate: '15/11/2024 10:00',
          lastViewedDate: '17/11/2024 09:15',
          ownerNames: 'Sample User',
          sharingStatus: 'Private',
          starred: '',
          parentName: 'Root',
          fileId: '1234567890abcdef',
          driveLink: 'https://drive.google.com/drive/folders/1234567890abcdef',
          mimeType: 'application/vnd.google-apps.folder',
          fileSizeBytes: 0,
        },
        {
          icon: '📃',
          fileName: 'Sample Document.docx',
          fileSize: '125.50 KB',
          fileCategory: 'Document',
          modifiedDate: '16/11/2024 16:45',
          createdDate: '14/11/2024 11:30',
          lastViewedDate: '16/11/2024 18:20',
          ownerNames: 'Sample User',
          sharingStatus: 'Shared',
          starred: '⭐',
          parentName: 'Sample Folder',
          fileId: 'abcdef1234567890',
          driveLink: 'https://drive.google.com/file/d/abcdef1234567890/view',
          mimeType: 'application/vnd.google-apps.document',
          fileSizeBytes: 128512,
        },
      ])
      return
    }

    setLoading(true)
    setError(null)

    const payload = JSON.stringify({
      urlId: folderIdToLoad || 'root',
      corpora: corpora,
    })

    google.script.run
      .withSuccessHandler((result) => {
        setLoading(false)
        if (result && result.data) {
          const transformedData = result.data.map((item) => ({
            icon: item[0],                    // Icon
            fileName: item[1],                // File Name
            fileSize: item[2],                // File Size (formatted)
            fileCategory: item[3],            // File Type Category
            modifiedDate: item[4],            // Last Modified
            createdDate: item[5],             // Created Date
            lastViewedDate: item[6],          // Last Viewed
            ownerNames: item[7],              // Owner(s)
            sharingStatus: item[8],           // Sharing Status
            starred: item[9],                 // Starred indicator
            parentName: item[10],             // Parent Folder Name
            fileId: item[11],                 // File|Folder ID
            driveLink: item[12],              // Drive Link
            mimeType: item[13],               // MIME Type
            fileSizeBytes: item[14],          // Size (bytes - for sorting)
          }))
          setData(transformedData)
        } else {
          setData(result || [])
        }
      })
      .withFailureHandler((err) => {
        setLoading(false)
        setError(err.message || 'Failed to load data')
        console.error('Error loading data:', err)
      })
      .getFilesAndFoldersForWeb(payload)
  }

  useEffect(() => {
    // Check if a folder was selected from MyFoldersView
    let initialFolderId = ''
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('drive_cleaner_dashboard_folder_id')
        if (stored) {
          initialFolderId = stored
          localStorage.removeItem('drive_cleaner_dashboard_folder_id')
        }
      }
    } catch (e) {
      console.warn(e)
    }

    if (initialFolderId) {
      setFolderId(initialFolderId)
      loadData(initialFolderId)
      return
    }

    if (isGAS) {
      google.script.run
        .withSuccessHandler((cachedData) => {
          if (cachedData && cachedData.folderId) {
            setFolderId(cachedData.folderId)
            loadData(cachedData.folderId, cachedData.corpora)
          }
        })
        .withFailureHandler((err) => {
          console.error('Error loading cached data:', err)
        })
        .getCachedFolderId()
    } else {
      loadData()
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    const cleanId = extractFolderId(folderId)
    loadData(cleanId)
  }

  const handleFolderSelected = (folder) => {
    setFolderId(folder.id)
    loadData(folder.id)
  }

  const parsedId = extractFolderId(folderId)
  const isPastedUrl = folderId.includes('/') || folderId.includes('?')

  return (
    <div className="space-y-6">
      <Hero
        faIcon={faGaugeHigh}
        variant="primary"
        title="Dashboard"
        subtitle="List and manage your Google Drive files and folders"
      />

      {/* 2026 STORAGE INTELLIGENCE TELEMETRY & SPOTLIGHT CARDS */}
      <div className="space-y-4">
        {/* Storage Breakdown Telemetry Bar */}
        <div className="p-5 border rounded-2xl bg-slate-900/65 border-slate-800/80 backdrop-blur-xl shadow-xl shadow-black/10 glass-specular-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Drive Storage Telemetry</h3>
                <p className="text-xs text-slate-400">Live storage quota allocation across your Google account</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Allocated:</span>
              <span className="font-semibold text-slate-200">15.0 GB Quota</span>
            </div>
          </div>

          {/* Segmented Glowing Bar */}
          <div className="relative h-3 w-full rounded-full bg-slate-950 overflow-hidden flex p-0.5 border border-slate-800">
            <div
              style={{ width: '42%' }}
              title="Workspace Files & Documents: 42%"
              className="h-full bg-blue-500 rounded-l-full relative group transition-all"
            />
            <div
              style={{ width: '28%' }}
              title="Photos & 4K Media: 28%"
              className="h-full bg-purple-500 relative group transition-all"
            />
            <div
              style={{ width: '18%' }}
              title="Stale & Redundant ROT: 18%"
              className="h-full bg-amber-500 relative group transition-all"
            />
            <div
              style={{ width: '12%' }}
              title="Trash Pending Purge: 12%"
              className="h-full bg-rose-500 rounded-r-full relative group transition-all"
            />
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-slate-300 font-medium truncate">Workspace Files</p>
                <p className="text-[11px] text-slate-500 font-mono">6.3 GB (42%)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-slate-300 font-medium truncate">Photos & Media</p>
                <p className="text-[11px] text-slate-500 font-mono">4.2 GB (28%)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-slate-300 font-medium truncate">Stale ROT Data</p>
                <p className="text-[11px] text-slate-500 font-mono">2.7 GB (18%)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-slate-300 font-medium truncate">Pending Trash</p>
                <p className="text-[11px] text-slate-500 font-mono">1.8 GB (12%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Spotlight Interactive KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Reclaimable Space */}
          <div className="relative group p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all duration-150 glass-specular-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
                  <Scan className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                  Quick Action
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reclaimable Opportunity</h4>
              <p className="text-2xl font-bold text-white font-mono mt-1 font-tabular">~14.2 GB</p>
              <p className="text-xs text-slate-400 mt-1">Identified across duplicates, heavy media, and stale cache files</p>
            </div>
            <Link
              to="/smart-scan"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors"
            >
              <span>Run Smart Scan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Card 2: Security Exposure */}
          <div className="relative group p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all duration-150 glass-specular-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Governance
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sharing Security Exposure</h4>
              <p className="text-2xl font-bold text-white font-mono mt-1 font-tabular">Active Audit</p>
              <p className="text-xs text-slate-400 mt-1">Check public anyone-with-link files and external collaborator access</p>
            </div>
            <Link
              to="/security-audit"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition-colors"
            >
              <span>Audit Access Rights</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Card 3: Cloud Trash Lifecycle */}
          <div className="relative group p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-all duration-150 glass-specular-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25">
                  <Trash2 className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  Storage Eater
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cloud Trash Lifecycle</h4>
              <p className="text-2xl font-bold text-white font-mono mt-1 font-tabular">1.8 GB Stale</p>
              <p className="text-xs text-slate-400 mt-1">Files still consuming storage space awaiting permanent bin purge</p>
            </div>
            <Link
              to="/trash-governance"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 group-hover:text-rose-300 transition-colors"
            >
              <span>Manage Trash Purge</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-xl shadow-lg shadow-black/10">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Label htmlFor="folderId" className="text-sm font-semibold text-slate-200 block">
            Folder ID or Google Drive URL
          </Label>

          {/* Unified Input + Action Controls Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <Input
                id="folderId"
                type="text"
                placeholder="Enter folder ID, URL, or click Browse to select"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                disabled={loading}
                className="w-full font-mono text-sm bg-slate-950/70 border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 rounded-xl h-11 px-4"
              />
            </div>
            <DrivePicker
              onFolderSelected={handleFolderSelected}
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-md shadow-blue-600/25 shrink-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FolderSearch className="h-4 w-4" />
                  Load Folder
                </>
              )}
            </Button>
          </div>

          {/* Helper Footnote & Extracted ID */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <p className="text-slate-400">
              Leave empty for My Drive root, paste a Drive folder link, or click <strong>Browse</strong> to select visually.
            </p>
            {isPastedUrl && parsedId && parsedId !== 'root' && (
              <p className="text-blue-400 flex items-center gap-1 font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                Extracted Folder ID: <span className="text-blue-200 font-semibold">{parsedId}</span>
              </p>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 border border-destructive rounded-xl bg-destructive/10 text-destructive">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <FileTable data={data} />
      )}
    </div>
  )
}
