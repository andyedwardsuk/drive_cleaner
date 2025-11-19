# RemNotifLib - Reminder & Notification Library Specification

**Library Name**: RemNotifLib (Reminder & Notification Library)
**Purpose**: Centralized management of reminders, notifications, triggers, and email delivery
**Type**: Google Apps Script Library
**Status**: 📋 Planning
**Dependencies**: GmailApp (for emails), PropertiesService (for triggers), LoggerLib (optional)

---

## 1. Overview

**RemNotifLib** provides a unified API for managing all types of notifications and reminders in Google Apps Script projects:

- **Browser Notifications** (via client-side integration)
- **Email Notifications** (via GmailApp)
- **Time-based Triggers** (daily/weekly reminders)
- **Event-based Notifications** (achievement unlocks, streak risks)
- **Template Management** (email templates, notification text)

**Key Features**:
- ✅ Trigger creation and management (time-driven, installable)
- ✅ Email composition from templates with variable substitution
- ✅ Notification scheduling and batching
- ✅ User preference management (opt-in/opt-out)
- ✅ Delivery status tracking
- ✅ Rate limiting and throttling

---

## 2. Core API

### A. Trigger Management

```javascript
/**
 * Create a daily reminder trigger
 * @param {string} functionName - Function to execute
 * @param {number} hour - Hour (0-23) to trigger
 * @param {Object} options - Additional options
 * @returns {string} Trigger ID
 */
RemNotifLib.createDailyTrigger(functionName, hour, options = {});

/**
 * Example Usage:
 */
const triggerId = RemNotifLib.createDailyTrigger('sendStreakReminder', 21, {
  timezone: 'America/New_York',
  tag: 'streak-reminder'
});

/**
 * Remove a trigger by ID
 */
RemNotifLib.removeTrigger(triggerId);

/**
 * List all active triggers
 * @returns {Array<Object>} Trigger metadata
 */
RemNotifLib.listTriggers();

/**
 * Update trigger schedule
 */
RemNotifLib.updateTrigger(triggerId, { hour: 20 });
```

### B. Email Notifications

```javascript
/**
 * Send email from template
 * @param {string} recipient - Email address
 * @param {string} templateName - Template key
 * @param {Object} variables - Template variables
 * @param {Object} options - Email options
 */
RemNotifLib.sendEmail(recipient, templateName, variables, options = {});

/**
 * Example Usage:
 */
RemNotifLib.sendEmail(
  'user@example.com',
  'weekly-summary',
  {
    filesDeleted: 234,
    storageGb: 2.3,
    co2Kg: 0.115,
    rotScoreChange: -4,
    streak: 7
  },
  {
    bcc: 'analytics@example.com',
    replyTo: 'noreply@example.com'
  }
);

/**
 * Register email template
 */
RemNotifLib.registerTemplate('weekly-summary', {
  subject: 'Your Weekly Impact Summary - You deleted {{filesDeleted}} files! 🎉',
  body: `
    Hi there,

    Here's your Drive Cleaner impact for the week:

    📉 Files Deleted: {{filesDeleted}}
    💾 Storage Saved: {{storageGb}} GB
    🌍 CO2 Reduced: {{co2Kg}} kg

    📊 ROT Score: {{rotScoreChange}} points
    🔥 Current Streak: {{streak}} days

    Keep up the great work!

    [View Full Dashboard]({{dashboardUrl}})
  `,
  htmlBody: `
    <html>
      <!-- HTML template with styling -->
    </html>
  `
});

/**
 * Batch send emails (with rate limiting)
 */
RemNotifLib.batchSendEmails(recipients, templateName, variablesArray);
```

### C. Notification Preferences

