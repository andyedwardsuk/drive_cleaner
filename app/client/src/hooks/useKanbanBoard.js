import { create } from 'zustand'
import { faInbox, faThumbtack, faBoxArchive, faTrashCan } from '@fortawesome/pro-duotone-svg-icons'

export const KANBAN_STORAGE_KEY = 'drive_cleaner_kanban_cards_v1'

export const KANBAN_COLUMNS = [
  {
    id: 'inbox',
    title: 'Needs Review',
    icon: faInbox,
    iconColor: 'text-blue-400',
    color: 'blue',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    description: 'Unsorted files awaiting triage',
  },
  {
    id: 'keep',
    title: 'Keep / Retain',
    icon: faThumbtack,
    iconColor: 'text-emerald-400',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Important files verified to preserve',
  },
  {
    id: 'archive',
    title: 'Archive',
    icon: faBoxArchive,
    iconColor: 'text-amber-400',
    color: 'amber',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Inactive files to compress or store',
  },
  {
    id: 'trash',
    title: 'Pending Trash',
    icon: faTrashCan,
    iconColor: 'text-rose-400',
    color: 'rose',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    description: 'Files staged for batch deletion',
  },
]

function getSeedCards() {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  return [
    {
      fileId: 'k-1',
      fileName: 'Project_Alpha_Raw_Footage_2023.mp4',
      sizeBytes: 1258291200, // 1.17 GB
      mimeType: 'video/mp4',
      parentName: 'Marketing Videos',
      driveLink: 'https://drive.google.com',
      modifiedDate: new Date(now - 420 * day).toISOString(),
      columnId: 'inbox',
      label: 'Needs Review',
    },
    {
      fileId: 'k-2',
      fileName: 'Quarterly_Financial_Forecast_v3.xlsx',
      sizeBytes: 45088768, // 43 MB
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      parentName: 'Finance 2024',
      driveLink: 'https://drive.google.com',
      modifiedDate: new Date(now - 120 * day).toISOString(),
      columnId: 'keep',
      label: 'Keep',
    },
    {
      fileId: 'k-3',
      fileName: 'Annual_Report_2021_Final_Print.pdf',
      sizeBytes: 88080384, // 84 MB
      mimeType: 'application/pdf',
      parentName: 'Reports Archive',
      driveLink: 'https://drive.google.com',
      modifiedDate: new Date(now - 890 * day).toISOString(),
      columnId: 'archive',
      label: 'Archive',
    },
    {
      fileId: 'k-4',
      fileName: '~$Draft_Meeting_Notes_old.tmp',
      sizeBytes: 2048576, // 2 MB
      mimeType: 'application/octet-stream',
      parentName: 'Temp Scratch',
      driveLink: 'https://drive.google.com',
      modifiedDate: new Date(now - 210 * day).toISOString(),
      columnId: 'trash',
      label: 'Pending Trash',
    },
    {
      fileId: 'k-5',
      fileName: 'Conference_Presentation_Deck_2022.pptx',
      sizeBytes: 314572800, // 300 MB
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      parentName: 'Presentations',
      driveLink: 'https://drive.google.com',
      modifiedDate: new Date(now - 550 * day).toISOString(),
      columnId: 'inbox',
      label: 'Needs Review',
    },
    {
      fileId: 'k-6',
      fileName: 'App_Architecture_Diagram_v4.png',
      sizeBytes: 15728640, // 15 MB
      mimeType: 'image/png',
      parentName: 'Architecture',
      driveLink: 'https://drive.google.com',
      modifiedDate: new Date(now - 45 * day).toISOString(),
      columnId: 'keep',
      label: 'Keep',
    },
  ]
}

function loadInitialCards() {
  try {
    const saved = localStorage.getItem(KANBAN_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to load saved Kanban cards:', e)
  }
  return getSeedCards()
}

function persistCards(cards) {
  try {
    localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(cards))
  } catch (e) {
    console.error('Failed to persist Kanban cards:', e)
  }
}

export const useKanbanStore = create((set, get) => ({
  cards: loadInitialCards(),

  /**
   * Move card to target column
   */
  moveCard: (fileId, targetColumnId) => {
    const targetCol = KANBAN_COLUMNS.find((c) => c.id === targetColumnId)
    const label = targetCol ? targetCol.title : targetColumnId

    const updated = get().cards.map((card) => {
      if (card.fileId === fileId) {
        return { ...card, columnId: targetColumnId, label }
      }
      return card
    })

    set({ cards: updated })
    persistCards(updated)
  },

  /**
   * Import files from Smart Scan data into the 'inbox' column
   */
  importFromScan: (scanData) => {
    if (!scanData) return 0
    const existingIds = new Set(get().cards.map((c) => c.fileId))
    const newCards = []

    const candidateLists = [
      scanData.large_files?.items || [],
      scanData.old_files?.items || [],
      scanData.rot_analysis?.items || [],
      scanData.temp_files?.items || [],
      scanData.duplicates?.items || [],
    ]

    for (const list of candidateLists) {
      for (const item of list) {
        const id = item.file_id || item.fileId || item.id
        if (id && !existingIds.has(id)) {
          existingIds.add(id)
          newCards.push({
            fileId: id,
            fileName: item.file_name || item.fileName || item.title || 'Untitled',
            sizeBytes: item.size_bytes || item.fileSizeBytes || 0,
            mimeType: item.mime_type || item.mimeType || '',
            parentName: item.parent_name || item.parentName || 'Drive Folder',
            driveLink: item.drive_link || item.driveLink || `https://drive.google.com/file/d/${id}/view`,
            modifiedDate: item.modified_date || item.modifiedDate || new Date().toISOString(),
            columnId: 'inbox',
            label: 'Needs Review',
          })
        }
      }
    }

    if (newCards.length > 0) {
      const updated = [...get().cards, ...newCards]
      set({ cards: updated })
      persistCards(updated)
    }

    return newCards.length
  },

  /**
   * Remove a card from the board
   */
  removeCard: (fileId) => {
    const updated = get().cards.filter((c) => c.fileId !== fileId)
    set({ cards: updated })
    persistCards(updated)
  },

  /**
   * Clear all cards belonging to a specific column
   */
  clearColumn: (columnId) => {
    const updated = get().cards.filter((c) => c.columnId !== columnId)
    set({ cards: updated })
    persistCards(updated)
  },

  /**
   * Reset cards back to seed demo dataset
   */
  resetDemoCards: () => {
    const seeds = getSeedCards()
    set({ cards: seeds })
    persistCards(seeds)
  },
}))

/**
 * Custom hook interface for Kanban board operations
 */
export function useKanbanBoard() {
  const cards = useKanbanStore((state) => state.cards)
  const moveCard = useKanbanStore((state) => state.moveCard)
  const importFromScan = useKanbanStore((state) => state.importFromScan)
  const removeCard = useKanbanStore((state) => state.removeCard)
  const clearColumn = useKanbanStore((state) => state.clearColumn)
  const resetDemoCards = useKanbanStore((state) => state.resetDemoCards)

  return {
    cards,
    columns: KANBAN_COLUMNS,
    moveCard,
    importFromScan,
    removeCard,
    clearColumn,
    resetDemoCards,
  }
}
