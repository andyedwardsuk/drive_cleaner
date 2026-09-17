import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  HardDrive,
  Clock,
  User,
  Users,
  Folder,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Film,
  Music,
  Maximize2,
  Minimize2,
  Star,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useFilePreview } from '@/hooks/useFilePreview'
import { useFileActions } from '@/hooks/useFileActions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Helpers
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${(diffDays / 365).toFixed(1)} years ago`
  } catch {
    return ''
  }
}

function getFileIcon(mimeType = '') {
  if (mimeType.includes('image')) return ImageIcon
  if (mimeType.includes('video')) return Film
  if (mimeType.includes('audio')) return Music
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('sheet'))
    return FileSpreadsheet
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('pdf'))
    return FileText
  if (mimeType.includes('script') || mimeType.includes('json') || mimeType.includes('html'))
    return FileCode
  if (mimeType.includes('folder')) return Folder
  return FileText
}

export default function FilePreviewModal() {
  const {
    activeFile,
    fileList,
    currentIndex,
    isOpen,
    closePreview,
    nextFile,
    prevFile,
    hasNext,
    hasPrev,
  } = useFilePreview()

  const { requestTrash } = useFileActions()

  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // Reset states when switching files
  useEffect(() => {
    setIframeLoaded(false)
    setIsZoomed(false)
    setCopiedLink(false)
    setCopiedId(false)
  }, [activeFile?.fileId])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePreview()
      } else if (e.key === 'ArrowRight') {
        nextFile()
      } else if (e.key === 'ArrowLeft') {
        prevFile()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closePreview, nextFile, prevFile])

  if (!isOpen || !activeFile) return null

  const IconComponent = getFileIcon(activeFile.mimeType)
  const isImage =
    activeFile.mimeType.startsWith('image/') ||
    (activeFile.thumbnailLink && !activeFile.mimeType.includes('folder'))

  const isGoogleDocOrPdf =
    activeFile.mimeType.includes('google-apps') ||
    activeFile.mimeType === 'application/pdf' ||
    activeFile.mimeType.includes('officedocument')

  const isMedia =
    activeFile.mimeType.startsWith('video/') ||
    activeFile.mimeType.startsWith('audio/')

  const canEmbed = isGoogleDocOrPdf || isMedia

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeFile.driveLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(activeFile.fileId)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleTrashFromPreview = () => {
    requestTrash([activeFile.raw || activeFile])
    closePreview()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePreview}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 flex-shrink-0">
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2
                    className="text-base font-semibold text-white truncate max-w-sm sm:max-w-md md:max-w-lg"
                    title={activeFile.fileName}
                  >
                    {activeFile.fileName}
                  </h2>
                  {activeFile.starred && (
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{formatBytes(activeFile.sizeBytes)}</span>
                  <span>•</span>
                  <span>{activeFile.parentName}</span>
                </div>
              </div>
            </div>

            {/* Pagination Controls & Close */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {fileList.length > 1 && (
                <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-800 mr-2">
                  <button
                    type="button"
                    onClick={prevFile}
                    disabled={!hasPrev}
                    aria-label="Previous file"
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 px-1 font-mono">
                    {currentIndex + 1}/{fileList.length}
                  </span>
                  <button
                    type="button"
                    onClick={nextFile}
                    disabled={!hasNext}
                    aria-label="Next file"
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={closePreview}
                aria-label="Close preview"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Modal Body (Split Preview & Details) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-glass-border">
            {/* Left Column: Live Preview (7 cols) */}
            <div className="md:col-span-7 p-4 sm:p-6 flex flex-col items-center justify-center bg-slate-950/50 min-h-[320px] md:min-h-[460px] relative">
              {isImage && (activeFile.thumbnailLink || activeFile.driveLink) ? (
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={activeFile.thumbnailLink || activeFile.driveLink}
                    alt={activeFile.fileName}
                    className={cn(
                      'max-w-full max-h-[420px] object-contain rounded-xl shadow-lg transition-transform duration-200 cursor-zoom-in',
                      isZoomed && 'scale-125 cursor-zoom-out'
                    )}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 text-slate-300 hover:text-white backdrop-blur-sm border border-slate-800"
                    title={isZoomed ? 'Zoom out' : 'Zoom in'}
                  >
                    {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              ) : canEmbed && activeFile.previewLink ? (
                <div className="w-full h-full min-h-[380px] flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-900/80 relative">
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10">
                      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-xs text-slate-400">Loading document preview...</p>
                    </div>
                  )}
                  <iframe
                    src={activeFile.previewLink}
                    title={activeFile.fileName}
                    onLoad={() => setIframeLoaded(true)}
                    className="w-full h-full flex-1 border-0 rounded-xl"
                    allow="autoplay"
                  />
                </div>
              ) : (
                /* Fallback preview card */
                <div className="text-center p-8 max-w-md">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <IconComponent className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {activeFile.fileName}
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Direct in-app stream not available for this file type. You can inspect all metadata on the right or view directly in Google Drive.
                  </p>
                  <Button
                    onClick={() => window.open(activeFile.driveLink, '_blank')}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Google Drive
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column: Deep Metadata & Quick Actions (5 cols) */}
            <div className="md:col-span-5 p-5 sm:p-6 flex flex-col justify-between bg-slate-900/70 space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    Storage & Location
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-400">File Size</span>
                      <span className="font-semibold text-white">
                        {formatBytes(activeFile.sizeBytes)}{' '}
                        <span className="text-xs text-slate-400 font-normal">
                          ({activeFile.sizeBytes.toLocaleString()} bytes)
                        </span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-400">Folder</span>
                      <span className="text-slate-200 flex items-center gap-1.5 truncate max-w-[200px]" title={activeFile.parentName}>
                        <Folder className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{activeFile.parentName}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-400">MIME Type</span>
                      <span className="text-slate-300 font-mono text-xs truncate max-w-[210px]" title={activeFile.mimeType}>
                        {activeFile.mimeType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline & Lifecycle */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Timeline & Activity
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-400">Last Modified</span>
                      <div className="text-right">
                        <div className="text-slate-200">{formatDate(activeFile.modifiedDate)}</div>
                        <div className="text-xs text-amber-400 font-medium">
                          {formatRelativeTime(activeFile.modifiedDate)}
                        </div>
                      </div>
                    </div>

                    {activeFile.createdDate && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-800">
                        <span className="text-slate-400">Created</span>
                        <div className="text-slate-200">{formatDate(activeFile.createdDate)}</div>
                      </div>
                    )}

                    {activeFile.lastViewedDate && (
                      <div className="flex justify-between items-center py-1 border-b border-slate-800">
                        <span className="text-slate-400">Last Viewed</span>
                        <div className="text-right">
                          <div className="text-slate-200">{formatDate(activeFile.lastViewedDate)}</div>
                          <div className="text-xs text-slate-400">
                            {formatRelativeTime(activeFile.lastViewedDate)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Access & Sharing */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Access & Ownership
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-400">Owner</span>
                      <span className="text-slate-200 flex items-center gap-1.5 truncate max-w-[200px]" title={activeFile.ownerNames}>
                        <User className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{activeFile.ownerNames}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800">
                      <span className="text-slate-400">Sharing Status</span>
                      <Badge
                        variant={
                          activeFile.sharingStatus === 'Private'
                            ? 'outline'
                            : activeFile.sharingStatus === 'Public'
                            ? 'destructive'
                            : 'default'
                        }
                        className="text-xs"
                      >
                        {activeFile.sharingStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Drive File ID */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-xs text-slate-400 font-mono truncate">
                      ID: {activeFile.fileId}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
                    title="Copy File ID"
                  >
                    {copiedId ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(activeFile.driveLink, '_blank')}
                    className="gap-1.5 text-xs text-slate-200 hover:text-white border-slate-800 hover:bg-slate-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open in Drive
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="gap-1.5 text-xs text-slate-200 hover:text-white border-slate-800 hover:bg-slate-800"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleTrashFromPreview}
                  className="w-full gap-2 bg-red-600/90 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4" />
                  Move to Trash
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
