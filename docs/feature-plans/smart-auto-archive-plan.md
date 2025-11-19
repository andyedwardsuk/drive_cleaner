# Feature Implementation Plan: Smart Auto-Archive

**Feature Name**: smart-auto-archive
**Complexity**: High (ML patterns, automation, safety mechanisms)
**Priority**: High (High-impact automation)
**Module**: Full Stack (Backend Engine + Frontend Dashboard + Rules UI)
**Estimated Effort**: 10-14 days

---

## 1. Feature Overview

**Description**: Intelligent automation system that detects completed projects, inactive folders, and stale content, then automatically archives them to designated locations with full reversibility and safety mechanisms.

**Core Innovation**: Transform manual archiving into **intelligent automation** using activity patterns, project lifecycle detection, and user-defined rules while maintaining complete safety and transparency.

**Key Insight**: Users know they should archive old projects but never do because it's tedious. Automation with smart defaults + safety nets = clean drives without effort.

**Target Users**:
- Individual users with project-based work (consultants, freelancers)
- Teams managing multiple projects simultaneously
- Organizations needing workspace hygiene policies
- Anyone overwhelmed by accumulated Drive clutter

---

## 2. Core Functionality

### A. Automatic Detection

**What Gets Auto-Archived:**

```javascript
{
  // Project folders
  project_folders: {
    criteria: [
      'No activity in last 90 days',
      'Folder name contains "Project" or "Client"',
      'Contains dated subfolders (Q1 2023, etc.)',
      'All files older than 6 months'
    ],
    confidence: 'high' // 85%+
  },

  // Completed initiatives
  completed_work: {
    criteria: [
      'Folder name contains "DONE", "COMPLETE", "FINAL"',
      'Last modified >6 months ago',
      'No open comments or unresolved threads',
      'All collaborators inactive on folder'
    ],
    confidence: 'very_high' // 95%+
  },

  // Event-based content
  event_folders: {
    criteria: [
      'Folder name contains event/conference name + year',
      'Event date passed (if detectable)',
      'No activity since event date + 30 days',
      'Calendar integration shows past event'
    ],
    confidence: 'medium' // 70%+
  },

  // Temporal folders
  dated_folders: {
    criteria: [
      'Name contains year (2022, 2023) or quarter (Q1 2023)',
      'Period has passed',
      'No recent access',
      'Not current year/quarter'
    ],
    confidence: 'high' // 80%+
  },

  // Inactive Shared Drives
  stale_shared_drives: {
    criteria: [
      'Shared Drive with no activity >120 days',
      'All members inactive',
      'No files modified recently',
      'Drive marked as "Archive" or "Old"'
    ],
    confidence: 'medium' // 65%+
  }
}
```

### B. Safety Mechanisms

**Never Auto-Archive:**

```javascript
const SAFETY_RULES = {
  recent_activity: 'Any folder with activity in last 30 days',
  starred_files: 'Files/folders user has starred',
  open_shares: 'Files with active external shares',
  important_labels: 'Files labeled as "Important" or "Critical"',
  current_period: 'Folders for current year/quarter',
  small_file_count: 'Folders with <5 files (might be incomplete)',
  root_level: 'Top-level folders in My Drive (user likely wants them visible)',
  shared_drive_member: 'Shared Drives where user is active member',
  unresolved_comments: 'Files with open comment threads',
  recent_shares: 'Files shared in last 30 days',
  calendar_upcoming: 'Folders linked to upcoming calendar events',
  high_view_count: 'Files viewed >5 times in last 90 days'
};
```

### C. Archive Destinations

**Default Archive Structure:**

```
My Drive/
└── 📦 Archive/
    ├── 2024/
    │   ├── Q1/
    │   │   └── Project Alpha (archived 2024-01-15)
    │   ├── Q2/
    │   ├── Q3/
    │   └── Q4/
    ├── 2023/
    │   └── Q4/
    │       ├── Old Client Work (archived 2024-01-10)
    │       └── 2023 Tax Docs (archived 2024-02-01)
    └── 2022/
```

**Custom Destinations:**
- User-defined archive folder
- Shared Drive: "Company Archive"
- Separate Google account (export + delete)

---

## 3. Detection Algorithms

### A. Project Completion Detector

