import { Shield, Sparkles, Award, HardDrive, Trash2, Leaf } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatBytes } from '@/lib/utils'

const BADGES_META = [
  { id: 'first_clean', name: 'First Clean', icon: '🌱', desc: 'Cleaned your first file' },
  { id: 'streak_3', name: '3-Day Streak', icon: '🔥', desc: 'Maintained a 3-day cleaning streak' },
  { id: 'carbon_friend', name: 'Carbon Friend', icon: '♻️', desc: 'Avoided 0.1 kg of CO2 emissions' },
  { id: 'rot_slayer', name: 'ROT Slayer', icon: '⚔️', desc: 'Purged redundant or obsolete data' },
  { id: 'space_champion', name: 'Space Champion', icon: '🚀', desc: 'Freed over 1 GB of storage' },
]

export default function LevelProgressCard({ profile }) {
  const level = profile?.level || 1
  const levelName = profile?.level_name || 'Clean Novice'
  const xp = profile?.xp || 0
  const xpNext = profile?.xp_for_next_level || 200
  const percent = Math.min(100, Math.round((xp / xpNext) * 100))

  const lifetimeFiles = profile?.lifetime_files_cleaned || 0
  const lifetimeBytes = profile?.lifetime_storage_saved_bytes || 0
  const lifetimeCo2 = profile?.lifetime_co2_saved_kg || 0
  const unlockedBadges = new Set(profile?.badges_unlocked || ['first_clean', 'streak_3'])

  return (
    <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm space-y-5">
      {/* Header with Level Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">Level {level}: {levelName}</h3>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Rank {level}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Keep cleaning and completing challenges to unlock higher ranks
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Level Progress</p>
          <p className="text-sm font-bold text-white font-mono">{xp} / {xpNext} XP</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 rounded-full bg-slate-950/70 border border-slate-800 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500 shadow-sm"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>{percent}% to Level {level + 1}</span>
          <span>{xpNext - xp} XP needed</span>
        </div>
      </div>

      {/* Lifetime Stats */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Lifetime Cleaned</span>
          </div>
          <p className="text-base font-bold text-white">{lifetimeFiles}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <HardDrive className="w-3 h-3 text-blue-400" />
            <span>Lifetime Saved</span>
          </div>
          <p className="text-base font-bold text-white">{formatBytes(lifetimeBytes)}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <Leaf className="w-3 h-3 text-emerald-400" />
            <span>CO₂ Prevented</span>
          </div>
          <p className="text-base font-bold text-emerald-400">{lifetimeCo2} kg</p>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Cleaner Badges & Achievements:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {BADGES_META.map((badge) => {
            const isUnlocked = unlockedBadges.has(badge.id)
            return (
              <div
                key={badge.id}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  isUnlocked
                    ? 'bg-primary/10 border-primary/30 text-white'
                    : 'bg-slate-950/40 border-slate-800/50 text-slate-400 opacity-50'
                }`}
              >
                <span className="text-xl block mb-1">{badge.icon}</span>
                <p className="text-xs font-medium truncate">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{badge.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
