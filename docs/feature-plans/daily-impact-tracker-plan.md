# Feature Implementation Plan: Daily Impact Tracker & Progress Dashboard

**Feature Name:** daily-impact-tracker
**Complexity:** High (Time-series data, gamification, leaderboards)
**Priority:** High (Retention & Engagement)
**Module:** Full Stack (Analytics + Dashboard + Gamification)
**Estimated Effort:** 7-10 days

---

## 1. Feature Overview

**Description**: Track and visualize daily/weekly/monthly progress on carbon footprint reduction, storage cleanup, ROT score improvement, and hoarding assessment with gamification elements including "OCT King" (Organization Champion Trophy) leaderboard for most active cleaners.

**Core Innovation**: Transform episodic cleanup into **sustained engagement** through daily progress tracking, trend visualization, and competitive gamification.

**Key Insight**: People maintain habits when they see progress. By tracking daily metrics and showing improvement trends, users stay motivated to continue cleanup efforts.

**Gamification Angle**: "OCT King" (Organization Champion Trophy) - Monthly competition for most files deleted, most CO2 saved, biggest ROT score improvement.

---

## 2. Tracked Metrics (Daily)

### A. File Activity Metrics

```javascript
{
  date: '2024-11-18',

  // File counts
  files_added: 12,
  files_deleted: 45,
  files_modified: 8,
  net_change: -33,  // Negative = cleanup!

  // Storage impact
  storage_added_bytes: 15728640,      // 15 MB
  storage_deleted_bytes: 524288000,   // 500 MB
  net_storage_change_bytes: -508559360, // -485 MB saved

  // Carbon impact
  co2_added_kg: 0.00079,
  co2_saved_kg: 0.0262,
  net_co2_change_kg: -0.0254,  // Negative = reduction!

  // Equivalents
  equivalent_miles_saved: 0.062,
  equivalent_trees_planted: 0.001,

  // ROT Analysis
  rot_score_start: 62,
  rot_score_end: 58,
  rot_score_change: -4,  // Improvement!

  rot_deleted: {
    redundant: 12,
    obsolete: 28,
    trivial: 5
  },

  // Hoarding Assessment
  hoarding_score_start: 58,
  hoarding_score_end: 52,
  hoarding_score_change: -6,  // Improvement!

  clutter_index_start: 62,
  clutter_index_end: 58,
  clutter_index_change: -4,

  // Tool usage
  scans_run: 2,
  views_accessed: ['dashboard', 'smart-scan', 'data-rot'],
  time_in_app_minutes: 15,
  actions_performed: {
    delete: 45,
    archive: 0,
    export: 3
  }
}
```

### B. Weekly/Monthly Aggregations

```javascript
{
  period: 'week',  // or 'month'
  start_date: '2024-11-11',
  end_date: '2024-11-18',

  totals: {
    files_deleted: 234,
    storage_saved_gb: 2.3,
    co2_saved_kg: 0.115,
    rot_score_improvement: 15,
    hoarding_score_improvement: 12
  },

  averages: {
    files_deleted_per_day: 33.4,
    storage_saved_per_day_mb: 328.6,
    co2_saved_per_day_kg: 0.0164
  },

  achievements_unlocked: [
    'week_warrior',
    'carbon_reducer',
    'clutter_buster'
  ]
}
```

---

## 3. Dashboard Components

### A. Daily Impact Summary (Hero Card)

```
┌────────────────────────────────────────────────────┐
│  Today's Impact 🌟                                 │
│  November 18, 2024                                 │
├────────────────────────────────────────────────────┤
│                                                     │
│  Files Deleted: 45  (+37 vs yesterday)             │
│  Storage Saved: 485 MB                             │
│  CO2 Reduced: 0.026 kg ≈ Driving 0.06 miles 🌱     │
│                                                     │
│  ROT Score:  62 → 58  (-4) ✅                      │
│  Clutter:    62 → 58  (-4) ✅                      │
│  Hoarding:   58 → 52  (-6) 🎉                      │
│                                                     │
│  Streak: 🔥 7 days                                 │
│                                                     │
└────────────────────────────────────────────────────┘
```

### B. Progress Timeline (Charts)

**30-Day Trend Chart:**
```
CO2 Savings (kg)
0.03 ┤     ╭╮
0.02 ┤   ╭─╯╰╮   ╭╮
0.01 ┤  ╭╯   ╰╮╭─╯╰──╮
0.00 ┼──╯     ╰╯     ╰─
     └─────────────────────►
     Oct 20      Nov 18
```

**ROT Score Progress:**
```
ROT Score (Target: <20)
80 ┤●
60 ┤ ●●
40 ┤   ●●●
20 ┤      ●●● ← Target
 0 ┼──────────────────────►
   Week 1  2  3  4
```

