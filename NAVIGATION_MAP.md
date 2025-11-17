# Drive Cleaner - Navigation & Information Architecture

## Feature Organization & Navigation Map

### Main Navigation Structure

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  SIDEBAR NAVIGATION (Left)                         │
│                                                     │
│  SECTION 1: OVERVIEW                               │
│  ├─ 🏠 Dashboard                [v0.0.1] ✅        │
│  ├─ 🔍 Smart Scan               [v0.2.0] 🚧        │
│  └─ 📊 Storage Analytics        [v0.3.0] 🚧        │
│                                                     │
│  SECTION 2: CLEANUP TOOLS                          │
│  ├─ 🔄 Duplicates               [v0.4.0] 🚧        │
│  ├─ 📦 Large Files              [v0.2.0] 🚧        │
│  ├─ ⏰ Old Files                [v0.2.0] 🚧        │
│  ├─ 📭 Empty Items              [v0.5.0] 🚧        │
│  ├─ 🗑️  Temporary Files         [v0.5.0] 🚧        │
│  └─ ⭐ Shared Files             [v0.2.0] 🚧        │
│                                                     │
│  SECTION 3: MANAGEMENT                             │
│  ├─ 🔧 Bulk Actions             [v0.6.0] 🚧        │
│  ├─ 📋 Kanban Labels            [v0.7.0] 🚧        │
│  ├─ 📁 My Folders               [v0.1.0] ✅        │
│  └─ 📋 History                  [v0.3.0] 🚧        │
│                                                     │
│  SECTION 4: SETTINGS                               │
│  ├─ ⚙️  Settings                [v0.2.0] 🚧        │
│  └─ ℹ️  About                   [v0.1.0] ✅        │
│                                                     │
└─────────────────────────────────────────────────────┘

Legend:
✅ = Implemented
🚧 = Behind feature flag (coming soon)
```

---

## Detailed Feature Breakdown by Navigation Item

### 🏠 DASHBOARD
**Status:** v0.0.1 - Partially implemented
**Release Flag:** `FEATURE_DASHBOARD` = true

#### Current Features (v0.0.1)
- Basic folder selection (Drive Picker)
- File listing in table
- Search and filter
- Export to CSV/JSON

#### Planned Enhancements (v0.2.0)
- Storage usage overview cards
- Quick stats (total files, total size, last scan)
- Recent scans list
- Quick action buttons (scan, view duplicates, etc.)
- Storage quota visualization (pie chart)

#### Layout Components
```
Dashboard View:
├─ Header (Welcome message)
├─ Storage Overview Cards
│  ├─ Total Files Card
│  ├─ Total Storage Card
│  ├─ Storage Quota Card
│  └─ Last Scan Card
├─ Quick Actions Grid
│  ├─ Start Scan Button
│  ├─ View Duplicates Button
│  ├─ View Large Files Button
│  └─ View Old Files Button
└─ Recent Scans List
```

---

### 🔍 SMART SCAN
**Status:** v0.2.0 - Planned
**Release Flag:** `FEATURE_SMART_SCAN` = false

#### Features
- One-click comprehensive scan
- Scans for all issues simultaneously:
  - Duplicates
  - Large files (>100MB, >500MB, >1GB)
  - Old files (>1 year, >2 years)
  - Empty files and folders
  - Temporary files
  - Unusual storage patterns
- Progress indicator with real-time updates
- Categorized results summary
- Recommendations for cleanup

#### User Flow
1. User clicks "Start Smart Scan"
2. Folder picker appears (or use last scanned folder)
3. Progress modal shows scanning progress
4. Results page shows issues by category
5. User can click into each category to review
6. Quick action: "Clean Up All Safe Items"

#### Layout Components
```
Smart Scan View:
├─ Hero Section
│  ├─ Illustration (scanning animation)
│  ├─ Title: "Smart Scan"
│  ├─ Subtitle: "Comprehensive scan for all issues"
│  └─ Large Scan Button
├─ Scan Progress Modal (when scanning)
│  ├─ Progress bar
│  ├─ Current operation text
│  ├─ Files scanned count
│  └─ Cancel button
└─ Results View (after scan)
   ├─ Summary Cards Grid
   │  ├─ Duplicates Found Card
   │  ├─ Large Files Card
   │  ├─ Old Files Card
   │  ├─ Empty Items Card
   │  ├─ Temp Files Card
   │  └─ Potential Savings Card
   └─ Recommendations Panel
      ├─ Safe to delete items
      └─ Review needed items
