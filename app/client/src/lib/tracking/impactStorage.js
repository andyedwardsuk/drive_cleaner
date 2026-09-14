/**
 * Storage management for Daily Impact Tracker
 * Handles local persistence of daily cleaning metrics, streaks, challenges, and user profile
 */

const STORAGE_KEYS = {
  DAILY_LOGS: 'drive_cleaner_daily_logs',
  PROFILE: 'drive_cleaner_user_profile',
  STREAKS: 'drive_cleaner_streaks',
  CHALLENGES: 'drive_cleaner_daily_challenges',
}

// CO2 emission factor: 0.0001 kWh/GB/year * 0.5 kg CO2/kWh = 0.00005 kg CO2 / GB / year
// or approx 0.00005 kg CO2 per GB saved
const CO2_KG_PER_GB = 0.05

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Generates realistic seed history for past 30 days if no logs exist
 */
function generateSeedLogs() {
  const logs = []
  const today = new Date()

  // Generate 30 days of historical data
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    // Determine if active on this day (simulate an active user with a recent 5-day streak)
    const dayOfWeek = d.getDay()
    const isRecentDay = i <= 4 // last 5 days active
    const isPastActive = (i % 3 === 0 || i % 4 === 0) && dayOfWeek !== 0

    const isActive = isRecentDay || isPastActive

    if (isActive) {
      const filesDeleted = Math.floor(Math.random() * 18) + 3
      const filesAdded = Math.floor(Math.random() * 6) + 1
      const storageDeletedBytes = filesDeleted * (Math.floor(Math.random() * 25000000) + 5000000)
      const storageAddedBytes = filesAdded * (Math.floor(Math.random() * 8000000) + 2000000)
      const storageSavedGb = Math.max(0, (storageDeletedBytes - storageAddedBytes) / (1024 * 1024 * 1024))
      const co2SavedKg = Number((storageSavedGb * CO2_KG_PER_GB).toFixed(4))

      logs.push({
        date: dateStr,
        files_deleted: filesDeleted,
        files_added: filesAdded,
        net_files: filesAdded - filesDeleted,
        storage_deleted_bytes: storageDeletedBytes,
        storage_added_bytes: storageAddedBytes,
        storage_saved_bytes: Math.max(0, storageDeletedBytes - storageAddedBytes),
        co2_saved_kg: co2SavedKg,
        rot_score_change: -Math.floor(Math.random() * 2) - 1,
        scans_run: Math.floor(Math.random() * 2) + 1,
        active: true,
      })
    } else {
      logs.push({
        date: dateStr,
        files_deleted: 0,
        files_added: 0,
        net_files: 0,
        storage_deleted_bytes: 0,
        storage_added_bytes: 0,
        storage_saved_bytes: 0,
        co2_saved_kg: 0,
        rot_score_change: 0,
        scans_run: 0,
        active: false,
      })
    }
  }

  return logs
}

/**
 * Default user profile
 */
const DEFAULT_PROFILE = {
  level: 3,
  level_name: 'Eco Warrior',
  xp: 420,
  xp_for_next_level: 600,
  total_xp: 1420,
  lifetime_files_cleaned: 186,
  lifetime_storage_saved_bytes: 4294967296, // 4 GB
  lifetime_co2_saved_kg: 0.215,
  badges_unlocked: ['first_clean', 'streak_3', 'carbon_friend', 'rot_slayer'],
}

/**
 * Gets all daily logs from localStorage
 */
export function getDailyLogs() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to load daily logs:', e)
  }

  const seed = generateSeedLogs()
  saveDailyLogs(seed)
  return seed
}

/**
 * Saves all daily logs to localStorage
 */
export function saveDailyLogs(logs) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs))
    }
  } catch (e) {
    console.warn('Failed to save daily logs:', e)
  }
}

/**
 * Gets today's log entry, creating one if not present
 */
export function getTodayLog() {
  const todayStr = getTodayDateString()
  const logs = getDailyLogs()
  let todayLog = logs.find((l) => l.date === todayStr)

  if (!todayLog) {
    todayLog = {
      date: todayStr,
      files_deleted: 0,
      files_added: 0,
      net_files: 0,
      storage_deleted_bytes: 0,
      storage_added_bytes: 0,
      storage_saved_bytes: 0,
      co2_saved_kg: 0,
      rot_score_change: 0,
      scans_run: 0,
      active: false,
    }
    logs.push(todayLog)
    saveDailyLogs(logs)
  }

  return todayLog
}