**Hoarding Grade Over Time:**
```
Hoarding Grade
┌─────────────────────────────┐
│ Severe     ████░░░░░░░      │ Oct 1
│ Significant ████████░░░     │ Oct 15
│ Moderate    ██████████░     │ Nov 1
│ Mild        ████████████    │ Nov 18 ← Current
│ Minimal     (Goal)          │
└─────────────────────────────┘
```

### C. Cumulative Impact (All-Time)

```
┌────────────────────────────────────────────────────┐
│  Lifetime Impact 🏆                                │
│  Since October 15, 2024 (34 days)                 │
├────────────────────────────────────────────────────┤
│                                                     │
│  📉 Total Files Deleted: 1,234                     │
│  💾 Total Storage Saved: 12.4 GB                   │
│  🌍 Total CO2 Saved: 0.62 kg                       │
│     = Driving 1.5 miles                            │
│     = 78 smartphone charges                        │
│                                                     │
│  📊 ROT Score: 82 → 58 (-24) ✅                    │
│  🧹 Clutter Index: 78 → 58 (-20) ✅                │
│  📦 Hoarding Grade: Significant → Mild ⬇️          │
│                                                     │
│  🔥 Current Streak: 7 days                         │
│  🏅 Longest Streak: 14 days (Oct 20-Nov 3)        │
│                                                     │
└────────────────────────────────────────────────────┘
```

### D. OCT King Leaderboard

**OCT = Organization Champion Trophy**

```
┌────────────────────────────────────────────────────┐
│  👑 OCT King - November 2024                       │
│  Most Active Cleaners This Month                   │
├────────────────────────────────────────────────────┤
│                                                     │
│  🥇 #1  CleanFreak247      2,345 files  52.1 kg   │
│  🥈 #2  EcoWarrior99       1,892 files  41.3 kg   │
│  🥉 #3  MinimalistPro       1,654 files  38.7 kg   │
│      #4  DataDetoxer        1,432 files  32.1 kg   │
│      #5  StorageSavior      1,287 files  28.9 kg   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  👤 #47 You                   892 files  19.2 kg   │
│      ↑ +3 ranks from last week                     │
│                                                     │
│  🎯 Delete 395 more files to reach Top 10!         │
│                                                     │
└────────────────────────────────────────────────────┘

Categories:
• Most Files Deleted
• Most CO2 Saved
• Biggest ROT Improvement
• Longest Streak
• Most Consistent (7+ days/week)
```

---

## 4. Gamification Elements

### A. Daily Streaks

**Streak Definition:** Used the app and deleted at least 1 file for X consecutive days

```javascript
{
  current_streak: 7,          // Days
  longest_streak: 14,
  streak_milestones: [
    { days: 7, badge: '🔥 Week Warrior', unlocked: true },
    { days: 14, badge: '⚡ Fortnight Force', unlocked: true },
    { days: 30, badge: '🌟 Monthly Master', unlocked: false },
    { days: 100, badge: '💎 Century Champion', unlocked: false }
  ]
}
```

**Streak Visualization:**
```
November 2024
Su Mo Tu We Th Fr Sa
          1  2  3  4
 5  6  7  8  9 10 11
12 13 14 15 16 17 18  ← Current streak (7 days)
   ✓  ✓  ✓  ✓  ✓  ✓  ✓
```

### B. Daily Challenges

```
┌────────────────────────────────────────────────────┐
│  Today's Challenges 🎯                             │
├────────────────────────────────────────────────────┤
│                                                     │
│  ☐ Delete 10 files (5/10) ████░░ 50%              │
│     Reward: 10 XP                                  │
│                                                     │
│  ☐ Save 100 MB storage (45/100) ████░░ 45%        │
│     Reward: 15 XP + "Storage Saver" badge          │
│                                                     │
│  ✅ Run Smart Scan (1/1) ██████ 100%               │
│     Reward: 5 XP ← Claimed!                        │
│                                                     │
│  ☐ Improve ROT Score by 5 points (2/5)            │
│     Reward: 25 XP + "ROT Buster" badge             │
│                                                     │
└────────────────────────────────────────────────────┘
```

### C. Achievements System

**Categories:**

1. **Cleanup Volume**
   - 🗑️ Trash Talker: Delete 100 files
   - 🚮 Waste Warrior: Delete 500 files
   - 🏭 Deletion Dynamo: Delete 1,000 files
   - 🌪️ File Hurricane: Delete 5,000 files

2. **Carbon Impact**
   - 🌱 Carbon Curious: Save 0.1 kg CO2
   - 🌳 Tree Planter: Save 21 kg CO2 (1 tree equivalent)
   - 🌲 Forest Guardian: Save 100 kg CO2
   - 🌍 Climate Hero: Save 500 kg CO2

