/**
 * Drive Cleaner - Labels & Taxonomy Manager
 *
 * Manages custom Google Drive Labels, metadata taxonomy tags,
 * and bulk label associations for Drive Cleaner.
 *
 * @author Andy Edwards
 * @version [2.6.0] - 2026-09-16
 */

var LabelsManager = (function () {

  // ============================================
  // CONSTANTS
  // ============================================

  const PROPERTY_KEY_REGISTRY = 'drive_cleaner_labels_registry';
  const PROPERTY_KEY_FILE_MAP = 'drive_cleaner_file_labels_map';

  const DEFAULT_LABELS = [
    {
      id: 'label_confidential',
      name: 'Confidential',
      color: 'rose',
      icon: 'shield',
      category: 'security',
      description: 'Restricted internal or sensitive data'
    },
    {
      id: 'label_legal_hold',
      name: 'Legal Hold',
      color: 'amber',
      icon: 'scale',
      category: 'compliance',
      description: 'Preserve indefinitely for audit or regulatory compliance'
    },
    {
      id: 'label_archive_staged',
      name: 'Archive Staged',
      color: 'indigo',
      icon: 'archive',
      category: 'lifecycle',
      description: 'Ready to be migrated to long-term storage'
    },
    {
      id: 'label_green_cleaned',
      name: 'Green Cleaned',
      color: 'emerald',
      icon: 'leaf',
      category: 'sustainability',
      description: 'Audited and optimized for cloud carbon reduction'
    },
    {
      id: 'label_financial',
      name: 'Financial',
      color: 'sky',
      icon: 'dollar',
      category: 'department',
      description: 'Budgets, invoices, accounting, and tax records'
    },
    {
      id: 'label_internal_only',
      name: 'Internal Only',
      color: 'purple',
      icon: 'lock',
      category: 'security',
      description: 'Do not share outside the organization domain'
    }
  ];

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Retrieves the label definitions and file mappings
   * @returns {Object} {success, labels, fileMap}
   */
  function getRegistry() {
    try {
      const userProps = PropertiesService.getUserProperties();
      const rawLabels = userProps.getProperty(PROPERTY_KEY_REGISTRY);
      const rawMap = userProps.getProperty(PROPERTY_KEY_FILE_MAP);

      const labels = rawLabels ? JSON.parse(rawLabels) : DEFAULT_LABELS;
      const fileMap = rawMap ? JSON.parse(rawMap) : {};

      // Calculate file counts for each label
      const countByLabel = {};
      const fileIds = Object.keys(fileMap);
      for (let i = 0; i < fileIds.length; i++) {
        const assignedLabels = fileMap[fileIds[i]] || [];
        for (let j = 0; j < assignedLabels.length; j++) {
          const lId = assignedLabels[j];
          countByLabel[lId] = (countByLabel[lId] || 0) + 1;
        }
      }

      const labelsWithCounts = labels.map(function (label) {
        return {
          id: label.id,
          name: label.name,
          color: label.color,
          icon: label.icon,
          category: label.category,
          description: label.description,
          fileCount: countByLabel[label.id] || 0
        };
      });

      return {
        success: true,
        labels: labelsWithCounts,
        fileMap: fileMap
      };
    } catch (error) {
      console.error('Error in getRegistry:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Applies a label to multiple files
   * @param {string|Object} payload - { fileIds: string[], labelId: string }
   * @returns {Object} Result {success, updatedCount}
   */
  function applyLabel(payload) {
    try {
      const options = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const fileIds = options.fileIds || [];
      const labelId = options.labelId;

      if (!labelId || fileIds.length === 0) {
        return { success: true, updatedCount: 0 };
      }

      const userProps = PropertiesService.getUserProperties();
      const rawMap = userProps.getProperty(PROPERTY_KEY_FILE_MAP);
      const fileMap = rawMap ? JSON.parse(rawMap) : {};

      let updatedCount = 0;
      for (let i = 0; i < fileIds.length; i++) {
        const fId = fileIds[i];
        const existing = fileMap[fId] || [];
        if (existing.indexOf(labelId) === -1) {
          existing.push(labelId);
          fileMap[fId] = existing;
          updatedCount++;
        }
      }

      userProps.setProperty(PROPERTY_KEY_FILE_MAP, JSON.stringify(fileMap));

      return {
        success: true,
        updatedCount: updatedCount,
        labelId: labelId,
        fileMap: fileMap
      };
    } catch (error) {
      console.error('Error in applyLabel:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Removes a label from multiple files
   * @param {string|Object} payload - { fileIds: string[], labelId: string }
   * @returns {Object} Result
   */
  function removeLabel(payload) {
    try {
      const options = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const fileIds = options.fileIds || [];
      const labelId = options.labelId;

      if (!labelId || fileIds.length === 0) {
        return { success: true, updatedCount: 0 };
      }

      const userProps = PropertiesService.getUserProperties();
      const rawMap = userProps.getProperty(PROPERTY_KEY_FILE_MAP);
      const fileMap = rawMap ? JSON.parse(rawMap) : {};

      let updatedCount = 0;
      for (let i = 0; i < fileIds.length; i++) {
        const fId = fileIds[i];
        if (fileMap[fId]) {
          const filtered = fileMap[fId].filter(function (id) {
            return id !== labelId;
          });
          if (filtered.length !== fileMap[fId].length) {
            fileMap[fId] = filtered;
            updatedCount++;
          }
        }
      }

      userProps.setProperty(PROPERTY_KEY_FILE_MAP, JSON.stringify(fileMap));

      return {
        success: true,
        updatedCount: updatedCount,
        labelId: labelId,
        fileMap: fileMap
      };
    } catch (error) {
      console.error('Error in removeLabel:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Saves or updates a custom label definition
   * @param {string|Object} payload - Label object
   * @returns {Object} Result
   */
  function saveCustomLabel(payload) {
    try {
      const labelData = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      if (!labelData.name) {
        return { success: false, error: 'Label name is required' };
      }

      const userProps = PropertiesService.getUserProperties();
      const rawLabels = userProps.getProperty(PROPERTY_KEY_REGISTRY);
      const labels = rawLabels ? JSON.parse(rawLabels) : DEFAULT_LABELS.slice();

      const labelId = labelData.id || 'label_custom_' + Date.now();
      const existingIdx = labels.findIndex(function (l) { return l.id === labelId; });

      const newLabel = {
        id: labelId,
        name: labelData.name,
        color: labelData.color || 'indigo',
        icon: labelData.icon || 'tag',
        category: labelData.category || 'general',
        description: labelData.description || ''
      };

      if (existingIdx !== -1) {
        labels[existingIdx] = newLabel;
      } else {
        labels.push(newLabel);
      }

      userProps.setProperty(PROPERTY_KEY_REGISTRY, JSON.stringify(labels));

      return {
        success: true,
        label: newLabel,
        labels: labels
      };
    } catch (error) {
      console.error('Error in saveCustomLabel:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // EXPORT
  // ============================================

  return {
    getRegistry: getRegistry,
    applyLabel: applyLabel,
    removeLabel: removeLabel,
    saveCustomLabel: saveCustomLabel
  };

})();
