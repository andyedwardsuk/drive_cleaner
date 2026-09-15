import {
  History,
  Trash2,
  Sparkles,
  Download,
  Trash,
  Search,
  RotateCcw,
  Calendar,
  Leaf,
  HardDrive,
  FileCheck,
} from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useHistoryLog } from '@/hooks/useHistoryLog'
import HistoryEventCard from '@/components/history/HistoryEventCard'

// Helper to format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function HistoryView() {
  const {
    events,
    allEvents,
    stats,
    eventTypeFilter,
    setEventTypeFilter,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    clearHistory,
    exportJSON,
    exportCSV,
  } = useHistoryLog()

  const filterTabs = [
    { id: 'all', label: 'All Events', count: allEvents.length, icon: Calendar },
    {
      id: 'scan',
      label: 'Scans',
      count: allEvents.filter((e) => e.type === 'scan').length,
      icon: Sparkles,
    },
    {
      id: 'trash',
      label: 'Trash Operations',
      count: allEvents.filter((e) => e.type === 'trash').length,
      icon: Trash2,
    },
    {
      id: 'restore',
      label: 'Restorations',
      count: allEvents.filter((e) => e.type === 'restore').length,
      icon: RotateCcw,
    },
  ]

  const dateTabs = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Hero
        icon={History}
        title="Scan & Action History"
        subtitle="Verifiable audit trail and timeline of all scans, trash operations, and restorations"
        badge="Active"
        illustration="📋"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              className="border-glass-border hover:bg-white/10 text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportJSON}
              className="border-glass-border hover:bg-white/10 text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 text-xs"
            >
              <Trash className="w-3.5 h-3.5 mr-1.5" />
              Clear
            </Button>
          </div>
        }
      />

      {/* Lifetime Audit Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-glass-border bg-card/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400">Total Scans</span>
              <div className="text-xl font-bold text-white">{stats.scansCount}</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-glass-border bg-card/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400">Files Cleaned</span>
              <div className="text-xl font-bold text-white">{stats.filesTrashedCount} items</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-glass-border bg-card/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400">Space Reclaimed</span>
              <div className="text-xl font-bold text-emerald-400">
                {formatBytes(stats.bytesReclaimed)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-glass-border bg-card/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/15 text-green-400 border border-green-500/25">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400">CO₂ Prevented</span>
              <div className="text-xl font-bold text-green-400">{stats.co2SavedKg} kg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-glass-border bg-card/40 backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search history by title, folder, or file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/20 border-white/10 text-sm"
            />
          </div>

          {/* Date range pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {dateTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  dateFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          {filterTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = eventTypeFilter === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setEventTypeFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                    : 'bg-card/60 text-gray-300 border-white/10 hover:bg-card/90 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            Activity Timeline
          </h2>
          <Badge variant="secondary" className="text-xs">
            {events.length} {events.length === 1 ? 'event' : 'events'} logged
          </Badge>
        </div>

        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((evt) => (
              <HistoryEventCard key={evt.id} event={evt} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border rounded-2xl bg-card/20 border-glass-border backdrop-blur-sm">
            <History className="w-10 h-10 text-gray-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-semibold text-gray-200 mb-1">No Activity Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              {searchQuery || eventTypeFilter !== 'all' || dateFilter !== 'all'
                ? 'No events match your current search or filter criteria.'
                : 'Scans and cleanup operations will be recorded here automatically.'}
            </p>
            {(searchQuery || eventTypeFilter !== 'all' || dateFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setEventTypeFilter('all')
                  setDateFilter('all')
                }}
                className="text-xs"
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
