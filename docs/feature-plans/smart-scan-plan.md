# Feature Implementation Plan: Smart Scan - Comprehensive Drive Analysis

**Feature Name**: smart-scan
**Complexity**: Medium-High
**Module**: app/server/smartScan/
**Primary Files**: scanEngine.js, analyzers.js, recommendations.js
**Issue Reference**: GitHub Issue #2

---

## 1. Feature Overview

**Description**: Implement a comprehensive, one-click Drive analysis feature that scans entire Drive or selected folders, categorizes files across multiple dimensions (duplicates, large files, old files, empty items, temp files), calculates potential space savings, and provides smart cleanup recommendations.

**Use Cases**:
- User wants to quickly identify all storage optimization opportunities without manually checking multiple categories
- User needs to see potential space savings before starting cleanup
- User wants automated recommendations for safe file removal
- User needs real-time progress updates during long-running scans

**Success Criteria**:
- ✅ Single-click scan initiation from SmartScanView
- ✅ Real-time progress updates (max 2-3 second intervals)
- ✅ All 5 categories analyzed: large files, old files, duplicates, empty items, temp files
- ✅ Accurate space savings calculations per category
- ✅ Results displayed in visual summary cards
- ✅ Navigation to detailed category views
- ✅ Scan completes for 1,000 files in < 60 seconds
- ✅ Comprehensive JSDoc documentation

---

## 2. Feature Assessment

**Scope**:
- 3 main backend files (scanEngine.js, analyzers.js, recommendations.js)
- 5 analyzer functions (one per category)
- 1 main orchestration function (runSmartScan)
- Progress tracking system
- Frontend integration via google.script.run
- No external GAS libraries required (uses native Drive API v2)

**Complexity**: Medium-High
- 8-10 total functions across 3 files
- No external libraries (self-contained)
- Drive API v2 integration
- Single-pass file analysis (performance optimization)
- Progress callback system
- Category-specific analysis logic

**GAS Compatibility**: ✅ Compatible
- No async/await required (synchronous execution)
- Uses Drive API v2 (already configured)
- No unsupported APIs
- CacheService optional (can add later for performance)
- All operations synchronous

**Estimated Development Time**: 5-7 days

**Dependencies**:
- **CRITICAL**: Issue #1 Enhanced Metadata Collection must be completed first
  - Requires: fileSize, createdDate, modifiedDate, lastViewedByMeDate
  - Without this, analyzers cannot function
- Existing: getFileandFoldersData function (webApp.js)
- Existing: Drive API v2 configuration

---

## 3. Architecture Design

**Module Location**: `app/server/smartScan/`

**File Structure**:
```
app/server/smartScan/
├── scanEngine.js         # Main scan orchestration
├── analyzers.js          # Category-specific analysis functions
└── recommendations.js    # Smart recommendation generation
```

**Public Functions** (exported via globalThis):
1. `runSmartScan(folderId, corpora)` - Main entry point, orchestrates scan
2. `analyzeLargeFiles(filesData, thresholds)` - Identifies files >100MB, >500MB, >1GB
3. `analyzeOldFiles(filesData, ageThresholds)` - Identifies files >1yr, >2yr, >5yr old
4. `analyzeEmptyItems(filesData)` - Identifies 0-byte files and empty folders
5. `analyzeTempFiles(filesData, patterns)` - Identifies temp files by patterns
6. `analyzeDuplicates(filesData, method)` - Identifies duplicates by name+size
7. `generateRecommendations(scanResults)` - Creates smart cleanup recommendations

**Private Functions** (internal helpers with `_` suffix):
1. `createAnalysisContext_(filesData)` - Prepares data structure for analysis
2. `calculateSpaceSavings_(categoryResults)` - Calculates potential space freed
3. `categorizeByPriority_(items, method)` - Sorts items by deletion safety
4. `formatResults_(rawResults)` - Formats results for frontend consumption

**Data Structures**:
- ScanResultsProps (overall scan results)
- CategoryResultProps (per-category results)
- FileAnalysisProps (individual file analysis)
- RecommendationProps (cleanup recommendations)

**Integration Points**:
- Calls existing `getFileandFoldersData(folderId, corpora)` for file retrieval
- Returns results to React via google.script.run async wrapper
- Frontend displays results in SmartScanView dashboard
- Navigation to category detail views (Large Files, Old Files, etc.)

---

## 4. Data Structure Definitions

### ScanResultsProps
```javascript
/**
 * Complete scan results across all categories
 * @typedef {Object} ScanResultsProps
 * @property {boolean} success - Whether scan completed successfully
 * @property {string} folder_id - ID of scanned folder
 * @property {string} folder_name - Name of scanned folder
 * @property {number} total_files_scanned - Total number of files analyzed
 * @property {number} total_space_used_bytes - Total space used by all files
 * @property {number} total_potential_savings_bytes - Sum of all category savings
 * @property {string} scan_date - ISO timestamp of scan completion
 * @property {CategoryResultProps} large_files - Large files analysis
 * @property {CategoryResultProps} old_files - Old files analysis
 * @property {CategoryResultProps} duplicates - Duplicate files analysis
 * @property {CategoryResultProps} empty_items - Empty files/folders analysis
 * @property {CategoryResultProps} temp_files - Temporary files analysis
 * @property {Array<RecommendationProps>} recommendations - Smart cleanup suggestions
 * @property {string|null} error - Error message if scan failed
 */
```