3. **ROT Mastery**
   - 🧹 Tidy Beginner: Reduce ROT score by 10
   - 🧼 Clean Machine: Reduce ROT score by 25
   - ✨ Minimalist Master: Achieve ROT score <20
   - 💎 Data Zen: Maintain ROT <20 for 30 days

4. **Hoarding Recovery**
   - 📦 Hoarding Awareness: Complete first assessment
   - 📉 Progress Pioneer: Reduce hoarding grade by 1 level
   - 🎯 Moderation Master: Reach "Mild" hoarding grade
   - 🏆 Minimal Champion: Reach "Minimal" hoarding grade

5. **Consistency**
   - 🔥 Week Warrior: 7-day streak
   - ⚡ Fortnight Force: 14-day streak
   - 🌟 Monthly Master: 30-day streak
   - 💎 Century Champion: 100-day streak

6. **OCT King (Monthly)**
   - 👑 OCT King: #1 in any category
   - 🥇 Gold Cleaner: Top 10 overall
   - 🥈 Silver Savior: Top 25 overall
   - 🥉 Bronze Boss: Top 50 overall

### D. Level & XP System

```javascript
{
  level: 12,
  xp: 3450,
  xp_to_next_level: 1550,  // Need 5000 total for level 13
  title: 'Data Wrangler',

  xp_sources: {
    file_deleted: 1,           // 1 XP per file
    mb_saved: 0.1,             // 0.1 XP per MB
    daily_challenge: 5-25,     // Varies by challenge
    achievement: 50-500,       // Varies by achievement
    streak_maintained: 10      // 10 XP per day
  },

  level_titles: {
    1: 'Digital Hoarder',
    5: 'Casual Cleaner',
    10: 'Storage Savant',
    15: 'Data Wrangler',
    20: 'Cloud Custodian',
    25: 'Minimalist Master',
    30: 'Organization Oracle',
    50: 'Legendary Librarian'
  }
}
```

---

## 5. Data Storage Strategy

### A. Local Storage (Browser)

**Quick access for current user:**

```javascript
// localStorage schema
{
  'drive_cleaner_daily_logs': {
    '2024-11-18': { /* today's metrics */ },
    '2024-11-17': { /* yesterday */ },
    // ... last 90 days
  },

  'drive_cleaner_user_profile': {
    first_scan_date: '2024-10-15',
    total_files_deleted: 1234,
    total_storage_saved_bytes: 13316300800,
    total_co2_saved_kg: 0.62,
    current_streak: 7,
    longest_streak: 14,
    level: 12,
    xp: 3450,
    achievements: ['week_warrior', 'tree_planter', ...]
  },

  'drive_cleaner_current_metrics': {
    rot_score: 58,
    clutter_index: 58,
    hoarding_score: 52,
    hoarding_grade: 'Mild',
    last_updated: '2024-11-18T10:30:00Z'
  }
}
```

**Advantages:**
- ✅ Fast access
- ✅ No backend needed for MVP
- ✅ Privacy (stays on device)

**Disadvantages:**
- ❌ Lost if browser cache cleared
- ❌ No cross-device sync
- ❌ No leaderboard (without backend)

### B. Google Drive App Data (Future)

**Store in hidden AppData folder:**

```javascript
// appDataFolder/drive_cleaner_progress.json
{
  version: '1.0',
  user_id: 'hashed_email',  // Privacy
  daily_logs: {
    '2024-11-18': { /* metrics */ }
  },
  user_profile: { /* ... */ }
}
```

**Advantages:**
- ✅ Syncs across devices
- ✅ Persists permanently
- ✅ Uses existing Google auth

**Disadvantages:**
- ❌ Requires appDataFolder scope
- ❌ More complex implementation

### C. Backend Database (Full Implementation)

**For leaderboard and social features:**

```sql
-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email_hash VARCHAR(64) UNIQUE,  -- Privacy: hashed email
  display_name VARCHAR(50),        -- Anonymous: "CleanFreak247"
  created_at TIMESTAMP
);

-- daily_metrics table
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,

  -- File activity
  files_added INTEGER DEFAULT 0,
  files_deleted INTEGER DEFAULT 0,
  files_modified INTEGER DEFAULT 0,
  net_change INTEGER DEFAULT 0,

  -- Storage
  storage_added_bytes BIGINT DEFAULT 0,
  storage_deleted_bytes BIGINT DEFAULT 0,
  net_storage_change_bytes BIGINT DEFAULT 0,

  -- Carbon
  co2_added_kg DECIMAL(10,5) DEFAULT 0,
  co2_saved_kg DECIMAL(10,5) DEFAULT 0,
  net_co2_change_kg DECIMAL(10,5) DEFAULT 0,

  -- ROT scores
  rot_score_start INTEGER,
  rot_score_end INTEGER,
  rot_score_change INTEGER,

  -- Hoarding
  hoarding_score_start INTEGER,
  hoarding_score_end INTEGER,
  hoarding_score_change INTEGER,
  clutter_index_start INTEGER,
  clutter_index_end INTEGER,
  clutter_index_change INTEGER,

  -- Tool usage
  scans_run INTEGER DEFAULT 0,
  time_in_app_minutes INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_key VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- leaderboard_entries table
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  period VARCHAR(20) NOT NULL,        -- 'week', 'month', 'all-time'
  category VARCHAR(50) NOT NULL,      -- 'files', 'co2', 'rot', 'streak'
  value DECIMAL(12,2) NOT NULL,
  rank INTEGER,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, period, category)
);
```

