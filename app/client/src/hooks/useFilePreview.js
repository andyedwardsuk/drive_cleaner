import { create } from 'zustand'

/**
 * Normalizes file objects across Drive API v2 responses, Smart Scan analyzers,
 * and history event structures into a consistent preview metadata object.
 */
export function normalizeFileMetadata(file) {
  if (!file) return null

  const fileId = file.fileId || file.file_id || file.id || ''
  const fileName = file.fileName || file.file_name || file.name || file.title || 'Untitled'
  const mimeType = file.mimeType || file.mime_type || ''
  const sizeBytes = Number(
    file.sizeBytes ||
    file.fileSizeBytes ||
    file.size_bytes ||
    file.size ||
    0
  )

  const driveLink =
    file.driveLink ||
    file.drive_link ||
    file.alternateLink ||
    (fileId ? `https://drive.google.com/file/d/${fileId}/view` : '')

  const previewLink = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : ''

  let thumbnailLink = file.thumbnailLink || file.thumbnail_link || ''
  if (thumbnailLink && thumbnailLink.includes('=s')) {
    thumbnailLink = thumbnailLink.replace(/=s\d+/, '=s1200')
  }

  const parentName = file.parentName || file.parent_name || 'My Drive'
  const parentId = file.parentId || file.parent_id || 'root'

  const modifiedDate = file.modifiedDate || file.modified_date || null
  const createdDate = file.createdDate || file.created_date || null
  const lastViewedDate = file.lastViewedDate || file.last_viewed_date || null

  let ownerNames = file.ownerNames || file.owner_names || file.ownerFormatted || ''
  if (Array.isArray(ownerNames)) {
    ownerNames = ownerNames.join(', ')
  }
  if (!ownerNames) {
    ownerNames = 'You'
  }

  let sharingStatus = file.sharingStatus || file.sharing_status || ''
  if (!sharingStatus) {
    sharingStatus = file.shared || file.is_shared ? 'Shared' : 'Private'
  }

  const isFolder = mimeType === 'application/vnd.google-apps.folder'

  return {
    fileId,
    fileName,
    mimeType,
    sizeBytes,
    driveLink,
    previewLink,
    thumbnailLink,
    parentName,
    parentId,
    modifiedDate,
    createdDate,
    lastViewedDate,
    ownerNames,
    sharingStatus,
    starred: !!(file.starred || (file.labels && file.labels.starred)),
    isFolder,
    raw: file,
  }
}

/**
 * Global Zustand store for managing active file preview and modal navigation
 */
export const useFilePreviewStore = create((set, get) => ({
  activeFile: null,
  fileList: [],
  currentIndex: -1,
  isOpen: false,

  /**
   * Open preview for a file, optionally passing the full list of files for pagination
   */
  openPreview: (file, list = []) => {
    if (!file) return
    const normalized = normalizeFileMetadata(file)
    const normalizedList = list.map(normalizeFileMetadata)

    let index = normalizedList.findIndex((f) => f.fileId === normalized.fileId)
    if (index === -1 && normalizedList.length > 0) {
      index = 0
    }

    set({
      activeFile: normalized,
      fileList: normalizedList.length > 0 ? normalizedList : [normalized],
      currentIndex: index >= 0 ? index : 0,
      isOpen: true,
    })
  },

  /**
   * Close the preview modal
   */
  closePreview: () => {
    set({
      isOpen: false,
      activeFile: null,
      currentIndex: -1,
    })
  },

  /**
   * Go to next file in current list
   */
  nextFile: () => {
    const { fileList, currentIndex } = get()
    if (fileList.length <= 1 || currentIndex >= fileList.length - 1) return

    const nextIdx = currentIndex + 1
    set({
      activeFile: fileList[nextIdx],
      currentIndex: nextIdx,
    })
  },

  /**
   * Go to previous file in current list
   */
  prevFile: () => {
    const { fileList, currentIndex } = get()
    if (fileList.length <= 1 || currentIndex <= 0) return

    const prevIdx = currentIndex - 1
    set({
      activeFile: fileList[prevIdx],
      currentIndex: prevIdx,
    })
  },
}))

/**
 * Hook interface for file preview operations
 */
export function useFilePreview() {
  const activeFile = useFilePreviewStore((state) => state.activeFile)
  const fileList = useFilePreviewStore((state) => state.fileList)
  const currentIndex = useFilePreviewStore((state) => state.currentIndex)
  const isOpen = useFilePreviewStore((state) => state.isOpen)
  const openPreview = useFilePreviewStore((state) => state.openPreview)
  const closePreview = useFilePreviewStore((state) => state.closePreview)
  const nextFile = useFilePreviewStore((state) => state.nextFile)
  const prevFile = useFilePreviewStore((state) => state.prevFile)

  const hasNext = currentIndex >= 0 && currentIndex < fileList.length - 1
  const hasPrev = currentIndex > 0

  return {
    activeFile,
    fileList,
    currentIndex,
    isOpen,
    openPreview,
    closePreview,
    nextFile,
    prevFile,
    hasNext,
    hasPrev,
  }
}