**Example Data**:
```json
{
  "success": true,
  "folder_id": "abc123",
  "folder_name": "My Drive",
  "total_files_scanned": 1234,
  "total_space_used_bytes": 5368709120,
  "total_potential_savings_bytes": 1073741824,
  "scan_date": "2025-11-17T12:00:00.000Z",
  "large_files": { "count": 15, "total_size_bytes": 536870912, "items": [...] },
  "old_files": { "count": 42, "total_size_bytes": 314572800, "items": [...] },
  "duplicates": { "count": 8, "total_size_bytes": 104857600, "items": [...] },
  "empty_items": { "count": 5, "total_size_bytes": 0, "items": [...] },
  "temp_files": { "count": 12, "total_size_bytes": 52428800, "items": [...] },
  "recommendations": [...],
  "error": null
}
```

### CategoryResultProps
```javascript
/**
 * Results for a specific analysis category
 * @typedef {Object} CategoryResultProps
 * @property {number} count - Number of items found in this category
 * @property {number} total_size_bytes - Total size of all items in bytes
 * @property {Array<FileAnalysisProps>} items - Individual file details
 * @property {string} category_name - Human-readable category name
 * @property {string} category_type - Technical category identifier
 */
```

### FileAnalysisProps
```javascript
/**
 * Individual file analysis data
 * @typedef {Object} FileAnalysisProps
 * @property {string} file_id - Drive file ID
 * @property {string} file_name - File name
 * @property {string} mime_type - File MIME type
 * @property {number} size_bytes - File size in bytes
 * @property {string} created_date - ISO timestamp
 * @property {string} modified_date - ISO timestamp
 * @property {string|null} last_viewed_date - ISO timestamp or null
 * @property {string} parent_id - Parent folder ID
 * @property {string} parent_name - Parent folder name
 * @property {Array<string>} matched_criteria - Which detection rules matched
 * @property {string} safety_level - 'safe' | 'review' | 'caution'
 * @property {string|null} recommendation - Suggested action
 */
```

### RecommendationProps
```javascript
/**
 * Smart cleanup recommendation
 * @typedef {Object} RecommendationProps
 * @property {string} recommendation_id - Unique identifier
 * @property {string} category - Which category this relates to
 * @property {string} title - Short recommendation title
 * @property {string} description - Detailed explanation
 * @property {number} estimated_savings_bytes - Space that could be freed
 * @property {number} affected_files_count - Number of files involved
 * @property {string} priority - 'high' | 'medium' | 'low'
 * @property {string} safety_level - 'safe' | 'review' | 'caution'
 * @property {string} action_type - 'delete' | 'archive' | 'review'
 */
```

---

## 5. Function Specifications

### Function 1: runSmartScan

**Purpose**: Main entry point - orchestrates complete Drive scan and analysis

**Signature**:
```javascript
function runSmartScan(folderId, corpora = 'user')
```

**Parameters**:
- `folderId` (string, required): Drive folder ID or 'root' for My Drive
- `corpora` (string, optional): 'user' for My Drive or 'drive' for Shared Drive (default: 'user')

**Returns**:
- `ScanResultsProps` object with complete scan results

**Logic**:
1. Validate inputs (folderId must be non-empty string)
2. Initialize scan context (start time, folder info)
3. Call `getFileandFoldersData(folderId, corpora)` to retrieve all files
4. Create analysis context from files data
5. Run all 5 analyzers in sequence (single-pass over data):
   - analyzeLargeFiles
   - analyzeOldFiles
   - analyzeEmptyItems
   - analyzeTempFiles
   - analyzeDuplicates
6. Calculate total potential savings across categories
7. Generate smart recommendations
8. Format and return complete results object

**Error Handling**:
- Try-catch around file retrieval (handle invalid folder ID)
- Try-catch around each analyzer (partial results if one fails)
- Log errors with console.error
- Return ScanResultsProps with success: false and error message

**JSDoc Requirements**:
- @param {string} folderId - Drive folder ID or 'root'
- @param {string} [corpora='user'] - 'user' or 'drive'
- @returns {ScanResultsProps} Complete scan results
- @throws None (all errors caught and returned in response)
- @example (minimum 3): Basic scan, Shared Drive scan, Error handling

**GAS Constraints**:
- Synchronous execution only (no async/await)
- Single Drive API call via getFileandFoldersData
- Memory-efficient (single pass, no duplicate data storage)
- Execution time: target < 60 seconds for 1,000 files

**globalThis Export**: YES

---

### Function 2: analyzeLargeFiles

**Purpose**: Identify files exceeding size thresholds (100MB, 500MB, 1GB)

**Signature**:
```javascript
function analyzeLargeFiles(filesData, thresholds = { medium: 104857600, large: 524288000, very_large: 1073741824 })
```

**Parameters**:
- `filesData` (Array<Array>, required): 2D array from getFileandFoldersData
- `thresholds` (Object, optional): Size thresholds in bytes
  - medium: 100MB = 104857600 bytes (default)
  - large: 500MB = 524288000 bytes (default)
  - very_large: 1GB = 1073741824 bytes (default)

