import { useState, useCallback } from 'react'
import {
  getTodayLog,
  getDailyLogs,
  getUserProfile,
  updateTodayMetrics,
} from '@/lib/tracking/impactStorage'
import { calculateStreak, getStreakCalendarDays } from '@/lib/tracking/streakEngine'
import { getDailyChallenges, completeChallenge } from '@/lib/tracking/challengesEngine'

/**
 * Hook for Daily Impact Tracker and Habit Gamification
 */
export function useDailyImpact() {
  const [todayLog, setTodayLog] = useState(() => getTodayLog())
  const [dailyLogs, setDailyLogs] = useState(() => getDailyLogs())
  const [profile, setProfile] = useState(() => getUserProfile())
  const [streak, setStreak] = useState(() => calculateStreak())
  const [calendarDays, setCalendarDays] = useState(() => getStreakCalendarDays())
  const [challenges, setChallenges] = useState(() => getDailyChallenges())

  const refresh = useCallback(() => {
    setTodayLog(getTodayLog())
    setDailyLogs(getDailyLogs())
    setProfile(getUserProfile())
    setStreak(calculateStreak())
    setCalendarDays(getStreakCalendarDays())
    setChallenges(getDailyChallenges())
  }, [])

  const handleCompleteChallenge = useCallback((challengeId) => {
    const result = completeChallenge(challengeId)
    if (result.success) {
      refresh()
    }
    return result
  }, [refresh])

  const recordCleanupAction = useCallback(({ filesDeleted = 0, bytesSaved = 0, scansRun = 0, rotImprovement = 0 }) => {
    updateTodayMetrics({
      files_deleted: filesDeleted,
      storage_deleted_bytes: bytesSaved,
      scans_run: scansRun,
      rot_score_change: rotImprovement,
    })
    refresh()
  }, [refresh])

  return {
    todayLog,
    dailyLogs,
    profile,
    streak,
    calendarDays,
    challenges,
    completeChallenge: handleCompleteChallenge,
    recordCleanupAction,
    refresh,
  }
}
