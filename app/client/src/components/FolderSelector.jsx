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
    <div className={`p-6 border rounded-xl bg-card/60 border-glass-border backdrop-blur-md space-y-5 ${className}`}>
      {/* Target Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-glass-border">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Scan Target
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select the Drive scope or target folder to analyze
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-background/50 p-1 border border-glass-border self-start sm:self-auto">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleModeChange('root')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'root'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Whole Drive
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleModeChange('specific')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'specific'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
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
                  className="pr-8 bg-background/60 text-sm font-mono"
                />
              </div>

              <DrivePicker
                onFolderSelected={handlePickerSelected}
                disabled={disabled}
              />
            </div>

            {/* Extracted preview note */}
            {isPastedUrl && extractedId && (
              <p className="text-xs text-primary mt-1.5 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3" />
                Extracted Folder ID: <span className="font-semibold">{extractedId}</span>
              </p>
            )}

            {!inputVal && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Paste any Google Drive folder URL, enter a Folder ID, or click <strong>Browse</strong> to choose visually.
              </p>
            )}
          </div>

          {/* Drive Corpora Choice */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground font-medium">Drive Type:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 hover:text-white">
              <input
                type="radio"
                name="corpora"
                value="user"
                checked={corpora === 'user'}
                onChange={() => handleCorporaChange('user')}
                disabled={disabled}
                className="accent-primary"
              />
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Personal / My Drive
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 hover:text-white">
              <input
                type="radio"
                name="corpora"
                value="drive"
                checked={corpora === 'drive'}
                onChange={() => handleCorporaChange('drive')}
                disabled={disabled}
                className="accent-primary"
              />
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5" /> Shared Drive
              </span>
            </label>
          </div>

          {/* Target Folder Details Card (if resolved) */}
          {extractedId && extractedId !== 'root' && (
            <div className="p-3.5 rounded-lg bg-card/40 border border-glass-border flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-lg">📁</span>
                <div className="truncate">
                  <p className="text-sm font-semibold text-white truncate">
                    {value?.name || `Selected Folder (${extractedId.slice(0, 10)}...)`}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground truncate">
                    ID: {extractedId}
                  </p>
                </div>
              </div>

              <a
                href={getDriveFolderUrl(extractedId)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0 ml-3"
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
        <div className="pt-2 border-t border-glass-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <History className="w-3.5 h-3.5" />
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
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-primary bg-primary/15 text-primary font-medium'
                      : 'border-glass-border bg-card/40 text-muted-foreground hover:text-white hover:border-gray-500'
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
