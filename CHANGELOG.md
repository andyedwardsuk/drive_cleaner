# Changelog

All notable changes to the Drive Cleaner project will be documented in this file.

---

## [2.9.0] - 2026-09-17
### Added
- **Sharing Permissions, External Exposure & Security Audit Hub (`FEATURE_SECURITY_AUDIT`)**:
  - Quantified **Security Health Score (0–100)** evaluating exposure risks across public links, external domains, dormant shares, and sensitive documents.
  - Public Web Link scanner identifying unrestricted `anyoneWithLink` files indexable on the open web.
  - 1-click **"Revoke All Public Links"** bulk action instantly cutting open web access.
  - External domain exposure mapping clustering shares by organization domain (`@consulting-agency.com`, etc.) with domain-wide **"Revoke Domain"** capability.
  - Sensitive keyword detection flagging credentials, financial sheets, NDAs, and tax documents exposed to external parties.
  - Dormant access tracker highlighting collaborator permissions inactive for > 180 days.
  - Inline permission inspector with 1-click **Downgrade to Viewer** and **Remove Collaborator** controls.
  - Exportable Security Audit Manifest (`.csv`) with full permission records.
  - Universal File Preview modal integration across all security-flagged files.

---

## [2.8.0] - 2026-09-16
### Added
- **Google Photos & Media Optimization Center (`FEATURE_MEDIA_OPTIMIZER`)**:
  - Deep video duration, resolution, and bitrate storage consumer analysis:
    - Automatically categorizes video assets into `4K UHD`, `1440p QHD`, `1080p FHD`, `720p HD`, and `SD`.
    - Calculates linear bitrates (Mbps) and flags excessive intra-frame/video storage hogs (> 35 Mbps).
    - Formats duration (`MM:SS` / `HH:MM:SS`) and ranks video consumers by storage footprint.
  - Photo burst detection & near-duplicate image grouping:
    - Clusters rapid consecutive shots captured within seconds by the same camera/mobile device or matching sequential filename patterns.
    - Automatically designates and pins the **"Best Shot"** based on resolution, sharpness, and quality.
    - 1-click **"Select All Burst Tailings"** action to stage non-best duplicate shots for cleanup or archival.
  - Cloud space compression recommendations & projections:
    - Identifies heavy/uncompressed formats: RAW camera photos (`.CR2`, `.NEF`, `.ARW`, `.DNG`), heavy mobile HEIC/HEIF, uncompressed audio (`.WAV`, `.AIFF`, `.FLAC`), and ProRes/QuickTime videos.
    - Computes real-world projected compression space savings (~82% for RAW → WebP, ~85% for WAV → AAC, ~70% for ProRes → H.265/AV1).
    - Transformation guidance cards and before/after size comparisons.
  - Interactive media triage grid & dense table:
    - Responsive card grid with high-resolution visual previews, overlay badges (Resolution, Bitrate, Duration, Best Shot, Format tag).
    - Toggleable Dense Table view with structured columns for granular media audit.
    - Multi-select batch action toolbar with "Stage for Archive", "Move to Trash" (safe undo toast), and 1-click selection helpers.
    - Exportable Media Optimization Manifest (`.csv`) with full metadata and recommended formats.
    - Seamless 1-click integration with the universal `FilePreviewModal` for playable video/audio and high-res image zoom.

---

## [2.7.0] - 2026-09-16
### Added
- **Shared Drives (Team Drive) Hygiene Hub (`FEATURE_SHARED_DRIVES_HUB`)**:
  - Google Workspace Shared Drives discovery and hygiene governance dashboard.
  - Server-side `SharedDrivesManager` (`sharedDrivesManager.js`) auditing domain repositories, external exposure risks, and dormant drives.
  - Portfolio summary metrics: Total Shared Drives, Organization Storage Consumption, High Risk Drives, and Dormant Repositories (> 180 days inactive).
  - Search and filter pills (All Drives, High Risk, Dormant, Healthy).
  - Deep hygiene audit inspector with 0–100 Hygiene Health Score meter and action recommendation badges.
  - Dual risk tabs: **External Exposure Files** (public links and external collaborator shares) and **Stale Large Files** (> 50MB untouched > 180 days).
  - 1-click **Scope Scan Here** action targeting Smart Scan and cleanup tools directly to team drives.
  - Downloadable CSV audit manifest export.
  - Universal File Preview modal integration across all flagged items.

---

## [2.6.0] - 2026-09-16
### Added
- **Google Drive Labels & Taxonomy Hub (`FEATURE_DRIVE_LABELS`)**:
  - Full taxonomy tag management with pre-seeded standard labels (`Confidential`, `Finance`, `Legal`, `Project Alpha`, `Archive Candidate`, `Public`) and custom label creation modal.
  - Interactive file classification table with real-time multi-select bulk tagging ("Apply Label" dropdown menu).
  - Inline badge chips on file rows with 1-click removal button (`✕`).
  - Google Apps Script backend (`labelsManager.js`) persisting taxonomy registry and file label mappings in `UserProperties`.
  - Seamless Universal File Preview modal integration with live metadata and taxonomy badges.
  - Full local Vite dev simulation and live Apps Script bridge (`getDriveLabelsRegistry`, `applyDriveLabel`, `removeDriveLabel`, `saveCustomDriveLabel`).

---

## [2.5.0] - 2026-09-16
### Added
- **Smart Folder Reorganizer & Hierarchy Architect (`FEATURE_SMART_REORGANIZER`)**:
  - "Marie Kondo for Google Drive" — intelligent structure analyzer detecting root clutter, deep nesting, generic folder names, and duplicate concepts.
  - Structure Health Score gauge (0–100) and depth health metrics.
  - Interactive **Hierarchy Architect (Before vs After)** comparison tree visualizer.
  - **Smart File Clusters**: Auto-detection of natural file groupings based on client keywords, projects, file types, and date ranges.
  - Reversible bulk reorganization engine in Apps Script with 1-click **Revert Locations** restore point support.
  - Floating undo countdown toast.

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