```

---

### 📊 STORAGE ANALYTICS
**Status:** v0.3.0 - Planned
**Release Flag:** `FEATURE_STORAGE_ANALYTICS` = false

#### Features
- Visual folder size breakdown (tree map / sunburst chart)
- Storage trends over time
- File type distribution (pie chart)
- Largest folders list
- Storage by file age
- Storage by owner (for shared drives)
- Interactive drill-down
- Breadcrumb navigation

#### User Flow
1. User clicks "Storage Analytics"
2. Shows overall Drive storage breakdown
3. Click on folders to drill down
4. View charts and insights
5. Click "View Files" to see file list

#### Layout Components
```
Storage Analytics View:
├─ Header
│  ├─ Title: "Storage Analytics"
│  ├─ Total storage display
│  └─ Breadcrumb navigation
├─ Main Chart Area
│  ├─ Tree Map / Sunburst Chart
│  │  └─ Interactive (click to drill down)
│  └─ Chart Type Toggle (tree/sunburst/list)
├─ Insights Panel
│  ├─ Largest Folders List
│  ├─ File Type Distribution Chart
│  └─ Storage by Age Chart
└─ Actions
   └─ View Files in Folder Button
```

---

### 🔄 DUPLICATES
**Status:** v0.4.0 - Planned
**Release Flag:** `FEATURE_DUPLICATES` = false

#### Features
- Multiple detection methods:
  - Exact name match
  - Name + size match
  - MD5 checksum match
- Group duplicates together
- Side-by-side comparison
- Thumbnail previews
- Smart suggestions (keep newest, largest, etc.)
- Bulk selection within groups
- Show potential space savings
- Filter by file type

#### User Flow
1. User clicks "Duplicates"
2. Scan runs (or shows cached results)
3. Duplicates grouped together
4. User reviews each group
5. Selects files to keep/delete
6. Confirms deletion
7. Space freed shown

#### Layout Components
```
Duplicates View:
├─ Header
│  ├─ Title: "Duplicate Files"
│  ├─ Stats: X duplicates, Y GB to save
│  └─ Detection Method Selector
├─ Filters Panel
│  ├─ File type filter
│  ├─ Size range filter
│  └─ Date range filter
├─ Duplicate Groups List
│  └─ Each Group Card:
│     ├─ Group header (filename, count)
│     ├─ Potential savings
│     ├─ File comparison (side by side)
│     │  ├─ Thumbnail
│     │  ├─ Size
│     │  ├─ Date
│     │  ├─ Location
│     │  └─ Keep/Delete radio
│     └─ Actions
│        ├─ Keep Newest Button
│        ├─ Keep Largest Button
│        └─ Custom Selection
└─ Bulk Actions Bar (bottom)
   ├─ Selected count
   ├─ Space to free
   └─ Delete Selected Button
```

---

### 📦 LARGE FILES
**Status:** v0.2.0 - Planned
**Release Flag:** `FEATURE_LARGE_FILES` = false

#### Features
- Preset size filters (>100MB, >500MB, >1GB)
- Custom size range filter
- Sort by size (descending by default)
- File type breakdown
- Preview files
- Show file age
- Quick actions (delete, move, open)
- Bulk selection

#### Layout Components
```
Large Files View:
├─ Header
│  ├─ Title: "Large Files"
│  └─ Stats: X files using Y GB
├─ Filter Chips (Quick Filters)
│  ├─ >100MB
│  ├─ >500MB
│  ├─ >1GB
│  └─ Custom Range
├─ File Type Tabs
│  ├─ All
│  ├─ Videos
│  ├─ Images
│  ├─ Archives
│  └─ Other
└─ File List (Enhanced Table)
   ├─ Preview column
   ├─ Name column
   ├─ Size column (sortable)
   ├─ Type column
   ├─ Modified column
   └─ Actions column
```

---

### ⏰ OLD FILES
**Status:** v0.2.0 - Planned
**Release Flag:** `FEATURE_OLD_FILES` = false

#### Features
- Preset age filters (>1yr, >2yr, >5yr)
- Custom date range
- Show last accessed date
- Show last modified date
- File type breakdown
- Preview old files
- Archive suggestions
- Bulk operations

#### Layout Components
```
Old Files View:
├─ Header
│  ├─ Title: "Old Files"
│  └─ Stats: X files not accessed in Y days
├─ Age Filter Chips
│  ├─ >1 Year
│  ├─ >2 Years
│  ├─ >5 Years
│  └─ Custom Date
├─ Sorting Options
│  ├─ By age (oldest first)
│  ├─ By size
│  └─ By file type
└─ File List with Timeline
   ├─ Group by year
   ├─ Show last accessed date
   └─ Archive suggestions