/**
 * Updates today's metrics by adding or adjusting fields
 */
export function updateTodayMetrics(metrics) {
  const todayStr = getTodayDateString()
  const logs = getDailyLogs()
  const index = logs.findIndex((l) => l.date === todayStr)

  let entry
  if (index >= 0) {
    entry = { ...logs[index] }
  } else {
    entry = {
      date: todayStr,
      files_deleted: 0,
      files_added: 0,
      net_files: 0,
      storage_deleted_bytes: 0,
      storage_added_bytes: 0,
      storage_saved_bytes: 0,
      co2_saved_kg: 0,
      rot_score_change: 0,
      scans_run: 0,
      active: false,
    }
  }

  if (metrics.files_deleted) entry.files_deleted += metrics.files_deleted
  if (metrics.files_added) entry.files_added += metrics.files_added
  if (metrics.storage_deleted_bytes) entry.storage_deleted_bytes += metrics.storage_deleted_bytes
  if (metrics.storage_added_bytes) entry.storage_added_bytes += metrics.storage_added_bytes
  if (metrics.scans_run) entry.scans_run += metrics.scans_run
  if (metrics.rot_score_change) entry.rot_score_change += metrics.rot_score_change

  entry.net_files = entry.files_added - entry.files_deleted
  entry.storage_saved_bytes = Math.max(0, entry.storage_deleted_bytes - entry.storage_added_bytes)

  const savedGb = entry.storage_saved_bytes / (1024 * 1024 * 1024)
  entry.co2_saved_kg = Number((savedGb * CO2_KG_PER_GB).toFixed(4))
  entry.active = entry.files_deleted > 0 || entry.scans_run > 0

  if (index >= 0) {
    logs[index] = entry
  } else {
    logs.push(entry)
  }

  saveDailyLogs(logs)

  // Update lifetime profile
  updateLifetimeProfile({
    files_cleaned: metrics.files_deleted || 0,
    storage_saved_bytes: metrics.storage_deleted_bytes || 0,
    co2_saved_kg: Number((((metrics.storage_deleted_bytes || 0) / (1024 * 1024 * 1024)) * CO2_KG_PER_GB).toFixed(4)),
    xp_earned: (metrics.files_deleted || 0) * 10 + (metrics.scans_run || 0) * 25,
  })

  return entry
}

/**
 * Gets user profile (level, XP, badges, lifetime stats)
 */
export function getUserProfile() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE)
      if (raw) return JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load user profile:', e)
  }

  saveUserProfile(DEFAULT_PROFILE)
  return DEFAULT_PROFILE
}

/**
 * Saves user profile to localStorage
 */
export function saveUserProfile(profile) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
    }
  } catch (e) {
    console.warn('Failed to save user profile:', e)
  }
}

/**
 * Increment user XP and update lifetime stats
 */
export function updateLifetimeProfile({ files_cleaned = 0, storage_saved_bytes = 0, co2_saved_kg = 0, xp_earned = 0 }) {
  const profile = getUserProfile()

  profile.lifetime_files_cleaned += files_cleaned
  profile.lifetime_storage_saved_bytes += storage_saved_bytes
  profile.lifetime_co2_saved_kg = Number((profile.lifetime_co2_saved_kg + co2_saved_kg).toFixed(4))
  profile.total_xp += xp_earned
  profile.xp += xp_earned

  // Level up progression: Level N requires N * 200 XP
  while (profile.xp >= profile.xp_for_next_level) {
    profile.xp -= profile.xp_for_next_level
    profile.level += 1
    profile.xp_for_next_level = profile.level * 200

    const rankTitles = [
      'Clean Novice',
      'Declutterer',
      'Eco Warrior',
      'Storage Sentinel',
      'Eco Guardian',
      'Grand Master Cleaner',
    ]
    profile.level_name = rankTitles[Math.min(profile.level - 1, rankTitles.length - 1)]
  }

  saveUserProfile(profile)
  return profile
}
