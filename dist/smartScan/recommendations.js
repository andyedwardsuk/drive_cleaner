//########### SMART SCAN RECOMMENDATIONS ###########

/**
 * @fileoverview Smart recommendation generation for Smart Scan
 *
 * Analyses scan results across all categories and generates prioritised
 * cleanup recommendations. Recommendations include estimated space savings,
 * safety levels, and suggested actions.
 *
 * @author Drive Cleaner Dev Team
 * @version 1.0.0
 */

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

/**
 * Generate smart cleanup recommendations from scan results
 *
 * Analyses all category results and creates prioritised recommendations
 * for file cleanup. Recommendations are sorted by potential impact
 * (storage savings) and safety level.
 *
 * @param {Object} scanResults - Scan results object (without recommendations)
 * @param {Object} scanResults.large_files - Large files category results
 * @param {Object} scanResults.old_files - Old files category results
 * @param {Object} scanResults.duplicates - Duplicates category results
 * @param {Object} scanResults.empty_items - Empty items category results
 * @param {Object} scanResults.temp_files - Temp files category results
 * @returns {Array<RecommendationProps>} Array of recommendations (max 5)
 *
 * @example
 * // Generate recommendations from scan results
 * const recommendations = generateRecommendations(scanResults)
 * // Returns: [
 * //   { recommendation_id: 'rec_1', category: 'old_files', priority: 'high', ... },
 * //   { recommendation_id: 'rec_2', category: 'duplicates', priority: 'medium', ... }
 * // ]
 *
 * @example
 * // Handle empty scan results
 * const recommendations = generateRecommendations({
 *   large_files: { count: 0 },
 *   old_files: { count: 0 },
 *   duplicates: { count: 0 },
 *   empty_items: { count: 0 },
 *   temp_files: { count: 0 }
 * })
 * // Returns: [] (no recommendations)
 */
