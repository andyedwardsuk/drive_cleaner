# Changelog

All notable changes to the Drive Cleaner project will be documented in this file.

---

## [2.4.0] - 2026-09-16
### Added
- **Scheduled Audit & Automation Triggers (`FEATURE_AUTOMATION_TRIGGERS`)**:
  - Google Apps Script time-driven project triggers via `ScriptApp`.
  - Silent background audit job (`runScheduledAudit`) computing storage metrics and tracking trends.
  - Weekly HTML cleanup digest email (`sendScheduledDigestEmail`) delivered to Gmail via `MailApp.sendEmail`.
  - Interactive automation dashboard at `/automation` with trigger status cards and frequency pickers.
  - Live HTML email digest preview modal with responsiveness and dark mode styling.
  - Storage Quota Guard alert trigger with customizable threshold slider (75% - 95%).
  - Immediate test actions: "Send Test Digest Email Now" and "Run Audit Now".

---

## [2.3.0] - 2026-09-16
### Added
- **Smart Auto-Archive Engine (`FEATURE_AUTO_ARCHIVE`)**:
  - Reversible file archival moving stale items into `_DriveCleaner_Archive/{YYYY}` folders in Google Drive.
  - Server-side `archiveFiles` and `unarchiveFiles` API preserving original parent folder mappings.
  - Dedicated `/auto-archive` view with multi-source candidate ingestion:
    - Kanban staged items.
    - Inactivity rules (> 365, > 730, > 1095 days).
    - ROT Analyzer "Stale" recommendations.
    - Persistent archive audit history with 1-click **Restore to Originals** button.
  - Floating undo countdown toast for instantaneous reverts.
  - Direct "Archive to Drive" button in the Kanban board's `Archive` column.

---

## [2.2.0] - 2026-09-16
### Added
- **Google Drive Labels & Kanban Board (`FEATURE_KANBAN_LABELS`)**:
  - Interactive drag-and-drop triage pipeline across 4 workflow stages: *Needs Review*, *Keep / Retain*, *Archive*, and *Pending Trash*.
  - Native HTML5 Drag-and-Drop API integration with custom hover drop target highlights.
  - 1-click directional card shift controls and dropdown column selectors.
  - Column actions: Downloadable CSV triage manifest export and batch "Trash All" action.
  - Direct integration with Smart Scan recommendations to import unorganized files.
  - 1-click deep file inspection trigger on every card.

---

## [2.1.0] - 2026-09-16
### Added
- **Universal File Preview & Deep Metadata Inspector (`FEATURE_FILE_PREVIEW`)**:
  - Live embedded preview container supporting Google Drive iframes (Docs, Sheets, Slides, PDFs), high-resolution image zoom viewer, and audio/video streaming.
  - Comprehensive metadata inspector showing exact bytes, parent folder hierarchy, relative timestamps, sharing badges, and Drive File ID with copy feedback.
  - Keyboard shortcut navigation (`Escape` to close, `ArrowLeft` / `ArrowRight` to paginate sequentially through table rows).
  - Globally mounted across all file tables via clickable row titles and table action menus.

---

## [2.0.0] - 2026-09-16
### Added
- **Settings & Custom Thresholds Hub (`FEATURE_SETTINGS`)**:
  - Unified configuration center across 5 comprehensive tabs:
    1. *Scanning & Automation*: Default corpora, auto-cache, batch query sizes.
    2. *Custom Thresholds*: Interactive sliders for Large Files (10 MB – 500 MB) and Old Files (30 – 1095 days).
    3. *Appearance & Theme*: Real-time live theme switching (Dark, Light, System) and table density modes.
    4. *Safe Trash & Safety Net*: Deletion safety confirmation rules and customizable undo window duration (5s – 30s).
    5. *Data, Backups & Privacy*: Complete JSON app data backup export and local cache reset.
  - Reactive threshold propagation dynamically driving `LargeFilesView.jsx`, `OldFilesView.jsx`, and `useFileActions.js`.

---

## [1.6.0] - 2024-11-20
### Added
- Daily Impact Tracker & Green Gamification system with streaks, achievements, and DHQ metric tracking.