**Advantages:**
- ✅ Full leaderboard support
- ✅ Cross-user analytics
- ✅ Persistent and scalable
- ✅ Social features enabled

**Disadvantages:**
- ❌ Requires backend infrastructure
- ❌ Privacy considerations
- ❌ Hosting costs

**Recommended Approach for MVP:**
- **Phase 1**: localStorage only (fast, private, no backend)
- **Phase 2**: Add Google Drive AppData sync
- **Phase 3**: Optional backend for leaderboard

---

## 6. UI Implementation

### A. React Components Structure

```
app/client/src/
├── views/
│   └── DailyImpactView.jsx          # Main dashboard view
│
├── components/
│   ├── impact/
│   │   ├── DailyImpactCard.jsx      # Today's summary
│   │   ├── LifetimeImpactCard.jsx   # All-time stats
│   │   ├── ProgressChart.jsx        # 30-day trends
│   │   ├── ROTProgressChart.jsx     # ROT score over time
│   │   ├── HoardingProgressBar.jsx  # Hoarding grade visual
│   │   ├── StreakCalendar.jsx       # Streak visualization
│   │   ├── OCTLeaderboard.jsx       # Leaderboard component
│   │   ├── DailyChallenges.jsx      # Challenges card
│   │   ├── AchievementBadge.jsx     # Single achievement
│   │   ├── AchievementsGrid.jsx     # All achievements
│   │   └── LevelProgressBar.jsx     # XP/Level display
│   │
│   └── charts/
│       ├── LineChart.jsx             # Reusable line chart
│       └── BarChart.jsx              # Reusable bar chart
│
└── hooks/
    ├── useImpactTracking.js          # Track daily metrics
    ├── useStreakCalculation.js       # Streak logic
    ├── useAchievements.js            # Achievement unlock logic
    ├── useLeaderboard.js             # Leaderboard data (future)
    └── useDailyChallenges.js         # Challenge progress
```

### B. Key Component APIs

**DailyImpactView.jsx:**
```jsx
export default function DailyImpactView() {
  const { today, yesterday, last30Days } = useImpactTracking();
  const { currentStreak, longestStreak } = useStreakCalculation();
  const { unlockedAchievements, checkAchievements } = useAchievements();
  const { challenges, updateProgress } = useDailyChallenges();

  return (
    <div className="space-y-6">
      <DailyImpactCard data={today} comparison={yesterday} />
      <div className="grid md:grid-cols-2 gap-6">
        <ProgressChart data={last30Days} />
        <ROTProgressChart data={last30Days} />
      </div>
      <StreakCalendar current={currentStreak} longest={longestStreak} />
      <DailyChallenges challenges={challenges} />
      <AchievementsGrid achievements={unlockedAchievements} />
      <LifetimeImpactCard />
      <OCTLeaderboard />
    </div>
  );
}
```

---

## 7. Backend Implementation

### A. Tracking Engine (`trackingEngine.js`)

```javascript
/**
 * Core tracking engine for daily metrics
 * Captures file operations and calculates impact
 */

/**
 * Initialize tracking for the day
 */
function initializeDailyTracking() {
  const today = new Date().toISOString().split('T')[0];
  const dailyLogs = getDailyLogs();

  if (!dailyLogs[today]) {
    dailyLogs[today] = createEmptyDayMetrics(today);
    saveDailyLogs(dailyLogs);
  }

  return dailyLogs[today];
}

/**
 * Track file deletion event
 */
function trackFileDeletion(file) {
  const metrics = getTodayMetrics();

  // Update counts
  metrics.files_deleted += 1;
  metrics.net_change -= 1;

  // Update storage
  const fileSize = file.size || estimateWorkspaceFileSize(file.mimeType);
  metrics.storage_deleted_bytes += fileSize;
  metrics.net_storage_change_bytes -= fileSize;

  // Update carbon
  const co2Saved = calculateCO2(fileSize);
  metrics.co2_saved_kg += co2Saved;
  metrics.net_co2_change_kg -= co2Saved;

  // Track ROT if applicable
  if (file.rot_category) {
    metrics.rot_deleted[file.rot_category] += 1;
  }

  saveTodayMetrics(metrics);
  checkAchievements(metrics);
}

/**
 * Track scan completion
 */
function trackScanCompletion(scanResults) {
  const metrics = getTodayMetrics();
  metrics.scans_run += 1;

  // Update ROT score if scan included ROT analysis
  if (scanResults.rot_score !== undefined) {
    if (metrics.rot_score_start === null) {
      metrics.rot_score_start = scanResults.rot_score;
    }
    metrics.rot_score_end = scanResults.rot_score;
    metrics.rot_score_change = metrics.rot_score_end - metrics.rot_score_start;
  }

  // Update hoarding score if included
  if (scanResults.hoarding_score !== undefined) {
    if (metrics.hoarding_score_start === null) {
      metrics.hoarding_score_start = scanResults.hoarding_score;
    }
    metrics.hoarding_score_end = scanResults.hoarding_score;
    metrics.hoarding_score_change = metrics.hoarding_score_end - metrics.hoarding_score_start;
  }

  saveTodayMetrics(metrics);
}

/**
 * Track time spent in app
 */
function trackTimeSpent(minutes) {
  const metrics = getTodayMetrics();
  metrics.time_in_app_minutes += minutes;
  saveTodayMetrics(metrics);
}
```