**Returns**:
- `CategoryResultProps` object with large files results

**Logic**:
1. Filter filesData for files with size_bytes >= thresholds.medium
2. For each large file:
   - Determine which threshold it exceeds (medium/large/very_large)
   - Add to matched_criteria array
   - Calculate safety_level based on file type and age
   - Generate recommendation (review large files, consider archiving)
3. Sum total size of all large files
4. Return CategoryResultProps with count, total_size_bytes, items array

**Error Handling**:
- Validate filesData is array
- Skip files with missing size_bytes property
- Return empty results if no data provided
- Log warnings for malformed data

**JSDoc Requirements**:
- @param {Array<Array>} filesData - File data from Drive scan
- @param {Object} [thresholds] - Size thresholds in bytes
- @returns {CategoryResultProps} Large files analysis results
- @example (minimum 2): Default thresholds, Custom thresholds

**GAS Constraints**:
- Array.filter and Array.map (ES6+ supported in V8)
- No async operations
- Memory-efficient processing (filter in single pass)

**globalThis Export**: YES

---

### Function 3: analyzeOldFiles

**Purpose**: Identify files not modified in 1+ years, 2+ years, 5+ years

**Signature**:
```javascript
function analyzeOldFiles(filesData, ageThresholds = { moderate: 365, old: 730, very_old: 1825 })
```

**Parameters**:
- `filesData` (Array<Array>, required): 2D array from getFileandFoldersData
- `ageThresholds` (Object, optional): Age thresholds in days
  - moderate: 1 year = 365 days (default)
  - old: 2 years = 730 days (default)
  - very_old: 5 years = 1825 days (default)

**Returns**:
- `CategoryResultProps` object with old files results

**Logic**:
1. Get current date: `new Date()`
2. Filter filesData for files where `(currentDate - modifiedDate) >= ageThresholds.moderate`
3. For each old file:
   - Calculate age in days
   - Determine which threshold exceeded (moderate/old/very_old)
   - Add to matched_criteria array
   - Calculate safety_level based on last_viewed_date (if available)
   - Generate recommendation (safe to delete if not viewed in 2+ years)
4. Sum total size of all old files
5. Return CategoryResultProps

**Error Handling**:
- Handle missing modified_date (skip file or use created_date)
- Validate date parsing
- Return empty results if no dates available
- Log warnings for invalid dates

**JSDoc Requirements**:
- @param {Array<Array>} filesData - File data from Drive scan
- @param {Object} [ageThresholds] - Age thresholds in days
- @returns {CategoryResultProps} Old files analysis results
- @example (minimum 2): Default thresholds, Custom thresholds

**GAS Constraints**:
- Date arithmetic (supported in V8)
- No moment.js (use native Date)
- Synchronous processing

**globalThis Export**: YES

---

### Function 4: analyzeEmptyItems

**Purpose**: Identify files with 0 bytes and empty folders

**Signature**:
```javascript
function analyzeEmptyItems(filesData)
```

**Parameters**:
- `filesData` (Array<Array>, required): 2D array from getFileandFoldersData

**Returns**:
- `CategoryResultProps` object with empty items results

**Logic**:
1. Filter filesData for items where:
   - Files: size_bytes === 0 OR size_bytes === null/undefined
   - Folders: mime_type === 'application/vnd.google-apps.folder' AND no children (check against filesData for parentId matches)
2. For each empty item:
   - Add matched_criteria: 'zero_bytes' or 'empty_folder'
   - Calculate safety_level: 'safe' (generally safe to delete)
   - Generate recommendation: 'Safe to delete - no content'
3. Count empty files vs empty folders separately (in matched_criteria)
4. Return CategoryResultProps (total_size_bytes will always be 0)

**Error Handling**:
- Handle missing size_bytes (treat as potentially empty)
- Validate folder detection logic
- Return empty results if no data

**JSDoc Requirements**:
- @param {Array<Array>} filesData - File data from Drive scan
- @returns {CategoryResultProps} Empty items analysis results
- @example (minimum 2): Empty files, Empty folders

**GAS Constraints**:
- Array methods (filter, find)
- Folder detection via MIME type
- Synchronous processing

**globalThis Export**: YES

---

### Function 5: analyzeTempFiles

**Purpose**: Identify temporary files by pattern matching (extensions, prefixes)

**Signature**:
```javascript
function analyzeTempFiles(filesData, patterns = DEFAULT_TEMP_PATTERNS)
```

**Parameters**:
- `filesData` (Array<Array>, required): 2D array from getFileandFoldersData
- `patterns` (Object, optional): Detection patterns
  - extensions: ['.tmp', '.temp', '.bak', '.cache', '.swp', '.swo']
  - prefixes: ['~$', '._', '.~']
  - suffixes: ['~', '.old']
  - exact_names: ['Thumbs.db', '.DS_Store']

**Returns**:
- `CategoryResultProps` object with temp files results

**Logic**:
1. Define DEFAULT_TEMP_PATTERNS constant if not provided
2. Filter filesData for files matching any pattern:
   - Check file_name ends with pattern.extensions
   - Check file_name starts with pattern.prefixes
   - Check file_name ends with pattern.suffixes
   - Check file_name === pattern.exact_names