function generateRecommendations(scanResults) {
  try {
    const recommendations = [];

    // Validate input
    if (!scanResults) {
      console.warn('generateRecommendations: scanResults is null or undefined');
      return [];
    }

    // 1. Temporary files recommendation
    if (scanResults.temp_files && scanResults.temp_files.count > 0) {
      const safeToDelete = scanResults.temp_files.items.filter(item => item.safety_level === 'safe').length;

      if (safeToDelete > 0) {
        recommendations.push({
          recommendation_id: `rec_${Date.now()}_temp`,
          category: 'temp_files',
          title: `Delete ${safeToDelete} temporary file${safeToDelete > 1 ? 's' : ''}`,
          description: `Found ${safeToDelete} temporary or system files that are safe to delete. These include files like .tmp, .bak, Thumbs.db, and .DS_Store.`,
          estimated_savings_bytes: scanResults.temp_files.total_size_bytes,
          affected_files_count: safeToDelete,
          priority: safeToDelete > 10 ? 'high' : 'medium',
          safety_level: 'safe',
          action_type: 'delete'
        });
      }
    }

    // 2. Empty items recommendation
    if (scanResults.empty_items && scanResults.empty_items.count > 0) {
      recommendations.push({
        recommendation_id: `rec_${Date.now()}_empty`,
        category: 'empty_items',
        title: `Delete ${scanResults.empty_items.count} empty item${scanResults.empty_items.count > 1 ? 's' : ''}`,
        description: `Found ${scanResults.empty_items.count} empty files or folders with no content. These serve no purpose and are safe to delete.`,
        estimated_savings_bytes: 0,
        affected_files_count: scanResults.empty_items.count,
        priority: 'medium',
        safety_level: 'safe',
        action_type: 'delete'
      });
    }

    // 3. Duplicate files recommendation
    if (scanResults.duplicates && scanResults.duplicates.count > 0) {
      recommendations.push({
        recommendation_id: `rec_${Date.now()}_duplicates`,
        category: 'duplicates',
        title: `Review ${scanResults.duplicates.count} duplicate file${scanResults.duplicates.count > 1 ? 's' : ''}`,
        description: `Found ${scanResults.duplicates.count} potential duplicate files (matched by name and size). Review these to confirm before deletion. Keeping the newest version is recommended.`,
        estimated_savings_bytes: scanResults.duplicates.total_size_bytes,
        affected_files_count: scanResults.duplicates.count,
        priority: scanResults.duplicates.total_size_bytes > 104857600 ? 'high' : 'medium', // >100MB = high
        safety_level: 'review',
        action_type: 'review'
      });
    }

    // 4. Old files recommendation
    if (scanResults.old_files && scanResults.old_files.count > 0) {
      const safeToDelete = scanResults.old_files.items.filter(item => item.safety_level === 'safe').length;
      const totalOld = scanResults.old_files.count;

      if (safeToDelete > 0) {
        recommendations.push({
          recommendation_id: `rec_${Date.now()}_old`,
          category: 'old_files',
          title: `Archive or delete ${safeToDelete} old file${safeToDelete > 1 ? 's' : ''}`,
          description: `Found ${safeToDelete} files not modified in over 2 years (${totalOld} total old files). These are strong candidates for archival or deletion.`,
          estimated_savings_bytes: scanResults.old_files.items
            .filter(item => item.safety_level === 'safe')
            .reduce((sum, item) => sum + (item.size_bytes || 0), 0),
          affected_files_count: safeToDelete,
          priority: safeToDelete > 20 ? 'high' : 'medium',
          safety_level: 'safe',
          action_type: 'archive'
        });
      } else if (totalOld > 0) {
        // All old files need review
        recommendations.push({
          recommendation_id: `rec_${Date.now()}_old_review`,
          category: 'old_files',
          title: `Review ${totalOld} old file${totalOld > 1 ? 's' : ''}`,
          description: `Found ${totalOld} files not modified in over a year. Review these to determine if they're still needed.`,
          estimated_savings_bytes: scanResults.old_files.total_size_bytes,
          affected_files_count: totalOld,
          priority: 'low',
          safety_level: 'review',
          action_type: 'review'
        });
      }
    }

    // 5. Large files recommendation
    if (scanResults.large_files && scanResults.large_files.count > 0) {
      const veryLargeFiles = scanResults.large_files.items.filter(item =>
        item.matched_criteria.includes('very_large_file')
      );

      if (veryLargeFiles.length > 0) {
        const veryLargeSize = veryLargeFiles.reduce((sum, item) => sum + item.size_bytes, 0);

        recommendations.push({
          recommendation_id: `rec_${Date.now()}_large`,
          category: 'large_files',
          title: `Review ${veryLargeFiles.length} very large file${veryLargeFiles.length > 1 ? 's' : ''}`,
          description: `Found ${veryLargeFiles.length} files over 1GB in size. Consider archiving these to external storage or cloud backup to free up significant space.`,
          estimated_savings_bytes: veryLargeSize,
          affected_files_count: veryLargeFiles.length,
          priority: 'high',
          safety_level: 'review',
          action_type: 'archive'
        });
      } else if (scanResults.large_files.count > 0) {
        // Medium-large files
        recommendations.push({
          recommendation_id: `rec_${Date.now()}_large_medium`,
          category: 'large_files',
          title: `Review ${scanResults.large_files.count} large file${scanResults.large_files.count > 1 ? 's' : ''}`,
          description: `Found ${scanResults.large_files.count} files over 100MB. These consume significant storage space and may be candidates for archival.`,
          estimated_savings_bytes: scanResults.large_files.total_size_bytes,
          affected_files_count: scanResults.large_files.count,
          priority: 'medium',
          safety_level: 'review',
          action_type: 'archive'
        });
      }
    }

    // Sort recommendations by priority (high → medium → low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sortedRecommendations = recommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      // If same priority, sort by estimated savings (largest first)
      return b.estimated_savings_bytes - a.estimated_savings_bytes;
    });

    // Return top 5 recommendations with both title/message and savings fields for complete compatibility
    return sortedRecommendations.slice(0, 5).map(r => ({
      ...r,
      message: r.title || r.message,
      space_savings_bytes: r.estimated_savings_bytes || r.space_savings_bytes || 0
    }));
  } catch (error) {
    console.error(`Error in generateRecommendations: ${error.message}`);
    return [];
  }
}

// Export public function to global scope for GAS
globalThis.generateRecommendations = generateRecommendations;