### B. Achievement Engine (`achievementEngine.js`)

```javascript
/**
 * Check if any achievements unlocked
 */
function checkAchievements(currentMetrics) {
  const profile = getUserProfile();
  const newUnlocks = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (profile.achievements.includes(achievement.key)) {
      return; // Already unlocked
    }

    if (achievement.condition(currentMetrics, profile)) {
      unlockAchievement(achievement.key);
      newUnlocks.push(achievement);
      awardXP(achievement.xp);
    }
  });

  if (newUnlocks.length > 0) {
    showAchievementNotification(newUnlocks);
  }

  return newUnlocks;
}

/**
 * Achievement definitions
 */
const ACHIEVEMENTS = [
  {
    key: 'trash_talker',
    name: 'Trash Talker',
    description: 'Delete 100 files',
    icon: '🗑️',
    xp: 100,
    condition: (metrics, profile) => profile.total_files_deleted >= 100
  },
  {
    key: 'carbon_curious',
    name: 'Carbon Curious',
    description: 'Save 0.1 kg CO2',
    icon: '🌱',
    xp: 50,
    condition: (metrics, profile) => profile.total_co2_saved_kg >= 0.1
  },
  // ... 20+ more achievements
];
```

### C. Streak Calculator (`streakCalculator.js`)

```javascript
/**
 * Calculate current streak
 */
function calculateCurrentStreak() {
  const dailyLogs = getDailyLogs();
  const dates = Object.keys(dailyLogs).sort().reverse();

  let streak = 0;
  let yesterday = getYesterdayDate();

  for (const date of dates) {
    if (date === yesterday && dailyLogs[date].files_deleted > 0) {
      streak += 1;
      yesterday = subtractDays(yesterday, 1);
    } else {
      break;
    }
  }

  return streak;
}
```

---

## 8. Integration Points

### A. Hook into Existing Features

**Smart Scan completion:**
```javascript
// In scanEngine.js - after scan completes
function runSmartScan(folderId, corpora) {
  // ... existing scan logic

  const results = { /* scan results */ };

  // Track scan completion
  trackScanCompletion(results);

  return results;
}
```

**File deletion:**
```javascript
// In fileOperations.js - when user deletes files
function deleteFiles(fileIds) {
  fileIds.forEach(id => {
    const file = getFileById(id);

    // Perform deletion
    Drive.Files.trash(id);

    // Track the deletion
    trackFileDeletion(file);
  });
}
```

**App session:**
```javascript
// In App.jsx - track time in app
useEffect(() => {
  const startTime = Date.now();

  return () => {
    const minutesSpent = Math.floor((Date.now() - startTime) / 60000);
    trackTimeSpent(minutesSpent);
  };
}, []);
```

### B. Navigation Integration

```javascript
// In App.jsx - add route
<Route path="/impact" element={<DailyImpactView />} />

// In Sidebar.jsx - add menu item
<SidebarItem icon="📊" label="Daily Impact" path="/impact" />
```

---

## 9. Testing Strategy

### A. Unit Tests

**Tracking Engine:**
```javascript
describe('trackFileDeletion', () => {
  it('increments files_deleted counter', () => {
    const file = { id: '123', size: 1024000, mimeType: 'image/jpeg' };
    trackFileDeletion(file);

    const metrics = getTodayMetrics();
    expect(metrics.files_deleted).toBe(1);
    expect(metrics.storage_deleted_bytes).toBe(1024000);
  });

  it('calculates CO2 savings correctly', () => {
    const file = { size: 1073741824 }; // 1 GB
    trackFileDeletion(file);

    const metrics = getTodayMetrics();
    expect(metrics.co2_saved_kg).toBeCloseTo(0.05); // ~0.05 kg per GB
  });
});
```

