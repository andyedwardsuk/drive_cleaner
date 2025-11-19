# Enhanced Metadata - Testing Checklist

**Feature:** Enhanced Metadata Collection (Issue #1)
**Test Date:** 2025-11-18
**Tester:** _______________
**Status:** ⏳ In Progress

---

## Pre-Test Setup

### Web App URL
```
https://script.google.com/macros/s/AKfycbzeARsCJmIQdgGS4ZrWsbE553FZqB0M1MGakNhUpE4RTRSFwaDxh0PEUiZX4Xao2_LAsA/exec
```

### Script Editor (for logs)
```
https://script.google.com/d/1qkpaDFbdqq3OlpMCEdOUk68nr3svvVk3mmhhmHykRIbvaBUimsx2uN-G/edit
```

### Test Folder Requirements

Create or use a test folder with:
- [ ] At least 5-10 files of various types
- [ ] Mix of file sizes (small, medium, large)
- [ ] Files created at different times
- [ ] Files you own
- [ ] At least one shared file (if possible)
- [ ] At least one starred file (if possible)

**Test Folder ID:** ___________________

---

## Test 1: Web App Loads

**Objective:** Verify the web app opens and displays correctly

- [ ] **1.1** Open web app URL in browser
- [ ] **1.2** Page loads without errors
- [ ] **1.3** UI displays correctly (no broken components)
- [ ] **1.4** "Browse" button visible
- [ ] **1.5** Folder ID input field visible
- [ ] **1.6** "Scan" button visible

**Result:** ⬜ Pass / ⬜ Fail

**Notes:**
```
____________________________________________________________
____________________________________________________________
```

---

## Test 2: Folder Scan

**Objective:** Successfully scan a folder and retrieve data

- [ ] **2.1** Enter test folder ID or click "Browse"
- [ ] **2.2** Click "Scan" button
- [ ] **2.3** Loading indicator appears
- [ ] **2.4** Scan completes without errors
- [ ] **2.5** FileTable displays with results

**Expected Behavior:**
- Scan should complete in reasonable time
- No console errors
- Table renders with data

**Result:** ⬜ Pass / ⬜ Fail

**Scan Duration:** _______ seconds

**Files Found:** _______ files

**Notes:**
```
____________________________________________________________
____________________________________________________________
```

---

## Test 3: Enhanced Metadata Columns

**Objective:** Verify all enhanced metadata columns are visible and populated

### 3.1 Column Visibility

Check that the following columns appear in the FileTable:

- [ ] **Icon/Type** - File/folder icons display
- [ ] **File Name** - File names display correctly
- [ ] **Size** - File size column visible
- [ ] **Category** - File category badge visible
- [ ] **Last Modified** - Modified date column visible
- [ ] **Owner** - Owner name column visible
- [ ] **Sharing** - Sharing status column visible

**Result:** ⬜ Pass / ⬜ Fail

**Missing Columns:**
```
____________________________________________________________
```

### 3.2 File Size Formatting

Pick 3-5 files and verify size formatting:

| File Name | Expected Size | Displayed Size | Format OK? |
|-----------|---------------|----------------|------------|
| _________ | _____________ | ______________ | ⬜ Yes ⬜ No |
| _________ | _____________ | ______________ | ⬜ Yes ⬜ No |
| _________ | _____________ | ______________ | ⬜ Yes ⬜ No |
| _________ | _____________ | ______________ | ⬜ Yes ⬜ No |
| _________ | _____________ | ______________ | ⬜ Yes ⬜ No |

**Expected Formats:**
- Small files: "X.XX KB"
- Medium files: "X.XX MB"
- Large files: "X.XX GB"
- Zero-byte files: "0 Bytes"
- Google Docs: Should show size (or "N/A" if not available)

**Result:** ⬜ Pass / ⬜ Fail

**Notes:**
```
____________________________________________________________
____________________________________________________________
```

### 3.3 Date Formatting

Verify dates are in UK format (DD/MM/YYYY):

| File Name | Modified Date | Format Correct? |
|-----------|---------------|-----------------|
| _________ | _____________ | ⬜ Yes ⬜ No    |
| _________ | _____________ | ⬜ Yes ⬜ No    |
| _________ | _____________ | ⬜ Yes ⬜ No    |

**Expected Format:** DD/MM/YYYY HH:MM or DD/MM/YYYY

**Result:** ⬜ Pass / ⬜ Fail

**Notes:**
```
____________________________________________________________
____________________________________________________________
```

### 3.4 File Categories

Verify files are categorized correctly:

| File Name | MIME Type | Expected Category | Displayed Category | Correct? |
|-----------|-----------|-------------------|-------------------|----------|
| *.pdf | application/pdf | Document | _____________ | ⬜ Yes ⬜ No |
| *.jpg | image/jpeg | Image | _____________ | ⬜ Yes ⬜ No |
| *.mp4 | video/mp4 | Video | _____________ | ⬜ Yes ⬜ No |
| Google Doc | vnd.google-apps.document | Document | _____________ | ⬜ Yes ⬜ No |
| Folder | vnd.google-apps.folder | Folder | _____________ | ⬜ Yes ⬜ No |

**Result:** ⬜ Pass / ⬜ Fail

**Notes:**
```
____________________________________________________________
____________________________________________________________
```

### 3.5 Owner Information

Verify owner names display:

| File Name | Expected Owner | Displayed Owner | Correct? |
|-----------|----------------|-----------------|----------|
| _________ | Your name | _____________ | ⬜ Yes ⬜ No |
| _________ | _________ | _____________ | ⬜ Yes ⬜ No |
| _________ | _________ | _____________ | ⬜ Yes ⬜ No |

**Result:** ⬜ Pass / ⬜ Fail

**Notes:**
```
____________________________________________________________
____________________________________________________________
```

### 3.6 Sharing Status

Verify sharing status is shown:

| File Name | Expected Status | Displayed Status | Correct? |
|-----------|-----------------|------------------|----------|
| Private file | Private | _____________ | ⬜ Yes ⬜ No |
| Shared file | Shared | _____________ | ⬜ Yes ⬜ No |

**Expected Values:** "Private", "Shared", "Public", etc.

**Result:** ⬜ Pass / ⬜ Fail

**Notes:**
```
____________________________________________________________
____________________________________________________________
```

---

## Test 4: Table Functionality

**Objective:** Verify table features work with enhanced metadata

### 4.1 Sorting

- [ ] **4.1.1** Click "Size" column header
- [ ] **4.1.2** Files sort by size (ascending)
- [ ] **4.1.3** Click "Size" header again
- [ ] **4.1.4** Files sort by size (descending)
- [ ] **4.1.5** Verify largest files appear first in descending sort

**Result:** ⬜ Pass / ⬜ Fail

### 4.2 Other Column Sorting

Test sorting on:
- [ ] **File Name** - Alphabetical sort works
- [ ] **Category** - Category sort works
- [ ] **Last Modified** - Date sort works
- [ ] **Owner** - Owner sort works

**Result:** ⬜ Pass / ⬜ Fail

### 4.3 Filtering/Search

- [ ] **4.3.1** Use search box to filter files
- [ ] **4.3.2** Type a file name
- [ ] **4.3.3** Table filters correctly
- [ ] **4.3.4** Metadata still displays for filtered results

**Result:** ⬜ Pass / ⬜ Fail

---

## Test 5: Data Accuracy

**Objective:** Verify metadata matches actual Google Drive values

### 5.1 Spot Check in Google Drive

Pick 2-3 files and verify in Google Drive:

**File 1:**
- [ ] Size matches Drive Cleaner display
- [ ] Modified date matches
- [ ] Owner matches
- [ ] Sharing status matches

**File 2:**
- [ ] Size matches Drive Cleaner display
- [ ] Modified date matches
- [ ] Owner matches
- [ ] Sharing status matches

**File 3:**
- [ ] Size matches Drive Cleaner display
- [ ] Modified date matches
- [ ] Owner matches
- [ ] Sharing status matches

**Result:** ⬜ Pass / ⬜ Fail

**Discrepancies Found:**
```
____________________________________________________________
____________________________________________________________
____________________________________________________________
```

---

## Test 6: Edge Cases

**Objective:** Test special cases and edge scenarios

### 6.1 Google Workspace Files

Test with Google Docs, Sheets, Slides:

- [ ] **6.1.1** Google Doc displays size (or "N/A")
- [ ] **6.1.2** Google Sheet displays size (or "N/A")
- [ ] **6.1.3** Category correctly shows "Document"/"Spreadsheet"
- [ ] **6.1.4** Dates display correctly

**Result:** ⬜ Pass / ⬜ Fail

**Notes:**
```
____________________________________________________________
____________________________________________________________
```

### 6.2 Empty/Zero-byte Files

If you have any:

- [ ] **6.2.1** Zero-byte file shows "0 Bytes"
- [ ] **6.2.2** Dates still populate
- [ ] **6.2.3** Owner/sharing still populate

**Result:** ⬜ Pass / ⬜ Fail

### 6.3 Large Files

If you have files >100MB:

- [ ] **6.3.1** Size displays correctly (e.g., "1.25 GB")
- [ ] **6.3.2** All other metadata populates
- [ ] **6.3.3** No performance issues with large files

**Result:** ⬜ Pass / ⬜ Fail

### 6.4 Folders

- [ ] **6.4.1** Folders display with folder icon
- [ ] **6.4.2** Folder size shows (may be 0 or calculated)
- [ ] **6.4.3** Folder dates populate
- [ ] **6.4.4** Category shows "Folder"

**Result:** ⬜ Pass / ⬜ Fail

---

## Test 7: Error Handling

**Objective:** Verify graceful error handling

### 7.1 Invalid Folder ID

- [ ] **7.1.1** Enter invalid folder ID
- [ ] **7.1.2** Click "Scan"
- [ ] **7.1.3** Error message displays clearly
- [ ] **7.1.4** No console errors
- [ ] **7.1.5** App remains functional

**Result:** ⬜ Pass / ⬜ Fail

**Error Message:**
```
____________________________________________________________
```

### 7.2 Empty Folder

- [ ] **7.2.1** Scan an empty folder
- [ ] **7.2.2** App handles gracefully
- [ ] **7.2.3** Shows "No files found" or similar
- [ ] **7.2.4** No errors

**Result:** ⬜ Pass / ⬜ Fail

---

## Test 8: Console/Logs Check

**Objective:** Verify no errors in execution

### 8.1 Browser Console

Open browser DevTools (F12):

- [ ] **8.1.1** No JavaScript errors in console
- [ ] **8.1.2** No failed network requests
- [ ] **8.1.3** No warning messages (or only benign ones)

**Errors Found:**
```
____________________________________________________________
____________________________________________________________
```

### 8.2 Apps Script Logs

View logs: `clasp logs --simplified` or via Script Editor

- [ ] **8.2.1** No errors logged
- [ ] **8.2.2** Scan completed successfully in logs
- [ ] **8.2.3** No "undefined" or "null" warnings for metadata

**Errors Found:**
```
____________________________________________________________
____________________________________________________________
```

---

## Test 9: Performance

**Objective:** Verify acceptable performance

| Metric | Target | Actual | Pass? |
|--------|--------|--------|-------|
| Scan 100 files | <10s | ___s | ⬜ Yes ⬜ No |
| Scan 500 files | <30s | ___s | ⬜ Yes ⬜ No |
| Table renders | <2s | ___s | ⬜ Yes ⬜ No |
| Sorting | <1s | ___s | ⬜ Yes ⬜ No |
| Filtering | <1s | ___s | ⬜ Yes ⬜ No |

**Result:** ⬜ Pass / ⬜ Fail

**Notes:**
```
____________________________________________________________
____________________________________________________________
```

---

## Overall Results

### Summary

| Test Section | Result | Notes |
|--------------|--------|-------|
| 1. Web App Loads | ⬜ Pass ⬜ Fail | _________________ |
| 2. Folder Scan | ⬜ Pass ⬜ Fail | _________________ |
| 3. Enhanced Metadata | ⬜ Pass ⬜ Fail | _________________ |
| 4. Table Functionality | ⬜ Pass ⬜ Fail | _________________ |
| 5. Data Accuracy | ⬜ Pass ⬜ Fail | _________________ |
| 6. Edge Cases | ⬜ Pass ⬜ Fail | _________________ |
| 7. Error Handling | ⬜ Pass ⬜ Fail | _________________ |
| 8. Console/Logs | ⬜ Pass ⬜ Fail | _________________ |
| 9. Performance | ⬜ Pass ⬜ Fail | _________________ |

### Critical Issues Found

1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

### Non-Critical Issues

1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

### Recommendations

1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

---

## Final Verdict

**Enhanced Metadata Implementation:** ⬜ PASS ✅ / ⬜ FAIL ❌ / ⬜ PARTIAL ⚠️

**Ready for Production?** ⬜ Yes / ⬜ No / ⬜ With Fixes

**Tested By:** ___________________
**Date:** ___________________
**Time:** ___________________

---

## Screenshots

Attach screenshots showing:
1. FileTable with all enhanced metadata columns
2. Example of file size formatting
3. Example of date formatting
4. Example of category badges
5. Any errors encountered

---

## Next Steps

If PASS:
- [ ] Update Issue #1 with test results
- [ ] Mark enhanced metadata as production-ready
- [ ] Proceed with Smart Scan testing
- [ ] Begin Issue #3 (Large Files View)

If FAIL:
- [ ] Document issues in GitHub Issue #1
- [ ] Create fix plan
- [ ] Re-test after fixes

---

**Test Report Generated:** 2025-11-18
