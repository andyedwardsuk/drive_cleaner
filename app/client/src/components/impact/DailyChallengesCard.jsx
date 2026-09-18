import { Target, CheckCircle2, Circle, Sparkles, Award } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlassChart,
  faTrashCan,
  faSeedling,
  faClone,
  faFireFlameCurved,
  faFolderOpen,
  faSparkles
} from '@fortawesome/pro-duotone-svg-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const CHALLENGE_ICONS = {
  scan: { icon: faMagnifyingGlassChart, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  temp: { icon: faTrashCan, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  carbon: { icon: faSeedling, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  duplicates: { icon: faClone, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  rot: { icon: faFireFlameCurved, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  folders: { icon: faFolderOpen, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
}

export default function DailyChallengesCard({ challenges = [], onCompleteChallenge }) {
  const completedCount = challenges.filter((c) => c.completed).length
  const allCompleted = challenges.length > 0 && completedCount === challenges.length

  return (
    <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Daily Cleaning Goals</h3>
            <p className="text-xs text-slate-400">
              Complete micro-tasks to earn XP and level up your cleaner rank
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={allCompleted ? 'default' : 'secondary'} className="text-xs font-mono">
            {completedCount} / {challenges.length} Done
          </Badge>
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              challenge.completed
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900/80'
            }`}
          >
            <div className="flex items-start gap-3">
              {(() => {
                const iconMeta = CHALLENGE_ICONS[challenge.category] || CHALLENGE_ICONS[challenge.id] || { icon: faSparkles, color: 'text-primary bg-primary/10 border-primary/20' }
                return (
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${iconMeta.color}`}>
                    <FontAwesomeIcon icon={iconMeta.icon} className="w-4 h-4" />
                  </div>
                )
              })()}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-semibold ${challenge.completed ? 'text-emerald-300 line-through' : 'text-white'}`}>
                    {challenge.title}
                  </h4>
                  <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                    +{challenge.xp} XP
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {challenge.description}
                </p>
              </div>
            </div>

            <div className="self-end sm:self-center shrink-0">
              {challenge.completed ? (
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Completed</span>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCompleteChallenge(challenge.id)}
                  className="text-xs rounded-xl border-slate-800 hover:border-primary/40 hover:bg-primary/10"
                >
                  <Circle className="mr-1.5 h-3 w-3" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {allCompleted && (
        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All daily goals completed! Great job maintaining your Drive cleanliness today.</span>
        </div>
      )}
    </div>
  )
}