**Streak Calculator:**
```javascript
describe('calculateCurrentStreak', () => {
  it('returns 0 for no activity', () => {
    expect(calculateCurrentStreak()).toBe(0);
  });

  it('counts consecutive days correctly', () => {
    // Mock 7 consecutive days with deletions
    mockDailyLogs(7);
    expect(calculateCurrentStreak()).toBe(7);
  });

  it('breaks streak on missed day', () => {
    mockDailyLogs(7, { skipDay: 3 });
    expect(calculateCurrentStreak()).toBe(3);
  });
});
```

### B. Integration Tests

```javascript
describe('Daily Impact Integration', () => {
  it('completes full workflow: scan → delete → achievement', async () => {
    // Run scan
    await runSmartScan('root');

    // Delete 100 files
    for (let i = 0; i < 100; i++) {
      trackFileDeletion({ id: `file-${i}`, size: 1000000 });
    }

    // Check achievements
    const profile = getUserProfile();
    expect(profile.achievements).toContain('trash_talker');
    expect(profile.xp).toBeGreaterThan(100);
  });
});
```

---

## 10. Success Criteria

### Functional Requirements
- [ ] Daily metrics accurately captured for all file operations
- [ ] Storage and CO2 calculations correct (validated against research)
- [ ] ROT score changes tracked before/after scans
- [ ] Hoarding score changes tracked
- [ ] Streak calculation accurate (handles missed days)
- [ ] Achievements unlock at correct thresholds
- [ ] XP awarded correctly for all actions
- [ ] Charts display 30-day history accurately
- [ ] localStorage persists data across sessions

### UI/UX Requirements
- [ ] Dashboard loads in <2 seconds
- [ ] Charts render smoothly with 30+ data points
- [ ] Achievement notifications appear on unlock
- [ ] Streak calendar shows visual checkmarks
- [ ] Progress bars animate smoothly
- [ ] Responsive design (mobile, tablet, desktop)

### Performance Requirements
- [ ] Tracking functions execute in <50ms
- [ ] localStorage read/write in <10ms
- [ ] Chart rendering in <500ms
- [ ] No impact on scan performance

### Data Integrity
- [ ] No duplicate daily logs
- [ ] Metrics never go negative (except net_change fields)
- [ ] Streak calculation consistent
- [ ] Achievement unlocks idempotent

---

## 11. Implementation Timeline

### Phase 1: Core Tracking (Days 1-3)
**Day 1:**
- [ ] Create `trackingEngine.js` with basic metric tracking
- [ ] Implement localStorage schema
- [ ] Add tracking hooks to file deletion

**Day 2:**
- [ ] Implement CO2 calculation functions
- [ ] Add ROT score tracking integration
- [ ] Create streak calculator

**Day 3:**
- [ ] Build achievement engine
- [ ] Implement XP/level system
- [ ] Write unit tests for tracking logic

### Phase 2: UI Components (Days 4-6)
**Day 4:**
- [ ] Create `DailyImpactCard` component
- [ ] Create `LifetimeImpactCard` component
- [ ] Build basic charts (LineChart, BarChart)

**Day 5:**
- [ ] Create `ProgressChart` with 30-day data
- [ ] Create `ROTProgressChart`
- [ ] Create `StreakCalendar` component

**Day 6:**
- [ ] Build `DailyChallenges` component
- [ ] Build `AchievementsGrid`
- [ ] Create `LevelProgressBar`

### Phase 3: Integration & Polish (Days 7-10)
**Day 7:**
- [ ] Integrate tracking with all file operations
- [ ] Add navigation and routing
- [ ] Connect all components to data hooks

**Day 8:**
- [ ] Write integration tests
- [ ] Add achievement notifications
- [ ] Implement daily challenge logic

**Day 9:**
- [ ] Add OCT Leaderboard (localStorage mock for MVP)
- [ ] Polish animations and transitions
- [ ] Responsive design testing

**Day 10:**
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Documentation and user guide

---

## 12. Future Enhancements (Post-MVP)

### Phase 2: Cloud Sync
1. **Google Drive AppData Integration**
   - Sync daily logs to appDataFolder
   - Cross-device progress tracking
   - Backup/restore functionality

### Phase 3: Social Features
1. **Backend Leaderboard**
   - Real OCT King rankings
   - Friend comparisons
   - Team challenges

2. **Achievements 2.0**
   - Seasonal achievements
   - Limited-time events
   - Community challenges

### Phase 4: Notifications & Reminders
1. **Browser Notifications**
   - Streak reminder (daily at user-set time)
   - Achievement unlock notifications
   - Challenge completion alerts
   - Milestone celebrations

