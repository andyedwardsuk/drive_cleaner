# Drive Cleaner - Product Roadmap

## Vision

Transform Drive Cleaner into a comprehensive Google Drive management and optimization tool that helps users reclaim storage space, organize their files, and maintain a clean, efficient Drive account.

## Mission

Empower users to:
- **Discover** what's using their storage space
- **Identify** files they no longer need (duplicates, old files, empty files, temporary files)
- **Organize** their Drive with powerful filtering and categorization
- **Reclaim** storage space with safe, efficient bulk operations
- **Maintain** a clean Drive account over time

## Core Value Propositions

### 1. Privacy-First Approach
- All processing happens within Google's infrastructure (Google Apps Script)
- No file content leaves Google's ecosystem
- Minimal data collection - only what's necessary for functionality
- User maintains full control over what is scanned and deleted

### 2. Comprehensive Analysis
- Deep scan of entire Drive or selected folders
- Visual storage analytics with folder size breakdown
- Pre-categorized files for easy decision making
- Duplicate detection across the entire Drive

### 3. Safe Bulk Operations
- Multi-select and mass deletion capabilities
- Move to trash (reversible) by default
- Confirmation dialogs for destructive operations
- Preview files before deletion

### 4. User-Friendly Interface
- Clean, modern UI built with React and ShadCN components
- Intuitive 3-step workflow: Scan → Review → Organize
- Visual storage breakdown and charts
- Responsive design for all devices

---

## Development Phases

### Phase 1: Enhanced Data Collection & Foundation
**Timeline:** 1-2 weeks
**Status:** Planned

#### Features
- Expand file metadata collection:
  - File size (bytes, KB, MB, GB)
  - Created and modified dates
  - Last viewed date
  - Owner information
  - Sharing status and permissions
  - File extension from title
  - Thumbnail links
  - Star status
  - Full path/breadcrumb

- Implement caching system:
  - Session caching for current scan data
  - Persistent storage for scan history
  - Scan metadata (date, file count, total size)

- Add progress indicators:
  - Real-time scan progress updates
  - Estimated time remaining
  - Files processed count
  - Current folder being scanned

#### Technical Requirements
- Update Drive API field requests
- Implement CacheService for session data
- Use PropertiesService for scan history
- Create progress callback system

#### Success Metrics
- Scan 1,000 files in < 30 seconds
- Cache hit rate > 80% on repeated scans
- User can see progress updates every 2 seconds

---

### Phase 2: Storage Analytics & Visualization
**Timeline:** 2-3 weeks
**Status:** Planned
**Dependencies:** Phase 1

#### Features
- **Storage Usage Dashboard:**
  - Overall Drive quota usage (used vs available)
  - Drive vs Gmail vs Photos breakdown
  - Visual pie/donut charts
  - Storage trends over time

- **Folder Size Analysis:**
  - Hierarchical tree map of folder sizes
  - Sunburst or treemap visualization
  - Click to drill down into subfolders
  - Breadcrumb navigation
  - Show largest folders at a glance

- **Storage Insights:**
  - Top 10 largest folders
  - File type distribution (images, videos, documents, etc.)
  - Storage used by file age
  - Storage used by sharing status

#### Technical Requirements
- Add charting library (Recharts or Chart.js)
- Create visualization components
- Implement recursive folder size calculation
- Backend function for storage quota retrieval

#### Success Metrics
- Dashboard loads in < 2 seconds
- Tree map handles 10,000+ folders smoothly
- Charts are interactive and responsive

---

### Phase 3: Advanced Filtering & Categorization
**Timeline:** 2-3 weeks
**Status:** Planned
**Dependencies:** Phase 1

#### Features
- **Pre-defined Category Views:**
  - Large Files (>100MB, >500MB, >1GB - configurable thresholds)
  - Old Files (>1 year, >2 years, >5 years - configurable)
  - Recently Modified (last 7/30/90 days)
  - Images (all image MIME types)
  - Videos (all video MIME types)
  - Documents (Google Docs, Word, PDF, etc.)
  - Spreadsheets (Google Sheets, Excel, etc.)
  - Presentations (Google Slides, PowerPoint, etc.)
  - Archives (ZIP, RAR, TAR, etc.)
  - Audio files
  - Shared Files (with me, by me, public)
  - Starred Files
  - Hidden Files (names starting with .)