```javascript
/**
 * Set user notification preferences
 * @param {string} userId - User identifier
 * @param {Object} prefs - Preference object
 */
RemNotifLib.setPreferences(userId, prefs);

/**
 * Example Usage:
 */
RemNotifLib.setPreferences('user@example.com', {
  email_enabled: true,
  streak_reminder: true,
  weekly_summary: true,
  achievement_unlocks: false,
  reminder_time: '21:00',
  timezone: 'America/New_York'
});

/**
 * Get user preferences
 */
const prefs = RemNotifLib.getPreferences(userId);

/**
 * Check if user has opted in to notification type
 */
const canSend = RemNotifLib.canSendNotification(userId, 'streak_reminder');
```

### D. Notification Scheduling

```javascript
/**
 * Schedule notification for future delivery
 * @param {string} userId - User identifier
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
 * @param {Date} sendAt - When to send
 */
RemNotifLib.scheduleNotification(userId, type, data, sendAt);

/**
 * Example Usage:
 */
const tomorrow9pm = new Date();
tomorrow9pm.setDate(tomorrow9pm.getDate() + 1);
tomorrow9pm.setHours(21, 0, 0, 0);

RemNotifLib.scheduleNotification(
  'user@example.com',
  'streak_reminder',
  { streak: 7 },
  tomorrow9pm
);

/**
 * Cancel scheduled notification
 */
RemNotifLib.cancelScheduledNotification(notificationId);

/**
 * Get all scheduled notifications for user
 */
const scheduled = RemNotifLib.getScheduledNotifications(userId);
```

### E. Delivery Tracking

```javascript
/**
 * Log notification delivery
 */
RemNotifLib.logDelivery(userId, type, status, metadata);

/**
 * Get delivery history
 */
const history = RemNotifLib.getDeliveryHistory(userId, {
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
  type: 'streak_reminder'
});

/**
 * Get delivery stats
 */
const stats = RemNotifLib.getDeliveryStats({
  period: 'week',
  type: 'all'
});
// Returns: { sent: 234, delivered: 230, failed: 4, opened: 120 }
```

---

## 3. Template System

### Template Variable Syntax

```javascript
// Simple variable substitution
"Hello {{userName}}!"

// Conditional blocks
"{{#if streak > 7}}You're on fire!{{/if}}"

// Loops
"{{#each achievements}}
  - {{this.name}}: {{this.description}}
{{/each}}"

// Formatting helpers
"{{formatNumber filesDeleted}} files"
"{{formatDate lastScan 'MMMM d, yyyy'}}"
```

### Built-in Templates

```javascript
RemNotifLib.TEMPLATES = {
  'streak-reminder': {
    subject: 'Keep your {{streak}}-day streak alive! 🔥',
    body: '...'
  },
  'achievement-unlock': {
    subject: 'Achievement Unlocked: {{achievementName}} {{icon}}',
    body: '...'
  },
  'weekly-summary': {
    subject: 'Your Weekly Impact Summary',
    body: '...'
  },
  'streak-risk': {
    subject: "Don't lose your {{streak}}-day streak! 🔥",
    body: '...'
  },
  'monthly-leaderboard': {
    subject: '👑 OCT King Rankings - {{month}} {{year}}',
    body: '...'
  }
};
```

---

## 4. Storage Schema

### PropertiesService

```javascript
// Script Properties
{
  'RemNotifLib_Templates': JSON.stringify(templates),
  'RemNotifLib_Config': JSON.stringify({
    rate_limit_per_day: 100,
    batch_size: 50,
    default_timezone: 'UTC'
  })
}

// User Properties (per user)
{
  'RemNotifLib_Prefs_user@example.com': JSON.stringify({
    email_enabled: true,
    streak_reminder: true,
    reminder_time: '21:00',
    timezone: 'America/New_York'
  }),
  'RemNotifLib_DeliveryLog_user@example.com': JSON.stringify([
    { type: 'streak_reminder', sentAt: '2024-11-18T21:00:00Z', status: 'sent' }
  ])
}
```

### Spreadsheet (Optional - for analytics)

