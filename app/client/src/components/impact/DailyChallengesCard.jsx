import { Target, CheckCircle2, Circle, Sparkles, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function DailyChallengesCard({ challenges = [], onCompleteChallenge }) {
  const completedCount = challenges.filter((c) => c.completed).length
  const allCompleted = challenges.length > 0 && completedCount === challenges.length

  return (
    <div className="p-6 border rounded-xl bg-card/60 border-glass-border backdrop-blur-md space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-glass-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Daily Cleaning Goals</h3>
            <p className="text-xs text-muted-foreground">
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
            className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              challenge.completed
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-card/40 border-glass-border hover:bg-card/60'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{challenge.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm font-semibold ${challenge.completed ? 'text-emerald-300 line-through' : 'text-white'}`}>
                    {challenge.title}
                  </h4>
                  <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                    +{challenge.xp} XP
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
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
                  className="text-xs border-glass-border hover:border-primary/40 hover:bg-primary/10"
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