3. For each temp file:
   - Add matched_criteria with specific pattern matched
   - Calculate safety_level: 'safe' for system temp files, 'review' for user backups
   - Generate recommendation based on pattern type
4. Sum total size of all temp files
5. Return CategoryResultProps

**Error Handling**:
- Validate patterns object structure
- Handle missing file_name
- Return empty results if no patterns provided

**JSDoc Requirements**:
- @param {Array<Array>} filesData - File data from Drive scan
- @param {Object} [patterns] - Detection patterns
- @returns {CategoryResultProps} Temp files analysis results
- @example (minimum 3): Default patterns, Custom patterns, Edge cases

**GAS Constraints**:
- String methods (endsWith, startsWith, toLowerCase)
- RegEx support (for complex patterns)
- Synchronous processing

**globalThis Export**: YES

---

### Function 6: analyzeDuplicates

**Purpose**: Identify duplicate files by name+size matching (fast, no MD5)

**Signature**:
```javascript
function analyzeDuplicates(filesData, method = 'name_size')
```

**Parameters**:
- `filesData` (Array<Array>, required): 2D array from getFileandFoldersData
- `method` (string, optional): Detection method - 'name_size' (only supported method initially)

**Returns**:
- `CategoryResultProps` object with duplicate files results

**Logic**:
1. Create Map<string, Array<FileProps>> grouped by `${file_name}_${size_bytes}`
2. Filter Map for groups with count > 1 (duplicates)
3. For each duplicate group:
   - Keep newest file (highest modified_date) as original
   - Mark others as duplicates with matched_criteria: 'duplicate_name_size'
   - Calculate safety_level: 'review' (user should verify duplicates)
   - Generate recommendation: 'Review duplicates - keep newest version'
4. Flatten duplicate groups into items array
5. Calculate potential savings (size of all duplicates except one per group)
6. Return CategoryResultProps

**Error Handling**:
- Handle missing file_name or size_bytes (skip file)
- Handle identical modified_date (use created_date as tiebreaker)
- Return empty results if insufficient data
- Warn that MD5 method not yet supported

**JSDoc Requirements**:
- @param {Array<Array>} filesData - File data from Drive scan
- @param {string} [method='name_size'] - Detection method
- @returns {CategoryResultProps} Duplicate files analysis results
- @example (minimum 2): Basic duplicates, Edge cases (same name different size)

**GAS Constraints**:
- Map data structure (ES6+)
- Array.sort for date comparison
- Synchronous processing
- No MD5 checksum (Drive API quota impact - future enhancement)

**globalThis Export**: YES

---

### Function 7: generateRecommendations

**Purpose**: Generate smart cleanup recommendations from scan results

**Signature**:
```javascript
function generateRecommendations(scanResults)
```

**Parameters**:
- `scanResults` (Object, required): Partial ScanResultsProps (before recommendations added)

**Returns**:
- `Array<RecommendationProps>` array of recommendations

**Logic**:
1. Analyze each category's results
2. For each category with count > 0:
   - Calculate priority based on potential_savings and safety_level
   - Create recommendation object:
     - High priority: large files + safe to delete (>500MB, not viewed in 1yr)
     - Medium priority: old files + not viewed (>2yrs)
     - Low priority: temp files, empty items
3. Sort recommendations by priority (high → medium → low)
4. Limit to top 5 recommendations
5. Return array of RecommendationProps

**Error Handling**:
- Validate scanResults structure
- Handle missing categories gracefully
- Return empty array if no recommendations possible

**JSDoc Requirements**:
- @param {Object} scanResults - Scan results before recommendations
- @returns {Array<RecommendationProps>} Smart recommendations
- @example (minimum 2): Multiple categories, Single category

**GAS Constraints**:
- Object manipulation
- Array.sort
- Synchronous processing

**globalThis Export**: YES

---

### Private Helper Function 1: createAnalysisContext_

**Purpose**: Transform raw file data into structured analysis format

**Signature**:
```javascript
function createAnalysisContext_(filesData)
```

**Parameters**:
- `filesData` (Array<Array>, required): 2D array from getFileandFoldersData

**Returns**:
- `Array<Object>` array of file objects with standardized properties

