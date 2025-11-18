//########### SMART SCAN ENGINE ###########

/**
 * @fileoverview Smart Scan main orchestration and coordination
 *
 * Provides the main entry point for comprehensive Drive analysis. Orchestrates
 * file retrieval, runs all category analyzers, calculates space savings, and
 * generates smart recommendations. Designed for single-pass efficiency and
 * handles errors gracefully.
 *
 * @author Drive Cleaner Dev Team
 * @version 1.0.0
 */

/**
 * Complete scan results across all categories
 * @typedef {Object} ScanResultsProps
 * @property {boolean} success - Whether scan completed successfully
 * @property {string} folder_id - ID of scanned folder
 * @property {string} folder_name - Name of scanned folder
 * @property {number} total_files_scanned - Total number of files analysed
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

/**
 * Run comprehensive Smart Scan on Drive folder
 *
 * Main entry point for Smart Scan feature. Retrieves all files from the
 * specified folder, runs all category analyzers in a single pass, calculates
 * potential space savings, and generates smart cleanup recommendations.
 *
 * This function orchestrates the entire scan workflow:
 * 1. Validate inputs and retrieve folder metadata
 * 2. Fetch all files recursively using getFileandFoldersData
 * 3. Transform raw data into structured analysis context
 * 4. Run all 5 analyzers (large, old, empty, temp, duplicates)
 * 5. Calculate total potential savings
 * 6. Generate prioritised recommendations
 * 7. Format and return complete results
 *
 * @param {string} folderId - Drive folder ID or 'root' for My Drive
 * @param {string} [corpora='user'] - 'user' for My Drive or 'drive' for Shared Drive
 * @returns {ScanResultsProps} Complete scan results with all categories
 *
 * @example
 * // Scan My Drive root
 * const results = runSmartScan('root', 'user')
 * // Returns: { success: true, total_files_scanned: 1234, ... }
 *
 * @example
 * // Scan specific folder
 * const results = runSmartScan('abc123def456', 'user')
 * // Returns full scan results for that folder
 *
 * @example
 * // Scan Shared Drive folder
 * const results = runSmartScan('shared_drive_id', 'drive')
 * // Returns scan results for Shared Drive
 *
 * @example
 * // Handle invalid folder ID
 * const results = runSmartScan('invalid_id', 'user')
 * // Returns: { success: false, error: 'No folder found with this id: invalid_id' }
 */
