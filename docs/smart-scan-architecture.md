# Smart Scan - Architecture & Flow Diagram

**Version:** 1.0.0
**Last Updated:** 2025-11-18

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌────────────────────┐         ┌───────────────────────────┐  │
│  │  SmartScanView.jsx │────────▶│  useSmartScan() Hook      │  │
│  │  (User Interface)  │         │  - State Management       │  │
│  └────────────────────┘         │  - Error Handling         │  │
│                                  │  - Loading States         │  │
│                                  └─────────┬─────────────────┘  │
└──────────────────────────────────────────│─────────────────────┘
                                            │
                              google.script.run (RPC)
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Google Apps Script)                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    scanEngine.js                         │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │          runSmartScan(folderId, corpora)           │ │   │
│  │  │                                                     │ │   │
│  │  │  1. Fetch Files                                    │ │   │
│  │  │     └─▶ getFileandFoldersData()                    │ │   │
│  │  │         ├─▶ Drive API v2                           │ │   │
│  │  │         └─▶ Returns 15-element arrays              │ │   │
│  │  │                                                     │ │   │
│  │  │  2. Parse Metadata                                 │ │   │
│  │  │     └─▶ createAnalysisContext_()                   │ │   │
│  │  │         └─▶ Structured file objects                │ │   │
│  │  │                                                     │ │   │
│  │  │  3. Run Analyzers (Parallel)                       │ │   │
│  │  │     ├─▶ analyzeLargeFiles()      ─────┐            │ │   │
│  │  │     ├─▶ analyzeOldFiles()         ────┤            │ │   │
│  │  │     ├─▶ analyzeEmptyItems()       ────┼─▶ Results  │ │   │
│  │  │     ├─▶ analyzeTempFiles()        ────┤            │ │   │
│  │  │     └─▶ analyzeDuplicates()       ────┘            │ │   │
│  │  │                                                     │ │   │
│  │  │  4. Calculate Savings                              │ │   │
│  │  │     └─▶ calculateSpaceSavings_()                   │ │   │
│  │  │                                                     │ │   │
│  │  │  5. Generate Recommendations                       │ │   │
│  │  │     └─▶ generateRecommendations()                  │ │   │
│  │  │                                                     │ │   │
│  │  │  6. Return Results                                 │ │   │
│  │  │     └─▶ {success, data}                            │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     analyzers.js                         │   │
│  │  - analyzeLargeFiles()                                   │   │
│  │  - analyzeOldFiles()                                     │   │
│  │  - analyzeEmptyItems()                                   │   │
│  │  - analyzeTempFiles()                                    │   │
│  │  - analyzeDuplicates()                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  recommendations.js                      │   │
│  │  - generateRecommendations()                             │   │
│  │  - Priority ranking                                      │   │
│  │  - Safety assessment                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                            │
                                            │
                              ┌─────────────▼───────────────┐
                              │   Google Drive API v2       │
                              │   - File metadata           │
                              │   - Folder structure        │
                              │   - Enhanced fields         │
                              └─────────────────────────────┘
```

---

## Execution Flow

```
START
  │
  ├─ User clicks "Run Smart Scan" button
  │
  ├─ Frontend calls runSmartScan(folderId, corpora)
  │
  ▼
┌──────────────────────────────────┐
│  1. FETCH FILES                  │
│  getFileandFoldersData()         │
│  ├─ Query Drive API              │
│  ├─ Fetch all files recursively  │
│  └─ Return 2D array              │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  2. PARSE METADATA               │
│  createAnalysisContext_()        │
│  ├─ Transform arrays to objects  │
│  ├─ Extract enhanced metadata    │
│  ├─ Calculate age                │
│  └─ Return structured files      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  3. RUN ANALYZERS (Parallel)     │
│  ┌──────────────────────────┐   │
│  │ analyzeLargeFiles()      │   │
│  │  ├─ Filter by size       │   │
│  │  ├─ Categorize (M/L/VL)  │   │
│  │  └─ Return results       │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ analyzeOldFiles()        │   │
│  │  ├─ Calculate age        │   │
│  │  ├─ Filter by threshold  │   │
│  │  └─ Return results       │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ analyzeEmptyItems()      │   │
│  │  ├─ Find 0-byte files    │   │
│  │  ├─ Find empty folders   │   │
│  │  └─ Return results       │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ analyzeTempFiles()       │   │
│  │  ├─ Pattern matching     │   │
│  │  ├─ Extension check      │   │
│  │  └─ Return results       │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ analyzeDuplicates()      │   │
│  │  ├─ Group by name+size   │   │
│  │  ├─ Mark keep/duplicate  │   │
│  │  └─ Return results       │   │
│  └──────────────────────────┘   │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  4. CALCULATE SPACE SAVINGS      │
│  calculateSpaceSavings_()        │
│  ├─ Sum duplicates wasted        │
│  ├─ Sum temp files               │
│  ├─ Total bytes                  │
│  └─ Format human-readable        │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  5. GENERATE RECOMMENDATIONS     │
│  generateRecommendations()       │
│  ├─ Prioritize by impact         │
│  ├─ Assess safety level          │
│  ├─ Create action steps          │
│  └─ Return top 5                 │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  6. RETURN RESULTS               │
│  {                               │
│    success: true,                │
│    data: {                       │
│      scan_metadata,              │
│      categories,                 │
│      space_savings,              │
│      recommendations             │
│    }                             │
│  }                               │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  7. FRONTEND RENDERS             │
│  ├─ Update state                 │
│  ├─ Display results              │
│  ├─ Show recommendations         │
│  └─ Enable navigation            │
└──────────────────────────────────┘
           │
           ▼
          END
