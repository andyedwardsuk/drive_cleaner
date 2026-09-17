import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Zap,
  ChevronRight,
  Home,
  Scan,
  Copy,
  Trash2,
  Film,
  FolderSync,
  ShieldAlert,
} from 'lucide-react'
import { ALL_TOOLS, NAVIGATION_CATEGORIES } from '@/config/navigationItems'
import { cn } from '@/lib/utils'

// Quick action shortcuts shown when search is empty
const QUICK_ACTIONS = [
  {
    id: 'act-smart-scan',
    label: 'Run Smart Hygiene Scan',
    path: '/smart-scan',
    icon: Scan,
    badge: 'Quick Scan',
    description: 'Execute full ROT, duplicate, and storage analysis',
    categoryTitle: 'Actions',
  },
  {
    id: 'act-empty-trash',
    label: 'Purge Cloud Trash Bin',
    path: '/trash-governance',
    icon: Trash2,
    badge: 'Lifecycle',
    description: 'Permanently remove expired items from Google Drive trash',
    categoryTitle: 'Actions',
  },
  {
    id: 'act-media-opt',
    label: 'Optimise 4K Media & Videos',
    path: '/media-optimizer',
    icon: Film,
    badge: 'Heavy Files',
    description: 'Audit heavy video files and photo bursts eating space',
    categoryTitle: 'Actions',
  },
  {
    id: 'act-security-audit',
    label: 'Audit Sharing & Exposure',
    path: '/security-audit',
    icon: ShieldAlert,
    badge: 'Security',
    description: 'Review anyone-with-link and external collaborator access',
    categoryTitle: 'Actions',
  },
  {
    id: 'act-reorganize',
    label: 'Smart Folder Reorganisation',
    path: '/folder-reorganizer',
    icon: FolderSync,
    badge: 'Organisation',
    description: 'Organise loose files into automated year and category trees',
    categoryTitle: 'Actions',
  },
]

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  // Reset query and focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Filtered results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return [...QUICK_ACTIONS, ...ALL_TOOLS]
    }

    return ALL_TOOLS.filter((tool) => {
      const matchLabel = tool.label.toLowerCase().includes(q)
      const matchDesc = tool.description?.toLowerCase().includes(q)
      const matchCategory = tool.categoryTitle?.toLowerCase().includes(q)
      const matchKeywords = tool.keywords?.some((k) => k.toLowerCase().includes(q))
      return matchLabel || matchDesc || matchCategory || matchKeywords
    })
  }, [query])

  // Keep selectedIndex within bounds
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev <= 0 ? Math.max(0, filteredResults.length - 1) : prev - 1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = filteredResults[selectedIndex]
      if (selected) {
        handleSelect(selected)
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  const handleSelect = (item) => {
    onClose()
    navigate({ to: item.path })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/70 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden glass-specular z-10 flex flex-col max-h-[75vh]"
          >
            {/* Specular Ambient Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-blue-500/15 blur-3xl pointer-events-none" />

            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800/90 gap-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search tools, run actions, or jump to view..."
                className="flex-1 bg-transparent text-slate-100 text-sm md:text-base placeholder:text-slate-500 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-slate-400">
                <span>ESC</span>
              </div>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-[220px]"
            >
              {filteredResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-slate-400">No matching tools found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try searching for "scan", "trash", "duplicates", or "reorganise"
                  </p>
                </div>
              ) : (
                filteredResults.map((item, index) => {
                  const Icon = item.icon || Sparkles
                  const isSelected = index === selectedIndex

                  return (
                    <div
                      key={`${item.id}-${index}`}
                      data-selected={isSelected}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-120',
                        isSelected
                          ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                          isSelected
                            ? 'bg-blue-500/30 text-blue-300'
                            : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                        )}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>

                      {/* Title & Description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs md:text-sm font-semibold truncate">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Category Tag */}
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
                          {item.categoryTitle}
                        </span>
                        {isSelected && (
                          <CornerDownLeft className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="px-4 py-2.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                    ↑
                  </span>
                  <span className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                    ↓
                  </span>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                    ↵
                  </span>
                  to select
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Zap className="w-3 h-3 text-blue-400" />
                <span>Drive Cleaner Fast Command Engine</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
