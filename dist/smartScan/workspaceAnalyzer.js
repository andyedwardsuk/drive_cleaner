//########### GOOGLE WORKSPACE FILES ANALYZER ###########

/**
 * @fileoverview Google Workspace files analysis for Smart Scan
 *
 * Provides specialized analysis for Google Workspace native files (Docs, Sheets,
 * Slides, Forms, etc.). Identifies file types, usage patterns, sharing status,
 * and helps users manage their Workspace files effectively.
 *
 * @author Drive Cleaner Dev Team
 * @version 1.0.0
 */

/**
 * Google Workspace file type definitions
 * Maps MIME types to human-readable names and metadata
 */
const WORKSPACE_TYPES = {
  'application/vnd.google-apps.document': {
    name: 'Google Docs',
    short_name: 'Doc',
    icon: '📝',
    category: 'document'
  },
  'application/vnd.google-apps.spreadsheet': {
    name: 'Google Sheets',
    short_name: 'Sheet',
    icon: '📊',
    category: 'spreadsheet'
  },
  'application/vnd.google-apps.presentation': {
    name: 'Google Slides',
    short_name: 'Slides',
    icon: '📽️',
    category: 'presentation'
  },
  'application/vnd.google-apps.form': {
    name: 'Google Forms',
    short_name: 'Form',
    icon: '📋',
    category: 'form'
  },
  'application/vnd.google-apps.drawing': {
    name: 'Google Drawings',
    short_name: 'Drawing',
    icon: '🎨',
    category: 'drawing'
  },
  'application/vnd.google-apps.site': {
    name: 'Google Sites',
    short_name: 'Site',
    icon: '🌐',
    category: 'site'
  },
  'application/vnd.google-apps.script': {
    name: 'Apps Script',
    short_name: 'Script',
    icon: '⚙️',
    category: 'script'
  },
  'application/vnd.google-apps.jam': {
    name: 'Google Jamboard',
    short_name: 'Jam',
    icon: '🎯',
    category: 'jam'
  },
  'application/vnd.google-apps.shortcut': {
    name: 'Shortcut',
    short_name: 'Shortcut',
    icon: '🔗',
    category: 'shortcut'
  }
};

/**
 * Workspace analysis results with type breakdown
 * @typedef {Object} WorkspaceAnalysisResultProps
 * @property {number} count - Total number of Workspace files
 * @property {number} total_size_bytes - Total size (version history)
 * @property {Array<FileAnalysisProps>} items - Individual file details
 * @property {string} category_name - Human-readable category name
 * @property {string} category_type - Technical category identifier
 * @property {Object} type_breakdown - Count by file type
 * @property {Object} unused_breakdown - Unused files by age threshold
 * @property {Object} sharing_breakdown - Files by sharing status
 */

/**
 * Individual Workspace file analysis data
 * @typedef {Object} FileAnalysisProps
 * @property {string} file_id - Drive file ID
 * @property {string} file_name - File name
 * @property {string} mime_type - File MIME type
 * @property {string} workspace_type - Workspace file type (doc/sheet/slides/etc)
 * @property {number} size_bytes - Version history size (quotaBytesUsed)
 * @property {string} created_date - ISO timestamp
 * @property {string} modified_date - ISO timestamp
 * @property {string|null} last_viewed_date - ISO timestamp or null
 * @property {number|null} days_since_viewed - Days since last viewed
 * @property {string} parent_id - Parent folder ID
 * @property {string} parent_name - Parent folder name
 * @property {boolean} is_shared - Whether file is shared
 * @property {Array<string>} matched_criteria - Which detection rules matched
 * @property {string} safety_level - 'safe' | 'review' | 'caution'
 * @property {string|null} recommendation - Suggested action
 */

