import { useState, useEffect } from 'react'
import {
  FolderHeart,
  Plus,
  Folder,
  Trash2,
  ExternalLink,
  Scan,
  FolderSearch,
  Copy,
  Check,
  HardDrive,
  Users,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import DrivePicker from '@/components/DrivePicker'
import { useSmartScan } from '@/hooks/useSmartScan'
import { extractFolderId, getDriveFolderUrl, isValidDriveId } from '@/lib/driveUtils'

const ATTACHED_FOLDERS_KEY = 'drive_cleaner_attached_folders'

const DEFAULT_FOLDERS = [
  {
    id: 'root',
    name: 'My Drive (Root)',
    corpora: 'user',
    description: 'Whole personal Google Drive storage',
    dateAdded: new Date().toISOString(),
    isPermanent: true,
  },
]

export default function MyFoldersView() {
  const navigate = useNavigate()
  const { setTargetFolder, runScan } = useSmartScan()

  const [folders, setFolders] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(ATTACHED_FOLDERS_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      }
    } catch (e) {
      console.warn('Failed to load attached folders:', e)
    }
    return DEFAULT_FOLDERS
  })

  // New folder form state
  const [urlOrId, setUrlOrId] = useState('')
  const [customName, setCustomName] = useState('')
  const [corpora, setCorpora] = useState('user')
  const [formError, setFormError] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(ATTACHED_FOLDERS_KEY, JSON.stringify(folders))
      }
    } catch (e) {
      console.warn('Failed to save attached folders:', e)
    }
  }, [folders])

  const handlePickerSelected = (folder) => {
    setUrlOrId(folder.id)
    if (!customName) {
      setCustomName(folder.name || `Folder (${folder.id.slice(0, 8)}...)`)
    }
    setFormError('')
  }

  const handleAttachFolder = (e) => {
    e.preventDefault()
    setFormError('')

    const cleanId = extractFolderId(urlOrId)
    if (!cleanId || cleanId === '') {
      setFormError('Please enter a valid Google Drive URL or Folder ID.')
      return
    }

    if (cleanId !== 'root' && !isValidDriveId(cleanId)) {
      setFormError('The provided ID or URL does not match a valid Google Drive folder pattern.')
      return
    }

    // Check duplicate
    if (folders.some((f) => f.id === cleanId)) {
      setFormError('This folder is already in your attached folders list.')
      return
    }

    const newFolder = {
      id: cleanId,
      name: customName.trim() || (cleanId === 'root' ? 'My Drive' : `Folder (${cleanId.slice(0, 8)}...)`),
      corpora: corpora,
      description: cleanId === 'root' ? 'Whole personal Google Drive' : 'Custom attached folder',
      dateAdded: new Date().toISOString(),
      isPermanent: cleanId === 'root',
    }

    setFolders((prev) => [newFolder, ...prev])
    setUrlOrId('')
    setCustomName('')
    setShowAddForm(false)
  }

  const handleRemoveFolder = (folderId) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId))
  }

  const handleScanFolder = (folder) => {
    setTargetFolder({
      id: folder.id,
      name: folder.name,
      corpora: folder.corpora || 'user',
      url: getDriveFolderUrl(folder.id),
    })
    runScan(folder.id, folder.corpora || 'user', folder.name)
    navigate({ to: '/smart-scan' })
  }

  const handleBrowseInDashboard = (folder) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('drive_cleaner_dashboard_folder_id', folder.id)
      }
    } catch (e) {
      console.warn(e)
    }
    navigate({ to: '/dashboard' })
  }

  const handleCopyId = (id) => {
    navigator.clipboard?.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const parsedCleanId = extractFolderId(urlOrId)

  return (
    <div className="space-y-6">
      <Hero
        icon={FolderHeart}
        title="My Folders"
        subtitle="Attach, organise, and quickly scan specific Google Drive folders"
        illustration="📁"
        actions={
          <Button
            size="lg"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="shadow-lg shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showAddForm ? 'Close Form' : 'Attach Folder'}
          </Button>
        }
      />

      {/* Attach New Folder Form / Modal Card */}
      {showAddForm && (
        <div className="p-6 border rounded-2xl bg-slate-900/80 border-primary/40 backdrop-blur-md space-y-4 shadow-xl animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Attach a Google Drive Folder</span>
            </div>
            <Badge variant="outline" className="text-xs text-primary border-primary/30">
              New Target
            </Badge>
          </div>

          <form onSubmit={handleAttachFolder} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="attachUrlOrId" className="text-xs font-medium text-slate-300">
                Folder URL or Folder ID <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="attachUrlOrId"
                  type="text"
                  placeholder="e.g. https://drive.google.com/drive/folders/1aBcDe... or 1aBcDe..."
                  value={urlOrId}
                  onChange={(e) => {
                    setUrlOrId(e.target.value)
                    setFormError('')
                  }}
                  className="font-mono text-sm bg-slate-950/70 border-slate-800 flex-1 h-11 rounded-xl"
                />
                <DrivePicker onFolderSelected={handlePickerSelected} />
              </div>
              {parsedCleanId && parsedCleanId !== 'root' && urlOrId.includes('/') && (
                <p className="text-xs text-primary font-mono mt-1">
                  Extracted ID: <strong>{parsedCleanId}</strong>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customName" className="text-xs font-medium text-slate-300">
                Folder Nickname / Label (Optional)
              </Label>
              <Input
                id="customName"
                type="text"
                placeholder="e.g. Finance Backups, Project Alpha, Invoices 2024"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="text-sm bg-slate-950/70 border-slate-800 h-11 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-6 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Drive Type:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="radio"
                  name="attachCorpora"
                  value="user"
                  checked={corpora === 'user'}
                  onChange={() => setCorpora('user')}
                  className="accent-primary"
                />
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Personal / My Drive
                </span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="radio"
                  name="attachCorpora"
                  value="drive"
                  checked={corpora === 'drive'}
                  onChange={() => setCorpora('drive')}
                  className="accent-primary"
                />
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" /> Shared Drive
                </span>
              </label>
            </div>

            {formError && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setFormError('')
                }}
                className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!urlOrId.trim()} className="rounded-xl">
                Save Folder
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Folders List Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Attached Folders</h2>
          <p className="text-xs text-slate-400">
            Target folders ready for scanning, auditing, or browsing
          </p>
        </div>
        <Badge variant="secondary" className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
          {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
        </Badge>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {folders.map((folder) => {
          const isRoot = folder.id === 'root'
          return (
            <div
              key={folder.id}
              className="p-5 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm hover:border-primary/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Folder className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors">
                        {folder.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {folder.description || 'Google Drive Folder'}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-xs border-slate-700/80 text-slate-300 bg-slate-800/60">
                    {folder.corpora === 'drive' ? 'Shared Drive' : 'Personal'}
                  </Badge>
                </div>

                {/* Folder ID Row */}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-slate-400 truncate max-w-[240px]">
                    <span>ID:</span>
                    <span className="text-slate-300 truncate">{folder.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(folder.id)}
                      title="Copy ID"
                      className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors ml-1"
                    >
                      {copiedId === folder.id ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  <a
                    href={getDriveFolderUrl(folder.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 shrink-0 text-xs"
                  >
                    <span>Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleScanFolder(folder)}
                    className="bg-primary hover:bg-primary/90 text-xs shadow-sm rounded-xl"
                  >
                    <Scan className="mr-1.5 h-3.5 w-3.5" />
                    Smart Scan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBrowseInDashboard(folder)}
                    className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60 text-xs rounded-xl"
                  >
                    <FolderSearch className="mr-1.5 h-3.5 w-3.5" />
                    Browse
                  </Button>
                </div>

                {!folder.isPermanent && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveFolder(folder.id)}
                    className="text-slate-400 hover:text-destructive hover:bg-destructive/10 p-2 h-8 w-8 rounded-lg"
                    title="Remove from saved list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Guidance Note */}
      <div className="p-6 border rounded-2xl bg-slate-900/50 border-slate-800/80 text-sm text-slate-400 space-y-2">
        <p className="font-medium text-slate-200">💡 Testing with Specific Folders</p>
        <p>
          To test Drive Cleaner on a specific set of files without scanning your entire Google Drive,
          create a test folder in Google Drive (e.g. &ldquo;Drive Cleaner Test&rdquo;), copy its URL from your browser address bar,
          and attach it here. You can then trigger a focused Smart Scan in seconds!
        </p>
      </div>
    </div>
  )
}
