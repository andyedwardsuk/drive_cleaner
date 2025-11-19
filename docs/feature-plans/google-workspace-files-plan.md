# Feature Implementation Plan: Google Workspace Files View

**Feature Name:** google-workspace-files
**Complexity:** Medium
**Priority:** High
**Module:** Frontend View + Backend Analyzer
**Estimated Effort:** 3-4 days

---

## 1. Feature Overview

**Description**: A dedicated view for analyzing and managing Google Workspace files (Docs, Sheets, Slides, Forms, Drawings, Sites, Apps Script, etc.) with specialized insights and metadata unique to Google's native file types.

**Key Insight**: Google Workspace files are fundamentally different from regular files:
- Don't consume storage quota (mostly)
- Can't be measured by traditional file size
- Have unique collaboration features (comments, version history, sharing)
- Often become abandoned/unused over time
- Can have complex permission structures

**Use Cases**:
- User wants to find all Google Docs not opened in 6+ months
- User wants to see which Sheets have the most collaborators
- User wants to identify Workspace files they own vs. shared with them
- User wants to clean up old Google Forms or unused Slides
- User wants to see version history size (does consume quota)
- User wants to convert Workspace files to Office formats to download

---

## 2. Workspace File Types

### Google Workspace Native Types

| Type | MIME Type | Icon | Quota Impact |
|------|-----------|------|--------------|
| **Document** | `application/vnd.google-apps.document` | 📝 | Free* |
| **Spreadsheet** | `application/vnd.google-apps.spreadsheet` | 📊 | Free* |
| **Presentation** | `application/vnd.google-apps.presentation` | 📽️ | Free* |
| **Form** | `application/vnd.google-apps.form` | 📋 | Free |
| **Drawing** | `application/vnd.google-apps.drawing` | 🎨 | Free |
| **Site** | `application/vnd.google-apps.site` | 🌐 | Free |
| **Apps Script** | `application/vnd.google-apps.script` | ⚙️ | Free |
| **Jam** | `application/vnd.google-apps.jam` | 🎯 | Free |
| **Shortcut** | `application/vnd.google-apps.shortcut` | 🔗 | Free |

**Note**: Version history and revisions CAN consume quota

---

## 3. Unique Metadata for Workspace Files

### Available from Drive API v2

```javascript
{
  // Standard metadata (already collected)
  id, title, mimeType, owners, shared,
  createdDate, modifiedDate, lastViewedByMeDate,

  // Workspace-specific metadata
  quotaBytesUsed,           // Version history size (can be non-zero!)
  writersCanShare,          // Sharing permissions
  sharingUser,              // Who shared it with me
  capabilities: {
    canEdit,
    canComment,
    canShare,
    canCopy,
    canDownload
  },
  version,                  // Version number
  headRevisionId,          // Latest revision ID

  // Embedded content
  embedLink,               // Embeddable link
  webViewLink,             // View-only link
  exportLinks: {           // Conversion formats
    'application/pdf': '...',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '...',
    // ... more formats
  }
}
```

---

## 4. Feature Design

### View Layout

```
┌────────────────────────────────────────────────────────┐
│  Google Workspace Files                                │
│  📊 Analyze your Docs, Sheets, Slides, and more       │
└────────────────────────────────────────────────────────┘

┌─────────────────────── Summary Cards ─────────────────┐
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │   📝     │  │   📊     │  │   📽️    │  │  📋   ││
│  │  Docs    │  │  Sheets  │  │  Slides  │  │ Forms  ││
│  │   234    │  │   156    │  │    89    │  │   45   ││
│  └──────────┘  └──────────┘  └──────────┘  └────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────── Filters ───────────────────────┐
│                                                         │
│  Type: [All ▼]  Owner: [All ▼]  Status: [All ▼]       │
│  Last Viewed: [Any ▼]  Shared: [All ▼]                │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────── Files Table ──────────────────────┐
│                                                         │
│  Icon | Name            | Type   | Last Viewed | ... │
│  📝   | Project Plan    | Doc    | 2 days ago  | ... │
│  📊   | Budget 2024     | Sheet  | 1 week ago  | ... │
│  📽️  | Q4 Review       | Slides | 3 months ago| ... │
│  ...                                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Specialized Analyzers

### A. Unused Workspace Files Analyzer

Identifies Google Workspace files not accessed recently:

```javascript
/**
 * Analyze unused Google Workspace files
 * @param {Array} filesData - All files
 * @param {Object} thresholds - Age thresholds
 * @returns {Object} Results with unused files
 */
