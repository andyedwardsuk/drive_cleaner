# Smart Scan - Quick Reference

**Version:** 1.0.0 | **Status:** Production Ready

---

## Quick Start

```javascript
// Run scan
const result = runSmartScan('root', 'user');

// Check results
if (result.success) {
  console.log(`Files scanned: ${result.data.scan_metadata.total_files}`);
  console.log(`Savings: ${result.data.space_savings.total_formatted}`);
}
```

---

## Main Function

### `runSmartScan(folderId, corpora)`

**Parameters:**
- `folderId`: Folder ID or `'root'`
- `corpora`: `'user'` (My Drive) or `'drive'` (Shared Drive)

**Returns:** Scan results with 5 categories + recommendations

---

## Five Analyzers

| Function | Purpose | Key Metric |
|----------|---------|------------|
| `analyzeLargeFiles()` | Files >100MB | `space_used` |
| `analyzeOldFiles()` | Not modified in 1+ years | `space_used` |
| `analyzeDuplicates()` | Same name + size | `space_wasted` |
| `analyzeEmptyItems()` | 0-byte files/folders | `count` |
| `analyzeTempFiles()` | .tmp, .bak, etc. | `space_used` |

---

## Thresholds

### Large Files (bytes)
- **Medium:** 100MB (104857600)
- **Large:** 500MB (524288000)
- **Very Large:** 1GB (1073741824)

### Old Files (milliseconds)
- **1 Year:** 31536000000
- **2 Years:** 63072000000
- **5 Years:** 157680000000

### Temp File Patterns
- **Extensions:** `.tmp`, `.bak`, `.cache`, `.old`
- **Prefixes:** `~$`, `.~`, `temp_`
- **Exact:** `Thumbs.db`, `.DS_Store`

---

## Data Structure

### Scan Results
```javascript
{
  success: true,
  data: {
    scan_metadata: { total_files, total_size, ... },
    categories: { large_files, old_files, duplicates, ... },
    space_savings: { total_bytes, total_formatted, ... },
    recommendations: [ { priority, message, ... }, ... ]
  }
}
```

### Category Result
```javascript
{
  count: 15,
  space_used_bytes: 2684354560,
  space_used_formatted: "2.50 GB",
  breakdown: { ... },
  files: [ { file_id, file_name, size_bytes, ... }, ... ]
}
```

### Recommendation
```javascript
{
  category: "duplicates",
  priority: "high",          // high | medium | low
  action: "review_and_delete",
  file_count: 45,
  space_impact: "500 MB",
  safety_level: "review",    // safe | review | caution
  message: "...",
  next_steps: [ "...", "..." ]
}
```

---

## Frontend Hook

```javascript
import { useState } from 'react';

export function useSmartScan() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runScan = (folderId = 'root', corpora = 'user') => {
    setLoading(true);
    google.script.run
      .withSuccessHandler((result) => {
        setLoading(false);
        setResults(result.success ? result.data : null);
        setError(result.success ? null : result.error);
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

---

## Usage Example

```javascript
// In component
const { loading, results, runScan } = useSmartScan();

// Start scan
runScan('root', 'user');

// Display results
{results && (
  <div>
    <h2>{results.scan_metadata.total_files} Files Scanned</h2>
    <p>Potential Savings: {results.space_savings.total_formatted}</p>

    {/* Categories */}
    <div>Large Files: {results.categories.large_files.count}</div>
    <div>Duplicates: {results.categories.duplicates.count}</div>

    {/* Recommendations */}
    {results.recommendations.map(rec => (
      <div key={rec.category}>
        [{rec.priority}] {rec.message}
      </div>
    ))}
  </div>
)}
```

---

## Performance

| Files | Time |
|-------|------|
| 100 | ~2s |
| 1,000 | ~20s |
| 5,000 | ~90s |
| 10,000 | ~180s |

**Tip:** Scan subfolders for faster results

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| All categories = 0 | Complete Issue #1 (Enhanced Metadata) |
| Scan too slow | Scan subfolders, not entire Drive |
| Missing metadata warning | Check getFileandFoldersData() returns full metadata |

---

## Files

- **Main Guide:** [smart-scan-guide.md](./smart-scan-guide.md)
- **Feature Plan:** [feature-plans/smart-scan-plan.md](./feature-plans/smart-scan-plan.md)
- **Build Notes:** [build-notes/smart-scan-build.md](./build-notes/smart-scan-build.md)
- **Test Report:** [test-reports/smart-scan-test.md](./test-reports/smart-scan-test.md)

---

**Full Documentation:** See [Smart Scan Developer Guide](./smart-scan-guide.md)