```javascript
/**
 * Detect if a folder represents a completed project
 * @param {Object} folder - Folder metadata
 * @returns {Object} Detection result with confidence score
 */
function detectProjectCompletion(folder) {
  let score = 0;
  const signals = [];

  // Signal 1: Name indicates completion
  const completionKeywords = ['DONE', 'COMPLETE', 'FINAL', 'FINISHED', 'CLOSED', 'ARCHIVED'];
  if (completionKeywords.some(kw => folder.name.toUpperCase().includes(kw))) {
    score += 30;
    signals.push('completion_keyword_in_name');
  }

  // Signal 2: No recent activity
  const daysSinceActivity = getDaysSince(folder.last_modified_date);
  if (daysSinceActivity > 180) { score += 25; signals.push('no_activity_6m'); }
  else if (daysSinceActivity > 90) { score += 15; signals.push('no_activity_3m'); }

  // Signal 3: All files are old
  const files = getFilesInFolder(folder.id);
  const avgFileAge = files.reduce((sum, f) => sum + getDaysSince(f.modified), 0) / files.length;
  if (avgFileAge > 180) { score += 15; signals.push('all_files_old'); }

  // Signal 4: Contains dated subfolders suggesting project phases
  const hasDateStructure = folder.children?.some(child =>
    /\d{4}/.test(child.name) || /Q[1-4]/.test(child.name)
  );
  if (hasDateStructure) { score += 10; signals.push('dated_substructure'); }

  // Signal 5: No open collaborations
  const hasOpenCollabs = files.some(f => f.open_comments_count > 0 || f.shared_recently);
  if (!hasOpenCollabs) { score += 10; signals.push('no_open_collaborations'); }

  // Signal 6: Project name pattern
  const projectPattern = /(project|client|initiative|campaign)/i;
  if (projectPattern.test(folder.name)) { score += 10; signals.push('project_naming_pattern'); }

  return {
    is_completed: score >= 70,
    confidence: Math.min(score, 100),
    signals: signals,
    recommendation: score >= 85 ? 'auto_archive' :
                    score >= 70 ? 'suggest_archive' :
                    'keep_active'
  };
}
```

### B. Temporal Folder Detector

```javascript
/**
 * Detect folders tied to specific time periods
 */
function detectTemporalFolder(folder) {
  const namePatterns = {
    // Year-based
    year: /\b(19|20)\d{2}\b/,
    // Quarter-based
    quarter: /\bQ[1-4]\s*(19|20)?\d{2}\b/i,
    // Month-based
    month: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s*(19|20)?\d{2}\b/i,
    // Fiscal year
    fiscal_year: /\bFY\s*\d{2,4}\b/i,
    // Academic year
    academic: /\b(Fall|Spring|Summer|Winter)\s*(19|20)?\d{2}\b/i
  };

  for (const [type, pattern] of Object.entries(namePatterns)) {
    const match = folder.name.match(pattern);
    if (match) {
      const period = extractTimePeriod(match[0], type);
      const isPast = period.end < new Date();
      const daysSinceEnd = getDaysSince(period.end);

      return {
        is_temporal: true,
        type: type,
        period: period,
        is_past: isPast,
        days_since_end: daysSinceEnd,
        should_archive: isPast && daysSinceEnd > 90,
        confidence: isPast ? 90 : 60
      };
    }
  }

  return { is_temporal: false };
}
```

### C. Inactivity Analyzer

```javascript
/**
 * Analyze folder activity patterns
 */
function analyzeInactivity(folder) {
  const files = getFilesInFolder(folder.id, { recursive: true });

  const activity = {
    last_file_modified: Math.max(...files.map(f => new Date(f.modified))),
    last_file_viewed: Math.max(...files.map(f => new Date(f.last_viewed))),
    last_share_activity: getLastShareActivity(folder.id),
    last_comment: getLastComment(files),

    total_files: files.length,
    files_modified_30d: files.filter(f => getDaysSince(f.modified) < 30).length,
    files_viewed_30d: files.filter(f => getDaysSince(f.last_viewed) < 30).length,

    unique_collaborators_30d: getUniqueCollaborators(files, 30),
    unique_viewers_30d: getUniqueViewers(files, 30)
  };

  const inactivityScore = calculateInactivityScore(activity);

  return {
    activity: activity,
    inactivity_score: inactivityScore, // 0-100 (100 = completely inactive)
    is_inactive: inactivityScore > 80,
    recommendation: inactivityScore > 90 ? 'archive_immediately' :
                    inactivityScore > 80 ? 'archive_soon' :
                    inactivityScore > 60 ? 'monitor' :
                    'keep_active'
  };
}
```

---

## 4. Archive Rules Engine

### A. Rule Types

```javascript
const RULE_TYPES = {
  time_based: {
    name: 'Time-Based Archive',
    description: 'Archive after specific time period',
    params: {
      inactivity_days: 90,
      folder_patterns: ['*'], // All folders
      destination: 'Archive/{year}/{quarter}'
    }
  },

  project_based: {
    name: 'Project Completion Archive',
    description: 'Archive when project appears complete',
    params: {
      min_confidence: 85,
      grace_period_days: 30,
      notification_days_before: 7
    }
  },

  size_based: {
    name: 'Large Folder Archive',
    description: 'Archive folders exceeding size threshold',
    params: {
      min_size_gb: 5,
      max_file_age_days: 180,
      destination: 'Archive/Large Projects'
    }
  },

  pattern_based: {
    name: 'Naming Pattern Archive',
    description: 'Archive folders matching specific patterns',
    params: {
      patterns: ['*2022*', '*2023*', '*Old*', '*Legacy*'],
      exclude_patterns: ['*Current*', '*Active*'],
      inactivity_days: 60
    }
  },

  shared_drive_based: {
    name: 'Shared Drive Cleanup',
    description: 'Archive inactive Shared Drive content',
    params: {
      drive_id: 'shared_drive_id',
      inactivity_days: 120,
      min_member_inactivity: 90
    }
  }
};
```