/**
 * Analyze Google Workspace files (Docs, Sheets, Slides, Forms, etc.)
 *
 * Identifies all Google Workspace native files and provides detailed analysis
 * including type categorization, usage patterns, and sharing status. Helps users
 * understand and manage their Workspace file ecosystem.
 *
 * @param {Array<Object>} filesData - Structured file objects from analysis context
 * @param {Object} [options] - Analysis options
 * @param {Object} [options.unusedThresholds] - Age thresholds for unused detection
 * @param {number} [options.unusedThresholds.six_months=183] - 6 months in days
 * @param {number} [options.unusedThresholds.one_year=365] - 1 year in days
 * @param {number} [options.unusedThresholds.two_years=730] - 2 years in days
 * @param {boolean} [options.includeShortcuts=true] - Include shortcut files
 * @returns {WorkspaceAnalysisResultProps} Workspace files analysis results
 *
 * @example
 * // Basic analysis with default options
 * const results = analyzeWorkspaceFiles(filesData);
 * // Returns: {
 * //   count: 524,
 * //   type_breakdown: { document: 234, spreadsheet: 156, ... },
 * //   unused_breakdown: { six_months: 45, one_year: 78, ... },
 * //   items: [...]
 * // }
 *
 * @example
 * // Custom thresholds for unused detection
 * const results = analyzeWorkspaceFiles(filesData, {
 *   unusedThresholds: {
 *     six_months: 90,   // 3 months
 *     one_year: 180,    // 6 months
 *     two_years: 365    // 1 year
 *   },
 *   includeShortcuts: false  // Exclude shortcuts
 * });
 */
function analyzeWorkspaceFiles(filesData, options) {
  try {
    // Set default options
    const defaultOptions = {
      unusedThresholds: {
        six_months: 183,   // ~6 months
        one_year: 365,     // 1 year
        two_years: 730     // 2 years
      },
      includeShortcuts: true
    };
    const actualOptions = { ...defaultOptions, ...options };

    // Validate input
    if (!Array.isArray(filesData)) {
      console.warn('analyzeWorkspaceFiles: filesData is not an array');
      return createEmptyResult();
    }

    // Get list of Workspace MIME types to filter
    const workspaceMimeTypes = Object.keys(WORKSPACE_TYPES);

    // Filter for Google Workspace files
    const workspaceFiles = filesData.filter(file => {
      if (!file.mime_type) return false;

      const isWorkspaceFile = workspaceMimeTypes.includes(file.mime_type);

      // Optionally exclude shortcuts
      if (!actualOptions.includeShortcuts &&
          file.mime_type === 'application/vnd.google-apps.shortcut') {
        return false;
      }

      return isWorkspaceFile;
    });

    // Initialize tracking objects
    const typeBreakdown = {};
    const unusedBreakdown = {
      six_months: 0,
      one_year: 0,
      two_years: 0
    };
    const sharingBreakdown = {
      shared: 0,
      private: 0,
      unknown: 0
    };

    // Process each Workspace file
    const processedItems = workspaceFiles.map(file => {
      const workspaceInfo = WORKSPACE_TYPES[file.mime_type] || {
        name: 'Unknown Workspace File',
        short_name: 'Unknown',
        icon: '📄',
        category: 'unknown'
      };

      // Track type breakdown
      const category = workspaceInfo.category;
      typeBreakdown[category] = (typeBreakdown[category] || 0) + 1;

      // Calculate days since last viewed
      let daysSinceViewed = null;
      let isUnused = false;
      let unusedLevel = null;

      if (file.last_viewed_date) {
        const lastViewed = new Date(file.last_viewed_date);
        const now = new Date();
        daysSinceViewed = Math.floor((now - lastViewed) / (1000 * 60 * 60 * 24));

        // Determine unused level
        if (daysSinceViewed >= actualOptions.unusedThresholds.two_years) {
          isUnused = true;
          unusedLevel = 'two_years';
          unusedBreakdown.two_years++;
        } else if (daysSinceViewed >= actualOptions.unusedThresholds.one_year) {
          isUnused = true;
          unusedLevel = 'one_year';
          unusedBreakdown.one_year++;
        } else if (daysSinceViewed >= actualOptions.unusedThresholds.six_months) {
          isUnused = true;
          unusedLevel = 'six_months';
          unusedBreakdown.six_months++;
        }
      }

      // Determine sharing status
      const isShared = file.is_shared === true || file.shared === true;
      if (isShared) {
        sharingBreakdown.shared++;
      } else if (file.is_shared === false || file.shared === false) {
        sharingBreakdown.private++;
      } else {
        sharingBreakdown.unknown++;
      }

      // Build matched criteria
      const matchedCriteria = [workspaceInfo.category];
      if (isUnused) {
        matchedCriteria.push(`unused_${unusedLevel}`);
      }
      if (isShared) {
        matchedCriteria.push('shared');
      }

      // Determine safety level and recommendation
      let safetyLevel = 'review';
      let recommendation = `Review ${workspaceInfo.name}`;

      if (isUnused) {
        if (unusedLevel === 'two_years') {
          safetyLevel = 'safe';
          recommendation = `Not viewed in 2+ years - strong candidate for archival or deletion`;
        } else if (unusedLevel === 'one_year') {
          safetyLevel = 'safe';
          recommendation = `Not viewed in 1+ year - consider archiving`;
        } else if (unusedLevel === 'six_months') {
          safetyLevel = 'review';
          recommendation = `Not viewed in 6+ months - review for relevance`;
        }
      } else if (daysSinceViewed === null) {
        safetyLevel = 'caution';
        recommendation = 'Never viewed by you - may be shared or inherited file';
      } else {
        safetyLevel = 'review';
        recommendation = `Recently accessed ${workspaceInfo.name}`;
      }

      // Get version history size (some Workspace files do have quotaBytesUsed)
      const sizeBytes = file.size_bytes || 0;

      return {
        file_id: file.file_id,
        file_name: file.file_name,
        mime_type: file.mime_type,
        workspace_type: workspaceInfo.category,
        workspace_icon: workspaceInfo.icon,
        workspace_name: workspaceInfo.short_name,
        size_bytes: sizeBytes,
        created_date: file.created_date,
        modified_date: file.modified_date,
        last_viewed_date: file.last_viewed_date,
        days_since_viewed: daysSinceViewed,
        is_unused: isUnused,
        unused_level: unusedLevel,
        parent_id: file.parent_id,
        parent_name: file.parent_name,
        is_shared: isShared,
        matched_criteria: matchedCriteria,
        safety_level: safetyLevel,
        recommendation: recommendation
      };
    });

    // Calculate total size (version history)
    const totalSize = processedItems.reduce((sum, file) => sum + file.size_bytes, 0);

    return {
      count: processedItems.length,
      total_size_bytes: totalSize,
      items: processedItems,
      category_name: 'Google Workspace Files',
      category_type: 'workspace_files',
      type_breakdown: typeBreakdown,
      unused_breakdown: unusedBreakdown,
      sharing_breakdown: sharingBreakdown
    };

  } catch (error) {
    console.error(`Error in analyzeWorkspaceFiles: ${error.message}`);
    return createEmptyResult();
  }
}