**Logic**:
1. Map each file array to object with named properties:
   - Extract: icon, file_name, file_id, parent_name, parent_id, mime_type
   - Add: size_bytes (from Issue #1 enhanced metadata - REQUIRED)
   - Add: created_date, modified_date, last_viewed_date (from Issue #1 - REQUIRED)
2. Filter out items with critical missing data
3. Return array of file objects

**Error Handling**:
- Skip files with missing critical properties
- Log warnings for incomplete data
- Return empty array if all files invalid

**JSDoc Requirements**:
- @private
- @param {Array<Array>} filesData - Raw file data
- @returns {Array<Object>} Structured file objects

**GAS Constraints**:
- Array.map
- Object creation
- Synchronous processing

**globalThis Export**: NO (private helper)

---

### Private Helper Function 2: calculateSpaceSavings_

**Purpose**: Calculate total potential space savings from category results

**Signature**:
```javascript
function calculateSpaceSavings_(categoryResults)
```

**Parameters**:
- `categoryResults` (Object, required): Object containing all 5 category results

**Returns**:
- `number` total potential savings in bytes

**Logic**:
1. Sum total_size_bytes from: large_files, old_files, empty_items, temp_files
2. For duplicates: use special calculation (total_size - one_copy_per_group)
3. Return total as number

**Error Handling**:
- Handle missing category results (treat as 0)
- Validate numeric values

**JSDoc Requirements**:
- @private
- @param {Object} categoryResults - All category results
- @returns {number} Total savings in bytes

**GAS Constraints**:
- Arithmetic operations
- Synchronous processing

**globalThis Export**: NO (private helper)

---

### Private Helper Function 3: categorizeByPriority_

**Purpose**: Sort items by deletion safety and priority

**Signature**:
```javascript
function categorizeByPriority_(items, method)
```

**Parameters**:
- `items` (Array<FileAnalysisProps>, required): Files to categorize
- `method` (string, required): Categorization method ('size' | 'age' | 'safety')

**Returns**:
- `Array<FileAnalysisProps>` sorted array

**Logic**:
1. Sort items based on method:
   - 'size': largest first
   - 'age': oldest first
   - 'safety': safest first
2. Return sorted array

**Error Handling**:
- Validate method parameter
- Handle missing sort properties
- Return original array if method invalid

**JSDoc Requirements**:
- @private
- @param {Array<FileAnalysisProps>} items - Items to sort
- @param {string} method - Sort method
- @returns {Array<FileAnalysisProps>} Sorted items

**GAS Constraints**:
- Array.sort
- Comparator functions

**globalThis Export**: NO (private helper)

---

### Private Helper Function 4: formatResults_

**Purpose**: Format raw analysis results for frontend consumption

**Signature**:
```javascript
function formatResults_(rawResults)
```

**Parameters**:
- `rawResults` (Object, required): Unformatted scan results

**Returns**:
- `ScanResultsProps` formatted results

**Logic**:
1. Add human-readable dates
2. Add formatted size strings (e.g., "1.2 GB")
3. Add category summaries
4. Add metadata (scan_date, folder_name)
5. Return complete ScanResultsProps object

**Error Handling**:
- Handle missing properties
- Provide default values

**JSDoc Requirements**:
- @private
- @param {Object} rawResults - Raw results
- @returns {ScanResultsProps} Formatted results

**GAS Constraints**:
- Object manipulation
- Date formatting

**globalThis Export**: NO (private helper)

---

## 6. Implementation Checklist

Ordered by dependency (implement lower-level functions first):

**Data Structures & Constants**:
- [ ] Define all custom types (JSDoc @typedef) in scanEngine.js header
- [ ] Define DEFAULT_TEMP_PATTERNS constant in analyzers.js
- [ ] Define default thresholds for large files and old files

**Private Helper Functions** (build foundation first):
- [ ] Implement createAnalysisContext_ (convert arrays to objects)
- [ ] Implement calculateSpaceSavings_ (sum category results)
- [ ] Implement categorizeByPriority_ (sorting logic)
- [ ] Implement formatResults_ (formatting for frontend)

**Analyzer Functions** (core analysis logic):
- [ ] Implement analyzeLargeFiles in analyzers.js
- [ ] Implement analyzeOldFiles in analyzers.js
- [ ] Implement analyzeEmptyItems in analyzers.js
- [ ] Implement analyzeTempFiles in analyzers.js
- [ ] Implement analyzeDuplicates in analyzers.js

**Recommendation Engine**:
- [ ] Implement generateRecommendations in recommendations.js

**Main Orchestration**:
- [ ] Implement runSmartScan in scanEngine.js
- [ ] Wire up all analyzers in correct order
- [ ] Add error handling and try-catch blocks

**Integration**:
- [ ] Add globalThis exports for all public functions
- [ ] Add file headers with @fileoverview to all 3 files
- [ ] Test integration with existing getFileandFoldersData

**Quality Checks**:
- [ ] Run ESLint: `pnpm run lint`
- [ ] Fix any linting errors: `pnpm run lint:fix`
- [ ] Verify all JSDoc tags present and accurate
- [ ] Verify snake_case for all data properties
- [ ] Verify camelCase for all function names

**Build & Deploy**:
- [ ] Run build: `pnpm run build`
- [ ] Verify dist/ output includes all 3 files
- [ ] Deploy to GAS: `pnpm run push`

---

## 7. Risk Assessment

### High-Risk Items

#### Risk 1: Issue #1 Dependency - Enhanced Metadata
**Severity**: CRITICAL | **Likelihood**: High

**Scenario**: If Issue #1 (Enhanced Metadata Collection) is not completed, the analyzers will fail because they require:
- `size_bytes` (for large files, space calculations)
- `created_date` (for age calculations)
- `modified_date` (for old files detection)
- `last_viewed_date` (for safety recommendations)

**Mitigation**:
- **STOP WORK if Issue #1 not complete** - this is a hard dependency
- Verify `getFileandFoldersData` returns enhanced metadata before starting
- Add validation in `createAnalysisContext_` to check for required fields
- If metadata missing, return clear error message

**Acceptance Criteria for Issue #1**:
- ✅ `getFileandFoldersData` returns size_bytes for all files
- ✅ `getFileandFoldersData` returns created_date and modified_date
- ✅ `getFileandFoldersData` returns last_viewed_date (or null if not available)

---

#### Risk 2: Execution Time Limits
**Severity**: High | **Likelihood**: Medium

**Scenario**: GAS functions have a 6-minute execution limit. Large folders (5,000+ files) could timeout.

**Mitigation**:
- Single-pass analysis (iterate files once, run all analyzers)
- Avoid storing duplicate data in memory
- Use efficient data structures (Map for duplicates)
- Test with progressively larger folders: 100 → 500 → 1,000 → 2,000 files
- If timeout occurs, implement chunked processing (future enhancement)

**Performance Targets**:
- 1,000 files: < 60 seconds ✅
- 2,000 files: < 120 seconds ⚠️
- 5,000 files: < 300 seconds (5 minutes) ⚠️

---

#### Risk 3: Memory Limits
**Severity**: Medium | **Likelihood**: Low

**Scenario**: Apps Script has ~250MB memory limit. Very large scans could exceed this.

**Mitigation**:
- Process files in single pass (don't duplicate arrays)
- Use Array.filter and Array.map (lazy evaluation)
- Don't store entire results in variables until final return
- Monitor memory usage during testing
- If memory issues occur, implement streaming results (future enhancement)

---

#### Risk 4: Duplicate Detection Accuracy
**Severity**: Medium | **Likelihood**: Medium

**Scenario**: Name+size matching produces false positives (different files, same name+size).

**Mitigation**:
- Clearly label method as 'name_size' (not MD5)
- Set safety_level to 'review' (user must verify)
- Provide side-by-side comparison in future UI
- Document limitation in JSDoc and recommendations
- Plan for MD5 checksum method in Phase 2 (future enhancement)

**User Communication**:
- "Duplicates detected by name and size - review before deleting"
- "For more accurate duplicate detection, upgrade to MD5 comparison (coming soon)"

---

#### Risk 5: Date Parsing Errors
**Severity**: Medium | **Likelihood**: Low

**Scenario**: Drive API returns dates in various formats, parsing could fail.

**Mitigation**:
- Use `new Date(dateString)` for ISO 8601 parsing
- Add try-catch around date parsing
- Fall back to created_date if modified_date fails
- Log warnings for unparseable dates
- Skip files with no valid dates (don't crash analyzer)

**Validation**:
- Test with various date formats
- Test with missing dates (null/undefined)
- Verify timezone handling

---

### Medium-Risk Items

#### Risk 6: Temp File Pattern Coverage
**Severity**: Low | **Likelihood**: Medium

**Scenario**: DEFAULT_TEMP_PATTERNS might miss some temporary file types.

**Mitigation**:
- Start with comprehensive default patterns (see Function 5 spec)
- Allow custom patterns parameter
- Document pattern syntax in JSDoc
- Plan for user-configurable patterns (future enhancement)
- Test with real Drive folders to identify missing patterns

**Pattern Review**:
- Extensions: .tmp, .temp, .bak, .backup, .cache, .swp, .swo, .old
- Prefixes: ~$, ._, .~
- Suffixes: ~
- Exact names: Thumbs.db, .DS_Store, desktop.ini

---

## 8. Integration Notes

### Backend to Frontend Communication

**Server (GAS) - Synchronous**:
```javascript
// scanEngine.js
function runSmartScan(folderId, corpora) {
  // Synchronous implementation
  const results = { success: true, data: {...} };
  return results;
}

// Export to globalThis
globalThis.runSmartScan = runSmartScan;
```

**Client (React) - Async Wrapper** (useSmartScan.js):
```javascript
async function runSmartScanAsync(folderId, corpora) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      .runSmartScan(folderId, corpora);
  });
}
```

**TanStack Query Integration** (useSmartScan.js):
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['smartScan', folderId],
  queryFn: () => runSmartScanAsync(folderId, 'user'),
  enabled: !!folderId,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

### No Triggers Required

Smart Scan is user-initiated only (no automatic/scheduled scans).

---

### No Web App Configuration Changes

Uses existing `doGet()` and web app deployment.

---

### Future Enhancement: Progress Tracking

**Note**: Issue #2 requirements include real-time progress updates, but this requires a different architecture (polling or Server-Sent Events). For Phase 1 implementation, we'll return results after scan completes.

**Future Implementation** (Phase 2):
1. Implement progress tracking in GAS (store state in CacheService)
2. Add `getSmartScanProgress(scanId)` function
3. Frontend polls progress every 2 seconds
4. Display progress modal with files_scanned / total_files

---

## 9. Testing Strategy

### Unit Testing (via `clasp run`)

**Test Each Analyzer Individually**:

```javascript
// Test analyzeLargeFiles
clasp run analyzeLargeFiles --params '[[[..sample file data..]], {"medium": 100000000}]'

// Expected output:
// { count: 3, total_size_bytes: 1500000000, items: [...] }
```

**Test Cases**:
1. `analyzeLargeFiles` with default thresholds → verify correct categorization
2. `analyzeLargeFiles` with custom thresholds → verify custom logic
3. `analyzeOldFiles` with files from various dates → verify age calculation
4. `analyzeOldFiles` with missing dates → verify fallback logic
5. `analyzeEmptyItems` with 0-byte files → verify detection
6. `analyzeEmptyItems` with empty folders → verify folder detection
7. `analyzeTempFiles` with various patterns → verify pattern matching
8. `analyzeTempFiles` with edge cases (dots in names) → verify false positives
9. `analyzeDuplicates` with duplicate name+size → verify grouping
10. `analyzeDuplicates` with same name different size → verify exclusion
11. `generateRecommendations` with multiple categories → verify prioritization
12. `generateRecommendations` with single category → verify edge case

**Test runSmartScan Integration**:
```javascript
clasp run runSmartScan --params '["folder_id_here", "user"]'

// Expected output:
// ScanResultsProps object with all categories populated
```

---

### Integration Testing

**Full Scan with Real Drive Folder**:
1. Create test folder with known files:
   - 3 large files (>100MB, >500MB, >1GB)
   - 5 old files (1yr, 2yr, 5yr old)
   - 2 duplicate files (same name+size)
   - 3 empty files (0 bytes)
   - 4 temp files (.tmp, ~$doc, .bak, Thumbs.db)
2. Run `runSmartScan(testFolderId, 'user')`
3. Verify results match expected counts
4. Verify space savings calculations correct

**Frontend Integration** (SmartScanView.jsx):
1. Trigger scan from UI
2. Verify results load in dashboard
3. Verify summary cards display correct counts
4. Verify navigation to category views works
5. Test error handling (invalid folder ID)

---

### Edge Cases

**Edge Case 1: Empty Folder (No Files)**
- Input: Folder with 0 files
- Expected: All categories return count: 0, graceful message

**Edge Case 2: Files with Missing Metadata**
- Input: Files missing size_bytes or modified_date
- Expected: Skip files with critical missing data, log warnings, continue scan

**Edge Case 3: Very Large Folder (5,000+ Files)**
- Input: Folder with 5,000 files
- Expected: Scan completes within 6-minute limit or returns partial results with timeout message

**Edge Case 4: Shared Drive vs My Drive**
- Input: Test both `corpora='user'` and `corpora='drive'`
- Expected: Scan works correctly for both types

**Edge Case 5: Files with Identical Modified Dates**
- Input: Duplicate files with same modified_date
- Expected: Use created_date as tiebreaker for "newest" detection

**Edge Case 6: Zero Results in All Categories**
- Input: Folder with no large/old/duplicate/empty/temp files
- Expected: All categories return count: 0, recommendations array empty, graceful message

---

### Performance Testing

**Benchmark Tests**:
1. Measure execution time for various folder sizes:
   - 100 files → target < 10 seconds
   - 500 files → target < 30 seconds
   - 1,000 files → target < 60 seconds
   - 2,000 files → target < 120 seconds
2. Monitor memory usage (GAS execution logs)
3. Verify single-pass efficiency (should iterate files once)

**Optimization Checks**:
- [ ] Analyzers called in correct order (most efficient first)
- [ ] No duplicate data storage
- [ ] Efficient data structures (Map for duplicates)
- [ ] Early returns for empty data

---

### Manual Testing Checklist

**Backend Testing**:
- [ ] Run `runSmartScan` with valid folder ID → success
- [ ] Run `runSmartScan` with invalid folder ID → error message
- [ ] Run `runSmartScan` with 'root' → My Drive scan
- [ ] Run each analyzer function individually → correct results
- [ ] Run with large folder (1,000+ files) → completes without timeout
- [ ] Verify all 5 categories return results
- [ ] Verify space savings calculations correct
- [ ] Verify recommendations generated

**Frontend Testing** (after integration):
- [ ] Navigate to /smart-scan → view loads
- [ ] Click "Start Scan" → scan initiates
- [ ] Verify loading state during scan
- [ ] Verify results dashboard displays after completion
- [ ] Verify all 5 summary cards show correct data
- [ ] Click "View Details" on each card → navigates to category
- [ ] Verify error handling for scan failures
- [ ] Verify retry functionality

---

## 10. Success Criteria Verification

### Functional Requirements
- [ ] Single-click scan initiation via `runSmartScan(folderId, corpora)`
- [ ] All 5 categories analyzed: large, old, duplicates, empty, temp
- [ ] Accurate space savings calculations (verified with test data)
- [ ] Results returned in ScanResultsProps format
- [ ] Recommendations generated automatically
- [ ] Integration with existing `getFileandFoldersData` works
- [ ] Error handling returns meaningful error messages

### Non-Functional Requirements
- [ ] Performance: Complete scan of 1,000 files in < 60 seconds
- [ ] Memory: No memory limit errors during testing
- [ ] Reliability: Handles missing metadata gracefully
- [ ] Maintainability: Clear separation of concerns (scanEngine, analyzers, recommendations)

### Code Quality
- [ ] All functions have comprehensive JSDoc documentation
- [ ] All data properties use snake_case
- [ ] All function names use camelCase
- [ ] Private helpers use trailing underscore suffix
- [ ] File headers with @fileoverview present
- [ ] ESLint passes with no errors: `pnpm run lint`
- [ ] Code builds successfully: `pnpm run build`
- [ ] All globalThis exports added correctly

### Documentation
- [ ] JSDoc completeness score ≥ 8/10
- [ ] All public functions have @example tags (minimum 2 examples each)
- [ ] All parameters documented with types
- [ ] All return values documented
- [ ] Error conditions documented in @throws (or "None" if caught)

---

## 11. Implementation Timeline

**Day 1-2: Data Structures & Analyzers Foundation**
- Define all TypeDefs in scanEngine.js
- Implement private helpers (createAnalysisContext_, calculateSpaceSavings_, etc.)
- Implement analyzeLargeFiles and analyzeOldFiles
- Unit test both analyzers with sample data

**Day 3: Analyzers Completion**
- Implement analyzeEmptyItems
- Implement analyzeTempFiles
- Implement analyzeDuplicates
- Unit test all 3 analyzers with sample data

**Day 4: Orchestration & Recommendations**
- Implement generateRecommendations
- Implement runSmartScan main orchestration
- Wire up all analyzers in correct order
- Add comprehensive error handling

**Day 5-6: Integration & Testing**
- Add globalThis exports
- Test integration with `getFileandFoldersData`
- Build and deploy to GAS
- Run integration tests with real Drive folders
- Performance testing with 1,000+ files

**Day 7: Quality & Documentation**
- Run ESLint and fix errors
- Verify JSDoc completeness
- Review code quality
- Final testing and validation
- Update GitHub issue with completion notes

**Total Effort**: 5-7 days

---

## 12. File Structure Reference

```
app/server/smartScan/
├── scanEngine.js
│   ├── @fileoverview Smart Scan main orchestration
│   ├── Type Definitions (all @typedef)
│   ├── Constants (thresholds, defaults)
│   ├── runSmartScan (main entry point)
│   ├── createAnalysisContext_ (helper)
│   ├── calculateSpaceSavings_ (helper)
│   └── formatResults_ (helper)
│
├── analyzers.js
│   ├── @fileoverview File analysis functions for each category
│   ├── DEFAULT_TEMP_PATTERNS constant
│   ├── analyzeLargeFiles
│   ├── analyzeOldFiles
│   ├── analyzeEmptyItems
│   ├── analyzeTempFiles
│   ├── analyzeDuplicates
│   └── categorizeByPriority_ (helper)
│
└── recommendations.js
    ├── @fileoverview Smart recommendation generation
    ├── generateRecommendations
    └── (future: prioritization helpers)
```

---

## 13. Future Enhancements (Out of Scope for Phase 1)

**Phase 2 Enhancements**:
1. **Real-time Progress Tracking**
   - Implement progress callbacks during scan
   - Store progress in CacheService
   - Frontend polling for progress updates
   - Progress modal with ETA

2. **MD5 Duplicate Detection**
   - Use Drive API MD5 checksum field
   - More accurate duplicate detection
   - Higher API quota usage (trade-off)

3. **User-Configurable Thresholds**
   - Allow users to set custom size/age thresholds
   - Store preferences in PropertiesService
   - UI for threshold configuration

4. **Scan History**
   - Store past scan results
   - Compare scans over time
   - Show storage trends

5. **Batch Processing for Large Folders**
   - Chunked scanning for 10,000+ files
   - Resume from last scanned position
   - Incremental results

---

## Appendix A: Drive API v2 Field Reference

**Current Fields** (from `getItemsForFolderArray_`):
```javascript
fields: `items(id, title, mimeType, parents(id), alternateLink), nextPageToken`
```

**Enhanced Fields Required** (Issue #1 - CRITICAL DEPENDENCY):
```javascript
fields: `items(
  id,
  title,
  mimeType,
  parents(id),
  alternateLink,
  fileSize,           // Required for large files analyzer
  createdDate,        // Required for age calculations
  modifiedDate,       // Required for old files analyzer
  lastViewedByMeDate  // Optional for recommendations
), nextPageToken`
```

**Reference**: [Drive API v2 Files.list](https://developers.google.com/drive/api/v2/reference/files/list)

---

## Appendix B: Example Function Calls

**Example 1: Basic Scan**
```javascript
const results = runSmartScan('abc123', 'user');
// Returns: ScanResultsProps with all categories
```

**Example 2: Shared Drive Scan**
```javascript
const results = runSmartScan('shared_drive_id', 'drive');
// Returns: ScanResultsProps for Shared Drive
```

**Example 3: My Drive Root**
```javascript
const results = runSmartScan('root', 'user');
// Returns: ScanResultsProps for entire My Drive
```

**Example 4: Custom Thresholds**
```javascript
const filesData = getFileandFoldersData('abc123', 'user');
const largeFiles = analyzeLargeFiles(filesData, {
  medium: 50000000,    // 50MB
  large: 200000000,    // 200MB
  very_large: 500000000 // 500MB
});
// Returns: CategoryResultProps with custom thresholds
```

---

**Plan Complete**
**Ready for**: Phase 2 (Building)

---

**Plan Metadata**:
- **Created**: 2025-11-17
- **Feature**: Smart Scan - Comprehensive Drive Analysis
- **Issue**: GitHub Issue #2
- **Dependencies**: Issue #1 Enhanced Metadata Collection (CRITICAL)
- **Estimated Effort**: 5-7 days
- **Complexity**: Medium-High
- **Files**: 3 (scanEngine.js, analyzers.js, recommendations.js)
- **Functions**: 11 total (7 public, 4 private)
- **Lines of Code**: ~600-800 (estimated)