### B. Rule Configuration UI

```javascript
// Rule builder example
const exampleRule = {
  id: 'rule_001',
  name: 'Archive 2023 Projects',
  enabled: true,
  type: 'pattern_based',

  conditions: {
    all_of: [
      { type: 'name_contains', value: '2023' },
      { type: 'inactivity_days', operator: '>', value: 90 },
      { type: 'confidence_score', operator: '>=', value: 80 }
    ],
    none_of: [
      { type: 'starred', value: true },
      { type: 'has_open_comments', value: true }
    ]
  },

  actions: {
    archive_to: 'Archive/2023',
    notify_user: true,
    notification_days_before: 7,
    create_shortcut: true, // Leave shortcut in original location
    add_label: 'auto-archived'
  },

  schedule: {
    frequency: 'weekly', // or 'daily', 'monthly'
    day_of_week: 0, // Sunday
    dry_run_first: true // Preview mode before actual archiving
  }
};
```

---

## 5. UI/UX Design

### A. Dashboard Overview

```
┌─────────────────────────────────────────────────────────┐
│  Smart Auto-Archive 📦                                  │
│  Intelligent file organization on autopilot             │
└─────────────────────────────────────────────────────────┘

┌─────────────────── Archive Candidates ──────────────────┐
│                                                          │
│  🎯 27 folders ready to archive (12.4 GB)               │
│     ├─ 15 Completed projects (High confidence)          │
│     ├─ 8  Past-year folders (2023, Q1 2023)             │
│     └─ 4  Inactive folders (90+ days)                   │
│                                                          │
│  [Review Suggestions]  [Archive All]  [Configure Rules] │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌─────────────────── Active Rules ────────────────────────┐
│                                                          │
│  ✅ Auto-archive projects after 90 days inactivity      │
│     Last run: 2 days ago  |  Next run: In 5 days        │
│     Archived: 12 folders  |  Saved: 3.2 GB              │
│                                                          │
│  ✅ Archive past-year folders quarterly                 │
│     Last run: 15 days ago  |  Next run: In 75 days      │
│     Archived: 8 folders  |  Saved: 1.8 GB               │
│                                                          │
│  ⏸️  Large folder cleanup (Paused)                      │
│                                                          │
│  [+ Create New Rule]                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌─────────────────── Archive History ─────────────────────┐
│                                                          │
│  📦 2024-11-15: "Project Phoenix" → Archive/2024/Q4     │
│     12 files, 234 MB  [Restore] [View Archive]          │
│                                                          │
│  📦 2024-11-10: "2023 Marketing" → Archive/2023         │
│     45 files, 1.2 GB  [Restore] [View Archive]          │
│                                                          │
│  📦 2024-11-08: "Old Client Work" → Archive/2024/Q4     │
│     8 files, 89 MB  [Restore] [View Archive]            │
│                                                          │
│  [View All Archives] [Export History]                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### B. Archive Suggestions View

```
┌──────────────── Archive Candidates (27) ────────────────┐
│                                                          │
│  Filters: [All] [High Confidence] [Projects] [Temporal] │
│  Sort by: [Confidence ↓] [Size] [Age] [Name]            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ✅ Project Alpha                                        │
│     📁 Confidence: 95% (Very High)                       │
│     📊 Size: 456 MB (23 files)                          │
│     🕐 Last activity: 127 days ago                       │
│     ✨ Signals: completion_keyword, no_activity_6m,     │
│               all_files_old, no_open_collaborations     │
│     📍 Will archive to: Archive/2024/Q4/                 │
│     [Keep Active] [Archive Now] [Customize]             │
│                                                          │
│  ✅ Q1 2023 Planning                                     │
│     📁 Confidence: 90% (High)                            │
│     📊 Size: 234 MB (15 files)                          │
│     🕐 Last activity: 198 days ago                       │
│     ✨ Signals: temporal_folder, period_passed,         │
│               no_recent_access                          │
│     📍 Will archive to: Archive/2023/Q1/                 │
│     [Keep Active] [Archive Now] [Customize]             │
│                                                          │
│  ⚠️  Old Workspace                                       │
│     📁 Confidence: 72% (Medium)                          │
│     📊 Size: 1.2 GB (89 files)                          │
│     🕐 Last activity: 95 days ago                        │
│     ✨ Signals: inactivity_90d, large_size              │
│     ⚠️  Safety: Contains 2 starred files                 │
│     📍 Will archive to: Archive/2024/Q4/                 │
│     [Keep Active] [Review Starred] [Archive Rest]       │
│                                                          │
│  [Select All] [Archive Selected (27)]  [Dry Run]        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### C. Rule Builder UI