/**
 * Analyze unused Google Workspace files
 *
 * Specialized analyzer that focuses specifically on Workspace files that haven't
 * been accessed recently. Useful for cleanup campaigns and storage optimization.
 *
 * @param {Array<Object>} filesData - Structured file objects from analysis context
 * @param {Object} [thresholds] - Age thresholds in days
 * @param {number} [thresholds.six_months=183] - 6 months threshold
 * @param {number} [thresholds.one_year=365] - 1 year threshold
 * @param {number} [thresholds.two_years=730] - 2 years threshold
 * @returns {CategoryResultProps} Unused Workspace files results
 *
 * @example
 * const unusedFiles = analyzeUnusedWorkspaceFiles(filesData);
 * // Returns only files not viewed in 6+ months
 */
function analyzeUnusedWorkspaceFiles(filesData, thresholds) {
  try {
    const defaultThresholds = {
      six_months: 183,
      one_year: 365,
      two_years: 730
    };
    const actualThresholds = { ...defaultThresholds, ...thresholds };

    // Get all Workspace files
    const workspaceAnalysis = analyzeWorkspaceFiles(filesData, {
      unusedThresholds: actualThresholds
    });

    // Filter for only unused files
    const unusedFiles = workspaceAnalysis.items.filter(file => file.is_unused);

    // Calculate total size
    const totalSize = unusedFiles.reduce((sum, file) => sum + file.size_bytes, 0);

    return {
      count: unusedFiles.length,
      total_size_bytes: totalSize,
      items: unusedFiles,
      category_name: 'Unused Workspace Files',
      category_type: 'unused_workspace_files',
      type_breakdown: workspaceAnalysis.type_breakdown,
      unused_breakdown: workspaceAnalysis.unused_breakdown
    };

  } catch (error) {
    console.error(`Error in analyzeUnusedWorkspaceFiles: ${error.message}`);
    return {
      count: 0,
      total_size_bytes: 0,
      items: [],
      category_name: 'Unused Workspace Files',
      category_type: 'unused_workspace_files',
      type_breakdown: {},
      unused_breakdown: {}
    };
  }
}