function analyzeUnusedWorkspaceFiles(filesData, thresholds = {
  six_months: 15768000000,
  one_year: 31536000000,
  two_years: 63072000000
}) {
  const workspaceTypes = [
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.spreadsheet',
    'application/vnd.google-apps.presentation',
    'application/vnd.google-apps.form',
    'application/vnd.google-apps.drawing'
  ];

  const workspaceFiles = filesData.filter(f =>
    workspaceTypes.includes(f.mime_type)
  );

  const now = Date.now();
  const unused = workspaceFiles.filter(f => {
    const lastViewed = new Date(f.last_viewed_date).getTime();
    const ageMs = now - lastViewed;
    return ageMs > thresholds.six_months;
  });

  return {
    count: unused.length,
    total_workspace_files: workspaceFiles.length,
    percentage_unused: (unused.length / workspaceFiles.length * 100).toFixed(1),
    breakdown: {
      six_months: unused.filter(f => ageInMonths(f) >= 6 && ageInMonths(f) < 12).length,
      one_year: unused.filter(f => ageInMonths(f) >= 12 && ageInMonths(f) < 24).length,
      two_years_plus: unused.filter(f => ageInMonths(f) >= 24).length
    },
    files: unused
  };
}
```

### B. Workspace Files by Type

Categorize and count by specific Workspace type:

```javascript
function categorizeWorkspaceFiles(filesData) {
  const categories = {
    documents: [],
    spreadsheets: [],
    presentations: [],
    forms: [],
    drawings: [],
    sites: [],
    scripts: [],
    other: []
  };

  filesData.forEach(file => {
    if (file.mime_type.includes('document')) categories.documents.push(file);
    else if (file.mime_type.includes('spreadsheet')) categories.spreadsheets.push(file);
    else if (file.mime_type.includes('presentation')) categories.presentations.push(file);
    else if (file.mime_type.includes('form')) categories.forms.push(file);
    else if (file.mime_type.includes('drawing')) categories.drawings.push(file);
    else if (file.mime_type.includes('site')) categories.sites.push(file);
    else if (file.mime_type.includes('script')) categories.scripts.push(file);
    else categories.other.push(file);
  });

  return categories;
}
```

### C. Shared Workspace Files

Analyze sharing patterns:

```javascript
function analyzeWorkspaceSharing(filesData) {
  const workspaceFiles = filesData.filter(isWorkspaceFile);

  return {
    total: workspaceFiles.length,
    owned_by_me: workspaceFiles.filter(f => f.owner_is_me).length,
    shared_with_me: workspaceFiles.filter(f => !f.owner_is_me && f.shared).length,
    shared_by_me: workspaceFiles.filter(f => f.owner_is_me && f.shared).length,
    private: workspaceFiles.filter(f => !f.shared).length,
    public: workspaceFiles.filter(f => f.sharing_status === 'Public').length,

    by_type: {
      documents: analyzeTypeSharing(workspaceFiles, 'document'),
      spreadsheets: analyzeTypeSharing(workspaceFiles, 'spreadsheet'),
      presentations: analyzeTypeSharing(workspaceFiles, 'presentation')
    }
  };
}
```

---

## 6. UI Components

### Summary Cards

```jsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <WorkspaceTypeCard
    icon="📝"
    label="Documents"
    count={stats.documents.count}
    unused={stats.documents.unused}
    onClick={() => filterByType('document')}
  />
  <WorkspaceTypeCard
    icon="📊"
    label="Spreadsheets"
    count={stats.spreadsheets.count}
    unused={stats.spreadsheets.unused}
    onClick={() => filterByType('spreadsheet')}
  />
  {/* ... more cards */}
</div>
```

### Filters

```jsx
<div className="flex gap-4 mb-6">
  <Select value={typeFilter} onChange={setTypeFilter}>
    <option value="all">All Workspace Files</option>
    <option value="document">Documents</option>
    <option value="spreadsheet">Spreadsheets</option>
    <option value="presentation">Presentations</option>
    <option value="form">Forms</option>
    <option value="drawing">Drawings</option>
  </Select>

  <Select value={ageFilter} onChange={setAgeFilter}>
    <option value="all">Any Age</option>
    <option value="6m">Not viewed in 6+ months</option>
    <option value="1y">Not viewed in 1+ year</option>
    <option value="2y">Not viewed in 2+ years</option>
  </Select>

  <Select value={ownerFilter} onChange={setOwnerFilter}>
    <option value="all">All Files</option>
    <option value="owned">Owned by me</option>
    <option value="shared">Shared with me</option>
  </Select>
</div>
```

### Actions

```jsx
<DropdownMenu>
  <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={openInDrive}>
      Open in Google Drive
    </DropdownMenuItem>
    <DropdownMenuItem onClick={exportAsPdf}>
      Export as PDF
    </DropdownMenuItem>
    <DropdownMenuItem onClick={exportAsDocx}>
      Export as Word/Excel/PPT
    </DropdownMenuItem>
    <DropdownMenuItem onClick={copyLink}>
      Copy Sharing Link
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={moveToFolder}>
      Move to Folder
    </DropdownMenuItem>
    <DropdownMenuItem onClick={removeAccess}>
      Remove My Access (Shared Files)
    </DropdownMenuItem>
    <DropdownMenuItem onClick={trash} className="text-destructive">
      Move to Trash
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 7. Backend Implementation

### New Analyzer: `analyzeWorkspaceFiles.js`

