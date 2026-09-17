# Changelog

All notable changes to the Drive Cleaner project will be documented in this file.

---

## [3.1.0] - 2026-09-17
### Added
- **Cloud Trash Lifecycle & Permanent Purge Governance Hub (`FEATURE_TRASH_GOVERNANCE`)**:
  - **Trapped Storage Quota Audit**: Quantifies storage trapped in Google Drive Trash consuming Google account quotas.
  - **Google Apps Script Backend Utility**: Implemented `TrashGovernanceManager` (`trashGovernanceManager.js`) auditing trashed files using Drive API v2 `Drive.Files.list({ q: "trashed = true" })` with fallback to `DriveApp.getTrashedFiles()`.
  - **30-Day Auto-Purge Countdown Tracker**: Categorizes trashed items by days remaining before Google's automatic permanent deletion:
    - Critical (`< 7 days` left)
    - Approaching (`7–14 days` left)
    - Midway (`15–21 days` left)
    - Fresh (`> 21 days` left / recently trashed)
  - **Accidental Deletion Recovery Engine**: Detects recent deletions of large or important documents and provides 1-click **Restore to Drive** (`Drive.Files.untrash`).
  - **Selective Permanent Purge**: Permanently and irreversibly removes individual or selected files from trash (`Drive.Files.remove`) without wiping the entire trash bin.
  - **Empty Entire Trash with Double-Confirmation Safeguards**: Implements strict data loss prevention requiring users to type `"PURGE"` before executing irreversible total trash purges (`Drive.Files.emptyTrash()`).
  - **Trash Manifest CSV Export**: Generates exportable CSV audit records of all trashed items, sizes, remaining days, and Drive links.
  - **Universal File Preview Integration**: Seamlessly inspects trashed files in universal preview modals before deciding to restore or purge.
  - **Theme & Control Alignment**: Grounded in obsidian midnight palette (`#070b14` / `#0b1329`) with unified `h-11` controls and WCAG AA contrast.

---

## [3.0.1] - 2026-09-17
### Changed
- **UI Color Scheme Overhaul & Accessibility Modernization**:
  - **Dark Mode Grounding**: Added `class="dark"` to root `<html>` tag and harmonized `:root` and `.dark` CSS tokens in `index.css` to eliminate stark white cards and glare boxes.
  - **Refined Color Palette**: Replaced oversaturated royal blue gradient with deep obsidian midnight canvas (`#070b14` → `#0b1329` → `#0e1b38`).
  - **Subtle Glassmorphism**: Swapped electric neon blue borders with delicate hairline slate borders (`rgba(148, 163, 184, 0.14)`) and dark glass surfaces (`rgba(15, 23, 42, 0.70)`).
  - **WCAG AA Compliance**: Upgraded sidebar section titles (`OVERVIEW`, `CLEANUP TOOLS`, etc.) from low-contrast `text-gray-500` to high-contrast `text-slate-400 font-semibold tracking-wider` (>5:1 ratio).
  - **Component Retheming**:
    - Overhauled `Hero.jsx`: Replaced neon gradients and oversized orbs with a sleek, modern dark glass card with high-contrast typography and subtle ambient accenting.
    - Updated `DashboardView.jsx`: Transformed the folder search form from a stark white box into an integrated dark glass card with slate inputs.
    - Updated `FolderSelector.jsx`: Converted Scan Target panels, tabs, and preset chips into cohesive dark slate controls.
    - Updated `FileTable.jsx`: Refined search inputs, table wrapper, and CSV/JSON export buttons.
- **Branding Removal**:
  - Removed outdated `"Made with Claude Code"` from navigation sidebar footer and About view credits.

---

## [3.0.0] - 2026-09-17
### Added
- **Incremental Sync & Drive Changes API Engine (`FEATURE_INCREMENTAL_SYNC`)**:
  - Sub-second incremental synchronization using Google Drive API v2 `Changes` resource (`largestChangeId`).
  - Google Apps Script server utility `SyncManager` (`syncManager.js`) querying deltas (`created`, `modified`, `deleted`) without full recursive tree scans.
  - Browser **IndexedDB engine** (`drive_cleaner_db`) managing 50,000+ cached file records without memory leaks or Google Apps Script 100KB `CacheService` quotas.
  - Live "Drive Changes Engine Status" banner reporting baseline change tokens, sync latency, and quota conservation telemetry.
  - 4 Real-time KPI Cards:
    - **Cached Files**: Real-time count of locally indexed files.
    - **Incremental Speed**: Sub-second execution (~180-350ms) vs 12-15s full re-scans.
    - **Total Sync Cycles**: Tracked delta cycles.
    - **Sync Architecture**: Zero-memory-leak engine rating.
  - **Quick Sync Now** action delivering instant incremental updates with toast summaries.
  - **Changes Stream & Deltas** tab auditing real-time file additions, edits, removals, and execution timings.
  - **Engine Diagnostics** tab providing IndexedDB schema transparency and Drive API quota savings calculations (>95% quota reduction).
  - Safe **Purge Local Cache** emergency reset with confirmation modal.
  - Universal File Preview modal integration across all cached files.

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
