# Drive Cleaner - Sprint Roadmap

**Last Updated**: 2024-11-19
**Sprint Length**: 2 weeks (10 working days)
**Current Sprint**: Sprint 1 (Active)

---

## Completed Features ✅

### Sprint 0 (Completed: Nov 2024)
- ✅ **#1: Enhanced Metadata Collection** - Drive API v2 integration
- ✅ **#2: Smart Scan** - 5-category analysis engine with complete backend analyzers:
  - Large Files analyzer ✅
  - Old Files analyzer ✅
  - Duplicates detector ✅
  - Empty Items finder ✅
  - Temp Files identifier ✅
- ✅ **#3: Large Files View** - Storage space management UI with filtering and sorting
- ✅ **#7: Storage Analytics Dashboard** - Visual analytics with storage breakdown
- ✅ **OLD FILES VIEW** - Age-based filtering and cleanup interface (Nov 18-19)
- ✅ **EMPTY ITEMS VIEW** - Empty files and folders detection UI (Nov 18-19)
- ✅ **TEMP FILES VIEW** - Temporary file cleanup interface (Nov 18-19)
- ✅ **DUPLICATES VIEW** - Duplicate detection and management UI (Nov 18-19)

**Total Completed**: 8 major features (5 Smart Scan analyzers + 5 category views + Enhanced Metadata + Storage Analytics)
**Sprint 0 Velocity**: 8 features in 2 weeks (4 features/week average)
**Current Deployment**: v1.1.0 (https://script.google.com/macros/s/AKfycbxHYe9ekHig7cTIRKgFKUo603IepNGSXDAQISFTEaZlydIcTplaMc9K-A_OeKWqVz9K7Q/exec)

---

## Active Backlog (Prioritized)

### High Priority (Core Features)
| Issue | Feature | Effort | Dependencies |
|-------|---------|--------|--------------|
| #10 | Google Workspace Files View | 5-7 days | None |
| #11 | Data ROT Analysis & Hoarding Assessment | 10-14 days | None |
| #12 | Cloud Carbon Footprint & Green Gamification | 7-10 days | None |
| #13 | Daily Impact Tracker & Progress Dashboard | 7-10 days | #11, #12 (soft) |

### Medium Priority (Enhancement Features)
| Issue | Feature | Effort | Dependencies |
|-------|---------|--------|--------------|
| #4 | Kanban Labels View | 7-10 days | #9 (related) |
| #9 | Google Drive Labels Management | 10-15 days | None |
| #8 | UI/UX Polish Pass | Ongoing | None |

### Infrastructure (Optional/Future)
| Issue | Feature | Effort | Dependencies |
|-------|---------|--------|--------------|
| #14 | RemNotifLib - Notification Library | 5-7 days | None |

---

## Product Tiers

### Standard Edition (Current Focus)
All features implementable without AI/ML:
- Rule-based logic
- Drive API analysis
- Pattern matching
- User-defined rules

### AI Edition (Future/Premium)
Features requiring ML/AI services:
- #16 Smart Folder Reorganizer (ML clustering)
- Advanced project completion detection
- Content-based similarity
- Predictive organization

**Decision**: Focus on Standard Edition first (faster to market, no dependencies)

---

## Recommended Sprint Plan (Standard Edition)

### Sprint 1: Workspace Analysis & ROT Foundation
**Duration**: 2 weeks (10 days)
**Focus**: File type analysis and data quality scoring

#### Goals:
1. Complete Google Workspace Files View
2. Start Data ROT Analysis (backend foundation)

#### Tasks:

**Week 1: Google Workspace Files** (5 days)
- [ ] **Day 1-2**: Backend analyzer
  - Create `workspaceAnalyzer.js`
  - Implement type categorization (Docs, Sheets, Slides, Forms, etc.)
  - Unused files detection (6m, 1y, 2y thresholds)
  - Sharing analysis
- [ ] **Day 3-4**: Frontend view
  - Create `GoogleWorkspaceView.jsx`
  - Summary cards by type
  - Filters (type, age, owner, sharing)
  - Files table with sorting
- [ ] **Day 5**: Integration & testing
  - Add to Smart Scan categories (6th category)
  - Navigation routing
  - End-to-end testing
  - **Deploy**: v1.2.0

**Week 2: ROT Analysis Foundation** (5 days)
- [ ] **Day 6-7**: ROT scoring backend
  - Create `rotAnalyzer.js`
  - Implement ROT categorization logic
  - Clutter Index calculation
  - File age/access analysis
- [ ] **Day 8-9**: Hoarding Assessment backend
  - Digital Hoarding Questionnaire (DHQ) implementation
  - Hoarding score calculation
  - Grade assignment (Minimal → Severe)
- [ ] **Day 10**: Testing & documentation
  - Unit tests for ROT algorithms
  - Documentation of scoring formulas

**Sprint 1 Deliverables**:
- ✅ Google Workspace Files View (#10) - Complete
- 🔄 ROT Analysis Backend (#11) - 50% complete
- 📊 **Sprint Review**: Demo Workspace Files, review ROT algorithms

---

### Sprint 2: ROT Visualization & Carbon Footprint
**Duration**: 2 weeks (10 days)
**Focus**: Data quality visualization and environmental impact

#### Goals:
1. Complete Data ROT Analysis UI
2. Complete Carbon Footprint feature

#### Tasks:

**Week 1: ROT Analysis UI** (5 days)
- [ ] **Day 1-3**: Visual rot effects
  - Create `DataROTView.jsx`
  - Implement rot heatmap with CSS gradients
  - File age decay visualization (fresh → aging → stale → rotting → decayed)
  - Clutter Index dashboard
- [ ] **Day 4-5**: Hoarding Assessment UI
  - DHQ questionnaire component
  - Hoarding grade progress bar
  - Recommendations engine
  - Testing & polish
  - **Deploy**: v1.3.0

**Week 2: Carbon Footprint** (5 days)
- [ ] **Day 6-7**: Backend calculations
  - Create `carbonCalculator.js`
  - CO2 calculation: `Storage (GB) × 0.0001 kWh/GB/year × 0.5 kg CO2/kWh`
  - Real-world equivalents (driving miles, trees, burgers)
  - Workspace file size estimation integration
- [ ] **Day 8-9**: Frontend dashboard
  - Create `CarbonFootprintView.jsx`
  - Eco-Dashboard with current footprint
  - Historical trend chart
  - Green gamification badges
- [ ] **Day 10**: Integration & testing
  - Add to Smart Scan results
  - Navigation integration
  - **Deploy**: v1.4.0

**Sprint 2 Deliverables**:
- ✅ Data ROT Analysis (#11) - Complete
- ✅ Carbon Footprint (#12) - Complete
- 📊 **Sprint Review**: Demo ROT heatmap and carbon savings

---

### Sprint 3: Daily Impact Tracker (Core)
**Duration**: 2 weeks (10 days)
**Focus**: Progress tracking and gamification

#### Goals:
1. Complete Daily Impact Tracker MVP
2. Inline notifications (no RemNotifLib)

#### Tasks:

**Week 1: Core Tracking** (5 days)
- [ ] **Day 1**: Backend infrastructure
  - `storageHelpers.js` - localStorage CRUD
  - `carbonCalculator.js` - Reuse from Sprint 2
  - `workspaceSizeEstimator.js` - Estimation logic
- [ ] **Day 2**: Tracking engine
  - `trackingEngine.js` - Metrics capture
  - Track file deletion, addition, scan completion
  - Daily metrics schema
- [ ] **Day 3**: Gamification logic
  - `streakCalculator.js` - Streak calculations
  - `achievementEngine.js` - 20+ achievements
  - XP/Level system
  - `challengeGenerator.js` - Daily challenges
- [ ] **Day 4-5**: Testing
  - Unit tests for all tracking functions
  - Integration with file operations
  - Hook into Smart Scan

**Week 2: UI Components** (5 days)
- [ ] **Day 6**: Core cards
  - `DailyImpactCard.jsx` - Today's summary
  - `LifetimeImpactCard.jsx` - All-time stats
  - Chart components (LineChart, BarChart)
- [ ] **Day 7**: Progress visualizations
  - `ProgressChart.jsx` - 30-day trends
  - `ROTProgressChart.jsx` - ROT score timeline
  - `StreakCalendar.jsx` - Streak calendar
- [ ] **Day 8**: Gamification UI
  - `AchievementsGrid.jsx` - Achievement display
  - `DailyChallenges.jsx` - Challenge list
  - `LevelProgressBar.jsx` - XP/Level UI
  - `ProgressNudge.jsx` - Smart in-app nudges
- [ ] **Day 9**: Main view & integration
  - `DailyImpactView.jsx` - Compose all components
  - `OCTLeaderboard.jsx` - Mock leaderboard (localStorage)
  - Navigation routing
- [ ] **Day 10**: Polish & testing
  - Responsive design
  - Animations
  - End-to-end testing
  - **Deploy**: v1.5.0

**Sprint 3 Deliverables**:
- ✅ Daily Impact Tracker (#13) - MVP Complete
- 📊 **Sprint Review**: Demo streak system, achievements, OCT King leaderboard

---

### Sprint 4: Collaboration & Security (High Priority - NEW)
**Duration**: 2 weeks (10 days)
**Focus**: Sharing health, security audit, and storage optimization

#### Goals:
1. Complete Collaboration Health Dashboard
2. Complete External Sharing Audit
3. Complete Meet Recording Cleanup

#### Tasks:

**Week 1: Collaboration Health** (5 days)
- [ ] **Day 1-2**: Backend - Collaboration analyzers
  - Create `collaborationAnalyzer.js`
  - Ghost collaborator detection (access but never opened)
  - Stale share analyzer (shared >6mo, no activity)
  - Permission bloat detector (10+ editors)
  - Orphaned file finder (owner left org)
- [ ] **Day 3-4**: Frontend - Collaboration dashboard
  - Create `CollaborationHealthView.jsx`
  - Collaboration health cards
  - Permission audit table with bulk actions
  - Sharing timeline visualization
  - Ghost collaborator removal UI
- [ ] **Day 5**: Testing & integration
  - Add to Smart Scan categories
  - Navigation integration
  - **Deploy**: v1.6.0

**Week 2: Security & Storage** (5 days)
- [ ] **Day 6-7**: External Sharing Audit
  - Create `sharingSecurityAnalyzer.js`
  - Public link detector ("Anyone with link")
  - External domain analyzer (sharing outside org)
  - Compliance checker (GDPR, HIPAA flags)
  - Risk scoring (High/Medium/Low)
  - Create `SharingSecurityView.jsx`
- [ ] **Day 8-9**: Meet Recording Cleanup
  - Create `meetRecordingAnalyzer.js`
  - Old recording detector (>3 months)
  - 0-view recording finder
  - Storage impact calculator (avg 500MB-2GB each!)
  - Transcript-only option (keep transcript, delete video)
  - Create `MeetRecordingView.jsx`
- [ ] **Day 10**: Integration & polish
  - Security dashboard combining both features
  - Storage savings estimator
  - Bulk cleanup actions
  - **Deploy**: v1.7.0

**Sprint 4 Deliverables**:
- ✅ Collaboration Health Dashboard (NEW Issue #17)
- ✅ External Sharing Audit (NEW Issue #18)
- ✅ Meet Recording Cleanup (NEW Issue #19)
- 📊 **Sprint Review**: Demo security features, massive storage savings

**Why Sprint 4 (Not Later)**:
- No AI needed - pure Drive API
- High security value (enterprise critical)
- MASSIVE storage impact (Meet recordings are huge)
- Relatively quick implementation (10 days)
- Low risk, high reward

---

### Sprint 5: Labels & Organization (Optional)
**Duration**: 2 weeks (10 days)
**Focus**: File organization and workflow management

#### Goals:
1. Complete Google Drive Labels Management
2. Complete Kanban Labels View

#### Tasks:

**Week 1: Labels Backend** (5 days)
- [ ] **Day 1-2**: Labels API integration
  - Drive Labels API v2 integration
  - List/create/update/delete labels
  - Apply labels to files
  - Batch operations
- [ ] **Day 3-5**: Labels management
  - Label picker component
  - Label creation UI
  - Bulk label operations
  - Filter by label

**Week 2: Kanban View** (5 days)
- [ ] **Day 6-8**: Kanban board
  - Create `KanbanLabelsView.jsx`
  - Drag-and-drop label assignment
  - Column-based organization
  - Card visualization
- [ ] **Day 9-10**: Integration & polish
  - Export control compliance features (missing labels detection)
  - Navigation integration
  - Testing
  - **Deploy**: v1.6.0

**Sprint 5 Deliverables**:
- ✅ Google Drive Labels Management (#9) - Complete
- ✅ Kanban Labels View (#4) - Complete
- 📊 **Sprint Review**: Demo drag-and-drop organization

---

### Sprint 6: Notifications & Infrastructure (Optional)
**Duration**: 2 weeks (10 days)
**Focus**: RemNotifLib and advanced notifications

#### Goals:
1. Build RemNotifLib as standalone library
2. Migrate Daily Impact Tracker to use RemNotifLib
3. Add browser notifications and email reminders

#### Tasks:

**Week 1: RemNotifLib Library** (5 days)
- [ ] **Day 1-2**: Core API
  - Trigger management (create, remove, list)
  - Email sending with templates
  - Preference management
- [ ] **Day 3-4**: Advanced features
  - Notification scheduling
  - Delivery tracking
  - Rate limiting
  - Batch sending
- [ ] **Day 5**: Publish library
  - Unit tests
  - Documentation
  - Publish to Apps Script

**Week 2: Integration** (5 days)
- [ ] **Day 6-7**: Migrate Daily Impact Tracker
  - Replace inline email code with RemNotifLib calls
  - Create email templates (streak-reminder, weekly-summary, etc.)
  - Set up daily triggers
- [ ] **Day 8-9**: Browser notifications
  - Service worker registration
  - Browser notification permissions
  - Daily reminder scheduling
- [ ] **Day 10**: Polish & testing
  - Notification settings UI
  - End-to-end notification testing
  - **Deploy**: v1.7.0

**Sprint 6 Deliverables**:
- ✅ RemNotifLib (#14) - Complete
- ✅ Advanced notifications in Daily Impact Tracker
- 📊 **Sprint Review**: Demo email reminders and browser notifications

---

### Sprint 7: File Preview & Details (From Product Vision)
**Duration**: 2 weeks (10 days)
**Focus**: File preview functionality and detailed file information

#### Goals:
1. Build file preview modal for common file types
2. Implement detailed file information panel
3. Add quick actions from preview

#### Tasks:

**Week 1: Preview Modal** (5 days)
- [ ] **Day 1-2**: Backend preparation
  - Image thumbnail generation
  - PDF preview support
  - Google Docs preview URLs
  - File content metadata
- [ ] **Day 3-4**: Frontend preview modal
  - Create `FilePreviewModal.jsx`
  - Image viewer with zoom
  - PDF viewer integration
  - Google Docs/Sheets/Slides iframe preview
  - Text file viewer
- [ ] **Day 5**: Quick actions
  - Download from preview
  - Star/unstar from preview
  - Move to trash from preview
  - Share from preview
  - **Deploy**: v1.8.0

**Week 2: File Details** (5 days)
- [ ] **Day 6-7**: Details panel
  - Create `FileDetailsPanel.jsx`
  - Extended metadata display
  - Version history (if available)
  - Sharing permissions details
  - Activity timeline
- [ ] **Day 8-9**: Integration
  - Add preview to all category views
  - Keyboard shortcuts (arrow keys, escape)
  - Mobile-optimized preview
- [ ] **Day 10**: Testing & polish
  - Cross-browser testing
  - Performance optimization
  - Accessibility audit
  - **Deploy**: v1.9.0

**Sprint 7 Deliverables**:
- ✅ File Preview Modal (NEW Feature)
- ✅ File Details Panel (NEW Feature)
- ✅ Quick actions from preview
- 📊 **Sprint Review**: Demo preview functionality across file types

---

### Sprint 8: Bulk Operations (From Product Vision)
**Duration**: 2 weeks (10 days)
**Focus**: Bulk file management and safety features

#### Goals:
1. Complete bulk selection system
2. Implement bulk operations with safety features
3. Add undo/rollback functionality

#### Tasks:

**Week 1: Bulk Selection** (5 days)
- [ ] **Day 1-2**: Selection system
  - Multi-select checkbox UI
  - Select all / deselect all
  - Filter-based selection (select all in view)
  - Selection count badge
  - Keyboard shortcuts (Ctrl+A, Shift+Click)
- [ ] **Day 3-4**: Bulk actions toolbar
  - Create `BulkActionsToolbar.jsx`
  - Bulk delete (with confirmation)
  - Bulk move to folder
  - Bulk star/unstar
  - Bulk apply labels
  - Cancel selection
- [ ] **Day 5**: Safety features
  - Confirmation modal for destructive actions
  - Preview affected files
  - Size impact calculator
  - **Deploy**: v2.0.0 (Major version!)

**Week 2: Advanced Bulk Operations** (5 days)
- [ ] **Day 6-7**: Move to trash with undo
  - Trash batch operation
  - Undo buffer (keep references for 30 seconds)
  - Toast notification with undo button
  - Background undo implementation
- [ ] **Day 8-9**: Batch processing
  - Progress indicator for large batches
  - Rate limit handling (batch in chunks)
  - Error handling (partial failures)
  - Success/failure summary
- [ ] **Day 10**: Integration & testing
  - Add bulk operations to all views
  - Performance testing (100+ files)
  - End-to-end testing
  - **Deploy**: v2.0.1

**Sprint 8 Deliverables**:
- ✅ Bulk selection system (NEW Feature)
- ✅ Bulk operations with safety (NEW Feature)
- ✅ Undo/rollback functionality (NEW Feature)
- 📊 **Sprint Review**: Demo bulk deletion with undo, batch processing

---

### Sprint 9: Polish & Optimization (Ongoing)
**Duration**: Ongoing
**Focus**: UI/UX improvements, performance, accessibility

#### Continuous Improvements (#8):
- [ ] Accessibility audit (WCAG AA compliance)
- [ ] Performance optimization (Lighthouse scores)
- [ ] Responsive design testing
- [ ] Animation polish
- [ ] Error handling improvements
- [ ] Loading states refinement
- [ ] Empty states
- [ ] User onboarding

---

## Sprint Dependencies & Critical Path

```
Sprint 1: Workspace Files (independent) + ROT Backend
           ↓
Sprint 2: ROT UI + Carbon Footprint (independent)
           ↓
Sprint 3: Daily Impact Tracker (depends on ROT + Carbon) ⭐ FAST TRACK ENDS HERE
           ↓
Sprint 4: Collaboration & Security (independent)
           ↓
Sprint 5: Labels & Kanban (independent, optional)
           ↓
Sprint 6: RemNotifLib (optional, enhances Sprint 3)
           ↓
Sprint 7: File Preview & Details (independent, optional)
           ↓
Sprint 8: Bulk Operations (independent, optional)
           ↓
Sprint 9: Polish & Optimization (ongoing)
```

**FAST TRACK (RECOMMENDED)**: Sprint 1 → Sprint 2 → Sprint 3 = **6 weeks** ⭐
**Full Core Features**: Sprints 1-4 = 8 weeks
**Extended Features**: Sprints 1-6 = 12 weeks
**Complete Product**: Sprints 1-8 = 16 weeks

---

## Milestone Summary

### Milestone 1: Smart Analysis (Completed ✅ - Nov 2024)
- Enhanced Metadata ✅
- Smart Scan with 5 backend analyzers ✅
- 5 category views (Large Files, Old Files, Duplicates, Empty Items, Temp Files) ✅
- Storage Analytics Dashboard ✅

### Milestone 2: Data Quality (Sprints 1-2, ~4 weeks) ⭐ FAST TRACK
- Google Workspace Files
- Data ROT Analysis
- Carbon Footprint
- **Status**: Sprint 1 Active

### Milestone 3: Engagement & Retention (Sprint 3, ~2 weeks) ⭐ FAST TRACK COMPLETION
- Daily Impact Tracker
- Gamification system
- Progress visualization
- **Fast Track Milestone**: End of 6-week Fast Track

### Milestone 4: Collaboration & Security (Sprint 4, ~2 weeks, optional)
- Collaboration Health Dashboard
- External Sharing Audit
- Meet Recording Cleanup
- **Impact**: Security + massive storage savings

### Milestone 5: Organization (Sprint 5, ~2 weeks, optional)
- Labels Management
- Kanban View
- Export Control compliance

### Milestone 6: Infrastructure (Sprint 6, ~2 weeks, optional)
- RemNotifLib
- Advanced notifications
- Email reminders

### Milestone 7: File Management (Sprint 7, ~2 weeks, optional)
- File Preview Modal
- File Details Panel
- Quick actions from preview

### Milestone 8: Bulk Operations (Sprint 8, ~2 weeks, optional)
- Bulk selection system
- Bulk operations with safety
- Undo/rollback functionality

---

## Resource Allocation

**Team Size**: 1 developer (you!)
**Sprint Capacity**: 10 days per sprint (2 weeks)

### Recommended Approach:

**⭐ FAST TRACK (RECOMMENDED - SELECTED)**:
- **Sprint 1 + Sprint 2 + Sprint 3 = 6 weeks**
- **Delivers**: Workspace Files, ROT Analysis, Carbon Footprint, Daily Impact Tracker
- **Outcome**: Production-ready app with full analytics and gamification
- **Status**: ✅ CHOSEN - Active development approach

**Extended Core (Optional)**:
- Sprints 1-4 = 8 weeks
- Adds: Collaboration Health, Sharing Audit, Meet Recording Cleanup
- **Outcome**: Fast Track + security and collaboration features

**Full Feature Set (Optional)**:
- Sprints 1-6 = 12 weeks
- Adds: Labels, Kanban, RemNotifLib, Advanced notifications
- **Outcome**: Enterprise-grade file management platform

**Complete Product (Optional)**:
- Sprints 1-8 = 16 weeks
- Adds: File Preview, Bulk Operations
- **Outcome**: Complete feature-rich platform

**Minimum Viable Product (Optional)**:
- Sprint 1 only = 2 weeks
- Delivers: Google Workspace Files View only
- **Outcome**: Quick win, demonstrates value

---

## Sprint Ceremonies

### Sprint Planning (Day 0)
- Review sprint backlog
- Assign tasks
- Estimate effort
- Identify blockers

### Daily Standup (Daily, 15min)
- What did I do yesterday?
- What will I do today?
- Any blockers?

### Sprint Review (Day 10)
- Demo completed features
- Stakeholder feedback
- Update product backlog

### Sprint Retrospective (Day 10)
- What went well?
- What could be improved?
- Action items for next sprint

---

## Risk Management

### High Risk Items:
1. **Data ROT Analysis** (10-14 days) - Complex algorithms, need careful testing
2. **Daily Impact Tracker** (7-10 days) - Many moving parts, localStorage complexity
3. **RemNotifLib** (5-7 days) - New library, needs publishing and versioning

### Mitigation Strategies:
- Start high-risk items early in sprint
- Build prototypes before full implementation
- Regular testing and code reviews
- Keep sprints focused (1-2 major features max)

---

## Next Steps

**Immediate Actions**:
1. ✅ Review sprint roadmap with team
2. ✅ Choose sprint approach (Fast Track - SELECTED)
3. 🚀 Sprint 1 IN PROGRESS: Google Workspace Files View + ROT Analysis Backend
4. ✅ Sprint tracking in place (Todo list)

**Decision Confirmed**: ⭐ **FAST TRACK (6 weeks)** - Sprints 1-3
- Delivers: Workspace Files, ROT Analysis, Carbon Footprint, Daily Impact Tracker
- Timeline: 6 weeks total (currently in Sprint 1, Week 1)
- Status: Active development

**Current Sprint**:
- Sprint 1, Day 1-2: Creating workspaceAnalyzer.js backend
- Next: GoogleWorkspaceView.jsx frontend (Days 3-4)
- Target deployment: v1.2.0 (end of Week 1)

---

**Status**: 🚀 Sprint 1 ACTIVE - Fast Track (6 weeks) in progress