2. **Email Reminders** (Optional)
   - Weekly progress summary
   - Streak risk warning (haven't used in 24hrs)
   - Monthly OCT King rankings
   - Personalized insights

3. **In-App Nudges**
   - "You're 2 files away from unlocking Trash Talker!"
   - "Keep your 14-day streak alive - delete 1 file today"
   - "You're #52 on the leaderboard - 3 files to top 50!"

### Phase 5: Advanced Analytics
1. **Trend Analysis**
   - Weekly/monthly reports
   - Predictive insights
   - Behavioral patterns

2. **Export & Sharing**
   - Share achievements on social media
   - Export impact reports (PDF/CSV)
   - Environmental impact certificates

---

## 16. Notifications & Reminders System

### A. Browser Notifications (Phase 1.5 - Optional MVP)

**Notification Permission:**
```javascript
// Request permission on first visit
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
```

**Daily Streak Reminder:**
```javascript
/**
 * Send browser notification for streak maintenance
 * Triggered at user-configured time (default: 9 PM)
 */
function sendStreakReminder() {
  if (Notification.permission === 'granted' && !todayActivityRecorded()) {
    new Notification('Keep your streak alive! 🔥', {
      body: `You have a ${getCurrentStreak()}-day streak. Delete just 1 file to keep it going!`,
      icon: '/icon-512.png',
      badge: '/badge-96.png',
      tag: 'streak-reminder',
      requireInteraction: false
    });
  }
}
```

**Achievement Unlock Notification:**
```javascript
function notifyAchievementUnlock(achievement) {
  new Notification(`Achievement Unlocked: ${achievement.name} ${achievement.icon}`, {
    body: `${achievement.description} - You earned ${achievement.xp} XP!`,
    icon: '/icon-512.png',
    tag: 'achievement',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Achievements' }
    ]
  });
}
```

**Notification Preferences:**
```javascript
// localStorage settings
{
  'drive_cleaner_notification_prefs': {
    enabled: true,
    streak_reminder: true,
    streak_reminder_time: '21:00',  // 9 PM
    achievement_unlocks: true,
    challenge_completion: true,
    milestone_celebrations: true,
    leaderboard_updates: false      // Future: when backend added
  }
}
```

### B. In-App Nudges (Phase 1 - MVP)

**Progress Nudges:**
```jsx
// Component: ProgressNudge.jsx
function ProgressNudge({ type, data }) {
  const nudges = {
    achievement_close: `You're ${data.filesNeeded} files away from unlocking "${data.achievementName}"! 🏆`,
    streak_risk: `Don't break your ${data.streak}-day streak! Delete at least 1 file today. 🔥`,
    leaderboard_rank: `You're #${data.currentRank}! Delete ${data.filesNeeded} more files to reach Top ${data.targetRank}! 👑`,
    milestone: `You've deleted ${data.totalFiles} files! Just ${data.remaining} more to hit ${data.milestone}! 🎯`
  };

  return (
    <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-4">
      <p className="text-blue-200">{nudges[type]}</p>
    </div>
  );
}
```

**Smart Nudge System:**
```javascript
/**
 * Calculate which nudge to show based on user context
 */
