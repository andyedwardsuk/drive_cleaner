`/**
 * @fileoverview Smart Scan Test Functions
 *
 * Test functions for Smart Scan feature. These can be run remotely using:
 * clasp run testSmartScanMetadata
 * clasp run testSmartScanSampleFolder
 *
 * @author Drive Cleaner Dev Team
 */

/**
 * Test Enhanced Metadata Collection
 *
 * Tests that the enhanced metadata fields are being collected from Drive API.
 * This test verifies Issue #1 (Enhanced Metadata Collection) is working.
 *
 * @returns {Object} Test results with metadata field verification
 */
function testSmartScanMetadata() {
  console.log('===== TESTING ENHANCED METADATA COLLECTION =====');

  try {
    // Get a small sample of files from My Drive root
    const folders = [{ id: 'root', name: 'My Drive' }];

    // Call the function that uses enhanced metadata
    // eslint-disable-next-line no-undef
    const result = getItemsForFolderArray_(folders, null, undefined, 'user');

    if (!result || !result.items || result.items.length === 0) {
      return {
        success: false,
        message: 'No items returned from Drive API',
        error: 'Empty result set'
      };
    }

    // Check first file for enhanced metadata fields
    const firstFile = result.items[0];

    // Core fields (should always be present)
    const coreFields = {
      id: firstFile.id !== undefined,
      title: firstFile.title !== undefined,
      mimeType: firstFile.mimeType !== undefined,
      createdDate: firstFile.createdDate !== undefined,
      modifiedDate: firstFile.modifiedDate !== undefined,
      owners: firstFile.owners !== undefined,
      shared: firstFile.shared !== undefined
    };

    // Optional fields (may not exist for all file types)
    const optionalFields = {
      fileSize: firstFile.fileSize !== undefined,
      lastViewedByMeDate: firstFile.lastViewedByMeDate !== undefined,
      'labels.starred': firstFile.labels && firstFile.labels.starred !== undefined,
      fileExtension: firstFile.fileExtension !== undefined,
      thumbnailLink: firstFile.thumbnailLink !== undefined
    };

    const allFields = { ...coreFields, ...optionalFields };

    const missingCoreFields = Object.entries(coreFields)
      .filter(([, exists]) => !exists)
      .map(([field]) => field);

    const missingOptionalFields = Object.entries(optionalFields)
      .filter(([, exists]) => !exists)
      .map(([field]) => field);

    const successRate = Object.values(allFields).filter(v => v).length /
                       Object.keys(allFields).length * 100;

    console.log('Core Metadata Fields:', coreFields);
    console.log('Optional Metadata Fields:', optionalFields);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);

    const isGoogleWorkspaceDoc = firstFile.mimeType &&
      firstFile.mimeType.startsWith('application/vnd.google-apps.');

    return {
      success: missingCoreFields.length === 0,
      message: missingCoreFields.length === 0
        ? `Core metadata collection working! (${successRate.toFixed(1)}% overall)`
        : `Missing core fields: ${missingCoreFields.join(', ')}`,
      core_fields_present: coreFields,
      optional_fields_present: optionalFields,
      missing_core_fields: missingCoreFields,
      missing_optional_fields: missingOptionalFields,
      success_rate: `${successRate.toFixed(1)}%`,
      is_google_workspace_doc: isGoogleWorkspaceDoc,
      note: isGoogleWorkspaceDoc
        ? 'Sample is a Google Workspace doc - some fields like fileSize/fileExtension may not apply'
        : 'Sample is a regular file',
      sample_file: {
        title: firstFile.title,
        mimeType: firstFile.mimeType,
        fileSize: firstFile.fileSize,
        createdDate: firstFile.createdDate,
        modifiedDate: firstFile.modifiedDate,
        lastViewedByMeDate: firstFile.lastViewedByMeDate,
        shared: firstFile.shared,
        starred: firstFile.labels ? firstFile.labels.starred : undefined,
        fileExtension: firstFile.fileExtension,
        thumbnailLink: firstFile.thumbnailLink
      },
      total_files_sampled: result.items.length
    };

  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      message: 'Test failed with error',
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Test Smart Scan on Sample Folder
 *
 * Runs a full Smart Scan on My Drive root (limited scan) to verify
 * all analyzers are working with enhanced metadata.
 *
 * @returns {Object} Smart Scan results
 */
function testSmartScanSampleFolder() {
  console.log('===== TESTING SMART SCAN WITH ENHANCED METADATA =====');

  try {
    // Run Smart Scan on My Drive root
    // eslint-disable-next-line no-undef
    const scanResults = runSmartScan('root', 'user');

    console.log('Scan Results:', JSON.stringify(scanResults, null, 2));

    // Verify scan structure
    const expectedCategories = [
      'large_files',
      'old_files',
      'duplicates',
      'empty_items',
      'temp_files',
      'workspace_files'
    ];

    const categoriesPresent = {};
    expectedCategories.forEach(category => {
      categoriesPresent[category] = scanResults[category] !== undefined;
    });

    const allCategoriesPresent = Object.values(categoriesPresent).every(v => v);

    return {
      success: scanResults.success && allCategoriesPresent,
      message: scanResults.success
        ? `Scan completed! Found ${scanResults.total_files_scanned} files`
        : `Scan failed: ${scanResults.error}`,
      scan_summary: {
        total_files_scanned: scanResults.total_files_scanned,
        total_space_used_bytes: scanResults.total_space_used_bytes,
        total_potential_savings_bytes: scanResults.total_potential_savings_bytes,
        scan_date: scanResults.scan_date
      },
      categories_present: categoriesPresent,
      category_counts: {
        large_files: scanResults.large_files?.count || 0,
        old_files: scanResults.old_files?.count || 0,
        duplicates: scanResults.duplicates?.count || 0,
        empty_items: scanResults.empty_items?.count || 0,
        temp_files: scanResults.temp_files?.count || 0,
        workspace_files: scanResults.workspace_files?.count || 0
      },
      recommendations_count: scanResults.recommendations?.length || 0,
      full_results: scanResults
    };

  } catch (error) {
    console.error('Smart Scan test failed:', error);
    return {
      success: false,
      message: 'Smart Scan test failed with error',
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Test Specific Analyzer - Large Files
 *
 * Tests the large files analyzer with sample data
 *
 * @returns {Object} Analyzer test results
 */
function testLargeFilesAnalyzer() {
  console.log('===== TESTING LARGE FILES ANALYZER =====');

  try {
    // Create sample files with various sizes
    const sampleFiles = [
      {
        id: 'file1',
        title: 'large_video.mp4',
        mimeType: 'video/mp4',
        fileSize: '524288000', // 500 MB
        alternateLink: 'https://drive.google.com/file/d/file1'
      },
      {
        id: 'file2',
        title: 'huge_backup.zip',
        mimeType: 'application/zip',
        fileSize: '1073741824', // 1 GB
        alternateLink: 'https://drive.google.com/file/d/file2'
      },
      {
        id: 'file3',
        title: 'small_doc.txt',
        mimeType: 'text/plain',
        fileSize: '1024', // 1 KB
        alternateLink: 'https://drive.google.com/file/d/file3'
      }
    ];

    // eslint-disable-next-line no-undef
    const result = analyzeLargeFiles(sampleFiles);

    console.log('Large Files Analysis:', JSON.stringify(result, null, 2));

    return {
      success: true,
      message: `Found ${result.count} large files`,
      analyzer_result: result,
      expected_count: 2, // Should find 2 large files (>100MB)
      actual_count: result.count,
      matches_expected: result.count === 2
    };

  } catch (error) {
    console.error('Large files analyzer test failed:', error);
    return {
      success: false,
      message: 'Large files analyzer test failed',
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Test ROT Analysis & Digital Hoarding Assessment
 *
 * Verifies that analyzeROT correctly identifies Redundant, Obsolete,
 * and Trivial files and computes Clutter Index and Hoarding score.
 *
 * @returns {Object} Test results
 */
function testRotAnalysis() {
  console.log('===== TESTING DATA ROT & HOARDING ANALYSIS =====');

  try {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const eighteenMonthsAgo = new Date();
    eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18);

    const mockFiles = [
      // Redundant
      { file_id: 'r1', file_name: 'Budget.xlsx', size_bytes: 50000, modified_date: '2024-01-01', created_date: '2024-01-01', mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { file_id: 'r2', file_name: 'Budget.xlsx', size_bytes: 50000, modified_date: '2024-01-02', created_date: '2024-01-02', mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { file_id: 'r3', file_name: 'Pitch Deck v1.pptx', size_bytes: 2000000, modified_date: '2023-01-01', created_date: '2023-01-01', mime_type: 'application/vnd.google-apps.presentation' },
      { file_id: 'r4', file_name: 'Pitch Deck final.pptx', size_bytes: 2100000, modified_date: '2024-01-01', created_date: '2024-01-01', mime_type: 'application/vnd.google-apps.presentation' },
      // Obsolete
      { file_id: 'o1', file_name: 'Archive 2022.pdf', size_bytes: 1000000, last_viewed_date: twoYearsAgo.toISOString(), modified_date: twoYearsAgo.toISOString(), mime_type: 'application/pdf' },
      { file_id: 'o2', file_name: 'Old Notes.docx', size_bytes: 40000, last_viewed_date: eighteenMonthsAgo.toISOString(), modified_date: eighteenMonthsAgo.toISOString(), mime_type: 'application/vnd.google-apps.document' },
      // Trivial
      { file_id: 't1', file_name: 'Screenshot 2024-05-10 at 14.20.png', size_bytes: 350000, modified_date: '2024-05-10', mime_type: 'image/png' },
      { file_id: 't2', file_name: 'Untitled document', size_bytes: 0, modified_date: '2024-05-10', mime_type: 'application/vnd.google-apps.document' },
      { file_id: 't3', file_name: 'stub.txt', size_bytes: 256, modified_date: '2024-05-10', mime_type: 'text/plain' },
      // Fresh/Active
      { file_id: 'f1', file_name: 'Q3 Report.pdf', size_bytes: 500000, modified_date: new Date().toISOString(), last_viewed_date: new Date().toISOString(), mime_type: 'application/pdf' }
    ];

    // eslint-disable-next-line no-undef
    const rot = analyzeROT(mockFiles);

    const hasRedundant = rot.breakdown.redundant.count > 0;
    const hasObsolete = rot.breakdown.obsolete.count > 0;
    const hasTrivial = rot.breakdown.trivial.count > 0;
    const validClutter = rot.clutter_index.score >= 0 && rot.clutter_index.score <= 100;
    const validHoarding = rot.hoarding_score.total_score >= 0 && rot.hoarding_score.total_score <= 100;

    const success = hasRedundant && hasObsolete && hasTrivial && validClutter && validHoarding;

    console.log(`ROT Test Results: Redundant=${rot.breakdown.redundant.count}, Obsolete=${rot.breakdown.obsolete.count}, Trivial=${rot.breakdown.trivial.count}`);
    console.log(`Clutter Index: ${rot.clutter_index.score}/100, Hoarding Score: ${rot.hoarding_score.total_score}/100 (${rot.hoarding_score.rating.level})`);

    return {
      success,
      message: success ? 'ROT analysis verified successfully' : 'ROT verification failed',
      clutter_score: rot.clutter_index.score,
      hoarding_level: rot.hoarding_score.rating.level,
      rot_items_count: rot.count
    };
  } catch (error) {
    console.error('ROT analysis test failed:', error);
    return {
      success: false,
      message: 'ROT analysis test failed',
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Run All Tests
 *
 * Convenience function to run all Smart Scan tests in sequence
 *
 * @returns {Object} Combined test results
 */
function runAllSmartScanTests() {
  console.log('========================================');
  console.log('RUNNING ALL SMART SCAN TESTS');
  console.log('========================================');

  const results = {
    metadata_test: testSmartScanMetadata(),
    analyzer_test: testLargeFilesAnalyzer(),
    rot_test: testRotAnalysis(),
    full_scan_test: testSmartScanSampleFolder()
  };

  const allPassed = results.metadata_test.success &&
                    results.analyzer_test.success &&
                    results.rot_test.success &&
                    results.full_scan_test.success;

  console.log('========================================');
  console.log(`ALL TESTS ${allPassed ? 'PASSED' : 'FAILED'}`);
  console.log('========================================');

  return {
    overall_success: allPassed,
    summary: {
      metadata_test: results.metadata_test.success ? 'PASS' : 'FAIL',
      analyzer_test: results.analyzer_test.success ? 'PASS' : 'FAIL',
      rot_test: results.rot_test.success ? 'PASS' : 'FAIL',
      full_scan_test: results.full_scan_test.success ? 'PASS' : 'FAIL'
    },
    detailed_results: results
  };
}