/**
 * Categorize Workspace files by type
 *
 * Groups Workspace files into categories (Docs, Sheets, Slides, etc.) for
 * summary views and type-specific analysis.
 *
 * @param {Array<Object>} filesData - Structured file objects
 * @returns {Object} Files categorized by type
 *
 * @example
 * const byType = categorizeWorkspaceFilesByType(filesData);
 * // Returns: {
 * //   document: [...],
 * //   spreadsheet: [...],
 * //   presentation: [...],
 * //   ...
 * // }
 */
function categorizeWorkspaceFilesByType(filesData) {
  try {
    const workspaceAnalysis = analyzeWorkspaceFiles(filesData);
    const categorized = {};

    // Group files by workspace_type
    workspaceAnalysis.items.forEach(file => {
      const type = file.workspace_type;
      if (!categorized[type]) {
        categorized[type] = [];
      }
      categorized[type].push(file);
    });

    return categorized;

  } catch (error) {
    console.error(`Error in categorizeWorkspaceFilesByType: ${error.message}`);
    return {};
  }
}

/**
 * Analyze sharing status of Workspace files
 *
 * Provides insights into which Workspace files are shared vs private,
 * helping users manage permissions and collaboration.
 *
 * @param {Array<Object>} filesData - Structured file objects
 * @returns {Object} Sharing analysis results
 *
 * @example
 * const sharing = analyzeWorkspaceSharing(filesData);
 * // Returns: {
 * //   shared_files: [...],
 * //   private_files: [...],
 * //   shared_count: 234,
 * //   private_count: 145
 * // }
 */
function analyzeWorkspaceSharing(filesData) {
  try {
    const workspaceAnalysis = analyzeWorkspaceFiles(filesData);

    const sharedFiles = workspaceAnalysis.items.filter(file => file.is_shared);
    const privateFiles = workspaceAnalysis.items.filter(file => !file.is_shared);

    return {
      shared_files: sharedFiles,
      private_files: privateFiles,
      shared_count: sharedFiles.length,
      private_count: privateFiles.length,
      sharing_breakdown: workspaceAnalysis.sharing_breakdown
    };

  } catch (error) {
    console.error(`Error in analyzeWorkspaceSharing: ${error.message}`);
    return {
      shared_files: [],
      private_files: [],
      shared_count: 0,
      private_count: 0,
      sharing_breakdown: { shared: 0, private: 0, unknown: 0 }
    };
  }
}

/**
 * Helper function to create empty result structure
 * @private
 * @returns {WorkspaceAnalysisResultProps} Empty result
 */
function createEmptyResult() {
  return {
    count: 0,
    total_size_bytes: 0,
    items: [],
    category_name: 'Google Workspace Files',
    category_type: 'workspace_files',
    type_breakdown: {},
    unused_breakdown: { six_months: 0, one_year: 0, two_years: 0 },
    sharing_breakdown: { shared: 0, private: 0, unknown: 0 }
  };
}

/**
 * Check if a file is a Google Workspace file
 *
 * Utility function to quickly determine if a file is a Workspace native file
 * based on its MIME type.
 *
 * @param {Object} file - File object with mime_type property
 * @returns {boolean} True if file is a Workspace file
 *
 * @example
 * if (isWorkspaceFile(file)) {
 *   // Handle Workspace-specific logic
 * }
 */
function isWorkspaceFile(file) {
  if (!file || !file.mime_type) return false;
  return Object.keys(WORKSPACE_TYPES).includes(file.mime_type);
}

/**
 * Get Workspace file type information
 *
 * Returns metadata about a specific Workspace file type including name,
 * icon, and category.
 *
 * @param {string} mimeType - Google Workspace MIME type
 * @returns {Object|null} Type information or null if not a Workspace type
 *
 * @example
 * const info = getWorkspaceTypeInfo('application/vnd.google-apps.document');
 * // Returns: { name: 'Google Docs', short_name: 'Doc', icon: '📝', category: 'document' }
 */
function getWorkspaceTypeInfo(mimeType) {
  return WORKSPACE_TYPES[mimeType] || null;
}

// Export public functions to global scope for GAS
if (typeof globalThis !== 'undefined') {
  globalThis.analyzeWorkspaceFiles = analyzeWorkspaceFiles;
  globalThis.isWorkspaceFile = isWorkspaceFile;
  globalThis.getWorkspaceTypeInfo = getWorkspaceTypeInfo;
}