- **Advanced Filter Panel:**
  - Multi-select filters
  - Filter by owner (dropdown of unique owners)
  - Filter by date range (created, modified, last viewed)
  - Filter by size range (min/max sliders)
  - Filter by sharing status
  - Filter by file extension
  - Combine multiple filters (AND logic)

- **Smart Search:**
  - Real-time search across file names
  - Search by file content (using Drive API search)
  - Save custom filter combinations
  - Quick filter presets

#### Technical Requirements
- Create category classification logic
- Build collapsible filter sidebar
- Implement filter state management
- Add saved filter persistence

#### Success Metrics
- Categorize 10,000 files in < 5 seconds
- Filter updates in < 300ms
- Support 10+ simultaneous filters

---

### Phase 4: Duplicate File Detection
**Timeline:** 3-4 weeks
**Status:** Planned
**Dependencies:** Phase 1

#### Features
- **Multiple Detection Methods:**
  - By exact file name
  - By file name + size
  - By MD5 checksum (most accurate)
  - By content similarity (advanced)

- **Duplicate Management UI:**
  - Group duplicate sets together
  - Show file details side-by-side
  - Display thumbnails for visual comparison
  - Highlight newest/oldest/largest versions
  - Show file locations (which folders)
  - Bulk select within each duplicate group

- **Smart Recommendations:**
  - Keep newest version (default)
  - Keep largest version
  - Keep version in specific folder
  - Keep manually selected
  - Custom selection criteria

- **Duplicate Statistics:**
  - Total duplicates found
  - Storage space wasted
  - Potential space savings
  - Duplicate groups count

#### Technical Requirements
- MD5 checksum extraction from Drive API
- Duplicate grouping algorithm
- Side-by-side comparison component
- Smart suggestion engine

#### Success Metrics
- Detect duplicates in 10,000 files in < 10 seconds
- Accurately identify duplicates (>99% precision)
- Show potential space savings
- Group duplicates by file name and checksum

---

### Phase 5: File Preview & Details
**Timeline:** 2 weeks
**Status:** Planned
**Dependencies:** Phase 1

#### Features
- **Preview Modal:**
  - Image preview with zoom and pan
  - PDF preview (Google Drive viewer embed)
  - Google Docs/Sheets/Slides preview
  - Video player with controls
  - Audio player
  - Text file preview (< 1MB)
  - Preview not available message for other types

- **Detailed File Information Panel:**
  - Full metadata display
  - File size (bytes and human-readable)
  - Created, modified, last viewed dates
  - Owner information
  - Sharing status and permissions list
  - Full file path/breadcrumb
  - File type and MIME type
  - Star status
  - Version history (if available)
  - Activity log (recent actions)

- **Quick Actions:**
  - Open in Google Drive (new tab)
  - Download to local machine
  - Copy file ID to clipboard
  - Copy file path to clipboard
  - Star/Unstar toggle
  - Share (open sharing dialog)
  - Move (Phase 6)
  - Delete (Phase 6)

#### Technical Requirements
- Create modal component with tabs
- Add zoom/pan library (react-zoom-pan-pinch)
- Implement PDF viewer
- Create iframe embedding for Google file types
- Backend function for detailed file metadata

#### Success Metrics
- Preview opens in < 1 second
- Images load progressively
- Smooth zoom and pan experience
- All file types have appropriate preview or message

---

### Phase 6: Bulk Operations & File Management
**Timeline:** 3-4 weeks
**Status:** Planned
**Dependencies:** Phase 3, Phase 4, Phase 5

#### Features
- **Multi-Selection System:**
  - Checkbox selection (individual files)
  - Select all on current page
  - Select all in current category
  - Select all filtered results
  - Select all duplicates in a group
  - Selection count indicator
  - Clear selection button

- **Bulk Actions:**
  - Bulk Delete (move to trash)
  - Bulk Permanent Delete (warning required)
  - Bulk Move to Folder
  - Bulk Star/Unstar
  - Bulk Share Settings
  - Export selection to CSV/JSON

- **Delete Safety Features:**
  - Move to trash by default (reversible)
  - Permanent delete requires explicit confirmation
  - Warning for large files (>1GB)
  - Warning for shared files
  - Warning for starred files
  - Show storage space to be freed
  - Preview selected files before deletion
  - Require confirmation for >10 files
  - Progress indicator during deletion
  - Success/failure report

- **Undo Functionality:**
  - Toast notification with undo button
  - 10-second undo window
  - Restore from trash via Drive API