function runSmartScan(folderId, corpora) {
  const scanStartTime = new Date();

  try {
    console.log(`Starting Smart Scan for folder: ${folderId}`);

    // Validate inputs
    if (!folderId || typeof folderId !== 'string') {
      return {
        success: false,
        error: 'Folder ID is required and must be a string',
        scan_date: scanStartTime.toISOString()
      };
    }

    const actualCorpora = corpora || 'user';

    // Get folder metadata
    let folderName = 'Unknown Folder';
    try {
      if (folderId === 'root') {
        folderName = 'My Drive';
      } else {
        const folderMetadata = Drive.Files.get(folderId, {
          fields: 'title',
          supportsAllDrives: true
        });
        folderName = folderMetadata.title;
      }
    } catch (error) {
      console.warn(`Could not retrieve folder name: ${error.message}`);
    }

    // Retrieve all files using existing function
    console.log('Fetching files and folders...');
    // eslint-disable-next-line no-undef
    const filesData = getFileandFoldersData(folderId, actualCorpora);

    if (!filesData || filesData.length === 0) {
      console.log('No files found in folder');
      return {
        success: true,
        folder_id: folderId,
        folder_name: folderName,
        total_files_scanned: 0,
        total_space_used_bytes: 0,
        total_potential_savings_bytes: 0,
        scan_date: new Date().toISOString(),
        large_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Large Files', category_type: 'large_files' },
        old_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Old Files', category_type: 'old_files' },
        duplicates: { count: 0, total_size_bytes: 0, items: [], category_name: 'Duplicate Files', category_type: 'duplicates' },
        empty_items: { count: 0, total_size_bytes: 0, items: [], category_name: 'Empty Items', category_type: 'empty_items' },
        temp_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Temporary Files', category_type: 'temp_files' },
        recommendations: [],
        error: null
      };
    }

    console.log(`Retrieved ${filesData.length} items`);

    // Create analysis context
    console.log('Creating analysis context...');
    const structuredFiles = createAnalysisContext_(filesData);

    if (structuredFiles.length === 0) {
      console.warn('No valid files after creating analysis context');
      return {
        success: true,
        folder_id: folderId,
        folder_name: folderName,
        total_files_scanned: 0,
        total_space_used_bytes: 0,
        total_potential_savings_bytes: 0,
        scan_date: new Date().toISOString(),
        large_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Large Files', category_type: 'large_files' },
        old_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Old Files', category_type: 'old_files' },
        duplicates: { count: 0, total_size_bytes: 0, items: [], category_name: 'Duplicate Files', category_type: 'duplicates' },
        empty_items: { count: 0, total_size_bytes: 0, items: [], category_name: 'Empty Items', category_type: 'empty_items' },
        temp_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Temporary Files', category_type: 'temp_files' },
        recommendations: [],
        error: null
      };
    }

    // Run all analyzers
    console.log('Running analyzers...');
    // eslint-disable-next-line no-undef
    const largeFilesResult = analyzeLargeFiles(structuredFiles);
    // eslint-disable-next-line no-undef
    const oldFilesResult = analyzeOldFiles(structuredFiles);
    // eslint-disable-next-line no-undef
    const emptyItemsResult = analyzeEmptyItems(structuredFiles);
    // eslint-disable-next-line no-undef
    const tempFilesResult = analyzeTempFiles(structuredFiles);
    // eslint-disable-next-line no-undef
    const duplicatesResult = analyzeDuplicates(structuredFiles);

    console.log('Analyzers complete');
    console.log(`- Large files: ${largeFilesResult.count}`);
    console.log(`- Old files: ${oldFilesResult.count}`);
    console.log(`- Empty items: ${emptyItemsResult.count}`);
    console.log(`- Temp files: ${tempFilesResult.count}`);
    console.log(`- Duplicates: ${duplicatesResult.count}`);

    // Calculate total space used
    const totalSpaceUsed = structuredFiles.reduce((sum, file) => sum + (file.size_bytes || 0), 0);

    // Calculate total potential savings
    const categoryResults = {
      large_files: largeFilesResult,
      old_files: oldFilesResult,
      duplicates: duplicatesResult,
      empty_items: emptyItemsResult,
      temp_files: tempFilesResult
    };

    const totalSavings = calculateSpaceSavings_(categoryResults);

    // Generate recommendations
    console.log('Generating recommendations...');
    // eslint-disable-next-line no-undef
    const recommendations = generateRecommendations(categoryResults);

    // Format final results
    const scanResults = {
      success: true,
      folder_id: folderId,
      folder_name: folderName,
      total_files_scanned: structuredFiles.length,
      total_space_used_bytes: totalSpaceUsed,
      total_potential_savings_bytes: totalSavings,
      scan_date: new Date().toISOString(),
      large_files: largeFilesResult,
      old_files: oldFilesResult,
      duplicates: duplicatesResult,
      empty_items: emptyItemsResult,
      temp_files: tempFilesResult,
      recommendations: recommendations,
      error: null
    };

    const scanDuration = (new Date() - scanStartTime) / 1000;
    console.log(`Smart Scan complete in ${scanDuration.toFixed(2)} seconds`);
    console.log(`Total potential savings: ${totalSavings} bytes`);

    return scanResults;
  } catch (error) {
    console.error(`Error in runSmartScan: ${error.message}`);
    console.error(error.stack);

    return {
      success: false,
      folder_id: folderId || 'unknown',
      folder_name: 'Unknown Folder',
      total_files_scanned: 0,
      total_space_used_bytes: 0,
      total_potential_savings_bytes: 0,
      scan_date: new Date().toISOString(),
      large_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Large Files', category_type: 'large_files' },
      old_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Old Files', category_type: 'old_files' },
      duplicates: { count: 0, total_size_bytes: 0, items: [], category_name: 'Duplicate Files', category_type: 'duplicates' },
      empty_items: { count: 0, total_size_bytes: 0, items: [], category_name: 'Empty Items', category_type: 'empty_items' },
      temp_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Temporary Files', category_type: 'temp_files' },
      recommendations: [],
      error: error.message
    };
  }
}

/**
 * Transform raw file data into structured analysis format
 *
 * Converts the 2D array format from getFileandFoldersData into a structured
 * array of objects with named properties. This makes the data easier to work
 * with in the analyzers.
 *
 * Current array format: [icon, file_name, file_id, parent_name, parent_id, mime_type]
 * Note: Enhanced metadata (size, dates) from Issue #1 is expected but handled gracefully if missing
 *
 * @param {Array<Array>} filesData - Raw 2D array from getFileandFoldersData
 * @returns {Array<Object>} Structured file objects
 * @private
 */
