import { Globe, Users, ArrowUpRight, ArrowDownLeft, HardDrive, AlertTriangle } from 'lucide-react'

// Format bytes
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function SharingAuditorCard({
  publicCount = 0,
  publicBytes = 0,
  sharedByMeCount = 0,
  sharedByMeBytes = 0,
  sharedWithMeCount = 0,
  sharedWithMeBytes = 0,
  totalSharedCount = 0,
  totalSharedBytes = 0,
  onSelectFilter,
  activeFilter = 'all',
}) {
  const cards = [
    {
      id: 'public',
      title: 'Public Links',
      count: publicCount,
      size: formatBytes(publicBytes),
      icon: Globe,
      alert: publicCount > 0,
      color: publicCount > 0
        ? 'from-red-500/20 to-amber-500/20 text-red-400 border-red-500/30'
        : 'from-blue-500/10 to-indigo-500/10 text-gray-400 border-white/10',
      description: 'Anyone with the link can access',
      badge: publicCount > 0 ? 'High Risk' : 'Secure',
      badgeColor: publicCount > 0 ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'by_me',
      title: 'Shared by Me',
      count: sharedByMeCount,
      size: formatBytes(sharedByMeBytes),
      icon: ArrowUpRight,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
      description: 'Files you own shared with others',
      badge: `${sharedByMeCount} files`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'with_me',
      title: 'Shared with Me',
      count: sharedWithMeCount,
      size: formatBytes(sharedWithMeBytes),
      icon: ArrowDownLeft,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      description: 'Files owned by external collaborators',
      badge: `${sharedWithMeCount} files`,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'all',
      title: 'All Shared Items',
      count: totalSharedCount,
      size: formatBytes(totalSharedBytes),
      icon: Users,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Total files with active sharing',
      badge: formatBytes(totalSharedBytes),
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Security alert banner if public links exist */}
      {publicCount > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-red-500/15 via-amber-500/10 to-red-500/15 border border-red-500/30 backdrop-blur-md animate-in fade-in-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-red-200">
                Security Alert: {publicCount} {publicCount === 1 ? 'file is' : 'files are'} publicly accessible!
              </div>
              <p className="text-xs text-red-300/80 mt-0.5">
                Anyone on the internet with the link can view these files ({formatBytes(publicBytes)} total).
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectFilter?.('public')}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-600/20 shrink-0"
          >
            Review Public Files
          </button>
        </div>
      )}

      {/* Grid of 4 metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          const isSelected = activeFilter === card.id

          return (
            <button
              key={card.id}
              onClick={() => onSelectFilter?.(card.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 backdrop-blur-md relative overflow-hidden ${
                isSelected
                  ? 'bg-card/90 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/30'
                  : 'bg-card/40 border-glass-border hover:bg-card/70 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white truncate">{card.title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-100">{card.count}</span>
                  <span className="text-xs text-emerald-400 font-medium">{card.size}</span>
                </div>
                <p className="text-[11px] text-gray-400 truncate">{card.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SharingAuditorCard