- **Bulk Operation Progress:**
  - Progress bar with percentage
  - Files processed / Total files
  - Estimated time remaining
  - Cancel operation button
  - Summary report (success/failures)

#### Technical Requirements
- Selection state management (Set data structure)
- Bulk action confirmation modals
- Backend bulk operation functions with batching
- Error handling for partial failures
- Undo mechanism with timeout
- Progress tracking system

#### OAuth Changes
- **CRITICAL:** Replace read-only scope
- Add `https://www.googleapis.com/auth/drive` (full Drive access)
- User must re-authorize
- Clear communication about why broader permissions needed

#### Success Metrics
- Select 1,000 files without performance impact
- Delete 100 files in < 10 seconds
- Batch operations in groups of 50 (API rate limits)
- Undo successful within 10-second window
- Error rate < 1% for bulk operations

---

### Phase 7: Empty & Temporary File Detection
**Timeline:** 1-2 weeks
**Status:** Planned
**Dependencies:** Phase 1, Phase 3

#### Features
- **Empty File Detection:**
  - Files with 0 bytes
  - Empty folders (no children)
  - Nearly empty files (< 1KB)
  - Empty Google Docs (0 characters)

- **Temporary File Detection Patterns:**
  - `.tmp` and `.temp` extensions
  - `~$` prefix (Office temp files)
  - `.cache` files and folders
  - `Thumbs.db` (Windows thumbnails)
  - `.DS_Store` (macOS metadata)
  - `.bak` and `.backup` extensions
  - Files ending with `~` (backup suffix)
  - Browser download temporary files
  - Auto-save files

