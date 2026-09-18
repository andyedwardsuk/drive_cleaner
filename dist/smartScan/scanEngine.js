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
      return JSON.stringify({
        success: false,
        error: 'Folder ID is required and must be a string',
        scan_date: scanStartTime.toISOString()
      });
    }

    // Sanitize folderId if passed as a full URL or ID
    let cleanFolderId = folderId.trim();
    if (!cleanFolderId || cleanFolderId.toLowerCase() === 'root') {
      cleanFolderId = 'root';
    } else if (cleanFolderId.includes('/')) {
      const match = cleanFolderId.match(/folders\/([A-Za-z0-9_-]+)/) || cleanFolderId.match(/[?&]id=([A-Za-z0-9_-]+)/);
      if (match && match[1]) {
        cleanFolderId = match[1];
      }
    }

    const actualCorpora = corpora || 'user';

    // Get folder metadata
    let folderName = 'Unknown Folder';
    try {
      if (cleanFolderId === 'root') {
        folderName = 'My Drive';
      } else {
        const folderMetadata = Drive.Files.get(cleanFolderId, {
          fields: 'title',
          supportsAllDrives: true,
          supportsTeamDrives: true
        });
        folderName = folderMetadata.title;
      }
    } catch (error) {
      console.warn(`Could not retrieve folder name via Drive.Files.get: ${error.message}`);
      // Fallback 1: DriveApp
      try {
        const f = DriveApp.getFolderById(cleanFolderId);
        if (f) folderName = f.getName();
      } catch (e) {
        // Fallback 2: Drive.Drives (Shared Drive root)
        try {
          if (typeof Drive !== 'undefined' && Drive.Drives && Drive.Drives.get) {
            const d = Drive.Drives.get(cleanFolderId);
            if (d && d.name) folderName = d.name;
          }
        } catch (err) {
          console.warn(`Could not retrieve folder name: ${error.message}`);
        }
      }
    }

    // Retrieve all files using existing function
    console.log('Fetching files and folders...');
    // eslint-disable-next-line no-undef
    const filesData = getFileandFoldersData(cleanFolderId, actualCorpora);

    if (!filesData || filesData.length === 0) {
      console.log('No files found in folder');
      return JSON.stringify({
        success: true,
        folder_id: cleanFolderId,
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
        workspace_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Google Workspace Files', category_type: 'workspace_files', type_breakdown: {}, unused_breakdown: { six_months: 0, one_year: 0, two_years: 0 }, sharing_breakdown: { shared: 0, private: 0, unknown: 0 } },
        rot_analysis: { count: 0, total_size_bytes: 0, category_name: 'Data ROT Analysis', category_type: 'rot_analysis', breakdown: { redundant: { count: 0, total_size_bytes: 0 }, obsolete: { count: 0, total_size_bytes: 0 }, trivial: { count: 0, total_size_bytes: 0 } }, clutter_index: { score: 0, target: 20, breakdown: { rot_ratio: 0, disorganization: 0, inertia: 0, data_gravity: 0 } }, hoarding_score: { total_score: 0, rating: { level: 'Minimal', color: 'green', icon: '✨' }, components: { clutter_volume: 0, disorganization: 0, accumulation: 0, attachment: 0 } }, freshness_distribution: { fresh: { count: 0, percentage: 0 }, aging: { count: 0, percentage: 0 }, stale: { count: 0, percentage: 0 }, rotting: { count: 0, percentage: 0 }, decayed: { count: 0, percentage: 0 } }, items: [] },
        carbon_footprint: { storage_gb: 0, annual_energy_kwh: 0, annual_co2_kg: 0, annual_co2_tonnes: 0, equivalents: { headline: '0 smartphone charges', car_miles: 0, car_km: 0, smartphone_charges: 0, tree_years: 0, burgers: 0, laptop_hours: 0, coffee_cups: 0 }, breakdown_by_type: {}, potential_savings: { cleanup_gb: 0, co2_saved_kg: 0, energy_saved_kwh: 0, equivalents: { headline: '0 smartphone charges', car_miles: 0, car_km: 0, smartphone_charges: 0, tree_years: 0, burgers: 0 } }, eco_rating: { level: 'Eco Champion', color: 'emerald', icon: '🌟', badge: 'Minimal Carbon Impact', message: 'No storage footprint.' }, achievements: [] },
        recommendations: [],
        error: null
      });
    }

    console.log(`Retrieved ${filesData.length} items`);

    // Create analysis context
    console.log('Creating analysis context...');
    const structuredFiles = createAnalysisContext_(filesData);

    if (structuredFiles.length === 0) {
      console.warn('No valid files after creating analysis context');
      return JSON.stringify({
        success: true,
        folder_id: cleanFolderId,
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
        workspace_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Google Workspace Files', category_type: 'workspace_files', type_breakdown: {}, unused_breakdown: { six_months: 0, one_year: 0, two_years: 0 }, sharing_breakdown: { shared: 0, private: 0, unknown: 0 } },
        rot_analysis: { count: 0, total_size_bytes: 0, category_name: 'Data ROT Analysis', category_type: 'rot_analysis', breakdown: { redundant: { count: 0, total_size_bytes: 0 }, obsolete: { count: 0, total_size_bytes: 0 }, trivial: { count: 0, total_size_bytes: 0 } }, clutter_index: { score: 0, target: 20, breakdown: { rot_ratio: 0, disorganization: 0, inertia: 0, data_gravity: 0 } }, hoarding_score: { total_score: 0, rating: { level: 'Minimal', color: 'green', icon: '✨' }, components: { clutter_volume: 0, disorganization: 0, accumulation: 0, attachment: 0 } }, freshness_distribution: { fresh: { count: 0, percentage: 0 }, aging: { count: 0, percentage: 0 }, stale: { count: 0, percentage: 0 }, rotting: { count: 0, percentage: 0 }, decayed: { count: 0, percentage: 0 } }, items: [] },
        carbon_footprint: { storage_gb: 0, annual_energy_kwh: 0, annual_co2_kg: 0, annual_co2_tonnes: 0, equivalents: { headline: '0 smartphone charges', car_miles: 0, car_km: 0, smartphone_charges: 0, tree_years: 0, burgers: 0, laptop_hours: 0, coffee_cups: 0 }, breakdown_by_type: {}, potential_savings: { cleanup_gb: 0, co2_saved_kg: 0, energy_saved_kwh: 0, equivalents: { headline: '0 smartphone charges', car_miles: 0, car_km: 0, smartphone_charges: 0, tree_years: 0, burgers: 0 } }, eco_rating: { level: 'Eco Champion', color: 'emerald', icon: '🌟', badge: 'Minimal Carbon Impact', message: 'No storage footprint.' }, achievements: [] },
        recommendations: [],
        error: null
      });
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
    // eslint-disable-next-line no-undef
    const workspaceFilesResult = analyzeWorkspaceFiles(structuredFiles);
    // eslint-disable-next-line no-undef
    const rotAnalysisResult = analyzeROT(structuredFiles);

    console.log('Analyzers complete');
    console.log(`- Large files: ${largeFilesResult.count}`);
    console.log(`- Old files: ${oldFilesResult.count}`);
    console.log(`- Empty items: ${emptyItemsResult.count}`);
    console.log(`- Temp files: ${tempFilesResult.count}`);
    console.log(`- Duplicates: ${duplicatesResult.count}`);
    console.log(`- Workspace files: ${workspaceFilesResult.count}`);
    console.log(`- ROT items: ${rotAnalysisResult.count}`);

    // Calculate total space used
    const totalSpaceUsed = structuredFiles.reduce((sum, file) => sum + (file.size_bytes || 0), 0);

    // Calculate total potential savings
    const categoryResults = {
      large_files: largeFilesResult,
      old_files: oldFilesResult,
      duplicates: duplicatesResult,
      empty_items: emptyItemsResult,
      temp_files: tempFilesResult,
      workspace_files: workspaceFilesResult,
      rot_analysis: rotAnalysisResult
    };

    const totalSavings = calculateSpaceSavings_(categoryResults);

    // Calculate Carbon Footprint
    console.log('Calculating carbon footprint...');
    // eslint-disable-next-line no-undef
    const carbonFootprintResult = calculateCarbonFootprint(structuredFiles, categoryResults);
    console.log(`- Annual CO2: ${carbonFootprintResult.annual_co2_kg} kg CO2 (${carbonFootprintResult.eco_rating.level})`);

    // Generate recommendations
    console.log('Generating recommendations...');
    // eslint-disable-next-line no-undef
    const recommendations = generateRecommendations(categoryResults);

    // Format final results with safety watchdog metadata
    const isPartial = !!filesData.isTruncated;
    const partialReason = filesData.truncationReason || null;
    const remainingFoldersCount = filesData.remainingFoldersCount || 0;

    // If scan was safely truncated at the 4-minute limit, inform the user
    if (isPartial) {
      recommendations.unshift({
        id: 'partial_scan_safety_notice',
        title: 'High-Volume Drive Safety Protection Active',
        description: `Drive Cleaner safely analyzed ${structuredFiles.length} files across your drive within Google Apps Script's safety window. You can clean these items now, or select specific folders for targeted cleaning.`,
        action_text: 'Review Scanned Files',
        category: 'performance',
        priority: 'HIGH',
        savings_bytes: 0,
        count: structuredFiles.length
      });
    }

    const scanResults = {
      success: true,
      folder_id: cleanFolderId,
      folder_name: folderName,
      total_files_scanned: structuredFiles.length,
      total_space_used_bytes: totalSpaceUsed,
      total_potential_savings_bytes: totalSavings,
      scan_date: new Date().toISOString(),
      is_partial: isPartial,
      partial_reason: partialReason,
      remaining_folders_count: remainingFoldersCount,
      elapsed_time_ms: filesData.elapsedTimeMs || (new Date() - scanStartTime),
      large_files: largeFilesResult,
      old_files: oldFilesResult,
      duplicates: duplicatesResult,
      empty_items: emptyItemsResult,
      temp_files: tempFilesResult,
      workspace_files: workspaceFilesResult,
      rot_analysis: rotAnalysisResult,
      carbon_footprint: carbonFootprintResult,
      recommendations: recommendations,
      error: null
    };

    const scanDuration = (new Date() - scanStartTime) / 1000;
    console.log(`Smart Scan complete in ${scanDuration.toFixed(2)} seconds`);
    console.log(`Total potential savings: ${totalSavings} bytes`);

    // Return as JSON string to guarantee reliable serialization across google.script.run
    return JSON.stringify(scanResults);
  } catch (error) {
    console.error(`Error in runSmartScan: ${error.message}`);
    console.error(error.stack);

    return JSON.stringify({
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
      workspace_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Google Workspace Files', category_type: 'workspace_files', type_breakdown: {}, unused_breakdown: { six_months: 0, one_year: 0, two_years: 0 }, sharing_breakdown: { shared: 0, private: 0, unknown: 0 } },
      rot_analysis: { count: 0, total_size_bytes: 0, category_name: 'Data ROT Analysis', category_type: 'rot_analysis', breakdown: { redundant: { count: 0, total_size_bytes: 0 }, obsolete: { count: 0, total_size_bytes: 0 }, trivial: { count: 0, total_size_bytes: 0 } }, clutter_index: { score: 0, target: 20, breakdown: { rot_ratio: 0, disorganization: 0, inertia: 0, data_gravity: 0 } }, hoarding_score: { total_score: 0, rating: { level: 'Minimal', color: 'green', icon: '✨' }, components: { clutter_volume: 0, disorganization: 0, accumulation: 0, attachment: 0 } }, freshness_distribution: { fresh: { count: 0, percentage: 0 }, aging: { count: 0, percentage: 0 }, stale: { count: 0, percentage: 0 }, rotting: { count: 0, percentage: 0 }, decayed: { count: 0, percentage: 0 } }, items: [] },
      carbon_footprint: { storage_gb: 0, annual_energy_kwh: 0, annual_co2_kg: 0, annual_co2_tonnes: 0, equivalents: { headline: '0 smartphone charges', car_miles: 0, car_km: 0, smartphone_charges: 0, tree_years: 0, burgers: 0, laptop_hours: 0, coffee_cups: 0 }, breakdown_by_type: {}, potential_savings: { cleanup_gb: 0, co2_saved_kg: 0, energy_saved_kwh: 0, equivalents: { headline: '0 smartphone charges', car_miles: 0, car_km: 0, smartphone_charges: 0, tree_years: 0, burgers: 0 } }, eco_rating: { level: 'Eco Champion', color: 'emerald', icon: '🌟', badge: 'Minimal Carbon Impact', message: 'No storage footprint.' }, achievements: [] },
      recommendations: [],
      error: error.message
    });
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

    const structuredFiles = filesData.map((fileItem) => {
      // If already a plain object
      if (fileItem && typeof fileItem === 'object' && !Array.isArray(fileItem)) {
        return {
          file_id: fileItem.file_id || fileItem.fileId || fileItem.id,
          file_name: fileItem.file_name || fileItem.fileName || fileItem.title,
          mime_type: fileItem.mime_type || fileItem.mimeType,
          parent_id: fileItem.parent_id || fileItem.parentId || '',
          parent_name: fileItem.parent_name || fileItem.parentName || '',
          size_bytes: fileItem.size_bytes || fileItem.fileSizeBytes || 0,
          created_date: fileItem.created_date || fileItem.createdDate || null,
          modified_date: fileItem.modified_date || fileItem.modifiedDate || null,
          last_viewed_date: fileItem.last_viewed_date || fileItem.lastViewedDate || null,
          is_shared: fileItem.is_shared !== undefined ? fileItem.is_shared : (fileItem.shared === true || (fileItem.sharingStatus && fileItem.sharingStatus !== 'Private')),
          sharing_status: fileItem.sharing_status || fileItem.sharingStatus || 'Private',
          owner_names: fileItem.owner_names || fileItem.ownerNames || ''
        };
      }

      // Enhanced 15-element array format from parseForSpreadsheet:
      // [0: icon, 1: fileName, 2: fileSizeFormatted, 3: fileCategory, 4: modifiedDateFormatted,
      //  5: createdDateFormatted, 6: lastViewedDateFormatted, 7: ownerNames, 8: sharingStatus,
      //  9: starred, 10: parentName, 11: fileId, 12: driveLink, 13: mimeType, 14: fileSizeBytes]
      if (Array.isArray(fileItem) && fileItem.length >= 14) {
        const fileName = fileItem[1];
        const modifiedDate = fileItem[4];
        const createdDate = fileItem[5];
        const lastViewedDate = fileItem[6];
        const ownerNames = fileItem[7];
        const sharingStatus = fileItem[8];
        const parentName = fileItem[10];
        const fileId = fileItem[11];
        const driveLink = fileItem[12];
        const mimeType = fileItem[13];
        const sizeBytes = typeof fileItem[14] === 'number' ? fileItem[14] : (parseInt(fileItem[14], 10) || 0);

        return {
          file_id: fileId,
          file_name: fileName,
          mime_type: mimeType,
          parent_id: '',
          parent_name: parentName,
          size_bytes: sizeBytes,
          created_date: createdDate,
          modified_date: modifiedDate,
          last_viewed_date: lastViewedDate,
          is_shared: Boolean(sharingStatus && sharingStatus !== 'Private'),
          sharing_status: sharingStatus,
          owner_names: ownerNames,
          drive_link: driveLink
        };
      }

      // Legacy array format: [icon, file_name, file_id, parent_name, parent_id, mime_type, ...extraFields]
      const [_icon, fileName, fileId, parentName, parentId, mimeType, ...extraFields] = fileItem;

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
        size_bytes: extraFields[0] || 0,
        created_date: extraFields[1] || null,
        modified_date: extraFields[2] || null,
        last_viewed_date: extraFields[3] || null,
        is_shared: false,
        sharing_status: 'Private',
        owner_names: ''
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
 * Executes a single chunk of Smart Scan directory indexing.
 * Called iteratively by the client to scan large drives without hitting GAS 6-minute limits.
 *
 * @param {string|Object} optionsPayload - JSON string or object { folderId, corpora, queue, pathLookup, chunkIndex, timeBudgetMs }
 * @returns {string} JSON string of chunk result
 */
function runSmartScanChunk(optionsPayload) {
  const chunkStartTime = Date.now();
  try {
    let opts = optionsPayload;
    if (typeof optionsPayload === 'string') {
      try {
        opts = JSON.parse(optionsPayload);
      } catch (e) {
        opts = {};
      }
    }
    opts = opts || {};

    const rawFolderId = opts.folderId || 'root';
    let cleanFolderId = rawFolderId.trim();
    if (!cleanFolderId || cleanFolderId.toLowerCase() === 'root') {
      cleanFolderId = 'root';
    } else if (cleanFolderId.includes('/')) {
      const match = cleanFolderId.match(/folders\/([A-Za-z0-9_-]+)/) || cleanFolderId.match(/[?&]id=([A-Za-z0-9_-]+)/);
      if (match && match[1]) cleanFolderId = match[1];
    }

    const corpora = opts.corpora || 'user';
    const chunkIndex = Number(opts.chunkIndex || 0);
    const timeBudgetMs = Number(opts.timeBudgetMs || 45000); // 45 seconds default

    // Call DriveApiHelpers.fetchDirectoryBatch
    const batchResult = DriveApiHelpers.fetchDirectoryBatch({
      rootFolderId: cleanFolderId,
      corpora: corpora,
      queue: opts.queue,
      pathLookup: opts.pathLookup,
      timeBudgetMs: timeBudgetMs,
      maxItems: 3000
    });

    // Convert raw rows to structured file objects
    const structuredFiles = createAnalysisContext_(batchResult.items || []);

    const response = {
      success: true,
      isComplete: !!batchResult.isComplete,
      chunkIndex: chunkIndex,
      folderId: cleanFolderId,
      folderName: (batchResult.rootFolderInfo && batchResult.rootFolderInfo.name) ? batchResult.rootFolderInfo.name : 'Target Folder',
      files: structuredFiles,
      remainingQueue: batchResult.remainingQueue || [],
      pathLookup: batchResult.pathLookup || {},
      skippedFolders: batchResult.skippedFolders || [],
      chunkFilesCount: structuredFiles.length,
      remainingFoldersCount: (batchResult.remainingQueue || []).length,
      elapsedMs: Date.now() - chunkStartTime,
      error: null
    };

    return JSON.stringify(response);
  } catch (err) {
    console.error(`Error in runSmartScanChunk: ${err.message}`, err.stack);
    return JSON.stringify({
      success: false,
      isComplete: false,
      chunkIndex: 0,
      folderId: 'unknown',
      folderName: 'Target Folder',
      files: [],
      remainingQueue: [],
      pathLookup: {},
      skippedFolders: [],
      chunkFilesCount: 0,
      remainingFoldersCount: 0,
      elapsedMs: Date.now() - chunkStartTime,
      error: err.message || 'Chunk scan encountered an error'
    });
  }
}

/**
 * Finalizes Smart Scan analysis across all accumulated files from chunks.
 * Executes all 7 analyzers, calculates savings, ROT clutter, carbon footprint, and smart recommendations.
 *
 * @param {Array|string} filesPayload - Array or JSON string of accumulated structured files
 * @param {string} [folderId='root'] - Target folder ID
 * @param {string} [folderName='My Drive'] - Target folder display name
 * @param {string|Object} [extraMeta] - Optional additional metadata
 * @returns {string} JSON string of complete ScanResultsProps
 */
function finishSmartScan(filesPayload, folderId, folderName, extraMeta) {
  const finishStartTime = Date.now();
  try {
    let structuredFiles = filesPayload;
    if (typeof filesPayload === 'string') {
      try {
        structuredFiles = JSON.parse(filesPayload);
      } catch (e) {
        structuredFiles = [];
      }
    }
    structuredFiles = Array.isArray(structuredFiles) ? structuredFiles : [];

    const cleanFolderId = folderId || 'root';
    const targetFolderName = folderName || (cleanFolderId === 'root' ? 'My Drive' : 'Drive Folder');

    console.log(`Finalizing Smart Scan on ${structuredFiles.length} files...`);

    if (structuredFiles.length === 0) {
      return JSON.stringify({
        success: true,
        folder_id: cleanFolderId,
        folder_name: targetFolderName,
        total_files_scanned: 0,
        total_space_used_bytes: 0,
        total_potential_savings_bytes: 0,
        scan_date: new Date().toISOString(),
        large_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Large Files', category_type: 'large_files' },
        old_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Old Files', category_type: 'old_files' },
        duplicates: { count: 0, total_size_bytes: 0, items: [], category_name: 'Duplicate Files', category_type: 'duplicates' },
        empty_items: { count: 0, total_size_bytes: 0, items: [], category_name: 'Empty Items', category_type: 'empty_items' },
        temp_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Temporary Files', category_type: 'temp_files' },
        workspace_files: { count: 0, total_size_bytes: 0, items: [], category_name: 'Google Workspace Files', category_type: 'workspace_files', type_breakdown: {}, unused_breakdown: { six_months: 0, one_year: 0, two_years: 0 }, sharing_breakdown: { shared: 0, private: 0, unknown: 0 } },
        rot_analysis: { count: 0, total_size_bytes: 0, category_name: 'Data ROT Analysis', category_type: 'rot_analysis', breakdown: { redundant: { count: 0, total_size_bytes: 0 }, obsolete: { count: 0, total_size_bytes: 0 }, trivial: { count: 0, total_size_bytes: 0 } }, clutter_index: { score: 0, target: 20, breakdown: { rot_ratio: 0, disorganization: 0, inertia: 0, data_gravity: 0 } }, hoarding_score: { total_score: 0, rating: { level: 'Minimal', color: 'green', icon: '✨' }, components: { clutter_volume: 0, disorganization: 0, accumulation: 0, attachment: 0 } }, freshness_distribution: { fresh: { count: 0, percentage: 0 }, aging: { count: 0, percentage: 0 }, stale: { count: 0, percentage: 0 }, rotting: { count: 0, percentage: 0 }, decayed: { count: 0, percentage: 0 } }, items: [] },
        carbon_footprint: { storage_gb: 0, annual_energy_kwh: 0, annual_co2_kg: 0, annual_co2_tonnes: 0, equivalents: { headline: '0 smartphone charges', car_miles: 0, car_km: 0, smartphone_charges: 0, tree_years: 0, burgers: 0, laptop_hours: 0, coffee_cups: 0 }, breakdown_by_type: {}, potential_savings: { cleanup_gb: 0, co2_saved_kg: 0, energy_saved_kwh: 0, equivalents: { headline: '0 smartphone charges', car_miles: 0, car_km: 0, smartphone_charges: 0, tree_years: 0, burgers: 0 } }, eco_rating: { level: 'Eco Champion', color: 'emerald', icon: '🌟', badge: 'Minimal Carbon Impact', message: 'No storage footprint.' }, achievements: [] },
        recommendations: [],
        error: null
      });
    }

    // Run all analyzers
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
    // eslint-disable-next-line no-undef
    const workspaceFilesResult = analyzeWorkspaceFiles(structuredFiles);
    // eslint-disable-next-line no-undef
    const rotAnalysisResult = analyzeROT(structuredFiles);

    // Calculate total space used
    const totalSpaceUsed = structuredFiles.reduce(function (sum, file) {
      return sum + (file.size_bytes || 0);
    }, 0);

    const categoryResults = {
      large_files: largeFilesResult,
      old_files: oldFilesResult,
      empty_items: emptyItemsResult,
      temp_files: tempFilesResult,
      duplicates: duplicatesResult,
      workspace_files: workspaceFilesResult,
      rot_analysis: rotAnalysisResult
    };

    // Calculate total potential savings
    // eslint-disable-next-line no-undef
    const totalSavings = calculateTotalSavings(categoryResults);

    // Run Carbon Footprint Analyzer
    // eslint-disable-next-line no-undef
    const carbonFootprintResult = analyzeCarbonFootprint(structuredFiles, totalSavings);

    // Generate recommendations
    // eslint-disable-next-line no-undef
    const recommendations = generateRecommendations(categoryResults);

    const scanResults = {
      success: true,
      folder_id: cleanFolderId,
      folder_name: targetFolderName,
      total_files_scanned: structuredFiles.length,
      total_space_used_bytes: totalSpaceUsed,
      total_potential_savings_bytes: totalSavings,
      scan_date: new Date().toISOString(),
      is_partial: false,
      elapsed_time_ms: Date.now() - finishStartTime,
      large_files: largeFilesResult,
      old_files: oldFilesResult,
      duplicates: duplicatesResult,
      empty_items: emptyItemsResult,
      temp_files: tempFilesResult,
      workspace_files: workspaceFilesResult,
      rot_analysis: rotAnalysisResult,
      carbon_footprint: carbonFootprintResult,
      recommendations: recommendations,
      error: null
    };

    return JSON.stringify(scanResults);
  } catch (error) {
    console.error(`Error in finishSmartScan: ${error.message}`, error.stack);
    return JSON.stringify({
      success: false,
      error: error.message || 'Failed to finalize Smart Scan analysis'
    });
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
  const res = runSmartScan('root', 'user');
  return typeof res === 'string' ? JSON.parse(res) : res;
}

// Export public functions to global scope for GAS
globalThis.runSmartScan = runSmartScan;
globalThis.runSmartScanChunk = runSmartScanChunk;
globalThis.finishSmartScan = finishSmartScan;
globalThis.testSmartScan = testSmartScan;