```

---

## Data Transformation Pipeline

```
DRIVE API RESPONSE (Raw)
   │
   │  15-element arrays:
   │  [icon, name, size, category, modified, created, viewed,
   │   owner, sharing, starred, parent, id, link, mime, sizeBytes]
   │
   ▼
createAnalysisContext_()
   │
   │  Transforms to objects:
   │  {
   │    file_id, file_name, mime_type,
   │    size_bytes, size_formatted,
   │    created_date, modified_date, last_viewed_date,
   │    age_days, is_folder, parent_name, ...
   │  }
   │
   ▼
ANALYZERS (Process Objects)
   │
   │  Each analyzer filters and processes:
   │  - analyzeLargeFiles()   → files.filter(f => f.size_bytes > threshold)
   │  - analyzeOldFiles()     → files.filter(f => f.age_days > threshold)
   │  - analyzeEmptyItems()   → files.filter(f => f.size_bytes === 0)
   │  - analyzeTempFiles()    → files.filter(f => matchesPattern(f.file_name))
   │  - analyzeDuplicates()   → groupBy(files, f => f.name + f.size)
   │
   ▼
CATEGORY RESULTS
   │
   │  Standardized format:
   │  {
   │    count, space_used_bytes, space_used_formatted,
   │    breakdown: { ... },
   │    files: [ { file details } ]
   │  }
   │
   ▼
AGGREGATION
   │
   │  Combine all results:
   │  - Scan metadata
   │  - 5 category results
   │  - Space savings calculation
   │  - Recommendations generation
   │
   ▼
FINAL RESPONSE
   │
   └─▶ Sent back to frontend
```

---

## Component Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                          scanEngine.js                           │
│                                                                   │
│  Orchestrates the entire scan process                            │
│                                                                   │
│  Exports:                                                         │
│  ├─ runSmartScan(folderId, corpora)  [Public API]               │
│  │                                                                │
│  Internal Functions:                                              │
│  ├─ createAnalysisContext_()     [Data transformation]          │
│  └─ calculateSpaceSavings_()     [Aggregation]                  │
│                                                                   │
│  Dependencies:                                                    │
│  ├─ getFileandFoldersData()      [External - driveApiHelpers]  │
│  ├─ All 5 analyzers               [analyzers.js]                │
│  └─ generateRecommendations()     [recommendations.js]          │
└─────────────────────────────────────────────────────────────────┘
                           │                    │
          ┌────────────────┴─────┐    ┌────────┴──────────┐
          ▼                      ▼    ▼                    ▼
┌──────────────────────┐   ┌────────────────────────────────────┐
│   analyzers.js       │   │      recommendations.js             │
│                      │   │                                     │
│  5 Analyzer Functions│   │  Recommendation Generator           │
│                      │   │                                     │
│  Exports:            │   │  Exports:                           │
│  ├─ analyzeLargeFiles│   │  └─ generateRecommendations()      │
│  ├─ analyzeOldFiles  │   │                                     │
│  ├─ analyzeEmptyItems│   │  Receives:                          │
│  ├─ analyzeTempFiles │   │  └─ Complete scan results           │
│  └─ analyzeDuplicates│   │                                     │
│                      │   │  Returns:                           │
│  Each returns:       │   │  └─ Prioritized recommendations     │
│  └─ CategoryResult   │   │     (max 5, ranked by impact)       │
└──────────────────────┘   └────────────────────────────────────┘
```

---

## Analyzer Logic Flow

### Large Files Analyzer

```
analyzeLargeFiles(filesData, thresholds)
  │
  ├─ Load thresholds (default or custom)
  │  ├─ medium: 100MB
  │  ├─ large: 500MB
  │  └─ very_large: 1GB
  │
  ├─ Filter files with size > 0
  │
  ├─ Categorize each file
  │  ├─ size >= 1GB      → very_large
  │  ├─ size >= 500MB    → large
  │  ├─ size >= 100MB    → medium
  │  └─ else             → skip
  │
  ├─ Calculate totals per category
  │
  └─ Return {count, space_used, breakdown, files}
```

### Duplicates Analyzer

```
analyzeDuplicates(filesData, method)
  │
  ├─ Create Map for grouping
  │  key = fileName + "_" + sizeBytes
  │
  ├─ Group files by key
  │  └─ Map: key → [file1, file2, ...]
  │
  ├─ Filter groups with >1 file
  │
  ├─ For each duplicate group:
  │  ├─ Sort by modified_date (newest first)
  │  ├─ Mark first as "keep"
  │  └─ Mark rest as "duplicate"
  │
  ├─ Calculate wasted space
  │  └─ (total size) - (1 copy per group)
  │
  └─ Return {count, space_wasted, duplicate_groups, files}
```