- **Cleanup Wizard:**
  - Automatic categorization
  - Safety suggestions (what's safe to delete)
  - Preview before cleanup
  - One-click cleanup per category
  - Scheduled cleanup reminders (optional)

- **Statistics:**
  - Count of empty files/folders
  - Count of temporary files
  - Total storage wasted
  - Potential space savings

#### Technical Requirements
- Pattern matching functions
- Empty folder detection algorithm
- Safe deletion suggestion logic
- Cleanup wizard UI component

#### Success Metrics
- Accurately detect empty files (100% precision)
- Identify common temp file patterns
- Show potential space savings
- Zero false positives on important files

---

### Phase 8: Performance Optimization & Scalability
**Timeline:** 3-4 weeks
**Status:** Planned
**Dependencies:** All previous phases

#### Features
- **Incremental Scanning:**
  - Scan only changed files since last scan
  - Use Drive Changes API
  - Store last change token
  - Background sync at regular intervals

- **Optimized Large Dataset Handling:**
  - Virtual scrolling for tables (millions of rows)
  - Lazy loading of file metadata
  - Pagination at API level
  - IndexedDB for client-side caching
  - Progressive loading strategy

- **Rate Limit Management:**
  - Exponential backoff on API errors
  - Request batching (up to 100 per batch)
  - Queue management system
  - User-visible rate limit warnings
  - Pause/resume scan functionality

- **Background Processing:**
  - Time-based triggers for automated scans
  - Weekly storage reports via email
  - Async processing of large operations
  - Notification system for completed tasks

- **Performance Monitoring:**
  - Scan performance metrics
  - API usage tracking
  - Error rate monitoring
  - User experience metrics (load times)

#### Technical Requirements
- Virtual scrolling library (@tanstack/react-virtual)
- Drive Changes API integration
- Rate limiter with exponential backoff
- Time-based trigger creation
- Client-side caching strategy (IndexedDB)

#### Success Metrics
- Handle millions of files without slowdown
- Scan 1,000 files in < 30 seconds
- Table renders 10,000 rows in < 2 seconds
- API rate limit errors < 0.1%
- Incremental sync 10x faster than full scan

---

## Post-MVP Features (Future Phases)

### Phase 9: Advanced Analytics
- Storage trends over time (historical data)
- File activity heatmaps
- Folder growth analysis
- Unused file detection (not opened in X months)
- Storage forecasting (when will you run out)

### Phase 10: Automation & Rules
- Automated cleanup rules
- Scheduled scans and reports
- Smart folders (auto-categorization)
- File organization suggestions
- Auto-archive old files

### Phase 11: Collaboration Features
- Share cleanup reports with team
- Collaborative folder management
- Shared Drive optimization
- Team storage analytics
- Permission auditing

### Phase 12: Integration & Export
- Export to other cloud storage
- Integration with backup services
- Zapier/Make.com integration
- API for third-party tools
- Bulk operations via API

---

## Technical Architecture

### Frontend Stack
- **Framework:** React 18.3.1
- **UI Library:** ShadCN UI + Tailwind CSS
- **Charts:** Recharts or Chart.js
- **State Management:** Zustand (global) + React Query (server state)
- **Table:** TanStack Table with virtual scrolling
- **Build Tool:** Vite
- **Deployment:** Google Apps Script (single HTML file)

### Backend Stack
- **Runtime:** Google Apps Script (V8)
- **API:** Google Drive API v2
- **Caching:** CacheService (6 hour limit)
- **Storage:** PropertiesService (persistent user data)
- **OAuth:** Google OAuth 2.0

### Data Flow
1. User authenticates with Google OAuth
2. React app runs in browser (served by Google Apps Script)
3. User selects folder via Drive Picker
4. React calls backend via `google.script.run`
5. Backend scans Drive using Drive API
6. Results cached in CacheService
7. Data returned to React for display
8. User performs actions (filter, preview, delete)
9. React calls backend for write operations
10. Backend updates Drive via Drive API

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Initial scan (1,000 files) | < 30 seconds | TBD |
| Table render (10,000 rows) | < 2 seconds | TBD |
| Search/filter update | < 300ms | < 500ms |
| Duplicate detection (10,000 files) | < 5 seconds | TBD |
| Bulk delete (100 files) | < 10 seconds | TBD |
| Storage dashboard load | < 2 seconds | TBD |

---

## OAuth Scopes Required

### Current Scopes (Read-Only)
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/drive.metadata.readonly`

### Future Scopes (Write Operations - Phase 6+)
- `https://www.googleapis.com/auth/drive` (full Drive access)
- `https://www.googleapis.com/auth/script.scriptapp` (for scheduled triggers)

### Rationale
- Read-only scopes for Phases 1-5 (no risk)
- Write scope only when bulk delete is ready
- Clear user communication about why broader permissions needed
- Option to use "view mode" with read-only permissions

---

## User Experience Goals

### 3-Step Workflow
1. **SCAN:** Select folder or full Drive → Start scan → See progress
2. **REVIEW:** View storage breakdown → Explore categories → Filter and search
3. **ORGANIZE:** Preview files → Select unwanted items → Bulk delete → Reclaim space

### Design Principles
- **Clarity:** Users should always know where they are and what they're doing
- **Safety:** Destructive actions require confirmation and are reversible
- **Speed:** Common tasks should be fast and efficient
- **Trust:** Transparent about data access and operations
- **Control:** Users decide what to scan and what to delete

### Key User Journeys

#### Journey 1: Find and Remove Duplicates
1. User opens Drive Cleaner
2. Clicks "Browse" and selects a folder
3. Scan completes → Storage dashboard shown
4. Clicks "Duplicates" category
5. Sees grouped duplicate files
6. Reviews side-by-side comparison
7. Selects "Keep Newest" suggestion
8. Confirms deletion
9. Sees "X MB freed" success message

#### Journey 2: Free Up Storage Quickly
1. User opens Drive Cleaner
2. Sees storage usage at 98% full
3. Clicks "Quick Cleanup" wizard
4. Wizard suggests: 100 old files (>2 years), 50 temp files, 20 empty folders
5. Reviews suggestions in preview
6. Clicks "Clean Up All"
7. Confirms deletion
8. Sees "2.3 GB freed" success message

#### Journey 3: Organize Large Files
1. User opens Drive Cleaner
2. Scans full Drive
3. Clicks "Large Files" category
4. Sets filter: >500MB
5. Sorts by size descending
6. Previews large video files
7. Selects unnecessary videos
8. Moves to archive folder (or deletes)
9. Sees updated storage usage

---

## Success Metrics (Product)

### User Engagement
- Weekly active users
- Average session duration
- Scans per user per month
- Return rate (users coming back)

### Value Delivered
- Average storage space reclaimed per user
- Files deleted per user
- Duplicates found per scan
- Time saved vs manual cleanup

### User Satisfaction
- Net Promoter Score (NPS)
- User reviews and ratings
- Feature usage rates
- Support ticket volume

---

## Risks & Mitigation

### Risk 1: API Rate Limits
- **Impact:** Slow scans, failed operations
- **Mitigation:** Request batching, exponential backoff, queue management, user warnings

### Risk 2: Large Dataset Performance
- **Impact:** Slow UI, browser crashes
- **Mitigation:** Virtual scrolling, pagination, lazy loading, progressive enhancement

### Risk 3: Accidental Data Loss
- **Impact:** Users delete important files
- **Mitigation:** Move to trash by default, confirmation dialogs, preview before delete, undo functionality

### Risk 4: User Privacy Concerns
- **Impact:** Users don't trust the app with Drive access
- **Mitigation:** Privacy-first messaging, transparent data handling, read-only mode, security audits

### Risk 5: OAuth Scope Rejection
- **Impact:** Users decline broader permissions
- **Mitigation:** Clear explanation of why needed, read-only mode option, progressive permission requests

---

## Competitive Advantages

1. **Privacy-First:** All processing within Google's infrastructure (no external servers)
2. **No Installation:** Pure web app (no downloads, no installations)
3. **Free Tier:** Core features available for free
4. **Fast & Responsive:** Modern React UI with optimized performance
5. **Safe by Default:** Move to trash, confirmation dialogs, undo functionality
6. **Comprehensive:** All features in one tool (duplicates, old files, temp files, etc.)

---

## Monetization Strategy (Future)

### Freemium Model
- **Free Tier:**
  - Scan up to 10,000 files
  - Basic duplicate detection
  - Manual cleanup only
  - 5 scans per month

- **Pro Tier ($4-5/month):**
  - Unlimited scans
  - Advanced duplicate detection (content similarity)
  - Automated cleanup rules
  - Scheduled scans and reports
  - Priority support
  - No ads

### Enterprise Tier (Future)
- Team analytics
- Shared Drive optimization
- Admin controls
- API access
- Custom integrations

---

## Release Strategy

### Alpha Release (Phases 1-2)
- Limited user testing
- Core scanning and analytics
- Feedback collection
- Bug fixing

### Beta Release (Phases 3-4)
- Public beta program
- Filtering and duplicate detection
- Marketing soft launch
- Iterate based on feedback

### V1.0 Release (Phases 5-6)
- Full feature set
- Preview and bulk operations
- Public launch
- Press and marketing campaign

### V1.5+ (Phases 7-8)
- Continuous improvement
- Performance optimization
- Additional features
- User-requested enhancements

---

## Success Criteria

### Phase 1 Success
- [ ] Scan 1,000 files in < 30 seconds
- [ ] Display 10+ metadata fields per file
- [ ] Cache working effectively
- [ ] Progress indicators functional

### Phase 2 Success
- [ ] Storage dashboard loads in < 2 seconds
- [ ] Charts are interactive and responsive
- [ ] Folder size tree accurate
- [ ] Users can drill down into folders

### Phase 3 Success
- [ ] 10+ category views available
- [ ] Advanced filters working
- [ ] Filter updates in < 300ms
- [ ] Saved filters persisting

### Phase 4 Success
- [ ] Detect duplicates with >99% accuracy
- [ ] Show potential space savings
- [ ] Smart recommendations working
- [ ] Duplicate groups UI intuitive

### Phase 5 Success
- [ ] Preview modal opens in < 1 second
- [ ] All file types handled
- [ ] Zoom/pan smooth
- [ ] Metadata display complete

### Phase 6 Success
- [ ] Bulk delete 100 files in < 10 seconds
- [ ] Undo functionality working
- [ ] Zero data loss incidents
- [ ] User authorization flow smooth

### Phase 7 Success
- [ ] Accurately detect empty files
- [ ] Temp file patterns comprehensive
- [ ] Zero false positives
- [ ] Cleanup wizard intuitive

### Phase 8 Success
- [ ] Handle millions of files
- [ ] Incremental sync working
- [ ] Rate limit errors < 0.1%
- [ ] Performance targets met

---

## Conclusion

This roadmap outlines a comprehensive vision for Drive Cleaner, transforming it from a basic file lister into a powerful Drive management and optimization tool. Each phase builds upon the previous, with clear goals, metrics, and success criteria.

The phased approach allows for:
- **Iterative Development:** Ship value early and often
- **User Feedback:** Incorporate feedback between phases
- **Risk Mitigation:** Validate assumptions before heavy investment
- **Flexibility:** Adjust priorities based on user needs

By following this roadmap, Drive Cleaner will become an essential tool for anyone looking to manage and optimize their Google Drive storage.

---

**Last Updated:** November 2025
**Status:** Planning
**Next Milestone:** Phase 1 Implementation