```
┌─────────────── Create Archive Rule ─────────────────────┐
│                                                          │
│  Rule Name: [Archive 2023 Projects____________]         │
│                                                          │
│  ━━━ Conditions ━━━                                     │
│                                                          │
│  Trigger when ALL of these are true:                    │
│    • Folder name [contains ▼] [2023_____________]       │
│    • Inactivity [greater than ▼] [90___] days          │
│    • Confidence score [≥ ▼] [80___]%                   │
│    [+ Add Condition]                                    │
│                                                          │
│  BUT exclude if ANY of these are true:                  │
│    • File is [starred ▼]                                │
│    • Has [open comments ▼]                              │
│    [+ Add Exclusion]                                    │
│                                                          │
│  ━━━ Actions ━━━                                        │
│                                                          │
│  Archive to: [Archive/2023_________________] [Browse]   │
│  □ Leave shortcut in original location                  │
│  ☑ Notify me before archiving                          │
│    └─ Send notification [7___] days before              │
│  □ Add label to archived files                          │
│                                                          │
│  ━━━ Schedule ━━━                                       │
│                                                          │
│  Run: [Weekly ▼] on [Sunday ▼]                         │
│  ☑ Dry run first (preview before archiving)            │
│                                                          │
│  [Cancel]  [Save as Draft]  [Enable Rule]              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### D. Pre-Archive Notification

```
┌────────────── Archive Notification 📦 ──────────────────┐
│                                                          │
│  Smart Auto-Archive will move 3 folders in 7 days       │
│                                                          │
│  📁 Project Phoenix (95% confidence)                     │
│     → Archive/2024/Q4/                                   │
│     456 MB, last activity 127 days ago                   │
│                                                          │
│  📁 Q1 2023 Planning (90% confidence)                    │
│     → Archive/2023/Q1/                                   │
│     234 MB, last activity 198 days ago                   │
│                                                          │
│  📁 Old Client Work (88% confidence)                     │
│     → Archive/2024/Q4/                                   │
│     89 MB, last activity 142 days ago                    │
│                                                          │
│  These folders have been inactive and match your         │
│  "Auto-archive projects" rule.                           │
│                                                          │
│  [Keep All Active]  [Review]  [Archive Now]             │
│  [Snooze 30 Days]                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Backend Implementation

### A. Detection Engine (`archiveDetector.js`)

```javascript
/**
 * Smart Auto-Archive Detection Engine
 * Analyzes Drive structure and suggests archive candidates
 */

/**
 * Main detection function
 * @param {Object} options - Scan options
 * @returns {Object} Archive candidates with confidence scores
 */
function detectArchiveCandidates(options = {}) {
  const {
    min_confidence = 70,
    include_shared_drives = false,
    max_candidates = 100
  } = options;

  // Get all folders in My Drive
  const folders = getAllFolders({
    corpora: 'user',
    exclude_root: true
  });

  const candidates = [];

  folders.forEach(folder => {
    // Run all detection algorithms
    const projectCompletion = detectProjectCompletion(folder);
    const temporalDetection = detectTemporalFolder(folder);
    const inactivityAnalysis = analyzeInactivity(folder);

    // Safety checks
    const safetyCheck = runSafetyChecks(folder);

    // Calculate overall confidence
    const confidence = calculateOverallConfidence({
      project: projectCompletion,
      temporal: temporalDetection,
      inactivity: inactivityAnalysis,
      safety: safetyCheck
    });

    if (confidence >= min_confidence && safetyCheck.is_safe) {
      candidates.push({
        folder: folder,
        confidence: confidence,
        signals: combineSignals(projectCompletion, temporalDetection, inactivityAnalysis),
        destination: calculateDestination(folder, temporalDetection),
        safety_flags: safetyCheck.flags,
        estimated_savings: calculateStorageSavings(folder)
      });
    }
  });

  // Sort by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);

  return {
    candidates: candidates.slice(0, max_candidates),
    total_count: candidates.length,
    total_size_bytes: candidates.reduce((sum, c) => sum + c.folder.size_bytes, 0),
    total_file_count: candidates.reduce((sum, c) => sum + c.folder.file_count, 0)
  };
}

/**
 * Run safety checks before archiving
 */
function runSafetyChecks(folder) {
  const flags = [];
  let is_safe = true;

  // Check 1: Recent activity
  if (getDaysSince(folder.last_modified) < 30) {
    flags.push('recent_activity');
    is_safe = false;
  }

  // Check 2: Starred
  if (folder.starred) {
    flags.push('starred');
    is_safe = false;
  }

  // Check 3: Open shares
  if (hasActiveExternalShares(folder)) {
    flags.push('active_external_shares');
    is_safe = false;
  }

  // Check 4: Important label
  if (hasLabel(folder, 'Important') || hasLabel(folder, 'Critical')) {
    flags.push('important_label');
    is_safe = false;
  }

  // Check 5: Current period
  if (isCurrentYearOrQuarter(folder.name)) {
    flags.push('current_period');
    is_safe = false;
  }

  // Check 6: Too few files (might be incomplete project)
  if (folder.file_count < 5) {
    flags.push('low_file_count');
    is_safe = false;
  }

  // Check 7: Root level folder
  if (folder.parent_id === 'root') {
    flags.push('root_level');
    // Still safe, but user should confirm
  }

  // Check 8: Has starred files inside
  const starredFiles = getStarredFilesInFolder(folder.id);
  if (starredFiles.length > 0) {
    flags.push(`contains_${starredFiles.length}_starred_files`);
    // Not blocking, but warn user
  }

  return {
    is_safe: is_safe,
    flags: flags,
    warnings: flags.filter(f => !['root_level', 'contains_starred_files'].includes(f.split('_')[0]))
  };
}
```