**Sheet: Delivery Log**
| Timestamp | User ID | Type | Status | Metadata |
|-----------|---------|------|--------|----------|
| 2024-11-18 21:00 | user@example.com | streak_reminder | sent | {...} |

---

## 5. Integration with Drive Cleaner

### Setup

```javascript
// In appsscript.json, add library
{
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "RemNotifLib",
        "version": "1",
        "libraryId": "1abc...xyz",
        "developmentMode": true
      }
    ]
  }
}
```

### Usage in Daily Impact Tracker

**Send streak reminder:**
```javascript
// In app/server/tracking/trackingEngine.js
function sendStreakReminder() {
  const prefs = RemNotifLib.getPreferences(Session.getActiveUser().getEmail());

  if (prefs.streak_reminder && !todayActivityRecorded()) {
    const streak = getCurrentStreak();

    RemNotifLib.sendEmail(
      Session.getActiveUser().getEmail(),
      'streak-reminder',
      { streak: streak },
      { replyTo: 'noreply@drivecleaner.com' }
    );
  }
}
```

**Weekly summary trigger:**
```javascript
// Create trigger on first run
function setupWeeklyReminder() {
  RemNotifLib.createWeeklyTrigger('sendWeeklySummary', 1, 9, {
    // Monday at 9 AM
    timezone: 'America/New_York',
    tag: 'weekly-summary'
  });
}

function sendWeeklySummary() {
  const userId = Session.getActiveUser().getEmail();
  const weekData = getWeeklyData(userId);

  if (RemNotifLib.canSendNotification(userId, 'weekly_summary')) {
    RemNotifLib.sendEmail(userId, 'weekly-summary', weekData);
  }
}
```

**Achievement unlock notification:**
```javascript
// In achievementEngine.js
function checkAchievements(metrics) {
  const newUnlocks = [];

  ACHIEVEMENTS.forEach(achievement => {
    if (/* unlock condition */) {
      unlockAchievement(achievement.key);
      newUnlocks.push(achievement);

      // Send email notification
      if (RemNotifLib.canSendNotification(userId, 'achievement_unlocks')) {
        RemNotifLib.sendEmail(userId, 'achievement-unlock', {
          achievementName: achievement.name,
          icon: achievement.icon,
          description: achievement.description,
          xp: achievement.xp
        });
      }
    }
  });

  return newUnlocks;
}
```

---

## 6. Advanced Features

### A. Rate Limiting

```javascript
/**
 * Check if user has exceeded rate limit
 */
RemNotifLib.checkRateLimit(userId, notificationType);

/**
 * Example: Max 5 achievement emails per day
 */
const config = {
  'achievement_unlocks': {
    max_per_day: 5,
    max_per_week: 20
  },
  'streak_reminder': {
    max_per_day: 1
  }
};
```

### B. A/B Testing

```javascript
/**
 * Register A/B test variant
 */
RemNotifLib.registerVariant('weekly-summary', 'variant-b', {
  subject: 'Alternative subject line',
  body: '...'
});

/**
 * Send with A/B testing
 */
RemNotifLib.sendEmailWithTest(userId, 'weekly-summary', data, {
  testName: 'subject-test',
  variant: 'b',  // or 'a' for control
  trackClicks: true
});

/**
 * Get test results
 */
const results = RemNotifLib.getTestResults('subject-test');
// Returns: { variant_a: { sent: 50, opened: 20 }, variant_b: { sent: 50, opened: 28 } }
```

### C. Localization

```javascript
/**
 * Register localized templates
 */
RemNotifLib.registerTemplate('streak-reminder', {
  'en': {
    subject: 'Keep your {{streak}}-day streak alive!',
    body: '...'
  },
  'es': {
    subject: '¡Mantén tu racha de {{streak}} días!',
    body: '...'
  },
  'fr': {
    subject: 'Maintenez votre série de {{streak}} jours !',
    body: '...'
  }
});

/**
 * Send localized email
 */
RemNotifLib.sendEmail(userId, 'streak-reminder', data, {
  locale: getUserLocale(userId)  // 'en', 'es', 'fr'
});
```

