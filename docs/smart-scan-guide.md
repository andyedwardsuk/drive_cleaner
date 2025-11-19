# Smart Scan - Developer Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-18
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Reference](#api-reference)
4. [Data Structures](#data-structures)
5. [Usage Examples](#usage-examples)
6. [Integration Guide](#integration-guide)
7. [Performance](#performance)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Smart Scan is a comprehensive Drive analysis feature that provides one-click scanning and categorisation of Google Drive files across five key dimensions: large files, old files, duplicates, empty items, and temporary files.

### Key Features

- **Single-Pass Analysis**: Processes all files once for efficiency
- **Five Analysis Categories**: Large files, old files, duplicates, empty items, temp files
- **Space Savings Calculation**: Estimates potential storage reclamation
- **Smart Recommendations**: AI-driven cleanup suggestions prioritised by safety and impact
- **Graceful Degradation**: Works with or without enhanced metadata

### Files Overview

| File | Lines | Purpose |
|------|-------|---------|
| `scanEngine.js` | 358 | Scan orchestration and coordination |
| `analyzers.js` | 711 | Category-specific analysis functions |
| `recommendations.js` | 212 | Smart recommendation generation |
| **Total** | **1,281** | Production-ready code |

---

## Architecture

### Data Flow

```
┌─────────────────┐
│  runSmartScan() │  Entry point
└────────┬────────┘
         │
         ├─► getFileandFoldersData()  (Fetch all files)
         │
         ├─► createAnalysisContext_() (Parse metadata)
         │
         ├─► analyzeLargeFiles()      ┐
         ├─► analyzeOldFiles()         │
         ├─► analyzeEmptyItems()       ├─ 5 Analyzers (parallel)
         ├─► analyzeTempFiles()        │
         └─► analyzeDuplicates()      ┘
                    │
                    ├─► calculateSpaceSavings_() (Aggregate results)
                    │
                    └─► generateRecommendations() (Smart suggestions)
                                │
                                ▼
                         ┌──────────────┐
                         │ Scan Results │
                         └──────────────┘
```

### Single-Pass Architecture

All analyzers receive the same structured file array and process it independently:
- **Memory Efficient**: No duplicate data storage
- **Fast**: Each analyzer filters and processes only relevant files
- **Scalable**: Results aggregated at the end

### Graceful Degradation

The Smart Scan is designed to work with or without enhanced metadata:

| Metadata Available | Functionality |
|-------------------|---------------|
| **Full** (Issue #1 complete) | All analyzers work fully |
| **Partial** (Basic only) | Defaults to safe values, warns in logs |
| **None** | Returns empty results, no errors |

---

## API Reference

### Main Functions

#### `runSmartScan(folderId, corpora)`

Main orchestration function that coordinates the entire scan process.

**Parameters:**
- `folderId` (string): Google Drive folder ID or 'root'
- `corpora` (string, optional): 'user' (My Drive) or 'drive' (Shared Drive). Default: 'user'

**Returns:**
```javascript
{
  success: true,
  data: {
    scan_metadata: {
      folder_id: "abc123",
      folder_name: "My Folder",
      scan_date: "2025-11-18T10:30:00Z",
      total_files: 1523,
      total_folders: 87,
      total_size_bytes: 5368709120,
      total_size_formatted: "5.00 GB"
    },
    categories: {
      large_files: { count: 15, space_used: "2.5 GB", ... },
      old_files: { count: 234, space_used: "1.2 GB", ... },
      duplicates: { count: 45, space_wasted: "500 MB", ... },
      empty_items: { count: 12, space_used: "0 Bytes", ... },
      temp_files: { count: 8, space_used: "50 MB", ... }
    },
    space_savings: {
      total_bytes: 2684354560,
      total_formatted: "2.50 GB",
      breakdown: { duplicates: "500 MB", temp_files: "50 MB" }
    },
    recommendations: [
      {
        category: "duplicates",
        priority: "high",
        action: "review_and_delete",
        file_count: 45,
        space_impact: "500 MB",
        safety_level: "review",
        message: "Found 45 duplicate files wasting 500 MB..."
      },
      // ... more recommendations
    ]
  }
}
```

**Example:**
```javascript
// Scan My Drive root
const result = runSmartScan('root', 'user');

// Scan specific folder
const result = runSmartScan('1abc_FolderIdHere', 'user');

// Scan Shared Drive folder
const result = runSmartScan('0xyz_SharedDriveFolderId', 'drive');
```

**Error Response:**
```javascript
{
  success: false,
  error: "Error message here"
}
```

---

### Analyzer Functions

#### `analyzeLargeFiles(filesData, thresholds)`

Identifies files exceeding size thresholds and categorises by priority.

**Parameters:**
- `filesData` (Array): Structured file array from `createAnalysisContext_()`
- `thresholds` (Object, optional): Custom size thresholds
  ```javascript
  {
    medium: 104857600,    // 100MB in bytes
    large: 524288000,     // 500MB
    very_large: 1073741824 // 1GB
  }
  ```

**Returns:**
```javascript
{
  count: 15,
  space_used_bytes: 2684354560,
  space_used_formatted: "2.50 GB",
  breakdown: {
    medium: { count: 10, size_bytes: 1073741824 },
    large: { count: 3, size_bytes: 1073741824 },
    very_large: { count: 2, size_bytes: 536870912 }
  },
  files: [
    {
      file_id: "abc123",
      file_name: "large-video.mp4",
      size_bytes: 1073741824,
      size_formatted: "1.00 GB",
      priority: "very_large",
      parent_name: "Videos"
    },
    // ... more files
  ]
}
```

**Example:**
```javascript
// Default thresholds (100MB, 500MB, 1GB)
const result = analyzeLargeFiles(filesData);

// Custom thresholds
const customResult = analyzeLargeFiles(filesData, {
  medium: 52428800,     // 50MB
  large: 262144000,     // 250MB
  very_large: 536870912 // 500MB
});
```

---

#### `analyzeOldFiles(filesData, ageThresholds)`

Identifies files not modified within specified time periods.

**Parameters:**
- `filesData` (Array): Structured file array
- `ageThresholds` (Object, optional): Age thresholds in milliseconds
  ```javascript
  {
    one_year: 31536000000,    // 1 year
    two_years: 63072000000,   // 2 years
    five_years: 157680000000  // 5 years
  }
  ```

**Returns:**
```javascript
{
  count: 234,
  space_used_bytes: 1288490189,
  space_used_formatted: "1.20 GB",
  breakdown: {
    one_year: { count: 50, size_bytes: ... },
    two_years: { count: 100, size_bytes: ... },
    five_years: { count: 84, size_bytes: ... }
  },
  files: [ /* ... */ ]
}
```

**Example:**
```javascript
// Default thresholds (1yr, 2yr, 5yr)
const result = analyzeOldFiles(filesData);

// Custom: Files not modified in 6 months or 1 year
const customResult = analyzeOldFiles(filesData, {
  six_months: 15768000000,  // 6 months
  one_year: 31536000000     // 1 year
});
```

---

#### `analyzeEmptyItems(filesData)`

Identifies zero-byte files and empty folders.

**Parameters:**
- `filesData` (Array): Structured file array

**Returns:**
```javascript
{
  count: 12,
  space_used_bytes: 0,
  space_used_formatted: "0 Bytes",
  breakdown: {
    empty_files: { count: 7 },
    empty_folders: { count: 5 }
  },
  files: [
    {
      file_id: "abc123",
      file_name: "empty.txt",
      size_bytes: 0,
      item_type: "empty_file",
      parent_name: "Documents"
    },
    // ... more items
  ]
}
```

**Example:**
```javascript
const result = analyzeEmptyItems(filesData);
console.log(`Found ${result.count} empty items`);
```

---

#### `analyzeTempFiles(filesData, patterns)`

Identifies temporary files using pattern matching.

**Parameters:**
- `filesData` (Array): Structured file array
- `patterns` (Object, optional): Custom pattern definitions
  ```javascript
  {
    extensions: ['.tmp', '.bak', '.cache'],
    prefixes: ['~$', '.~'],
    suffixes: ['~'],
    exact_names: ['Thumbs.db', '.DS_Store']
  }
  ```

**Returns:**
```javascript
{
  count: 8,
  space_used_bytes: 52428800,
  space_used_formatted: "50.00 MB",
  breakdown: {
    extension_match: { count: 5 },
    prefix_match: { count: 2 },
    exact_match: { count: 1 }
  },
  files: [ /* ... */ ]
}
```

**Default Patterns:**
```javascript
{
  extensions: ['.tmp', '.temp', '.bak', '.backup', '.cache', '.old'],
  prefixes: ['~$', '.~', 'temp_', 'tmp_'],
  suffixes: ['~', '.bak'],
  exact_names: ['Thumbs.db', '.DS_Store', 'desktop.ini', '.localized']
}
```

**Example:**
```javascript
// Default patterns
const result = analyzeTempFiles(filesData);

// Custom: Only .tmp and .bak files
const customResult = analyzeTempFiles(filesData, {
  extensions: ['.tmp', '.bak'],
  prefixes: [],
  suffixes: [],
  exact_names: []
});
```

---

#### `analyzeDuplicates(filesData, method)`

Identifies duplicate files using name and size matching.

**Parameters:**
- `filesData` (Array): Structured file array
- `method` (string, optional): Detection method. Default: 'name_and_size'
  - `'name_and_size'`: Match by filename and size (current implementation)
  - `'md5'`: Match by MD5 checksum (future enhancement)

**Returns:**
```javascript
{
  count: 45,
  space_wasted_bytes: 524288000,
  space_wasted_formatted: "500.00 MB",
  duplicate_groups: 15,
  breakdown: {
    duplicate_count: 45,
    groups_count: 15,
    space_kept: "100.00 MB",
    space_wasted: "500.00 MB"
  },
  files: [
    {
      file_id: "abc123",
      file_name: "document.pdf",
      size_bytes: 10485760,
      duplicate_group: "document.pdf_10485760",
      is_duplicate: true,
      keep_file: false,
      modified_date: "2025-01-15",
      parent_name: "Downloads"
    },
    // ... more duplicates
  ]
}
```

**Logic:**
- Groups files by `name + size`
- Marks newest file in each group as "keep"
- All others marked as duplicates
- Space wasted = total size minus one copy per group

**Example:**
```javascript
// Default: name + size matching
const result = analyzeDuplicates(filesData);

console.log(`Found ${result.duplicate_groups} sets of duplicates`);
console.log(`Potential savings: ${result.space_wasted_formatted}`);
```

---

#### `generateRecommendations(scanResults)`

Generates prioritised cleanup recommendations based on scan results.

**Parameters:**
- `scanResults` (Object): Complete scan results from `runSmartScan()`

**Returns:**
```javascript
[
  {
    category: "duplicates",
    priority: "high",
    action: "review_and_delete",
    file_count: 45,
    space_impact: "500.00 MB",
    space_impact_bytes: 524288000,
    safety_level: "review",
    message: "Found 45 duplicate files wasting 500.00 MB of storage. Review and keep only the most recent versions.",
    next_steps: [
      "Navigate to Duplicates view",
      "Review each duplicate group",
      "Keep newest version",
      "Delete older duplicates"
    ]
  },
  {
    category: "temp_files",
    priority: "medium",
    action: "safe_to_delete",
    file_count: 8,
    space_impact: "50.00 MB",
    space_impact_bytes: 52428800,
    safety_level: "safe",
    message: "Found 8 temporary files using 50.00 MB. These are safe to delete.",
    next_steps: [
      "Navigate to Temp Files view",
      "Select all temp files",
      "Delete safely"
    ]
  },
  // ... up to 5 recommendations
]
```

**Priority Levels:**
- `high`: Large impact (>500MB or >50 files)
- `medium`: Moderate impact (100MB-500MB or 10-50 files)
- `low`: Small impact (<100MB or <10 files)

**Safety Levels:**
- `safe`: Highly confident (temp files, empty items)
- `review`: User review recommended (duplicates, old files)
- `caution`: Careful review required (reserved for future use)

**Example:**
```javascript
const recommendations = generateRecommendations(scanResults);

// Display top recommendation
const top = recommendations[0];
console.log(`${top.priority.toUpperCase()}: ${top.message}`);
console.log(`Actions: ${top.next_steps.join(', ')}`);
```

---

## Data Structures

### Structured File Object

Files are transformed by `createAnalysisContext_()` into this format:

```javascript
{
  file_id: "abc123",
  file_name: "document.pdf",
  mime_type: "application/pdf",
  parent_name: "Documents",
  parent_id: "parent123",
  icon: "📄",

  // Enhanced metadata (from Issue #1)
  size_bytes: 10485760,
  size_formatted: "10.00 MB",
  created_date: "2024-01-15T10:30:00Z",
  modified_date: "2025-01-15T14:20:00Z",
  last_viewed_date: "2025-11-01T09:15:00Z",

  // Computed
  age_days: 365,
  is_folder: false
}
```

### Scan Results Structure

```javascript
{
  success: true,
  data: {
    scan_metadata: {
      folder_id: string,
      folder_name: string,
      scan_date: ISO8601,
      total_files: number,
      total_folders: number,
      total_size_bytes: number,
      total_size_formatted: string
    },
    categories: {
      large_files: CategoryResultProps,
      old_files: CategoryResultProps,
      duplicates: CategoryResultProps,
      empty_items: CategoryResultProps,
      temp_files: CategoryResultProps
    },
    space_savings: {
      total_bytes: number,
      total_formatted: string,
      breakdown: {
        duplicates: string,
        temp_files: string
      }
    },
    recommendations: RecommendationProps[]
  }
}
```

---

## Usage Examples

### Basic Scan

```javascript
// From frontend via google.script.run
google.script.run
  .withSuccessHandler((result) => {
    if (result.success) {
      console.log('Scan complete!');
      console.log(`Total files: ${result.data.scan_metadata.total_files}`);
      console.log(`Potential savings: ${result.data.space_savings.total_formatted}`);
    }
  })
  .withFailureHandler((error) => {
    console.error('Scan failed:', error);
  })
  .runSmartScan('root', 'user');
```

### Display Category Results

```javascript
const categories = result.data.categories;

// Large Files
console.log(`Large Files: ${categories.large_files.count} files`);
console.log(`Space used: ${categories.large_files.space_used_formatted}`);

// Duplicates
console.log(`Duplicates: ${categories.duplicates.count} files in ${categories.duplicates.duplicate_groups} groups`);
console.log(`Space wasted: ${categories.duplicates.space_wasted_formatted}`);
```

### Show Recommendations

```javascript
const recommendations = result.data.recommendations;

recommendations.forEach((rec, index) => {
  console.log(`\n${index + 1}. [${rec.priority.toUpperCase()}] ${rec.category}`);
  console.log(`   ${rec.message}`);
  console.log(`   Impact: ${rec.space_impact}`);
  console.log(`   Safety: ${rec.safety_level}`);
});
```

---

## Integration Guide

### Frontend Integration (React)

#### 1. Create Custom Hook

```javascript
// src/hooks/useSmartScan.js
import { useState } from 'react';

export function useSmartScan() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runScan = (folderId = 'root', corpora = 'user') => {
    setLoading(true);
    setError(null);

    google.script.run
      .withSuccessHandler((result) => {
        setLoading(false);
        if (result.success) {
          setResults(result.data);
        } else {
          setError(result.error);
        }
      })
      .withFailureHandler((err) => {
        setLoading(false);
        setError(err.message);
      })
      .runSmartScan(folderId, corpora);
  };

  return { loading, results, error, runScan };
}
```

#### 2. Use in Component

```javascript
// src/views/SmartScanView.jsx
import { useSmartScan } from '@/hooks/useSmartScan';

export function SmartScanView() {
  const { loading, results, error, runScan } = useSmartScan();

  const handleScan = () => {
    runScan('root', 'user');
  };

  return (
    <div>
      <button onClick={handleScan} disabled={loading}>
        {loading ? 'Scanning...' : 'Start Smart Scan'}
      </button>

      {error && <p>Error: {error}</p>}

      {results && (
        <div>
          <h2>Scan Results</h2>
          <p>Total Files: {results.scan_metadata.total_files}</p>
          <p>Potential Savings: {results.space_savings.total_formatted}</p>

          {/* Display categories */}
          {Object.entries(results.categories).map(([name, data]) => (
            <div key={name}>
              <h3>{name}: {data.count} files</h3>
              <p>{data.space_used_formatted}</p>
            </div>
          ))}

          {/* Display recommendations */}
          <h3>Recommendations</h3>
          {results.recommendations.map((rec, i) => (
            <div key={i}>
              <h4>[{rec.priority}] {rec.category}</h4>
              <p>{rec.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Performance

### Benchmarks

| Files Scanned | Time (approx) | Memory |
|--------------|---------------|--------|
| 100 files | ~2 seconds | Low |
| 500 files | ~10 seconds | Low |
| 1,000 files | ~20 seconds | Medium |
| 5,000 files | ~90 seconds | Medium |
| 10,000 files | ~180 seconds | High |

**Note:** Times vary based on file metadata complexity and network latency.

### Optimisation Tips

1. **Incremental Scans**: Scan subfolders rather than entire Drive
2. **Caching**: Results can be cached for repeated access
3. **Selective Analysis**: Disable analyzers you don't need (future enhancement)
4. **Batch Processing**: For very large folders (>10k files), consider pagination

### Memory Considerations

- Single-pass architecture minimises memory usage
- Each analyzer processes the same array (no duplication)
- Results are aggregated, not stored per analyzer

---

## Troubleshooting

### Common Issues

#### 1. All Categories Return 0 Files

**Cause:** Enhanced metadata not available (Issue #1 not complete)

**Solution:**
- Check console logs for: "Enhanced metadata not detected"
- Complete Issue #1 implementation
- Verify Drive API fields include fileSize, dates, etc.

**Workaround:**
- Scan will complete but return empty results
- No errors thrown (graceful degradation)

---

#### 2. Duplicates Not Detected

**Cause:** Files have different sizes or names

**Current Limitation:**
- Only matches files with **exact same name AND size**
- Case-sensitive name matching

**Future Enhancement:**
- MD5 checksum comparison for true duplicates
- Fuzzy name matching

---

#### 3. Scan Takes Too Long

**Cause:** Large folder with many files

**Solutions:**
- Scan subfolders instead of root
- Wait for scan completion (up to 6 minutes for GAS limit)
- Consider pagination for >10k files (future enhancement)

---

#### 4. "Missing Enhanced Metadata" Warning

**Cause:** `createAnalysisContext_()` detects missing fields

**Check:**
```javascript
// Verify array indices match expectations
// Expected: [icon, name, size, category, modified, created, viewed, owner, ...]
```

**Fix:**
- Update `getFileandFoldersData()` to return full metadata
- Ensure metadataParser is integrated

---

### Debug Mode

Enable detailed logging:

```javascript
// In scanEngine.js, uncomment debug logs
Logger.log('Files data structure:', filesData.slice(0, 5));
Logger.log('Analysis context:', analysisContext.slice(0, 5));
```

View logs:
```bash
clasp logs --simplified
```

---

## Future Enhancements

### Planned Improvements

1. **MD5 Duplicate Detection**: More accurate duplicate matching
2. **Progress Callbacks**: Real-time scan progress updates
3. **Selective Analysis**: Enable/disable specific analyzers
4. **Custom Thresholds UI**: User-configurable size and age thresholds
5. **Scan History**: Store and compare past scans
6. **Scheduled Scans**: Automatic weekly/monthly scans
7. **Export Results**: CSV/JSON export of scan results

---

## Changelog

### v1.0.0 (2025-11-17)
- ✅ Initial release
- ✅ 5 analyzers implemented
- ✅ Smart recommendations
- ✅ Single-pass architecture
- ✅ Graceful degradation
- ✅ Comprehensive JSDoc (9/10 quality)

---

## Support

**Documentation:**
- [Feature Plan](./feature-plans/smart-scan-plan.md)
- [Build Notes](./build-notes/smart-scan-build.md)
- [Test Report](./test-reports/smart-scan-test.md)

**GitHub:**
- [Issue #2](https://github.com/andyedwardsuk/drive_cleaner/issues/2) - Smart Scan Feature

---

**Author:** Andy Edwards
**License:** MIT
**Project:** Drive Cleaner
