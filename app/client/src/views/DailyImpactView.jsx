import { Flame, Scan, Sparkles } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import DailyImpactCard from '@/components/impact/DailyImpactCard'
import StreakCalendar from '@/components/impact/StreakCalendar'
import DailyChallengesCard from '@/components/impact/DailyChallengesCard'
import LevelProgressCard from '@/components/impact/LevelProgressCard'
import ImpactTrendsChart from '@/components/impact/ImpactTrendsChart'
import { useDailyImpact } from '@/hooks/useDailyImpact'

export default function DailyImpactView() {
  const navigate = useNavigate()
  const {
    todayLog,
    dailyLogs,
    profile,
    streak,
    calendarDays,
    challenges,
    completeChallenge,
  } = useDailyImpact()

  return (
    <div className="space-y-6">
      <Hero
        icon={Flame}
        title="Daily Impact Tracker"
        subtitle="Build sustained Drive cleaning habits, maintain daily streaks, and track your lifetime carbon reduction"
        illustration="🔥"
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              onClick={() => navigate({ to: '/smart-scan' })}
              className="shadow-lg shadow-primary/20"
            >
              <Scan className="mr-2 h-4 w-4" />
              Run Health Scan
            </Button>
          </div>
        }
      />

      {/* Top Section: Today's Summary & Streak Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyImpactCard todayLog={todayLog} />
        <StreakCalendar streak={streak} calendarDays={calendarDays} />
      </div>

      {/* Mid Section: Daily Cleaning Goals & Cleaner Level Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyChallengesCard
          challenges={challenges}
          onCompleteChallenge={completeChallenge}
        />
        <LevelProgressCard profile={profile} />
      </div>

      {/* Bottom Section: 30-Day Cumulative Impact Trends */}
      <ImpactTrendsChart dailyLogs={dailyLogs} />

      {/* Footer Motivation Banner */}
      <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white font-medium">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Habit Tip: The 2-Minute Drive Rule</span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Spending just two minutes every morning archiving old docs or emptying temporary files prevents digital hoarding, protects your quota, and reduces continuous cloud datacenter energy consumption.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/carbon-footprint' })}
          className="border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60 shrink-0 text-xs rounded-xl"
        >
          View Eco Impact ↗
        </Button>
      </div>
    </div>
  )
}
