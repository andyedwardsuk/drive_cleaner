import { Flame, Trophy, Info } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFireFlameCurved } from '@fortawesome/pro-duotone-svg-icons'
import { Badge } from '@/components/ui/badge'

export default function StreakCalendar({ streak, calendarDays = [] }) {
  const currentStreak = streak?.currentStreak || 0
  const longestStreak = streak?.longestStreak || 0
  const isActiveToday = streak?.isActiveToday || false

  return (
    <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm space-y-5">
      {/* Header with Streak Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                {currentStreak > 0 ? `${currentStreak}-Day Clean Streak` : 'Start Your Streak!'}
              </h3>
              {isActiveToday ? (
                <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-xs">
                  Active Today
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                  Extend Today
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Clean files or run a scan each day to keep your momentum going
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-1.5 text-xs text-slate-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Best: <strong className="text-white">{longestStreak} days</strong></span>
          </div>
        </div>
      </div>

      {/* 28-Day Heatmap Grid (4 weeks) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Past 4 Weeks Activity:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Cleaned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-950/60 border border-slate-800" />
              <span>Rest Day</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const isFlameDay = day.active
            return (
              <div
                key={day.date}
                className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center relative group ${
                  day.isToday
                    ? 'ring-1 ring-primary border-primary/40 bg-primary/10'
                    : isFlameDay
                    ? 'bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80'
                }`}
              >
                <span className="text-[10px] text-slate-500 uppercase">{day.weekdayShort}</span>
                <span className={`text-sm font-semibold mt-0.5 ${isFlameDay ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {day.dayOfMonth}
                </span>
                <span className="text-[11px] mt-0.5 flex items-center justify-center h-4">
                  {isFlameDay ? <FontAwesomeIcon icon={faFireFlameCurved} className="w-3 h-3 text-amber-400" /> : <span className="text-slate-600">·</span>}
                </span>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full mb-1.5 hidden group-hover:block z-20 px-2.5 py-1.5 text-[11px] rounded-md bg-slate-900 text-slate-200 border border-slate-800 shadow-lg whitespace-nowrap">
                  <p className="font-semibold">{day.date}</p>
                  <p className="text-slate-400">
                    {day.active ? `${day.filesDeleted} files cleaned` : 'No cleanup activity'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Streak Guidance Tip */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-xs text-slate-400">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p>
          Tip: Consistent small cleanups (2-3 files per day) keep storage clutter under control and prevent data ROT from accumulating.
        </p>
      </div>
    </div>
  )
}