---

## 7. Testing Strategy

### Unit Tests

```javascript
function testCreateDailyTrigger() {
  // Create trigger
  const triggerId = RemNotifLib.createDailyTrigger('testFunction', 21);

  // Verify trigger created
  const triggers = ScriptApp.getProjectTriggers();
  const found = triggers.some(t => t.getUniqueId() === triggerId);

  Logger.log(found ? 'PASS' : 'FAIL');

  // Cleanup
  RemNotifLib.removeTrigger(triggerId);
}

function testEmailTemplate() {
  RemNotifLib.registerTemplate('test-template', {
    subject: 'Hello {{name}}',
    body: 'You deleted {{count}} files'
  });

  const rendered = RemNotifLib.renderTemplate('test-template', {
    name: 'John',
    count: 42
  });

  Logger.log(rendered.subject === 'Hello John' ? 'PASS' : 'FAIL');
}

function testRateLimit() {
  const userId = 'test@example.com';

  // Send 5 emails (limit)
  for (let i = 0; i < 5; i++) {
    RemNotifLib.sendEmail(userId, 'test', {});
  }

  // 6th should be blocked
  const canSend = RemNotifLib.checkRateLimit(userId, 'test');
  Logger.log(canSend === false ? 'PASS' : 'FAIL');
}
```

---

## 8. Implementation Checklist

### Phase 1: Core (3-4 days)
- [ ] Create library project in Apps Script
- [ ] Implement trigger management (create, remove, list)
- [ ] Implement email sending (basic)
- [ ] Implement template system with variable substitution
- [ ] Implement preference management (PropertiesService)
- [ ] Write unit tests

### Phase 2: Advanced Features (2-3 days)
- [ ] Implement notification scheduling
- [ ] Implement delivery tracking
- [ ] Implement rate limiting
- [ ] Implement batch sending
- [ ] Add error handling and logging

### Phase 3: Integration (1-2 days)
- [ ] Publish library
- [ ] Integrate with Drive Cleaner
- [ ] Create email templates for all notification types
- [ ] Set up triggers for reminders
- [ ] Test end-to-end workflows

### Phase 4: Enhancements (Future)
- [ ] A/B testing framework
- [ ] Localization support
- [ ] Analytics dashboard
- [ ] SMS notifications (via Twilio)
- [ ] Slack/Discord webhooks

---

## 9. Benefits of RemNotifLib

**For Drive Cleaner:**
- ✅ Centralized notification logic (no duplication)
- ✅ Easy to add new notification types
- ✅ User preference management built-in
- ✅ Rate limiting prevents spam
- ✅ Template system for consistency

**Reusability:**
- ✅ Can be used across multiple projects
- ✅ Standardized API
- ✅ Shared maintenance and improvements
- ✅ Community contributions (if open-sourced)

**Scalability:**
- ✅ Batch processing for large user bases
- ✅ Delivery tracking for analytics
- ✅ A/B testing for optimization
- ✅ Multi-language support

---

## 10. Alternative: Extend Existing Library

**Option**: Extend **RegProjUsrLib** (Registration, Project, User Library) with notification features instead of creating a separate library.

**Pros:**
- Already manages user data
- One less library dependency
- Integrated user preferences

**Cons:**
- Increases library complexity
- Notification logic conceptually separate from user registration

**Recommendation**: Create separate **RemNotifLib** for cleaner separation of concerns.

---

**Next Steps:**
1. Create RemNotifLib Apps Script project
2. Implement core trigger and email functionality
3. Publish as library
4. Integrate with Daily Impact Tracker

**Estimated Effort**: 5-7 days
**Priority**: Medium (can use inline code for MVP, extract to library later)