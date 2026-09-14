/**
 * Streak Calculation Engine
 * Tracks daily cleaning streaks, longest streak, and calendar activity heatmap
 */

import { getDailyLogs, getTodayDateString } from './impactStorage'

/**
 * Calculates current streak and longest streak from daily logs
 * @returns {Object} Streak metrics { currentStreak, longestStreak, isActiveToday, days }
 */
export function calculateStreak() {
  const logs = getDailyLogs()
  const todayStr = getTodayDateString()

  // Sort logs in chronological order
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date))

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Calculate longest streak across history
  for (let i = 0; i < sortedLogs.length; i++) {
    const entry = sortedLogs[i]
    if (entry.active) {
      tempStreak++
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      tempStreak = 0
    }
  }

  // Calculate current streak working backwards from today / yesterday
  const todayEntry = sortedLogs.find((l) => l.date === todayStr)
  const isActiveToday = todayEntry?.active || false

  // Start from today if active, otherwise check yesterday
  let checkDate = new Date()
  if (!isActiveToday) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const entry = sortedLogs.find((l) => l.date === dateStr)

    if (entry && entry.active) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak
  }

  return {
    currentStreak,
    longestStreak,
    isActiveToday,
    logsCount: sortedLogs.length,
  }
}

/**
 * Generates the last 28 days (4 full weeks) of calendar days for the visual heatmap
 * @returns {Array} Array of { date, dayOfMonth, dayOfWeek, active, filesCleaned, storageSaved, isToday }
 */
export function getStreakCalendarDays() {
  const logs = getDailyLogs()
  const todayStr = getTodayDateString()
  const logsByDate = new Map(logs.map((l) => [l.date, l]))

  const days = []
  const today = new Date()

  // Generate past 28 days
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const log = logsByDate.get(dateStr)

    days.push({
      date: dateStr,
      dayOfMonth: d.getDate(),
      dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      weekdayShort: d.toLocaleDateString('en-US', { weekday: 'short' }),
      active: log?.active || false,
      filesDeleted: log?.files_deleted || 0,
      storageSavedBytes: log?.storage_saved_bytes || 0,
      co2SavedKg: log?.co2_saved_kg || 0,
      isToday: dateStr === todayStr,
    })
  }

  return days
}
