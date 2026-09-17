import { useState, useEffect } from 'react'
import { Folder, FolderSearch, ExternalLink, Sparkles, X, History, HardDrive, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import DrivePicker from '@/components/DrivePicker'
import { extractFolderId, getDriveFolderUrl, isValidDriveId } from '@/lib/driveUtils'

/**
 * FolderSelector Component
 * Allows users to select either Root or a specific Google Drive folder (via URL, ID, or Picker)
 */
export default function FolderSelector({
  value,
  onChange,
  recentFolders = [],
  disabled = false,
  className = '',
}) {
  const currentId = value?.id || 'root'
  const isRoot = currentId === 'root'
  const [mode, setMode] = useState(isRoot ? 'root' : 'specific')
  const [inputVal, setInputVal] = useState(isRoot ? '' : currentId)
  const [extractedId, setExtractedId] = useState(isRoot ? 'root' : currentId)
  const [corpora, setCorpora] = useState(value?.corpora || 'user')

  // Keep inputVal in sync when external value changes
  useEffect(() => {
    if (value?.id === 'root') {
      setMode('root')
      setInputVal('')
      setExtractedId('root')
    } else if (value?.id) {
      setMode('specific')
      setInputVal(value.id)
      setExtractedId(value.id)
    }
    if (value?.corpora) {
      setCorpora(value.corpora)
    }
  }, [value?.id, value?.corpora])

  const handleModeChange = (newMode) => {
    setMode(newMode)
    if (newMode === 'root') {
      setInputVal('')
      setExtractedId('root')
      onChange?.({
        id: 'root',
        name: 'My Drive (Root)',
        corpora: 'user',
        url: getDriveFolderUrl('root'),
      })
    } else {
      const parsed = extractFolderId(inputVal)
      setExtractedId(parsed)
      onChange?.({
        id: parsed === 'root' ? '' : parsed,
        name: value?.name && value?.name !== 'My Drive (Root)' ? value.name : (parsed && parsed !== 'root' ? `Folder (${parsed.slice(0, 8)}...)` : ''),
        corpora: corpora,
        url: parsed ? getDriveFolderUrl(parsed) : '',
      })
    }
  }

  const handleInputChange = (e) => {
    const raw = e.target.value
    setInputVal(raw)
    const parsed = extractFolderId(raw)
    setExtractedId(parsed)

    onChange?.({
      id: parsed,
      name: (parsed && parsed !== 'root' ? `Folder (${parsed.slice(0, 8)}...)` : (parsed === 'root' ? 'My Drive' : '')),
      corpora: corpora,
      url: getDriveFolderUrl(parsed),
    })
  }

  const handleCorporaChange = (newCorpora) => {
    setCorpora(newCorpora)
    onChange?.({
      ...value,
      corpora: newCorpora,
    })
  }

  const handlePickerSelected = (folder) => {
    setMode('specific')
    setInputVal(folder.id)
    setExtractedId(folder.id)
    onChange?.({
      id: folder.id,
      name: folder.name || `Folder (${folder.id.slice(0, 8)}...)`,
      corpora: corpora,
      url: folder.url || getDriveFolderUrl(folder.id),
    })
  }

  const handleRecentClick = (folder) => {
    if (folder.id === 'root') {
      handleModeChange('root')
    } else {
      setMode('specific')
      setInputVal(folder.id)
      setExtractedId(folder.id)
      setCorpora(folder.corpora || 'user')
      onChange?.({
        id: folder.id,
        name: folder.name,
        corpora: folder.corpora || 'user',
        url: getDriveFolderUrl(folder.id),
      })
    }
  }

  const handleClear = () => {
    setInputVal('')
    setExtractedId('')
    onChange?.({
      id: '',
      name: '',
      corpora: corpora,
      url: '',
    })
  }

  const isPastedUrl = inputVal.includes('/') || inputVal.includes('?')
  const hasValidTarget = mode === 'root' || (extractedId && isValidDriveId(extractedId))

  return (
    <div className={`p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-xl shadow-lg shadow-black/10 space-y-5 ${className}`}>
      {/* Target Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-400" />
            Scan Target
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the Drive scope or target folder to analyze
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-950/70 p-1 border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleModeChange('root')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'root'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Whole Drive
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleModeChange('specific')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'specific'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderSearch className="w-3.5 h-3.5" />
            Specific Folder
          </button>
        </div>
      </div>

      {/* Mode 1: Root Info Banner */}
      {mode === 'root' && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">My Drive (Root)</p>
              <p className="text-xs text-muted-foreground">
                Will analyze all accessible files, folders, and documents in your personal Drive
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="border-primary/30 text-primary-foreground bg-primary/20">
            Entire Drive
          </Badge>
        </div>
      )}

      {/* Mode 2: Specific Folder Inputs */}
      {mode === 'specific' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="folderInput" className="text-xs text-gray-300 font-medium">
                Folder ID or Google Drive URL
              </Label>
              {inputVal && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled}
                  className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="folderInput"
                  type="text"
                  placeholder="Paste folder link (e.g. drive.google.com/drive/folders/...) or ID"
                  value={inputVal}
                  onChange={handleInputChange}
                  disabled={disabled}
                  className="pr-8 bg-slate-950/70 border-slate-700/60 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 rounded-xl h-10 text-sm font-mono"
                />
              </div>

              <DrivePicker
                onFolderSelected={handlePickerSelected}
                disabled={disabled}
              />
            </div>

            {/* Extracted preview note */}
            {isPastedUrl && extractedId && (
              <p className="text-xs text-blue-400 mt-1.5 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3" />
                Extracted Folder ID: <span className="font-semibold text-blue-300">{extractedId}</span>
              </p>
            )}

            {!inputVal && (
              <p className="text-xs text-slate-400 mt-1.5">
                Paste any Google Drive folder URL, enter a Folder ID, or click <strong>Browse</strong> to choose visually.
              </p>
            )}
          </div>

          {/* Drive Corpora Choice */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400 font-medium">Drive Type:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="radio"
                name="corpora"
                value="user"
                checked={corpora === 'user'}
                onChange={() => handleCorporaChange('user')}
                disabled={disabled}
                className="accent-blue-500"
              />
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" /> Personal / My Drive
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="radio"
                name="corpora"
                value="drive"
                checked={corpora === 'drive'}
                onChange={() => handleCorporaChange('drive')}
                disabled={disabled}
                className="accent-blue-500"
              />
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" /> Shared Drive
              </span>
            </label>
          </div>

          {/* Target Folder Details Card (if resolved) */}
          {extractedId && extractedId !== 'root' && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-lg">📁</span>
                <div className="truncate">
                  <p className="text-sm font-semibold text-white truncate">
                    {value?.name || `Selected Folder (${extractedId.slice(0, 10)}...)`}
                  </p>
                  <p className="text-xs font-mono text-slate-400 truncate">
                    ID: {extractedId}
                  </p>
                </div>
              </div>

              <a
                href={getDriveFolderUrl(extractedId)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 shrink-0 ml-3 font-medium"
              >
                <span>Open in Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Quick Presets / Recent Folders */}
      {recentFolders && recentFolders.length > 0 && (
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Recent & Preset Targets:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentFolders.slice(0, 5).map((rf, idx) => {
              const isSelected = (mode === 'root' && rf.id === 'root') || (mode === 'specific' && rf.id === extractedId)
              return (
                <button
                  key={`${rf.id}-${idx}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRecentClick(rf)}
                  className={`px-3 py-1.5 text-xs rounded-xl border transition-all flex items-center gap-1.5 font-medium shadow-sm ${
                    isSelected
                      ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <span>{rf.id === 'root' ? '🏠' : '📁'}</span>
                  <span className="max-w-[160px] truncate">{rf.name || rf.id}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
