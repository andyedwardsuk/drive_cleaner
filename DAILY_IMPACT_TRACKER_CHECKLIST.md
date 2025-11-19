# Daily Impact Tracker - Implementation Checklist

**Status**: 📋 Planning Complete, Implementation Not Started
**GitHub Issue**: [#13](https://github.com/andyedwardsuk/drive_cleaner/issues/13)
**Sprint Assignment**: Sprint 3 (6 weeks out)
**Estimated Effort**: 7-10 days (2 week sprint)
**Feature Plan**: [docs/feature-plans/daily-impact-tracker-plan.md](docs/feature-plans/daily-impact-tracker-plan.md)
**Sprint Roadmap**: [SPRINT_ROADMAP.md](SPRINT_ROADMAP.md)

---

## Current Infrastructure Assessment

### ✅ Already Built (Can Leverage)

**Existing Components:**
- ✅ React + Vite frontend setup
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Google Apps Script backend with clasp deployment
- ✅ Drive API v2 integration with enhanced metadata
- ✅ File scanning and analysis infrastructure (Smart Scan)
- ✅ Storage analytics and formatters (`utilities/formatters.js`)
- ✅ Basic routing and navigation (`App.jsx`, `Sidebar.jsx`)

**Reusable Code:**
- ✅ `formatFileSize()` - Storage formatting (in `utilities/formatters.js`)
- ✅ `formatDate()` - Date formatting
- ✅ Enhanced metadata collection (includes file sizes, dates)
- ✅ Smart Scan engine (can hook into for ROT/tracking)
- ✅ Card components (can use as template for impact cards)

### ❌ Needs to Be Built (Core Feature)

**Backend Functions (0/15 complete):**
- ❌ `trackingEngine.js` - Core metrics tracking
- ❌ `achievementEngine.js` - Achievement unlock logic
- ❌ `streakCalculator.js` - Streak calculations
- ❌ `carbonCalculator.js` - CO2 calculations
- ❌ `storageHelpers.js` - localStorage CRUD operations
- ❌ `workspaceSizeEstimator.js` - Workspace file size estimation

**Frontend Components (0/13 complete):**
- ❌ `DailyImpactView.jsx` - Main view
- ❌ `DailyImpactCard.jsx` - Today's summary
- ❌ `LifetimeImpactCard.jsx` - All-time stats
- ❌ `ProgressChart.jsx` - 30-day trends
- ❌ `ROTProgressChart.jsx` - ROT score chart
- ❌ `StreakCalendar.jsx` - Streak visualization
- ❌ `DailyChallenges.jsx` - Challenges component
- ❌ `AchievementsGrid.jsx` - Achievements display
- ❌ `AchievementBadge.jsx` - Single achievement
- ❌ `LevelProgressBar.jsx` - XP/Level display
- ❌ `OCTLeaderboard.jsx` - Leaderboard (mock data for MVP)
- ❌ `LineChart.jsx` - Reusable chart component
- ❌ `BarChart.jsx` - Reusable chart component

**React Hooks (0/5 complete):**
- ❌ `useImpactTracking.js` - Track daily metrics
- ❌ `useStreakCalculation.js` - Streak logic
- ❌ `useAchievements.js` - Achievement system
- ❌ `useDailyChallenges.js` - Challenge progress
- ❌ `useLeaderboard.js` - Leaderboard data

**Integration Points (0/4 complete):**
- ❌ Hook tracking into file deletion operations
- ❌ Hook tracking into Smart Scan completion
- ❌ Hook tracking into app session time
- ❌ Add route and navigation menu item

---

## Phase 1: Core Tracking (Days 1-3)

### Day 1: Tracking Infrastructure

#### Backend: Storage Helpers
- [ ] **Create** `app/server/tracking/storageHelpers.js`
  ```javascript
  // localStorage schema operations
  - getDailyLogs()
  - saveDailyLogs()
  - getTodayMetrics()
  - saveTodayMetrics()
  - getUserProfile()
  - saveUserProfile()
  - createEmptyDayMetrics()
  ```
  **Dependencies**: None
  **Tests**: localStorage read/write, schema validation

#### Backend: Carbon Calculator
- [ ] **Create** `app/server/tracking/carbonCalculator.js`
  ```javascript
  - calculateCO2(sizeInBytes)
  - calculateEquivalentMiles(co2Kg)
  - calculateEquivalentTrees(co2Kg)
  ```
  **Dependencies**: None
  **Formula**: `Storage (GB) × 0.0001 kWh/GB/year × 0.5 kg CO2/kWh`
  **Tests**: Unit tests for calculation accuracy

#### Backend: Workspace Size Estimator
- [ ] **Create** `app/server/tracking/workspaceSizeEstimator.js`
  ```javascript
  - estimateWorkspaceFileSize(mimeType, version)
  - WORKSPACE_FILE_SIZE_ESTIMATES (baseline values)
  ```
  **Dependencies**: Research doc (`docs/research/google-workspace-sizing-research.md`)
  **Tests**: Estimates match expected ranges

#### Backend: Tracking Engine (Basic)
- [ ] **Create** `app/server/tracking/trackingEngine.js`
  ```javascript
  - initializeDailyTracking()
  - trackFileDeletion(file)
  - trackFileAddition(file)
  - trackScanCompletion(scanResults)
  ```
  **Dependencies**: storageHelpers, carbonCalculator, workspaceSizeEstimator
  **Tests**: Metrics increment correctly, CO2 calculations accurate

#### Testing
- [ ] **Write** Unit tests for all Day 1 functions
- [ ] **Verify** localStorage schema saves correctly
- [ ] **Test** CO2 calculations match expected values

---

### Day 2: Gamification Logic

#### Backend: Streak Calculator
- [ ] **Create** `app/server/tracking/streakCalculator.js`
  ```javascript
  - calculateCurrentStreak()
  - calculateLongestStreak()
  - getYesterdayDate()
  - subtractDays(date, days)
  ```
  **Dependencies**: storageHelpers
  **Tests**: Consecutive days, missed days, edge cases

#### Backend: Achievement Engine
- [ ] **Create** `app/server/tracking/achievementEngine.js`
  ```javascript
  - checkAchievements(metrics, profile)
  - unlockAchievement(key)
  - awardXP(amount)
  - calculateLevel(xp)
  - ACHIEVEMENTS (array of 20+ achievements)
  ```
  **Dependencies**: storageHelpers
  **Tests**: Achievement unlock conditions, XP calculations

#### Backend: Level System
- [ ] **Extend** `achievementEngine.js` with level system
  ```javascript
  - LEVEL_TITLES (1-50)
  - XP_THRESHOLDS (per level)
  - getNextLevelXP(currentLevel)
  ```
  **Tests**: Level-up triggers, XP requirements

#### Testing
- [ ] **Write** Unit tests for streak calculation
- [ ] **Write** Unit tests for achievement unlocks
- [ ] **Test** Edge cases (midnight crossing, timezone issues)

---

### Day 3: Integration Hooks

#### Backend: Track File Operations
- [ ] **Modify** `app/server/fileOperations.js` (or create if doesn't exist)
  ```javascript
  // In deleteFiles() function
  trackFileDeletion(file);
  ```
  **Dependencies**: trackingEngine
  **Tests**: Deletion triggers tracking correctly

#### Backend: Track Smart Scan
- [ ] **Modify** `app/server/smartScan/scanEngine.js`
  ```javascript
  // After scan completes
  trackScanCompletion(results);
  ```
  **Dependencies**: trackingEngine
  **Tests**: Scan completion updates metrics

#### Backend: Export Tracking API
- [ ] **Create** `app/server/api/trackingApi.js`
  ```javascript
  - getImpactData(period)  // 'today', 'week', 'month', 'all-time'
  - getStreakData()
  - getAchievements()
  - getUserProfile()
  ```
  **Dependencies**: All tracking modules
  **Tests**: API returns correct data structures

#### Testing
- [ ] **Integration test**: Scan → Track → Verify metrics
- [ ] **Integration test**: Delete files → Track → Check achievements
- [ ] **Performance test**: Tracking doesn't slow down operations

---

## Phase 2: UI Components (Days 4-6)

### Day 4: Core UI Components

#### Frontend: Reusable Charts
- [ ] **Create** `app/client/src/components/charts/LineChart.jsx`
  ```jsx
  Props: data, xKey, yKey, title, color
  Uses: Recharts or simple SVG
  ```
  **Dependencies**: Install `recharts` or use CSS
  **Tests**: Renders with sample data

- [ ] **Create** `app/client/src/components/charts/BarChart.jsx`
  ```jsx
  Props: data, xKey, yKey, title, color
  ```
  **Dependencies**: Recharts
  **Tests**: Renders correctly

#### Frontend: Impact Cards
- [ ] **Create** `app/client/src/components/impact/DailyImpactCard.jsx`
  ```jsx
  Props: data, comparison
  Displays: Files deleted, storage saved, CO2, ROT changes, streak
  ```
  **Dependencies**: formatFileSize, formatDate
  **Tests**: Component renders, comparisons show correctly

- [ ] **Create** `app/client/src/components/impact/LifetimeImpactCard.jsx`
  ```jsx
  Props: profileData
  Displays: All-time totals, streaks, ROT improvement
  ```
  **Tests**: Renders lifetime stats

#### Frontend: React Hook - Impact Tracking
- [ ] **Create** `app/client/src/hooks/useImpactTracking.js`
  ```javascript
  Returns: { today, yesterday, last30Days, isLoading }
  Fetches: Data from trackingApi
  ```
  **Dependencies**: trackingApi
  **Tests**: Hook fetches and returns correct data

#### Testing
- [ ] **Visual test**: Cards render with mock data
- [ ] **Test** Responsive design on mobile/tablet
- [ ] **Test** Charts display 30 days of data

---

### Day 5: Progress Visualizations

#### Frontend: Progress Charts
- [ ] **Create** `app/client/src/components/impact/ProgressChart.jsx`
  ```jsx
  Props: last30Days
  Displays: CO2 savings trend, storage saved trend
  Uses: LineChart component
  ```
  **Tests**: Multi-line chart renders

- [ ] **Create** `app/client/src/components/impact/ROTProgressChart.jsx`
  ```jsx
  Props: last30Days
  Displays: ROT score over time with target line
  ```
  **Tests**: Target line at ROT score 20

- [ ] **Create** `app/client/src/components/impact/HoardingProgressBar.jsx`
  ```jsx
  Props: currentGrade, startGrade
  Displays: Visual progress bar with grade labels
  ```
  **Tests**: Grade progression shows correctly

#### Frontend: Streak Visualization
- [ ] **Create** `app/client/src/components/impact/StreakCalendar.jsx`
  ```jsx
  Props: currentStreak, longestStreak, dailyLogs
  Displays: Calendar with checkmarks for active days
  ```
  **Tests**: Checkmarks on correct dates

#### Frontend: React Hook - Streak Calculation
- [ ] **Create** `app/client/src/hooks/useStreakCalculation.js`
  ```javascript
  Returns: { currentStreak, longestStreak, streakDates }
  ```
  **Dependencies**: trackingApi
  **Tests**: Streak calculations accurate

#### Testing
- [ ] **Test** Charts update when data changes
- [ ] **Test** Calendar shows current month by default
- [ ] **Visual test**: All progress visualizations

---

### Day 6: Gamification Components

#### Frontend: Achievements
- [ ] **Create** `app/client/src/components/impact/AchievementBadge.jsx`
  ```jsx
  Props: achievement, unlocked
  Displays: Icon, name, description, XP, locked/unlocked state
  ```
  **Tests**: Locked vs unlocked styling

- [ ] **Create** `app/client/src/components/impact/AchievementsGrid.jsx`
  ```jsx
  Props: achievements
  Displays: Grid of AchievementBadge components
  ```
  **Tests**: Grid layout responsive

#### Frontend: Daily Challenges
- [ ] **Create** `app/client/src/components/impact/DailyChallenges.jsx`
  ```jsx
  Props: challenges
  Displays: Challenge list with progress bars, rewards
  ```
  **Tests**: Progress bars update

#### Frontend: Level Progress
- [ ] **Create** `app/client/src/components/impact/LevelProgressBar.jsx`
  ```jsx
  Props: level, xp, xpToNextLevel, title
  Displays: Level number, title, XP progress bar
  ```
  **Tests**: XP bar fills correctly

#### Frontend: React Hooks - Achievements & Challenges
- [ ] **Create** `app/client/src/hooks/useAchievements.js`
  ```javascript
  Returns: { achievements, unlockedCount, totalXP }
  ```

- [ ] **Create** `app/client/src/hooks/useDailyChallenges.js`
  ```javascript
  Returns: { challenges, updateProgress }
  ```

#### Testing
- [ ] **Test** Achievement unlock animations
- [ ] **Test** Challenge progress updates
- [ ] **Visual test**: Gamification elements look engaging

---

## Phase 3: Integration & Polish (Days 7-10)

### Day 7: Main View & Navigation

#### Frontend: Main View
- [ ] **Create** `app/client/src/views/DailyImpactView.jsx`
  ```jsx
  Integrates: All impact components
  Layout: Responsive grid
  ```
  **Dependencies**: All impact components, all hooks
  **Tests**: Full view renders correctly

#### Frontend: OCT Leaderboard (Mock)
- [ ] **Create** `app/client/src/components/impact/OCTLeaderboard.jsx`
  ```jsx
  Props: leaderboardData (localStorage mock for MVP)
  Displays: Top 5 + user's rank
  ```
  **Tests**: Mock data displays

- [ ] **Create** `app/client/src/hooks/useLeaderboard.js`
  ```javascript
  Returns: { leaderboard, userRank, category }
  Note: Mock data from localStorage for MVP
  ```

#### Frontend: Navigation Integration
- [ ] **Modify** `app/client/src/App.jsx`
  ```jsx
  Add route: <Route path="/impact" element={<DailyImpactView />} />
  ```

- [ ] **Modify** `app/client/src/components/Sidebar.jsx`
  ```jsx
  Add menu item: "Daily Impact" with icon "📊"
  ```

#### Testing
- [ ] **Test** Navigation to /impact route
- [ ] **Test** Full view loads all components
- [ ] **Performance test**: View loads in <2 seconds

---

### Day 8: Time Tracking, Notifications & Reminders

#### Frontend: App Session Tracking
- [ ] **Modify** `app/client/src/App.jsx`
  ```jsx
  useEffect(() => {
    // Track time spent in app
    const startTime = Date.now();
    return () => trackTimeSpent((Date.now() - startTime) / 60000);
  }, []);
  ```

#### Frontend: In-App Nudges (MVP Priority)
- [ ] **Create** `app/client/src/components/impact/ProgressNudge.jsx`
  ```jsx
  Props: type, data
  Displays: Smart contextual nudges based on user progress
  Types: achievement_close, streak_risk, leaderboard_rank, milestone
  ```
  **Dependencies**: useImpactTracking
  **Tests**: Nudges appear at correct times

- [ ] **Create** `app/server/tracking/nudgeEngine.js`
  ```javascript
  - getSmartNudge()
  - getCloseAchievement(profile)
  - isEvening()
  ```
  **Tests**: Correct nudge priority logic

#### Frontend: Achievement Toast Notifications (MVP Priority)
- [ ] **Create** `app/client/src/components/impact/AchievementNotification.jsx`
  ```jsx
  Props: achievement
  Uses: shadcn/ui Toast component
  Displays: Toast notification on unlock with icon, name, XP
  ```
  **Dependencies**: shadcn/ui Toast component

- [ ] **Modify** `useAchievements.js`
  ```javascript
  // Show toast notification when achievement unlocked
  showNotification(newAchievement);
  ```

#### Frontend: Notification Settings (MVP Priority)
- [ ] **Create** `app/client/src/components/settings/NotificationSettings.jsx`
  ```jsx
  Settings: Enable/disable notifications, reminder time, notification types
  ```
  **Dependencies**: shadcn/ui Switch, Input components
  **Tests**: Settings save to localStorage

- [ ] **Create** `app/client/src/utils/notificationPrefs.js`
  ```javascript
  - getNotificationPrefs()
  - saveNotificationPrefs()
  - updatePref(key, value)
  ```

#### Backend: Daily Challenge Generator
- [ ] **Create** `app/server/tracking/challengeGenerator.js`
  ```javascript
  - generateDailyChallenges()
  - checkChallengeCompletion(challenge, metrics)
  ```
  **Tests**: Challenges generate correctly

#### Testing
- [ ] **Test** Session time tracked accurately
- [ ] **Test** Achievement toast notifications appear and dismiss
- [ ] **Test** Smart nudges show correct priority
- [ ] **Test** Notification settings persist
- [ ] **Test** Challenges update in real-time

---

### Day 8.5: Browser Notifications (Optional - Can Skip for MVP)

#### Frontend: Browser Notification API
- [ ] **Create** `app/client/src/utils/browserNotifications.js`
  ```javascript
  - requestNotificationPermission()
  - sendStreakReminder()
  - notifyAchievementUnlock(achievement)
  - notifyChallengeComplete(challenge)
  - scheduleDailyReminder(time)
  ```
  **Dependencies**: Browser Notification API
  **Tests**: Notifications send when permission granted

#### Frontend: Service Worker
- [ ] **Create** `app/client/public/sw.js`
  ```javascript
  - notificationclick event listener
  - periodicsync event listener (future)
  ```
  **Tests**: Service worker registers, notification clicks work

- [ ] **Modify** `app/client/src/main.jsx`
  ```javascript
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
  ```

#### Frontend: Notification Permission UI
- [ ] **Create** `app/client/src/components/settings/NotificationPermissionPrompt.jsx`
  ```jsx
  Displays: Banner prompting user to enable notifications
  Only shows if permission not granted and user has streak > 3 days
  ```

#### Testing
- [ ] **Test** Browser notifications send correctly
- [ ] **Test** Service worker registered
- [ ] **Test** Notification click opens correct page
- [ ] **Test** Daily reminder scheduled correctly
- [ ] **Manual test**: Close browser, wait for reminder time, check notification

---

### Day 9: Polish & Animations

#### Frontend: Animations & Transitions
- [ ] **Add** CSS transitions to progress bars
- [ ] **Add** Fade-in animations to cards
- [ ] **Add** Achievement unlock animation
- [ ] **Add** Level-up animation

#### Frontend: Responsive Design
- [ ] **Test** Mobile layout (320px - 768px)
- [ ] **Test** Tablet layout (768px - 1024px)
- [ ] **Test** Desktop layout (1024px+)
- [ ] **Fix** any layout issues

#### Frontend: Accessibility
- [ ] **Add** ARIA labels to all interactive elements
- [ ] **Test** Keyboard navigation
- [ ] **Check** Color contrast (WCAG AA)
- [ ] **Add** Screen reader support

#### UI/UX Polish
- [ ] **Add** Loading states for async operations
- [ ] **Add** Error states and handling
- [ ] **Add** Empty states (no data yet)
- [ ] **Improve** Typography and spacing

#### Testing
- [ ] **Visual regression test**: All components
- [ ] **Accessibility audit**: axe DevTools
- [ ] **Performance audit**: Lighthouse

---

### Day 10: Testing & Documentation

#### End-to-End Testing
- [ ] **Test** Full user flow: Scan → Delete → View Impact → Achievement
- [ ] **Test** Multi-day streak scenario
- [ ] **Test** localStorage persistence across sessions
- [ ] **Test** Data integrity (no negative values, no duplicates)

#### Performance Testing
- [ ] **Benchmark** Tracking function execution time (<50ms)
- [ ] **Benchmark** localStorage operations (<10ms)
- [ ] **Benchmark** Chart rendering (<500ms)
- [ ] **Test** No impact on Smart Scan performance

#### Bug Fixes
- [ ] **Fix** any issues found in testing
- [ ] **Optimize** slow operations
- [ ] **Refactor** any code smells

#### Documentation
- [ ] **Create** User guide (how to use Daily Impact Tracker)
- [ ] **Create** Developer API reference
- [ ] **Update** README with new feature
- [ ] **Add** JSDoc comments to all functions

---

## Feature Flag & Deployment

### Feature Flag
- [ ] **Add** `FEATURE_DAILY_IMPACT: false` to `app/client/src/config/featureFlags.js`
- [ ] **Test** Feature disabled by default
- [ ] **Enable** when ready: `FEATURE_DAILY_IMPACT: true`

### Deployment Checklist
- [ ] **Run** `npm run build` from `app/client/`
- [ ] **Run** `clasp push --force` from project root
- [ ] **Create** new deployment: `clasp deploy --description "v1.2.0 - Daily Impact Tracker"`
- [ ] **Update** `.clasp.json` with new deploymentId
- [ ] **Test** deployed web app
- [ ] **Verify** all features work in production

---

## Success Verification

### Functional Checks (All Must Pass)
- [ ] Daily metrics captured for file operations
- [ ] Storage and CO2 calculations accurate
- [ ] ROT score tracking works
- [ ] Streak calculation correct
- [ ] Achievements unlock at thresholds
- [ ] XP and levels work
- [ ] Charts display 30-day history
- [ ] localStorage persists across sessions

### Performance Checks
- [ ] Dashboard loads in <2 seconds
- [ ] Tracking executes in <50ms
- [ ] No slowdown to existing features

### UI/UX Checks
- [ ] Responsive on all devices
- [ ] Animations smooth
- [ ] WCAG AA compliant
- [ ] No console errors

---

## Dependencies to Install

### NPM Packages
```bash
cd app/client
npm install recharts  # For charts (if not using CSS-only)
```

### Optional Packages
```bash
npm install date-fns  # For date manipulation (optional, can use native)
```

---

## File Structure Reference

After implementation, file structure will be:

```
app/
├── server/
│   └── tracking/
│       ├── trackingEngine.js           ✅ Day 1
│       ├── carbonCalculator.js         ✅ Day 1
│       ├── workspaceSizeEstimator.js   ✅ Day 1
│       ├── storageHelpers.js           ✅ Day 1
│       ├── streakCalculator.js         ✅ Day 2
│       ├── achievementEngine.js        ✅ Day 2
│       └── challengeGenerator.js       ✅ Day 8
│
└── client/src/
    ├── views/
    │   └── DailyImpactView.jsx         ✅ Day 7
    │
    ├── components/
    │   ├── impact/
    │   │   ├── DailyImpactCard.jsx             ✅ Day 4
    │   │   ├── LifetimeImpactCard.jsx          ✅ Day 4
    │   │   ├── ProgressChart.jsx               ✅ Day 5
    │   │   ├── ROTProgressChart.jsx            ✅ Day 5
    │   │   ├── HoardingProgressBar.jsx         ✅ Day 5
    │   │   ├── StreakCalendar.jsx              ✅ Day 5
    │   │   ├── DailyChallenges.jsx             ✅ Day 6
    │   │   ├── AchievementBadge.jsx            ✅ Day 6
    │   │   ├── AchievementsGrid.jsx            ✅ Day 6
    │   │   ├── LevelProgressBar.jsx            ✅ Day 6
    │   │   ├── OCTLeaderboard.jsx              ✅ Day 7
    │   │   └── AchievementNotification.jsx     ✅ Day 8
    │   │
    │   └── charts/
    │       ├── LineChart.jsx                   ✅ Day 4
    │       └── BarChart.jsx                    ✅ Day 4
    │
    └── hooks/
        ├── useImpactTracking.js        ✅ Day 4
        ├── useStreakCalculation.js     ✅ Day 5
        ├── useAchievements.js          ✅ Day 6
        ├── useDailyChallenges.js       ✅ Day 6
        └── useLeaderboard.js           ✅ Day 7
```

---

## Optional: RemNotifLib Integration

### Use Standalone Library (Recommended for Production)

If creating **RemNotifLib** as a reusable library:

**Advantages:**
- ✅ Reusable across projects
- ✅ Centralized notification logic
- ✅ Built-in rate limiting and preferences
- ✅ Template management system
- ✅ Easier testing and maintenance

**Implementation:**
1. **Create RemNotifLib first** (5-7 days) - See [docs/libraries/RemNotifLib-spec.md](docs/libraries/RemNotifLib-spec.md)
2. **Replace inline notification code** in Daily Impact Tracker with RemNotifLib calls

**Modified Timeline:**
- Days 1-7: Build RemNotifLib library
- Days 8-17: Build Daily Impact Tracker (using RemNotifLib)
- **Total**: 14-17 days

### Inline Implementation (Recommended for MVP)

For faster MVP iteration:

**Approach:**
1. Implement notifications inline in Daily Impact Tracker
2. Extract to RemNotifLib later when proven and stable

**Advantages:**
- ✅ Faster to MVP (7-10 days vs 14-17 days)
- ✅ Can iterate on notification logic quickly
- ✅ Refactor to library when ready

**Migration Path:**
```javascript
// Phase 1 (MVP): Inline
function sendStreakReminder() {
  // Inline email sending code
  GmailApp.sendEmail(...);
}

// Phase 2 (Production): Extract to RemNotifLib
function sendStreakReminder() {
  RemNotifLib.sendEmail('streak-reminder', data);
}
```

**Recommendation**: Use inline for MVP, plan RemNotifLib extraction for Phase 2.

---

## Summary

**Current Status**: 📋 **0% Complete** (0/50 tasks)

**Next Actions**:
1. **Decision**: Inline notifications (7-10 days) vs RemNotifLib-first (14-17 days)
2. Start with Day 1: Core backend tracking functions
3. Build foundation before UI components
4. Test each component thoroughly before moving on
5. Integrate incrementally to avoid breaking existing features

**Estimated Timeline**:
- **MVP (Inline)**: 7-10 days full-time work
- **Production (RemNotifLib)**: 14-17 days full-time work

**Risk Level**: Medium (complex feature, but well-scoped)

**Blocker Check**: ✅ No blockers - all prerequisites in place

**Library Specs**:
- RemNotifLib: [docs/libraries/RemNotifLib-spec.md](docs/libraries/RemNotifLib-spec.md)