### Temp Files Analyzer

```
analyzeTempFiles(filesData, patterns)
  │
  ├─ Load patterns (default or custom)
  │  ├─ extensions: ['.tmp', '.bak', ...]
  │  ├─ prefixes: ['~$', '.~', ...]
  │  ├─ suffixes: ['~', ...]
  │  └─ exact_names: ['Thumbs.db', ...]
  │
  ├─ For each file:
  │  ├─ Check exact name match
  │  ├─ Check extension match
  │  ├─ Check prefix match
  │  └─ Check suffix match
  │
  ├─ Categorize matches
  │
  └─ Return {count, space_used, breakdown, files}
```

---

## Recommendation Priority Algorithm

```
generateRecommendations(scanResults)
  │
  ├─ Extract all categories
  │
  ├─ For each category with files:
  │  │
  │  ├─ Calculate impact score
  │  │  ├─ Space: bytes saved
  │  │  └─ Count: number of files
  │  │
  │  ├─ Determine priority
  │  │  ├─ High:   >500MB OR >50 files
  │  │  ├─ Medium: 100-500MB OR 10-50 files
  │  │  └─ Low:    <100MB AND <10 files
  │  │
  │  ├─ Assign safety level
  │  │  ├─ Safe:    temp_files, empty_items
  │  │  ├─ Review:  duplicates, old_files, large_files
  │  │  └─ Caution: (reserved for future)
  │  │
  │  └─ Create recommendation object
  │
  ├─ Sort by priority (high → medium → low)
  │
  ├─ Take top 5
  │
  └─ Return recommendations array
```

---

## Error Handling Flow

```
runSmartScan()
  │
  ├─ try {
  │  │
  │  ├─ Fetch files
  │  │  └─ catch → Return {success: false, error: "Fetch failed"}
  │  │
  │  ├─ Parse metadata
  │  │  └─ Warning if missing fields (continues with defaults)
  │  │
  │  ├─ Run analyzers
  │  │  └─ Each analyzer has try-catch
  │  │      └─ Returns empty result on error
  │  │
  │  ├─ Calculate savings
  │  │
  │  └─ Generate recommendations
  │
  │  } catch (error) {
  │     Logger.log('Scan error:', error)
  │     return {success: false, error: error.message}
  │  }
  │
  └─ Return {success: true, data: {...}}
```

---

## Performance Optimizations

### Single-Pass Architecture

```
Traditional Approach (Multiple Passes):
  Files → Analyzer 1 (full scan)
  Files → Analyzer 2 (full scan)  ❌ Slow
  Files → Analyzer 3 (full scan)
  ...

Smart Scan Approach (Single Pass):
  Files → Parse Once → {
    Analyzer 1 (filters only) ✓
    Analyzer 2 (filters only) ✓ Fast
    Analyzer 3 (filters only) ✓
  }
```

### Memory Efficiency

```
Traditional: Each analyzer stores full file list
  Analyzer 1: [ ...all files... ]
  Analyzer 2: [ ...all files... ]  ❌ High memory
  Total: N × 5 copies

Smart Scan: Single shared array
  filesData: [ ...all files... ]
  Analyzers: filter() on demand    ✓ Low memory
  Total: N × 1 copy
```

---

## Extension Points

```
┌────────────────────────────────────────┐
│  Future Enhancement Hooks              │
├────────────────────────────────────────┤
│  1. Custom Analyzers                   │
│     └─ Add new analyzer functions      │
│        in analyzers.js                 │
│                                         │
│  2. MD5 Duplicate Detection            │
│     └─ analyzeDuplicates(_, 'md5')     │
│                                         │
│  3. Progress Callbacks                 │
│     └─ runSmartScan(_, _, onProgress)  │
│                                         │
│  4. Selective Analysis                 │
│     └─ runSmartScan(_, _, {            │
│           enabledAnalyzers: [...]      │
│        })                               │
│                                         │
│  5. Custom Thresholds UI               │
│     └─ Pass user-defined thresholds    │
│        to each analyzer                │
└────────────────────────────────────────┘
```

---

## Summary

**Architecture Highlights:**
- ✅ **Modular Design**: 3 files, clear separation of concerns
- ✅ **Single-Pass**: All analyzers process same data once
- ✅ **Parallel Processing**: Analyzers run independently
- ✅ **Graceful Degradation**: Works with or without enhanced metadata
- ✅ **Error Resilient**: Try-catch at multiple levels
- ✅ **Extensible**: Easy to add new analyzers or features

**Performance:**
- 1,000 files in ~20 seconds
- Memory-efficient (single data copy)
- No external dependencies
- GAS V8 runtime compatible

---

**See Also:**
- [Developer Guide](./smart-scan-guide.md)
- [Quick Reference](./smart-scan-quick-reference.md)
- [Build Notes](./build-notes/smart-scan-build.md)
