import { Calendar, Trash2, HardDrive, Leaf, Flame, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatBytes } from '@/lib/utils'

export default function DailyImpactCard({ todayLog }) {
  const filesDeleted = todayLog?.files_deleted || 0
  const storageSaved = todayLog?.storage_saved_bytes || 0
  const co2Saved = todayLog?.co2_saved_kg || 0
  const scansRun = todayLog?.scans_run || 0
  const dateStr = todayLog?.date ? new Date(todayLog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'

  return (
    <div className="p-6 border rounded-xl bg-card/60 border-glass-border backdrop-blur-md space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-glass-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Today&apos;s Impact</h3>
            <p className="text-xs text-muted-foreground">{dateStr}</p>
          </div>
        </div>

        <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/20 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active Today</span>
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Files Cleaned */}
        <div className="p-4 rounded-lg bg-card/40 border border-glass-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Files Cleaned</span>
          </div>
          <p className="text-2xl font-bold text-white">{filesDeleted}</p>
          <p className="text-[11px] text-muted-foreground">
            {filesDeleted > 0 ? 'Removed from Drive' : 'No files cleaned yet'}
          </p>
        </div>

        {/* Storage Saved */}
        <div className="p-4 rounded-lg bg-card/40 border border-glass-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>Storage Reclaimed</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatBytes(storageSaved)}</p>
          <p className="text-[11px] text-muted-foreground">Net space reclaimed</p>
        </div>

        {/* CO2 Prevented */}
        <div className="p-4 rounded-lg bg-card/40 border border-glass-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>CO₂ Prevented</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {co2Saved > 0 ? `${co2Saved} kg` : '0 kg'}
          </p>
          <p className="text-[11px] text-muted-foreground">Emissions avoided</p>
        </div>

        {/* Scans Run */}
        <div className="p-4 rounded-lg bg-card/40 border border-glass-border space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Health Scans</span>
          </div>
          <p className="text-2xl font-bold text-white">{scansRun}</p>
          <p className="text-[11px] text-muted-foreground">Scans executed</p>
        </div>
      </div>
    </div>
  )
}
