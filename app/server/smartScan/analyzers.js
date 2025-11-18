//########### SMART SCAN ANALYZERS ###########

/**
 * @fileoverview File analysis functions for Smart Scan feature
 *
 * Provides category-specific analyzers that identify different types
 * of files for cleanup: large files, old files, empty items, temporary
 * files, and duplicates. Each analyzer returns structured results with
 * counts, sizes, and recommendations.
 *
 * @author Drive Cleaner Dev Team
 * @version 1.0.0
 */

/**
 * Default temporary file detection patterns
 * Used by analyzeTempFiles to identify temporary and system files
 */
const DEFAULT_TEMP_PATTERNS = {
  extensions: ['.tmp', '.temp', '.bak', '.backup', '.cache', '.swp', '.swo', '.old'],
  prefixes: ['~$', '._', '.~'],
  suffixes: ['~'],
  exact_names: ['Thumbs.db', '.DS_Store', 'desktop.ini', '.localized']
};

/**
 * Results for a specific analysis category
 * @typedef {Object} CategoryResultProps
 * @property {number} count - Number of items found in this category
 * @property {number} total_size_bytes - Total size of all items in bytes
 * @property {Array<FileAnalysisProps>} items - Individual file details
 * @property {string} category_name - Human-readable category name
 * @property {string} category_type - Technical category identifier
 */

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

/**
 * Analyse files for large size (>100MB, >500MB, >1GB)
 *
 * Identifies files exceeding configurable size thresholds and categorises
 * them by severity. Useful for finding files that consume significant
 * storage space.
 *
 * @param {Array<Object>} filesData - Structured file objects from analysis context
 * @param {Object} [thresholds] - Size thresholds in bytes
 * @param {number} [thresholds.medium=104857600] - Medium threshold (100MB)
 * @param {number} [thresholds.large=524288000] - Large threshold (500MB)
 * @param {number} [thresholds.very_large=1073741824] - Very large threshold (1GB)
 * @returns {CategoryResultProps} Large files analysis results
 *
 * @example
 * // Use default thresholds (100MB, 500MB, 1GB)
 * const results = analyzeLargeFiles(filesData)
 * // Returns: { count: 15, total_size_bytes: 5368709120, items: [...] }
 *
 * @example
 * // Custom thresholds
 * const results = analyzeLargeFiles(filesData, {
 *   medium: 52428800,   // 50MB
 *   large: 209715200,   // 200MB
 *   very_large: 524288000 // 500MB
 * })
 */
