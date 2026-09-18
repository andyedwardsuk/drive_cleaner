/**
 * Daily Challenges Engine
 * Generates rotational daily cleaning goals, tracks completion, and awards XP
 */

import { getTodayDateString, updateLifetimeProfile } from './impactStorage'

const CHALLENGES_STORAGE_KEY = 'drive_cleaner_daily_challenges'

const CHALLENGE_POOL = [
  {
    id: 'run_smart_scan',
    title: 'Run a Smart Scan',
    description: 'Perform a comprehensive health check on any Drive folder',
    xp: 50,
    icon: 'scan',
    category: 'scan',
    target: 1,
  },
  {
    id: 'clean_temp_files',
    title: 'Purge Temporary Files',
    description: 'Review or remove system junk or cache files',
    xp: 40,
    icon: 'temp',
    category: 'temp',
    target: 1,
  },
  {
    id: 'check_carbon_impact',
    title: 'Inspect Carbon Footprint',
    description: 'View your Cloud Carbon Footprint breakdown',
    xp: 30,
    icon: 'carbon',
    category: 'carbon',
    target: 1,
  },
  {
    id: 'review_duplicates',
    title: 'Examine Duplicates',
    description: 'Find redundant file copies wasting storage',
    xp: 45,
    icon: 'duplicates',
    category: 'duplicates',
    target: 1,
  },
  {
    id: 'inspect_rot',
    title: 'Check Data ROT Index',
    description: 'Audit obsolete and redundant clutter in your Drive',
    xp: 40,
    icon: 'rot',
    category: 'rot',
    target: 1,
  },
  {
    id: 'attach_folder',
    title: 'Attach a Target Folder',
    description: 'Add a specific folder or project folder to My Folders',
    xp: 35,
    icon: 'folders',
    category: 'folders',
    target: 1,
  },
]

/**
 * Gets or initializes today's challenges
 */
export function getDailyChallenges() {
  const todayStr = getTodayDateString()

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(CHALLENGES_STORAGE_KEY)
      if (raw) {
        const stored = JSON.parse(raw)
        if (stored.date === todayStr && Array.isArray(stored.challenges)) {
          return stored.challenges
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load challenges:', e)
  }

  // Generate 3 challenges for today based on date seed
  const dayNumber = new Date().getDate()
  const c1 = CHALLENGE_POOL[dayNumber % CHALLENGE_POOL.length]
  const c2 = CHALLENGE_POOL[(dayNumber + 1) % CHALLENGE_POOL.length]
  const c3 = CHALLENGE_POOL[(dayNumber + 2) % CHALLENGE_POOL.length]

  const todayChallenges = [
    { ...c1, completed: false, progress: 0 },
    { ...c2, completed: false, progress: 0 },
    { ...c3, completed: false, progress: 0 },
  ]

  saveDailyChallenges(todayChallenges)
  return todayChallenges
}

/**
 * Saves today's challenges to localStorage
 */
export function saveDailyChallenges(challenges) {
  const todayStr = getTodayDateString()
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(
        CHALLENGES_STORAGE_KEY,
        JSON.stringify({
          date: todayStr,
          challenges,
        })
      )
    }
  } catch (e) {
    console.warn('Failed to save challenges:', e)
  }
}

/**
 * Completes a challenge by ID and awards XP
 */
export function completeChallenge(challengeId) {
  const challenges = getDailyChallenges()
  const index = challenges.findIndex((c) => c.id === challengeId)

  if (index >= 0 && !challenges[index].completed) {
    challenges[index].completed = true
    challenges[index].progress = challenges[index].target
    saveDailyChallenges(challenges)

    // Award XP
    updateLifetimeProfile({
      xp_earned: challenges[index].xp,
    })

    return { success: true, xpEarned: challenges[index].xp, challenges }
  }

  return { success: false, challenges }
}