### B. Archive Engine (`archiveEngine.js`)

```javascript
/**
 * Execute archive operations
 */
function archiveFolder(folderId, destination, options = {}) {
  const {
    create_shortcut = false,
    notify_user = true,
    add_label = false,
    dry_run = false
  } = options;

  // Get folder details
  const folder = Drive.Files.get(folderId);

  // Final safety check
  const safety = runSafetyChecks(folder);
  if (!safety.is_safe && !options.force) {
    throw new Error(`Folder "${folder.title}" failed safety check: ${safety.warnings.join(', ')}`);
  }

  if (dry_run) {
    return {
      action: 'dry_run',
      folder: folder.title,
      destination: destination,
      would_move: true,
      estimated_time_seconds: estimateArchiveTime(folder)
    };
  }

  // Create destination if doesn't exist
  const destFolder = ensureArchiveFolder(destination);

  // Move folder
  const result = Drive.Files.update(
    { parents: [{ id: destFolder.id }] },
    folderId,
    null,
    { removeParents: folder.parents[0].id }
  );

  // Create shortcut in original location (optional)
  if (create_shortcut) {
    createShortcut(folder.title, folderId, folder.parents[0].id);
  }

  // Add label (optional)
  if (add_label) {
    addLabel(folderId, 'auto-archived');
  }

  // Log operation
  logArchiveOperation({
    folder_id: folderId,
    folder_name: folder.title,
    destination: destination,
    size_bytes: folder.size_bytes,
    file_count: folder.file_count,
    archived_at: new Date().toISOString(),
    user: Session.getActiveUser().getEmail()
  });

  // Notify user (optional)
  if (notify_user && RemNotifLib) {
    RemNotifLib.sendEmail(
      Session.getActiveUser().getEmail(),
      'folder-archived',
      {
        folderName: folder.title,
        destination: destination,
        size: formatFileSize(folder.size_bytes),
        fileCount: folder.file_count
      }
    );
  }

  return {
    success: true,
    folder_id: folderId,
    folder_name: folder.title,
    destination: destination,
    archived_at: new Date().toISOString()
  };
}

/**
 * Restore archived folder to original location
 */
function restoreArchivedFolder(folderId, originalParent) {
  const folder = Drive.Files.get(folderId);

  // Move back to original location
  const result = Drive.Files.update(
    { parents: [{ id: originalParent }] },
    folderId,
    null,
    { removeParents: folder.parents[0].id }
  );

  // Remove auto-archived label
  removeLabel(folderId, 'auto-archived');

  // Log restore
  logRestoreOperation({
    folder_id: folderId,
    folder_name: folder.title,
    restored_at: new Date().toISOString()
  });

  return {
    success: true,
    folder_id: folderId,
    folder_name: folder.title,
    restored_to: originalParent
  };
}
```

### C. Rules Engine (`archiveRulesEngine.js`)

```javascript
/**
 * Archive Rules Engine
 * Manages and executes archive rules
 */

/**
 * Evaluate all active rules
 */
function evaluateAllRules() {
  const rules = getActiveRules();
  const results = [];

  rules.forEach(rule => {
    const result = evaluateRule(rule);
    if (result.matches.length > 0) {
      results.push({
        rule: rule,
        matches: result.matches,
        total_size: result.total_size,
        should_notify: shouldNotifyForRule(rule, result)
      });
    }
  });

  return results;
}

/**
 * Execute a specific rule
 */
function executeRule(ruleId, options = {}) {
  const rule = getRule(ruleId);
  const evaluation = evaluateRule(rule);

  if (evaluation.matches.length === 0) {
    return { success: true, archived_count: 0, message: 'No matches found' };
  }

  // Dry run first if configured
  if (rule.schedule.dry_run_first && !options.skip_dry_run) {
    return {
      dry_run: true,
      matches: evaluation.matches,
      message: `Would archive ${evaluation.matches.length} folders`
    };
  }

  // Notify user if required
  if (rule.actions.notify_user && !options.skip_notification) {
    sendArchiveNotification(rule, evaluation.matches, rule.actions.notification_days_before);
    return {
      success: true,
      notification_sent: true,
      will_execute_at: addDays(new Date(), rule.actions.notification_days_before)
    };
  }

  // Execute archives
  const archived = [];
  evaluation.matches.forEach(match => {
    try {
      const result = archiveFolder(
        match.folder.id,
        rule.actions.archive_to,
        {
          create_shortcut: rule.actions.create_shortcut,
          add_label: rule.actions.add_label,
          notify_user: false // Batch notification sent above
        }
      );
      archived.push(result);
    } catch (error) {
      Logger.log(`Error archiving ${match.folder.name}: ${error.message}`);
    }
  });

  return {
    success: true,
    rule_id: ruleId,
    archived_count: archived.length,
    archived_folders: archived,
    total_size_saved: archived.reduce((sum, a) => sum + a.size_bytes, 0)
  };
}
```