function getSmartNudge() {
  const profile = getUserProfile();
  const today = getTodayMetrics();

  // Priority 1: Streak at risk (evening and no activity)
  if (isEvening() && today.files_deleted === 0 && profile.current_streak > 0) {
    return {
      type: 'streak_risk',
      data: { streak: profile.current_streak }
    };
  }

  // Priority 2: Close to achievement unlock
  const closeAchievement = getCloseAchievement(profile);
  if (closeAchievement) {
    return {
      type: 'achievement_close',
      data: closeAchievement
    };
  }

  // Priority 3: Close to leaderboard rank up
  const rankData = getLeaderboardProgress(profile);
  if (rankData && rankData.filesNeeded < 50) {
    return {
      type: 'leaderboard_rank',
      data: rankData
    };
  }

  return null;
}
```

### C. Notification Settings UI

```jsx
// Component: NotificationSettings.jsx
function NotificationSettings() {
  const [prefs, setPrefs] = useState(getNotificationPrefs());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Enable Notifications</Label>
          <Switch
            checked={prefs.enabled}
            onCheckedChange={(checked) => updatePref('enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Daily Streak Reminder</Label>
          <Switch
            checked={prefs.streak_reminder}
            onCheckedChange={(checked) => updatePref('streak_reminder', checked)}
          />
        </div>

        {prefs.streak_reminder && (
          <div>
            <Label>Reminder Time</Label>
            <Input
              type="time"
              value={prefs.streak_reminder_time}
              onChange={(e) => updatePref('streak_reminder_time', e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label>Achievement Unlocks</Label>
          <Switch
            checked={prefs.achievement_unlocks}
            onCheckedChange={(checked) => updatePref('achievement_unlocks', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Challenge Completion</Label>
          <Switch
            checked={prefs.challenge_completion}
            onCheckedChange={(checked) => updatePref('challenge_completion', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

### D. Scheduled Notifications (Service Worker)

**Register Service Worker:**
```javascript
// In main.jsx or App.jsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(registration => {
    console.log('Service Worker registered');

    // Schedule daily reminder
    scheduleDailyReminder(registration);
  });
}
```

**Service Worker (sw.js):**
```javascript
// Listen for notification actions
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    // Open impact dashboard
    clients.openWindow('/impact');
  } else {
    // Open app
    clients.openWindow('/');
  }
});

// Periodic background sync (future)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(checkAndSendReminder());
  }
});
```

### E. Email Reminders (Future - Phase 4)

**Weekly Summary Email Template:**
```
Subject: Your Weekly Impact Summary - You deleted 234 files! 🎉

Hi [User],

Here's your Drive Cleaner impact for the week:

📉 Files Deleted: 234 (+45% vs last week)
💾 Storage Saved: 2.3 GB
🌍 CO2 Reduced: 0.115 kg (≈ Driving 0.28 miles)

📊 ROT Score: Improved from 62 → 58 (-4 points)
🔥 Current Streak: 7 days

🏆 Achievements Unlocked:
- Week Warrior (7-day streak)
- Carbon Curious (0.1 kg CO2 saved)

👑 OCT King Ranking: #47 (+3 from last week)

Keep up the great work! Delete 50 more files to reach Top 25.

[View Full Dashboard] [Unsubscribe]
```

**Streak Risk Email:**
```
Subject: Don't lose your 14-day streak! 🔥

Your 14-day cleanup streak is at risk!

You haven't used Drive Cleaner in 24 hours. Delete just 1 file in the next 12 hours to keep your streak alive.

[Open Drive Cleaner]
```

### F. Implementation Priority

**Phase 1 (MVP):**
- ✅ In-app nudges (ProgressNudge component)
- ✅ Achievement unlock toast notifications (using existing UI library)
- ✅ Settings UI for notification preferences

**Phase 1.5 (Optional MVP):**
- 🔄 Browser notifications (Notification API)
- 🔄 Daily streak reminder (scheduled)
- 🔄 Service Worker registration

**Phase 4 (Future):**
- ⏳ Email reminders (requires backend)
- ⏳ Weekly summary emails
- ⏳ Personalized insights

---

## 13. Risks & Mitigation

### Risk 1: Performance with Large Datasets
**Issue**: 90 days of metrics could be 10KB+ in localStorage
**Mitigation**:
- Store only last 90 days
- Archive older data to Drive AppData
- Lazy load historical charts

### Risk 2: localStorage Clearing
**Issue**: Users might lose all progress if cache cleared
**Mitigation**:
- Show warning on dashboard if data is new (<7 days)
- Prompt to enable Drive AppData sync
- Export option for manual backup

### Risk 3: Tracking Accuracy
**Issue**: Workspace file size estimates may be inaccurate
**Mitigation**:
- Use research-based estimates (docs/research/google-workspace-sizing-research.md)
- Show "estimated" badge with tooltip
- Allow manual corrections (future)

### Risk 4: Achievement Balance
**Issue**: XP/achievement thresholds might be too easy/hard
**Mitigation**:
- Start conservative, adjust based on user feedback
- Track achievement unlock rates
- Make thresholds configurable

---

## 14. Documentation Plan

Once implementation complete:

1. **User Guide**: `docs/daily-impact-tracker-guide.md`
   - How to interpret metrics
   - Achievement unlock guide
   - Streak maintenance tips
   - FAQ

2. **Developer Guide**: `docs/daily-impact-tracker-api.md`
   - Tracking API reference
   - Hook usage examples
   - localStorage schema
   - Integration patterns

3. **Architecture Diagram**: `docs/daily-impact-tracker-architecture.md`
   - Data flow visualization
   - Component relationships
   - Storage strategy

---

## 15. Metrics for Success

After 30 days of release, measure:

**Engagement Metrics:**
- Daily active users (DAU)
- Average session length
- Streak completion rate (% users with 7+ day streaks)
- Achievement unlock rate

**Impact Metrics:**
- Total files deleted by all users
- Total storage saved
- Total CO2 reduced
- Average ROT score improvement

**Retention Metrics:**
- 7-day retention rate
- 30-day retention rate
- Churn rate

**Target Goals:**
- 50%+ users open impact dashboard daily
- 30%+ users maintain 7+ day streak
- 20%+ retention improvement vs. baseline

---

**Total Estimated Effort:** 7-10 days
**Priority:** High (drives retention and engagement)
**Complexity:** High (time-series data, gamification, multiple integrations)
**Value:** Very High (transforms episodic tool into daily habit)