```

---

### 📭 EMPTY ITEMS
**Status:** v0.5.0 - Planned
**Release Flag:** `FEATURE_EMPTY_ITEMS` = false

#### Features
- Empty files (0 bytes)
- Empty folders (no children)
- Nearly empty files (<1KB)
- Empty Google Docs
- Safe delete suggestions
- Bulk cleanup wizard

#### Layout Components
```
Empty Items View:
├─ Header
│  ├─ Title: "Empty Items"
│  └─ Stats: X empty items
├─ Category Tabs
│  ├─ Empty Files
│  ├─ Empty Folders
│  └─ Nearly Empty
├─ Safety Indicator
│  ├─ Safe to delete (green)
│  └─ Review needed (yellow)
└─ Item List
   ├─ Checkbox selection
   ├─ Item name
   ├─ Item type
   ├─ Location
   └─ Safety badge
```

---

### 🗑️ TEMPORARY FILES
**Status:** v0.5.0 - Planned
**Release Flag:** `FEATURE_TEMP_FILES` = false

#### Features
- Detect temp file patterns (.tmp, ~$, etc.)
- Cache files
- Backup files (.bak)
- Auto-save files
- Browser temp files
- Pattern-based detection
- Safe cleanup suggestions

#### Layout Components
```
Temporary Files View:
├─ Header
│  ├─ Title: "Temporary Files"
│  └─ Stats: X temp files, Y GB
├─ Pattern Categories
│  ├─ Office Temp Files
│  ├─ Cache Files
│  ├─ Backup Files
│  ├─ Browser Temp
│  └─ Other
├─ Safety Check Panel
│  ├─ Safe to delete list
│  └─ Review needed list
└─ Cleanup Actions
   ├─ Select All Safe Items
   └─ Delete Selected
```

---

### ⭐ SHARED FILES
**Status:** v0.2.0 - Planned
**Release Flag:** `FEATURE_SHARED_FILES` = false

#### Features
- Files shared with me
- Files shared by me
- Publicly shared files
- Filter by sharing status
- Show permissions list
- Ownership information
- Shared drive files
- Revoke sharing actions

#### Layout Components
```
Shared Files View:
├─ Header
│  ├─ Title: "Shared Files"
│  └─ Stats: X shared files
├─ Sharing Type Tabs
│  ├─ Shared With Me
│  ├─ Shared By Me
│  ├─ Public
│  └─ Shared Drives
├─ Permission Level Filter
│  ├─ View only
│  ├─ Edit
│  └─ Owner
└─ File List
   ├─ Checkbox
   ├─ File name
   ├─ Shared with (avatars)
   ├─ Permission level
   └─ Actions (manage permissions)
```

---

### 🔧 BULK ACTIONS
**Status:** v0.6.0 - Planned
**Release Flag:** `FEATURE_BULK_ACTIONS` = false

#### Features
- Mass selection across categories
- Bulk delete (trash)
- Bulk permanent delete
- Bulk move to folder
- Bulk share settings
- Bulk star/unstar
- Progress tracking
- Undo functionality
- Safety confirmations

#### Layout Components
```
Bulk Actions View:
├─ Header
│  ├─ Title: "Bulk Operations"
│  └─ Selected: X files (Y GB)
├─ Source Categories
│  ├─ From Duplicates
│  ├─ From Large Files
│  ├─ From Old Files
│  └─ Custom Selection
├─ Available Actions
│  ├─ Delete (Move to Trash)
│  ├─ Permanent Delete
│  ├─ Move to Folder
│  ├─ Change Sharing
│  └─ Star/Unstar
├─ Preview Panel
│  ├─ Files to be affected
│  └─ Safety warnings
└─ Confirmation Modal
   ├─ Summary of action
   ├─ Space to be freed
   └─ Confirm/Cancel
```

---

### 📋 KANBAN LABELS
**Status:** v0.7.0 - Planned
**Release Flag:** `FEATURE_KANBAN_LABELS` = false

#### Features
- Kanban board interface for file organization
- Columns represent Google Drive labels
- Drag-and-drop files between columns to reassign labels
- Visual file management workflow
- Label creation and management
- Multi-select for batch label assignment
- Filter files by current labels
- Search within kanban view

#### User Flow
1. User clicks "Kanban Labels"
2. Board displays columns for each Google Drive label
3. Files are shown as cards in their respective label columns
4. User drags file card to different column
5. File's label is automatically updated in Google Drive
6. Visual feedback confirms label change

#### Layout Components
```
Kanban Labels View:
├─ Header
│  ├─ Title: "Kanban Labels"
│  ├─ Add New Label Button
│  └─ Filter & Search Bar
├─ Kanban Board
│  └─ Each Column (Label):
│     ├─ Column Header
│     │  ├─ Label name & color
│     │  ├─ File count badge
│     │  └─ Column actions (edit, delete)
│     └─ File Cards (draggable):
│        ├─ File thumbnail/icon
│        ├─ File name
│        ├─ File size
│        ├─ Modified date
│        └─ Quick actions (open, star)
├─ Add Column Button
└─ Board Actions
   ├─ Save Layout
   └─ Reset View