---

## 7. Frontend Implementation

### A. React Components

```
app/client/src/
├── views/
│   └── SmartArchiveView.jsx          # Main dashboard
│
├── components/
│   ├── archive/
│   │   ├── ArchiveCandidatesTable.jsx    # List of suggestions
│   │   ├── ArchiveCandidateCard.jsx      # Individual candidate
│   │   ├── ActiveRulesPanel.jsx          # Active rules display
│   │   ├── RuleBuilder.jsx               # Create/edit rules
│   │   ├── ArchiveHistoryTimeline.jsx    # Past archives
│   │   ├── RestoreDialog.jsx             # Restore archived folder
│   │   ├── ConfidenceIndicator.jsx       # Visual confidence %
│   │   ├── SafetyFlagsDisplay.jsx        # Show safety warnings
│   │   └── ArchiveStats.jsx              # Storage saved, counts
│   │
│   └── rules/
│       ├── ConditionBuilder.jsx          # Rule condition UI
│       ├── ActionSelector.jsx            # Rule action UI
│       └── ScheduleConfig.jsx            # Schedule settings
│
└── hooks/
    ├── useArchiveCandidates.js       # Fetch candidates
    ├── useArchiveRules.js            # Manage rules
    ├── useArchiveHistory.js          # Archive logs
    └── useArchiveActions.js          # Archive/restore actions
```

### B. Key Component Example