```javascript
/**
 * Google Workspace Files Analyzer
 * Specialized analysis for Google native file types
 */

function analyzeWorkspaceFiles(filesData) {
  const workspaceFiles = filterWorkspaceFiles(filesData);

  return {
    total_count: workspaceFiles.length,

    // By type
    by_type: categorizeWorkspaceFiles(workspaceFiles),

    // By age
    unused: analyzeUnusedWorkspaceFiles(workspaceFiles),

    // By sharing
    sharing: analyzeWorkspaceSharing(workspaceFiles),

    // Version history quota impact
    quota_usage: analyzeQuotaUsage(workspaceFiles),

    // Files
    files: workspaceFiles
  };
}

function filterWorkspaceFiles(filesData) {
  return filesData.filter(f =>
    f.mime_type && f.mime_type.startsWith('application/vnd.google-apps.')
  );
}
```

---

## 8. Integration with Smart Scan

Add Workspace Files as 6th category:

```javascript
// In scanEngine.js
function runSmartScan(folderId, corpora) {
  // ... existing code

  const results = {
    categories: {
      large_files: analyzeLargeFiles(analysisContext),
      old_files: analyzeOldFiles(analysisContext),
      duplicates: analyzeDuplicates(analysisContext),
      empty_items: analyzeEmptyItems(analysisContext),
      temp_files: analyzeTempFiles(analysisContext),
      workspace_files: analyzeWorkspaceFiles(analysisContext)  // NEW
    }
  };

  // ... rest of code
}
```

---

## 9. Success Criteria

### Functional
- [ ] All Google Workspace file types detected and categorized
- [ ] Accurate count by type (Docs, Sheets, Slides, etc.)
- [ ] Filter by type, age, owner, sharing status
- [ ] Export/conversion links work correctly
- [ ] "Unused" detection based on last viewed date
- [ ] Quota usage shown for version history

### UI/UX
- [ ] Summary cards show counts and unused percentage
- [ ] Filters work smoothly
- [ ] Table sortable by all columns
- [ ] Actions menu functional
- [ ] Responsive design

### Performance
- [ ] Scan 1,000 Workspace files in <10 seconds
- [ ] Filtering instant (<500ms)
- [ ] No impact on existing features

---

## 10. Future Enhancements

### Phase 2
1. **Version History Analysis** - Show files with large version history
2. **Comment Detection** - Files with unresolved comments
3. **Collaboration Metrics** - Number of editors, viewers
4. **Conversion Automation** - Batch export to Office formats
5. **Archive Suggestions** - Workspace files to convert and archive

### Phase 3
1. **Workspace-Specific Recommendations**
   - "You have 45 Google Docs not viewed in 2+ years"
   - "Export and archive old Sheets to save quota (version history)"
2. **Template Detection** - Identify files used as templates
3. **Duplicate Content Detection** - Similar Docs/Sheets by title

---

## 11. Implementation Checklist

### Backend (2 days)
- [ ] Create `analyzeWorkspaceFiles.js` analyzer
- [ ] Implement type categorization
- [ ] Implement unused detection
- [ ] Implement sharing analysis
- [ ] Integrate with Smart Scan
- [ ] Add comprehensive JSDoc
- [ ] Write unit tests

### Frontend (2 days)
- [ ] Create `GoogleWorkspaceView.jsx`
- [ ] Build summary cards component
- [ ] Build filters component
- [ ] Build files table
- [ ] Add export/action menu
- [ ] Add routing
- [ ] Enable feature flag
- [ ] Test responsiveness

---

## 12. File Structure

```
app/
├── server/
│   └── smartScan/
│       ├── scanEngine.js (update)
│       ├── analyzers.js (update)
│       └── workspaceAnalyzer.js (NEW)
│
└── client/
    └── src/
        ├── views/
        │   └── GoogleWorkspaceView.jsx (NEW)
        ├── components/
        │   ├── WorkspaceTypeCard.jsx (NEW)
        │   ├── WorkspaceFilters.jsx (NEW)
        │   └── WorkspaceActions.jsx (NEW)
        └── config/
            └── featureFlags.js (update)
```

---

## 13. Risks & Mitigation

### Risk 1: API Limitations
**Issue**: Some metadata (comments, version count) not in Drive API v2
**Mitigation**: Use available fields, document limitations, plan for API v3 migration

### Risk 2: Export Link Expiry
**Issue**: Export links may expire
**Mitigation**: Generate on-demand, don't cache, show error handling

### Risk 3: Performance with Large Datasets
**Issue**: Many users have 1000s of Workspace files
**Mitigation**: Pagination, virtual scrolling, lazy loading

---

## 14. Timeline

**Week 1:**
- Days 1-2: Backend analyzer implementation
- Days 3-4: Frontend view and components
- Day 5: Integration and testing
- Days 6-7: Documentation and polish

**Total Effort**: 5-7 days

---

## 15. Documentation

Once complete, create:
- [ ] `docs/google-workspace-files-guide.md` - Comprehensive guide
- [ ] Update `docs/smart-scan-guide.md` - Add 6th category
- [ ] Update `docs/README.md` - Add new feature

---

**Priority**: High (addresses core use case)
**Value**: High (many users have primarily Workspace files)
**Complexity**: Medium (well-scoped, uses existing patterns)