function analyzeLargeFiles(filesData, thresholds) {
  try {
    // Set default thresholds
    const defaultThresholds = {
      medium: 104857600,      // 100MB
      large: 524288000,       // 500MB
      very_large: 1073741824  // 1GB
    };
    const actualThresholds = thresholds || defaultThresholds;

    // Validate input
    if (!Array.isArray(filesData)) {
      console.warn('analyzeLargeFiles: filesData is not an array');
      return {
        count: 0,
        total_size_bytes: 0,
        items: [],
        category_name: 'Large Files',
        category_type: 'large_files'
      };
    }

    // Filter for large files
    const largeFiles = filesData.filter(file => {
      return file.size_bytes && file.size_bytes >= actualThresholds.medium;
    });

    // Process each large file
    const processedItems = largeFiles.map(file => {
      const matchedCriteria = [];
      let safetyLevel = 'review';

      // Determine threshold level
      if (file.size_bytes >= actualThresholds.very_large) {
        matchedCriteria.push('very_large_file');
      } else if (file.size_bytes >= actualThresholds.large) {
        matchedCriteria.push('large_file');
      } else {
        matchedCriteria.push('medium_large_file');
      }

      // Generate recommendation based on file age
      let recommendation = 'Review large file - consider archiving or deletion';
      if (file.modified_date) {
        const modifiedDate = new Date(file.modified_date);
        const ageInDays = (Date.now() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (ageInDays > 365) {
          recommendation = 'Old large file - strong candidate for archival';
          safetyLevel = 'safe';
        }
      }

      return {
        file_id: file.file_id,
        file_name: file.file_name,
        mime_type: file.mime_type,
        size_bytes: file.size_bytes,
        created_date: file.created_date,
        modified_date: file.modified_date,
        last_viewed_date: file.last_viewed_date,
        parent_id: file.parent_id,
        parent_name: file.parent_name,
        matched_criteria: matchedCriteria,
        safety_level: safetyLevel,
        recommendation: recommendation
      };
    });

    // Calculate total size
    const totalSize = processedItems.reduce((sum, file) => sum + file.size_bytes, 0);

    return {
      count: processedItems.length,
      total_size_bytes: totalSize,
      items: processedItems,
      category_name: 'Large Files',
      category_type: 'large_files'
    };
  } catch (error) {
    console.error(`Error in analyzeLargeFiles: ${error.message}`);
    return {
      count: 0,
      total_size_bytes: 0,
      items: [],
      category_name: 'Large Files',
      category_type: 'large_files'
    };
  }
}

/**
 * Analyse files for age (>1 year, >2 years, >5 years old)
 *
 * Identifies files that haven't been modified in a long time, making them
 * candidates for archival or deletion. Uses modified_date and last_viewed_date
 * to assess file age and usage.
 *
 * @param {Array<Object>} filesData - Structured file objects from analysis context
 * @param {Object} [ageThresholds] - Age thresholds in days
 * @param {number} [ageThresholds.moderate=365] - Moderate age (1 year)
 * @param {number} [ageThresholds.old=730] - Old age (2 years)
 * @param {number} [ageThresholds.very_old=1825] - Very old age (5 years)
 * @returns {CategoryResultProps} Old files analysis results
 *
 * @example
 * // Use default thresholds (1yr, 2yr, 5yr)
 * const results = analyzeOldFiles(filesData)
 * // Returns: { count: 42, total_size_bytes: 314572800, items: [...] }
 *
 * @example
 * // Custom thresholds
 * const results = analyzeOldFiles(filesData, {
 *   moderate: 180,  // 6 months
 *   old: 365,       // 1 year
 *   very_old: 730   // 2 years
 * })
 */
function analyzeOldFiles(filesData, ageThresholds) {
  try {
    // Set default thresholds
    const defaultThresholds = {
      moderate: 365,   // 1 year
      old: 730,        // 2 years
      very_old: 1825   // 5 years
    };
    const actualThresholds = ageThresholds || defaultThresholds;

    // Validate input
    if (!Array.isArray(filesData)) {
      console.warn('analyzeOldFiles: filesData is not an array');
      return {
        count: 0,
        total_size_bytes: 0,
        items: [],
        category_name: 'Old Files',
        category_type: 'old_files'
      };
    }

    const currentDate = new Date();

    // Filter for old files
    const oldFiles = filesData.filter(file => {
      if (!file.modified_date) {
        return false;
      }

      const modifiedDate = new Date(file.modified_date);
      const ageInDays = (currentDate - modifiedDate) / (1000 * 60 * 60 * 24);

      return ageInDays >= actualThresholds.moderate;
    });

    // Process each old file
    const processedItems = oldFiles.map(file => {
      const modifiedDate = new Date(file.modified_date);
      const ageInDays = (currentDate - modifiedDate) / (1000 * 60 * 60 * 24);
      const matchedCriteria = [];
      let safetyLevel = 'review';
      let recommendation = 'Review old file - consider if still needed';

      // Determine age level
      if (ageInDays >= actualThresholds.very_old) {
        matchedCriteria.push('very_old_file');
        safetyLevel = 'safe';
        recommendation = 'Very old file (>5 years) - strong candidate for deletion';
      } else if (ageInDays >= actualThresholds.old) {
        matchedCriteria.push('old_file');
        recommendation = 'Old file (>2 years) - review before deletion';
      } else {
        matchedCriteria.push('moderately_old_file');
      }

      // Check last viewed date for additional context
      if (file.last_viewed_date) {
        const lastViewedDate = new Date(file.last_viewed_date);
        const daysSinceViewed = (currentDate - lastViewedDate) / (1000 * 60 * 60 * 24);
        if (daysSinceViewed > 730) {
          safetyLevel = 'safe';
          recommendation = 'Not viewed in 2+ years - safe to delete';
        }
      }

      return {
        file_id: file.file_id,
        file_name: file.file_name,
        mime_type: file.mime_type,
        size_bytes: file.size_bytes,
        created_date: file.created_date,
        modified_date: file.modified_date,
        last_viewed_date: file.last_viewed_date,
        parent_id: file.parent_id,
        parent_name: file.parent_name,
        matched_criteria: matchedCriteria,
        safety_level: safetyLevel,
        recommendation: recommendation
      };
    });

    // Calculate total size
    const totalSize = processedItems.reduce((sum, file) => sum + (file.size_bytes || 0), 0);

    return {
      count: processedItems.length,
      total_size_bytes: totalSize,
      items: processedItems,
      category_name: 'Old Files',
      category_type: 'old_files'
    };
  } catch (error) {
    console.error(`Error in analyzeOldFiles: ${error.message}`);
    return {
      count: 0,
      total_size_bytes: 0,
      items: [],
      category_name: 'Old Files',
      category_type: 'old_files'
    };
  }
}

/**
 * Analyse for empty files (0 bytes) and empty folders
 *
 * Identifies files with zero size and folders with no children.
 * These items typically serve no purpose and are safe to delete.
 *
 * @param {Array<Object>} filesData - Structured file objects from analysis context
 * @returns {CategoryResultProps} Empty items analysis results
 *
 * @example
 * // Identify empty files and folders
 * const results = analyzeEmptyItems(filesData)
 * // Returns: { count: 5, total_size_bytes: 0, items: [...] }
 *
 * @example
 * // Handle empty data set
 * const results = analyzeEmptyItems([])
 * // Returns: { count: 0, total_size_bytes: 0, items: [] }
 */
function analyzeEmptyItems(filesData) {
  try {
    // Validate input
    if (!Array.isArray(filesData)) {
      console.warn('analyzeEmptyItems: filesData is not an array');
      return {
        count: 0,
        total_size_bytes: 0,
        items: [],
        category_name: 'Empty Items',
        category_type: 'empty_items'
      };
    }

    // Identify empty files and folders
    const emptyItems = filesData.filter(file => {
      const isFolder = file.mime_type === 'application/vnd.google-apps.folder';
      const isGoogleWorkspaceDoc = file.mime_type && file.mime_type.startsWith('application/vnd.google-apps.');

      // Google Workspace docs (Docs, Sheets, Slides, etc.) don't have fileSize - exclude them
      // They're stored differently and can't be "empty" in the traditional sense
      if (isGoogleWorkspaceDoc && !isFolder) {
        return false;
      }

      // Only treat as empty if size_bytes exists and equals 0 (not undefined/null)
      const isEmptyFile = !isFolder && file.size_bytes === 0;

      // For folders, check if they have children
      if (isFolder) {
        const hasChildren = filesData.some(f => f.parent_id === file.file_id);
        return !hasChildren;
      }

      return isEmptyFile;
    });

    // Process each empty item
    const processedItems = emptyItems.map(file => {
      const isFolder = file.mime_type === 'application/vnd.google-apps.folder';
      const matchedCriteria = isFolder ? ['empty_folder'] : ['zero_bytes'];
      const recommendation = isFolder ? 'Empty folder - safe to delete' : 'Zero-byte file - safe to delete';

      return {
        file_id: file.file_id,
        file_name: file.file_name,
        mime_type: file.mime_type,
        size_bytes: file.size_bytes || 0,
        created_date: file.created_date,
        modified_date: file.modified_date,
        last_viewed_date: file.last_viewed_date,
        parent_id: file.parent_id,
        parent_name: file.parent_name,
        matched_criteria: matchedCriteria,
        safety_level: 'safe',
        recommendation: recommendation
      };
    });

    return {
      count: processedItems.length,
      total_size_bytes: 0, // Empty items have no size
      items: processedItems,
      category_name: 'Empty Items',
      category_type: 'empty_items'
    };
  } catch (error) {
    console.error(`Error in analyzeEmptyItems: ${error.message}`);
    return {
      count: 0,
      total_size_bytes: 0,
      items: [],
      category_name: 'Empty Items',
      category_type: 'empty_items'
    };
  }
}

/**
 * Analyse for temporary files by pattern matching
 *
 * Identifies temporary and system files using pattern matching on file names.
 * Matches against extensions (.tmp, .bak), prefixes (~$), and exact names
 * (Thumbs.db, .DS_Store).
 *
 * @param {Array<Object>} filesData - Structured file objects from analysis context
 * @param {Object} [patterns] - Detection patterns (uses DEFAULT_TEMP_PATTERNS if not provided)
 * @param {Array<string>} [patterns.extensions] - File extensions to match
 * @param {Array<string>} [patterns.prefixes] - Filename prefixes to match
 * @param {Array<string>} [patterns.suffixes] - Filename suffixes to match
 * @param {Array<string>} [patterns.exact_names] - Exact filenames to match
 * @returns {CategoryResultProps} Temporary files analysis results
 *
 * @example
 * // Use default patterns
 * const results = analyzeTempFiles(filesData)
 * // Returns: { count: 12, total_size_bytes: 52428800, items: [...] }
 *
 * @example
 * // Custom patterns
 * const results = analyzeTempFiles(filesData, {
 *   extensions: ['.log', '.cache'],
 *   prefixes: ['temp_'],
 *   suffixes: ['.backup'],
 *   exact_names: ['debug.txt']
 * })
 *
 * @example
 * // Identify only .tmp files
 * const results = analyzeTempFiles(filesData, {
 *   extensions: ['.tmp'],
 *   prefixes: [],
 *   suffixes: [],
 *   exact_names: []
 * })
 */
function analyzeTempFiles(filesData, patterns) {
  try {
    // Use default patterns if not provided
    const actualPatterns = patterns || DEFAULT_TEMP_PATTERNS;

    // Validate input
    if (!Array.isArray(filesData)) {
      console.warn('analyzeTempFiles: filesData is not an array');
      return {
        count: 0,
        total_size_bytes: 0,
        items: [],
        category_name: 'Temporary Files',
        category_type: 'temp_files'
      };
    }

    // Filter for temp files
    const tempFiles = filesData.filter(file => {
      if (!file.file_name) {
        return false;
      }

      const fileName = file.file_name.toLowerCase();

      // Check exact names
      if (actualPatterns.exact_names && actualPatterns.exact_names.some(name => fileName === name.toLowerCase())) {
        return true;
      }

      // Check extensions
      if (actualPatterns.extensions && actualPatterns.extensions.some(ext => fileName.endsWith(ext.toLowerCase()))) {
        return true;
      }

      // Check prefixes
      if (actualPatterns.prefixes && actualPatterns.prefixes.some(prefix => fileName.startsWith(prefix.toLowerCase()))) {
        return true;
      }

      // Check suffixes
      if (actualPatterns.suffixes && actualPatterns.suffixes.some(suffix => fileName.endsWith(suffix))) {
        return true;
      }

      return false;
    });

    // Process each temp file
    const processedItems = tempFiles.map(file => {
      const fileName = file.file_name.toLowerCase();
      const matchedCriteria = [];
      let safetyLevel = 'safe';
      let recommendation = 'Temporary file - safe to delete';

      // Determine which patterns matched
      if (actualPatterns.exact_names && actualPatterns.exact_names.some(name => fileName === name.toLowerCase())) {
        matchedCriteria.push('system_file');
        recommendation = 'System temporary file - safe to delete';
      }
      if (actualPatterns.extensions && actualPatterns.extensions.some(ext => fileName.endsWith(ext.toLowerCase()))) {
        matchedCriteria.push('temp_extension');
      }
      if (actualPatterns.prefixes && actualPatterns.prefixes.some(prefix => fileName.startsWith(prefix.toLowerCase()))) {
        matchedCriteria.push('temp_prefix');
      }
      if (actualPatterns.suffixes && actualPatterns.suffixes.some(suffix => fileName.endsWith(suffix))) {
        matchedCriteria.push('backup_suffix');
        recommendation = 'Backup file - review before deletion';
        safetyLevel = 'review';
      }

      return {
        file_id: file.file_id,
        file_name: file.file_name,
        mime_type: file.mime_type,
        size_bytes: file.size_bytes,
        created_date: file.created_date,
        modified_date: file.modified_date,
        last_viewed_date: file.last_viewed_date,
        parent_id: file.parent_id,
        parent_name: file.parent_name,
        matched_criteria: matchedCriteria,
        safety_level: safetyLevel,
        recommendation: recommendation
      };
    });

    // Calculate total size
    const totalSize = processedItems.reduce((sum, file) => sum + (file.size_bytes || 0), 0);

    return {
      count: processedItems.length,
      total_size_bytes: totalSize,
      items: processedItems,
      category_name: 'Temporary Files',
      category_type: 'temp_files'
    };
  } catch (error) {
    console.error(`Error in analyzeTempFiles: ${error.message}`);
    return {
      count: 0,
      total_size_bytes: 0,
      items: [],
      category_name: 'Temporary Files',
      category_type: 'temp_files'
    };
  }
}

/**
 * Analyse for duplicate files (name + size matching)
 *
 * Identifies duplicate files by comparing file names and sizes. Groups
 * duplicates together and marks all but the newest version for potential
 * deletion. Note: This method may produce false positives as it doesn't
 * use MD5 checksums.
 *
 * @param {Array<Object>} filesData - Structured file objects from analysis context
 * @param {string} [method='name_size'] - Detection method (only 'name_size' supported currently)
 * @returns {CategoryResultProps} Duplicate files analysis results
 *
 * @example
 * // Find duplicates by name and size
 * const results = analyzeDuplicates(filesData)
 * // Returns: { count: 8, total_size_bytes: 104857600, items: [...] }
 *
 * @example
 * // Handle files with same name but different sizes
 * const results = analyzeDuplicates(filesData)
 * // Only files with identical name AND size are marked as duplicates
 */
function analyzeDuplicates(filesData, method) {
  try {
    const detectionMethod = method || 'name_size';

    // Validate input
    if (!Array.isArray(filesData)) {
      console.warn('analyzeDuplicates: filesData is not an array');
      return {
        count: 0,
        total_size_bytes: 0,
        items: [],
        category_name: 'Duplicate Files',
        category_type: 'duplicates'
      };
    }

    // Only name_size method supported currently
    if (detectionMethod !== 'name_size') {
      console.warn(`analyzeDuplicates: method '${detectionMethod}' not supported, using 'name_size'`);
    }

    // Group files by name + size
    const fileGroups = new Map();

    filesData.forEach(file => {
      if (!file.file_name || file.size_bytes === null || file.size_bytes === undefined) {
        return;
      }

      // Skip folders
      if (file.mime_type === 'application/vnd.google-apps.folder') {
        return;
      }

      const groupKey = `${file.file_name}_${file.size_bytes}`;

      if (!fileGroups.has(groupKey)) {
        fileGroups.set(groupKey, []);
      }

      fileGroups.get(groupKey).push(file);
    });

    // Filter for groups with duplicates (count > 1)
    const duplicateGroups = Array.from(fileGroups.values()).filter(group => group.length > 1);

    // Process duplicate groups
    const allDuplicates = [];
    let totalSavings = 0;

    duplicateGroups.forEach(group => {
      // Sort by modified_date (newest first)
      const sortedGroup = group.sort((a, b) => {
        const dateA = a.modified_date ? new Date(a.modified_date) : new Date(a.created_date || 0);
        const dateB = b.modified_date ? new Date(b.modified_date) : new Date(b.created_date || 0);
        return dateB - dateA;
      });

      // Keep newest, mark others as duplicates
      sortedGroup.forEach((file, index) => {
        if (index === 0) {
          // Skip the newest file (keep it)
          return;
        }

        // Mark as duplicate
        allDuplicates.push({
          file_id: file.file_id,
          file_name: file.file_name,
          mime_type: file.mime_type,
          size_bytes: file.size_bytes,
          created_date: file.created_date,
          modified_date: file.modified_date,
          last_viewed_date: file.last_viewed_date,
          parent_id: file.parent_id,
          parent_name: file.parent_name,
          matched_criteria: ['duplicate_name_size'],
          safety_level: 'review',
          recommendation: 'Duplicate file (name+size match) - review before deletion'
        });

        // Add to savings (all duplicates except one per group)
        totalSavings += file.size_bytes || 0;
      });
    });

    return {
      count: allDuplicates.length,
      total_size_bytes: totalSavings,
      items: allDuplicates,
      category_name: 'Duplicate Files',
      category_type: 'duplicates'
    };
  } catch (error) {
    console.error(`Error in analyzeDuplicates: ${error.message}`);
    return {
      count: 0,
      total_size_bytes: 0,
      items: [],
      category_name: 'Duplicate Files',
      category_type: 'duplicates'
    };
  }
}

/**
 * Sort items by priority for deletion
 *
 * Helper function to categorise and sort items based on deletion priority.
 * Used internally by analyzers to order results.
 *
 * @param {Array<FileAnalysisProps>} items - Items to sort
 * @param {string} method - Sort method: 'size' | 'age' | 'safety'
 * @returns {Array<FileAnalysisProps>} Sorted items
 * @private
 */
function categorizeByPriority_(items, method) {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      return items;
    }

    const sorted = [...items];

    if (method === 'size') {
      // Sort by size (largest first)
      sorted.sort((a, b) => (b.size_bytes || 0) - (a.size_bytes || 0));
    } else if (method === 'age') {
      // Sort by modified_date (oldest first)
      sorted.sort((a, b) => {
        const dateA = a.modified_date ? new Date(a.modified_date) : new Date(a.created_date || 0);
        const dateB = b.modified_date ? new Date(b.modified_date) : new Date(b.created_date || 0);
        return dateA - dateB;
      });
    } else if (method === 'safety') {
      // Sort by safety_level (safe first, then review, then caution)
      const safetyOrder = { safe: 0, review: 1, caution: 2 };
      sorted.sort((a, b) => safetyOrder[a.safety_level] - safetyOrder[b.safety_level]);
    }

    return sorted;
  } catch (error) {
    console.error(`Error in categorizeByPriority_: ${error.message}`);
    return items;
  }
}

// Export public functions to global scope for GAS
globalThis.analyzeLargeFiles = analyzeLargeFiles;
globalThis.analyzeOldFiles = analyzeOldFiles;
globalThis.analyzeEmptyItems = analyzeEmptyItems;
globalThis.analyzeTempFiles = analyzeTempFiles;
globalThis.analyzeDuplicates = analyzeDuplicates;