function createAnalysisContext_(filesData) {
  try {
    if (!Array.isArray(filesData)) {
      console.warn('createAnalysisContext_: filesData is not an array');
      return [];
    }

    const structuredFiles = filesData.map((fileArray) => {
      // Current format: [icon, file_name, file_id, parent_name, parent_id, mime_type]
      // Note: Additional fields (size, dates) expected from Issue #1
      const [_icon, fileName, fileId, parentName, parentId, mimeType, ...extraFields] = fileArray;

      // Extract parentId from hyperlink formula if present
      let actualParentId = parentId;
      if (typeof parentId === 'string' && parentId.includes('HYPERLINK')) {
        // Extract ID from =HYPERLINK("url","id") format
        const match = parentId.match(/"([^"]+)"[,)]/);
        if (match && match[1]) {
          actualParentId = match[1];
        }
      }

      return {
        file_id: fileId,
        file_name: fileName,
        mime_type: mimeType,
        parent_id: actualParentId,
        parent_name: parentName,
        // Enhanced metadata from Issue #1 (gracefully handle if missing)
        size_bytes: extraFields[0] || 0, // Expected at index 6
        created_date: extraFields[1] || null, // Expected at index 7
        modified_date: extraFields[2] || null, // Expected at index 8
        last_viewed_date: extraFields[3] || null // Expected at index 9
      };
    });

    // Filter out items with missing critical data
    const validFiles = structuredFiles.filter(file => {
      if (!file.file_id || !file.file_name) {
        console.warn(`Skipping file with missing critical data: ${JSON.stringify(file)}`);
        return false;
      }
      return true;
    });

    console.log(`Created analysis context: ${validFiles.length} valid files from ${filesData.length} items`);

    // Check if enhanced metadata is present
    const hasEnhancedMetadata = validFiles.some(f => f.size_bytes > 0 || f.created_date || f.modified_date);
    if (!hasEnhancedMetadata) {
      console.warn('WARNING: Enhanced metadata (size, dates) not detected. Analyzers may not function correctly.');
      console.warn('Issue #1 (Enhanced Metadata Collection) must be completed for full functionality.');
    }

    return validFiles;
  } catch (error) {
    console.error(`Error in createAnalysisContext_: ${error.message}`);
    return [];
  }
}

/**
 * Calculate total potential space savings from category results
 *
 * Sums up the potential savings across all categories. For duplicates,
 * uses the total_size_bytes which already accounts for keeping one copy.
 * For other categories, sums the total_size_bytes from items marked as
 * safe or review.
 *
 * @param {Object} categoryResults - Object containing all 5 category results
 * @param {Object} categoryResults.large_files - Large files results
 * @param {Object} categoryResults.old_files - Old files results
 * @param {Object} categoryResults.duplicates - Duplicates results
 * @param {Object} categoryResults.empty_items - Empty items results
 * @param {Object} categoryResults.temp_files - Temp files results
 * @returns {number} Total potential savings in bytes
 * @private
 */
function calculateSpaceSavings_(categoryResults) {
  try {
    let totalSavings = 0;

    // For most categories, we can't assume all files will be deleted
    // so we'll be conservative and only count duplicates and temp files
    // as full savings

    // Duplicates: already calculated (total size minus one copy per group)
    if (categoryResults.duplicates) {
      totalSavings += categoryResults.duplicates.total_size_bytes || 0;
    }

    // Temp files: likely to be deleted
    if (categoryResults.temp_files) {
      totalSavings += categoryResults.temp_files.total_size_bytes || 0;
    }

    // Empty items: no size savings (already 0 bytes)
    // Old files: user must review, don't count automatically
    // Large files: user must review, don't count automatically

    return totalSavings;
  } catch (error) {
    console.error(`Error in calculateSpaceSavings_: ${error.message}`);
    return 0;
  }
}

/**
 * Test wrapper for Smart Scan - scans My Drive root
 * Simple function to test Smart Scan from Apps Script editor without parameters
 *
 * @returns {Object} Smart Scan results for My Drive root
 */
function testSmartScan() {
  console.log('Running Smart Scan test on My Drive root...');
  return runSmartScan('root', 'user');
}

// Export public functions to global scope for GAS
globalThis.runSmartScan = runSmartScan;
globalThis.testSmartScan = testSmartScan;