```

#### Technical Requirements
- Google Drive Labels API integration
- Drag-and-drop library (react-beautiful-dnd or @dnd-kit)
- Label color theming
- Optimistic UI updates
- Label synchronization with Drive
- Permission handling (read/write labels)

---

### 📁 MY FOLDERS
**Status:** v0.1.0 - Partially implemented
**Release Flag:** `FEATURE_MY_FOLDERS` = true

#### Current Features (v0.1.0)
- Drive Picker to select folders
- Browse folder contents
- View files in table

#### Planned Enhancements (v0.3.0)
- Saved folder list (favorites)
- Folder size at a glance
- Quick scan folder button
- Recent folders history
- Folder path breadcrumbs
- Folder comparison

#### Layout Components
```
My Folders View:
├─ Header
│  ├─ Title: "My Folders"
│  └─ Browse New Folder Button
├─ Saved Folders List
│  └─ Each Folder Card:
│     ├─ Folder icon & name
│     ├─ Size indicator
│     ├─ Last scanned date
│     ├─ Quick stats
│     └─ Actions (scan, remove)
├─ Recent Folders
│  └─ Recently scanned folders
└─ Quick Actions
   ├─ Scan Folder
   └─ View Analytics
```

---

### 📋 HISTORY
**Status:** v0.3.0 - Planned
**Release Flag:** `FEATURE_HISTORY` = false

#### Features
- Scan history timeline
- Action history (deleted files, etc.)
- Restore deleted files (within undo window)
- Export history
- Clear history
- Filter by date range

#### Layout Components
```
History View:
├─ Header
│  ├─ Title: "History"
│  └─ Clear History Button
├─ Timeline View
│  └─ Each Entry:
│     ├─ Date/time
│     ├─ Action type (scan, delete, move)
│     ├─ Details (files affected, space freed)
│     └─ Undo button (if available)
├─ Filters
│  ├─ Date range
│  ├─ Action type
│  └─ Folder
└─ Export Options
   └─ Export History CSV
```

---

### ⚙️ SETTINGS
**Status:** v0.2.0 - Planned
**Release Flag:** `FEATURE_SETTINGS` = false

#### Features
- Theme selection (dark/light/auto)
- Color scheme (blue/indigo variants)
- File size thresholds (customize what's "large")
- Age thresholds (customize what's "old")
- Default scan settings
- Auto-scan schedule
- Email notifications
- Privacy settings
- Data clearing

#### Layout Components
```
Settings View:
├─ Header
│  └─ Title: "Settings"
├─ Settings Categories (Tabs)
│  ├─ Appearance
│  │  ├─ Theme selector
│  │  ├─ Color scheme
│  │  └─ Animations toggle
│  ├─ Scan Settings
│  │  ├─ File size thresholds
│  │  ├─ Age thresholds
│  │  └─ Default scan options
│  ├─ Automation
│  │  ├─ Auto-scan schedule
│  │  └─ Email notifications
│  ├─ Privacy & Data
│  │  ├─ Data storage
│  │  ├─ Clear cache
│  │  └─ OAuth permissions
│  └─ Advanced
│     ├─ Feature flags
│     ├─ Debug mode
│     └─ Reset app
└─ Save Button
```

---

### ℹ️ ABOUT
**Status:** v0.1.0 - Implemented
**Release Flag:** `FEATURE_ABOUT` = true

#### Features
- Version information
- Developer credits
- Privacy policy
- Terms of service
- GitHub repository link
- Report bug/feedback link
- Keyboard shortcuts guide

#### Layout Components
```
About View:
├─ Header
│  └─ App Logo & Title
├─ Version Info
│  ├─ Version number
│  ├─ Release date
│  └─ Build info
├─ Links Section
│  ├─ GitHub Repository
│  ├─ Report Bug
│  ├─ Request Feature
│  └─ Privacy Policy
├─ Credits
│  └─ Developer info
└─ Keyboard Shortcuts
   └─ Shortcuts list