```jsx
// ArchiveCandidateCard.jsx
export function ArchiveCandidateCard({ candidate, onArchive, onKeep }) {
  const [expanded, setExpanded] = useState(false);

  const confidenceColor =
    candidate.confidence >= 90 ? 'text-green-400' :
    candidate.confidence >= 80 ? 'text-blue-400' :
    candidate.confidence >= 70 ? 'text-yellow-400' :
    'text-gray-400';

  return (
    <div className="p-4 border rounded-lg bg-card/50 border-glass-border">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <Folder className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-gray-200">{candidate.folder.name}</h3>
          </div>

          {/* Metadata */}
          <div className="mt-2 flex gap-4 text-sm text-gray-400">
            <span>📊 {formatFileSize(candidate.folder.size_bytes)} ({candidate.folder.file_count} files)</span>
            <span>🕐 {getDaysAgo(candidate.folder.last_modified)} days ago</span>
          </div>

          {/* Confidence */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-400">Confidence:</span>
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${confidenceColor} bg-current`}
                  style={{ width: `${candidate.confidence}%` }}
                />
              </div>
            </div>
            <span className={`font-semibold ${confidenceColor}`}>
              {candidate.confidence}%
            </span>
          </div>

          {/* Signals */}
          {expanded && (
            <div className="mt-3 flex flex-wrap gap-2">
              {candidate.signals.map(signal => (
                <span
                  key={signal}
                  className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-300 border border-blue-500/30"
                >
                  {signal.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Safety Flags */}
          {candidate.safety_flags?.length > 0 && (
            <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <div className="flex items-center gap-2 text-sm text-yellow-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Contains {candidate.safety_flags.join(', ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onKeep(candidate.folder.id)}>
            Keep Active
          </Button>
          <Button variant="default" size="sm" onClick={() => onArchive(candidate.folder.id)}>
            Archive Now
          </Button>
        </div>
      </div>

      {/* Destination */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-glass-border">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Will archive to:</span>
            <code className="px-2 py-1 bg-gray-800 rounded text-blue-300">
              {candidate.destination}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 8. Integration Points

### A. Smart Scan Integration

Add archive suggestions to Smart Scan results:

```javascript
// In scanEngine.js
function runSmartScan(folderId, corpora) {
  // ... existing scan logic

  // Add archive detection
  const archiveCandidates = detectArchiveCandidates({
    min_confidence: 80,
    max_candidates: 20
  });

  return {
    // ... existing categories
    categories: {
      large_files: ...,
      old_files: ...,
      duplicates: ...,
      empty_items: ...,
      temp_files: ...,
      workspace_files: ...,
      archive_candidates: archiveCandidates  // NEW
    }
  };
}
```

### B. Daily Impact Tracker Integration

Track archived folders in daily metrics:

```javascript
// In trackingEngine.js
function trackArchiveOperation(archiveResult) {
  const metrics = getTodayMetrics();

  metrics.folders_archived += 1;
  metrics.storage_archived_bytes += archiveResult.size_bytes;
  metrics.files_archived += archiveResult.file_count;

  // Award XP for good housekeeping
  awardXP(10); // 10 XP per archived folder

  // Check for achievements
  checkAchievements(metrics);

  saveTodayMetrics(metrics);
}
```

### C. ROT Score Integration

Use ROT score to boost archive confidence:

```javascript
function calculateOverallConfidence(detections) {
  let baseConfidence = /* ... existing logic */;

  // Boost if folder has high ROT score
  if (detections.folder.rot_score > 70) {
    baseConfidence += 10;
  }

  return Math.min(baseConfidence, 100);
}
```

---

## 9. Machine Learning Enhancement (Future)

### A. Pattern Learning

```javascript
/**
 * Learn from user behavior to improve detection
 */
function learnFromUserActions() {
  const userActions = getArchiveHistory();

  const learnings = {
    // Which signals correlate with user accepting suggestions
    signal_weights: calculateSignalWeights(userActions),

    // Common folder naming patterns user archives
    name_patterns: extractNamePatterns(userActions.filter(a => a.user_action === 'archived')),

    // Common folder naming patterns user keeps
    exclude_patterns: extractNamePatterns(userActions.filter(a => a.user_action === 'kept_active')),

    // Optimal inactivity thresholds
    optimal_inactivity_days: calculateOptimalThreshold(userActions)
  };

  // Update detection weights
  updateDetectionWeights(learnings);

  return learnings;
}
```

### B. Personalized Recommendations

```javascript
/**
 * Personalize archive suggestions based on user patterns
 */
function personalizeRecommendations(candidates, userProfile) {
  return candidates.map(candidate => {
    let adjustedConfidence = candidate.confidence;

    // User tends to archive project folders quickly
    if (userProfile.archives_projects_fast && candidate.signals.includes('project_naming_pattern')) {
      adjustedConfidence += 5;
    }

    // User tends to keep year-based folders longer
    if (userProfile.keeps_year_folders && candidate.signals.includes('temporal_folder')) {
      adjustedConfidence -= 10;
    }

    // User archives folders at specific inactivity threshold
    const userThreshold = userProfile.typical_archive_days || 90;
    const folderAge = getDaysSince(candidate.folder.last_modified);
    if (Math.abs(folderAge - userThreshold) < 30) {
      adjustedConfidence += 5;
    }

    return {
      ...candidate,
      confidence: Math.max(0, Math.min(100, adjustedConfidence)),
      personalized: true
    };
  });
}
```

---

## 10. Success Criteria

### Functional Requirements
- [ ] Detect archive candidates with 80%+ confidence accuracy
- [ ] Zero false positives (never archive recent/important files)
- [ ] Rule engine supports time/pattern/project/size-based rules
- [ ] Dry-run mode previews actions before execution
- [ ] One-click restore from archive history
- [ ] Notification system warns before auto-archiving
- [ ] Archive operations complete in <10 seconds per folder

### Safety Requirements
- [ ] ALL safety checks must pass before archiving
- [ ] User notification 7 days before auto-archive
- [ ] Starred files never auto-archived
- [ ] Files with open comments never auto-archived
- [ ] Current year/quarter folders never auto-archived
- [ ] Root-level folders require explicit confirmation
- [ ] Complete audit log of all archive operations

### UX Requirements
- [ ] Archive suggestions dashboard loads in <2 seconds
- [ ] Confidence indicators visually clear (color-coded)
- [ ] Rule builder intuitive (no technical knowledge required)
- [ ] Archive history searchable and filterable
- [ ] Restore action completes in <5 seconds

### Performance Requirements
- [ ] Scan 1,000 folders in <30 seconds
- [ ] Archive operation doesn't block other Drive operations
- [ ] Rules evaluation runs asynchronously
- [ ] No Drive API quota violations

---

## 11. Implementation Timeline

### Phase 1: Core Detection (Days 1-4)

**Day 1: Detection Algorithms**
- [ ] `detectProjectCompletion()`
- [ ] `detectTemporalFolder()`
- [ ] `analyzeInactivity()`
- [ ] Unit tests for detection logic

**Day 2: Safety Mechanisms**
- [ ] `runSafetyChecks()`
- [ ] Safety rule configuration
- [ ] Override system for edge cases
- [ ] Safety tests (ensure no false positives)

**Day 3: Archive Engine**
- [ ] `archiveFolder()` - Move operation
- [ ] `restoreArchivedFolder()` - Undo operation
- [ ] Audit logging
- [ ] Error handling and rollback

**Day 4: Archive Suggestions**
- [ ] `detectArchiveCandidates()` - Main API
- [ ] Confidence calculation
- [ ] Destination logic
- [ ] Integration tests

### Phase 2: Rules Engine (Days 5-7)

**Day 5: Rules Data Model**
- [ ] Rule schema definition
- [ ] Rule storage (PropertiesService)
- [ ] CRUD operations for rules
- [ ] Default rule templates

**Day 6: Rules Evaluation**
- [ ] `evaluateRule()`
- [ ] Condition matching logic
- [ ] `executeRule()`
- [ ] Scheduling system

**Day 7: Rules Testing**
- [ ] Unit tests for rule engine
- [ ] Integration tests with detection
- [ ] Performance benchmarks

### Phase 3: Frontend UI (Days 8-11)

**Day 8: Dashboard View**
- [ ] `SmartArchiveView.jsx`
- [ ] `ArchiveCandidatesTable.jsx`
- [ ] `ArchiveStats.jsx`
- [ ] `useArchiveCandidates` hook

**Day 9: Rule Builder**
- [ ] `RuleBuilder.jsx`
- [ ] `ConditionBuilder.jsx`
- [ ] `ActionSelector.jsx`
- [ ] `ScheduleConfig.jsx`

**Day 10: Archive History**
- [ ] `ArchiveHistoryTimeline.jsx`
- [ ] `RestoreDialog.jsx`
- [ ] `useArchiveHistory` hook
- [ ] Search and filter functionality

**Day 11: Notifications & Safety UI**
- [ ] Pre-archive notification component
- [ ] `SafetyFlagsDisplay.jsx`
- [ ] `ConfidenceIndicator.jsx`
- [ ] Dry-run mode UI

### Phase 4: Integration & Polish (Days 12-14)

**Day 12: Smart Scan Integration**
- [ ] Add archive category to Smart Scan
- [ ] Navigation integration
- [ ] ROT score integration

**Day 13: Daily Impact Tracker Integration**
- [ ] Track archive operations
- [ ] Archive XP and achievements
- [ ] Archive stats in dashboard

**Day 14: Testing & Documentation**
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] User guide documentation
- [ ] **Deploy**: v1.8.0

---

## 12. Future Enhancements

### Phase 2: Machine Learning
- [ ] Learn from user archive decisions
- [ ] Personalized confidence scoring
- [ ] Optimal inactivity threshold per user
- [ ] Project completion pattern recognition

### Phase 3: Advanced Features
- [ ] Multi-tier archiving (Archive → Deep Archive → Delete)
- [ ] Export to external storage (S3, Google Cloud Storage)
- [ ] Team-level archive policies
- [ ] Archive analytics and reports
- [ ] Predicted disk space freed over time

### Phase 4: Enterprise Features
- [ ] Admin console for organization-wide policies
- [ ] Compliance reporting (SOX, GDPR)
- [ ] Legal hold integration
- [ ] Shared Drive archiving
- [ ] Department-level quotas and policies

---

## 13. Risks & Mitigation

### Risk 1: Accidental Data Loss
**Issue**: User archives important files by mistake
**Mitigation**:
- Multi-layer safety checks
- 7-day notification before auto-archive
- One-click restore functionality
- Complete audit log
- Shortcuts left in original location (optional)

### Risk 2: Detection Inaccuracy
**Issue**: Low confidence in project completion detection
**Mitigation**:
- Conservative confidence thresholds (80%+ only)
- User confirmation required for <90% confidence
- Learning from user corrections
- Dry-run mode mandatory for new rules

### Risk 3: Drive API Quota
**Issue**: Large-scale archiving hits API limits
**Mitigation**:
- Batch operations with exponential backoff
- Async queue for archive operations
- Rate limiting (max 50 archives per run)
- Scheduled execution during off-peak hours

### Risk 4: Performance with Large Drives
**Issue**: Scanning 10,000+ folders too slow
**Mitigation**:
- Incremental scanning (cache previous results)
- Background processing
- User can limit scan scope
- Pagination in UI

---

## 14. Metrics for Success

**After 30 days of release:**

**Adoption Metrics**:
- 40%+ of users enable at least 1 archive rule
- 60%+ of users review archive suggestions
- 20%+ of suggested archives accepted by users

**Impact Metrics**:
- Average 2-5 GB storage saved per user
- Average 20-50 folders archived per user
- 95%+ of auto-archives NOT restored (correct decisions)

**Safety Metrics**:
- 0 reports of important files accidentally archived
- <5% restore rate within 24 hours (indicates confidence)
- 0 Drive API quota violations

**Engagement Metrics**:
- 30%+ users return to archive dashboard monthly
- Average 3 active rules per user
- 70%+ satisfaction score (NPS)

---

**Total Estimated Effort**: 10-14 days
**Priority**: High (High-impact automation)
**Complexity**: High (ML, safety, automation)
**Value**: Very High (transforms tedious task into automated intelligence)

---

## 15. GitHub Issue

Create as **Issue #15: Smart Auto-Archive**

**Labels**: `enhancement`, `automation`, `high-priority`
**Milestone**: Sprint 4 or 5 (after core features)
**Dependencies**:
- Soft: #11 (ROT Analysis - for confidence boosting)
- Soft: #13 (Daily Impact Tracker - for archive XP)
- Optional: #14 (RemNotifLib - for notifications)

---

**Next Steps**:
1. Review feature plan
2. Create GitHub issue
3. Add to sprint roadmap (recommend Sprint 4 or standalone sprint)
4. Begin implementation when ready