```

---

## Feature Flag System

### Flag Configuration File
```javascript
// src/config/featureFlags.js
export const FEATURE_FLAGS = {
  // Core Features (v0.1.0)
  FEATURE_DASHBOARD: true,
  FEATURE_MY_FOLDERS: true,
  FEATURE_ABOUT: true,

  // Phase 1 (v0.2.0)
  FEATURE_SMART_SCAN: false,
  FEATURE_LARGE_FILES: false,
  FEATURE_OLD_FILES: false,
  FEATURE_SHARED_FILES: false,
  FEATURE_SETTINGS: false,

  // Phase 2 (v0.3.0)
  FEATURE_STORAGE_ANALYTICS: false,
  FEATURE_HISTORY: false,

  // Phase 3 (v0.4.0)
  FEATURE_DUPLICATES: false,

  // Phase 4 (v0.5.0)
  FEATURE_EMPTY_ITEMS: false,
  FEATURE_TEMP_FILES: false,

  // Phase 5 (v0.6.0)
  FEATURE_BULK_ACTIONS: false,
  FEATURE_FILE_PREVIEW: false,

  // Advanced Features (Future)
  FEATURE_AUTOMATION: false,
  FEATURE_SCHEDULED_SCANS: false,
  FEATURE_AI_SUGGESTIONS: false,
}

// Helper function
export const isFeatureEnabled = (flagName) => {
  return FEATURE_FLAGS[flagName] === true
}
```

### Usage in Components
```jsx
import { isFeatureEnabled } from '@/config/featureFlags'

// In navigation
{isFeatureEnabled('FEATURE_DUPLICATES') && (
  <NavItem icon={RefreshCw} label="Duplicates" path="/duplicates" />
)}

// In routes
{isFeatureEnabled('FEATURE_DUPLICATES') && (
  <Route path="/duplicates" component={DuplicatesView} />
)}

// Show "Coming Soon" badge for disabled features
<NavItem
  icon={RefreshCw}
  label="Duplicates"
  path="/duplicates"
  badge={!isFeatureEnabled('FEATURE_DUPLICATES') ? 'Coming Soon' : null}
  disabled={!isFeatureEnabled('FEATURE_DUPLICATES')}
/>
```

---

## Release Roadmap & Feature Rollout

### v0.1.0 (Current - Baseline)
- ✅ Dashboard (basic)
- ✅ My Folders
- ✅ About
- ✅ File table with search/sort/pagination

### v0.2.0 (Phase 1 - Enhanced Data)
- 🚧 Smart Scan
- 🚧 Large Files category
- 🚧 Old Files category
- 🚧 Shared Files category
- 🚧 Settings page
- 🚧 Enhanced Dashboard with stats

### v0.3.0 (Phase 2 - Analytics)
- 🚧 Storage Analytics (tree map)
- 🚧 History page
- 🚧 Enhanced My Folders

### v0.4.0 (Phase 3 - Duplicates)
- 🚧 Duplicates detection
- 🚧 Duplicate comparison
- 🚧 Smart suggestions

### v0.5.0 (Phase 4 - Cleanup)
- 🚧 Empty Items detection
- 🚧 Temporary Files detection
- 🚧 File Preview modal

### v0.6.0 (Phase 5 - Bulk Operations)
- 🚧 Bulk Actions page
- 🚧 Mass delete/move
- 🚧 Undo functionality

---

## Navigation Behavior

### Active State
- Highlight current nav item
- Show blue accent on active item
- Update breadcrumb in header

### Disabled State (Feature Flag = false)
- Show "Coming Soon" badge
- Dim the nav item
- Tooltip on hover: "Available in v0.X.0"
- Click shows "Feature coming soon" modal

### Collapsed State (Mobile)
- Sidebar collapses to icons only
- Hamburger menu to expand
- Bottom tab bar on mobile

---

## Information Architecture Summary

```
Drive Cleaner
│
├─ Overview
│  ├─ Dashboard (home)
│  ├─ Smart Scan (comprehensive scan)
│  └─ Storage Analytics (visualizations)
│
├─ Cleanup Tools
│  ├─ Duplicates (find & remove dupes)
│  ├─ Large Files (size-based filter)
│  ├─ Old Files (age-based filter)
│  ├─ Empty Items (empty files/folders)
│  ├─ Temporary Files (temp/cache detection)
│  └─ Shared Files (sharing-based filter)
│
├─ Management
│  ├─ Bulk Actions (mass operations)
│  ├─ My Folders (saved folders)
│  └─ History (scan & action log)
│
└─ Settings
   ├─ Settings (preferences)
   └─ About (version & info)
```

---

**Next Steps:**
1. Design layout variations (3 options)
2. Choose best layout
3. Implement UI shell with feature flags
4. Build components for enabled features
5. Gradually enable features as completed

