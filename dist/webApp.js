/**
 * Drive Cleaner - Web App Interface
 *
 * Provides web application entry points and API functions
 * for the Drive Cleaner React application.
 *
 * @author Andy Edwards
 * @version [0.2.0] - 2025-11-17
 */

var DriveCleanerWebApp = (function () {

  // ============================================
  // PRIVATE CONSTANTS
  // ============================================

  /** User property key for caching refresh data */
  const CACHE_KEY_REFRESH = 'refresh';

  /** Default corpora value */
  const DEFAULT_CORPORA = 'user';

  // ============================================
  // PUBLIC API FUNCTIONS
  // ============================================

  /**
   * Serves the web application HTML
   * Entry point for Google Apps Script Web App
   * @returns {HtmlOutput} HTML output for web app
   */
  function serveWebApp() {
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Drive Cleaner')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  /**
   * Gets OAuth token for Drive Picker API
   * Called from client-side JavaScript via google.script.run
   * @returns {string} OAuth access token
   */
  function getOAuthToken() {
    try {
      return ScriptApp.getOAuthToken();
    } catch (error) {
      console.error('Error getting OAuth token:', error);
      throw new Error(`Failed to get OAuth token: ${error.message}`);
    }
  }

  /**
   * Gets files and folders for web interface
   * Called from React app via google.script.run
   * @param {string} payload - JSON string containing {urlId, corpora}
   * @returns {Object} {success: boolean, data: Array<Array>}
   */
  function getFilesAndFolders(payload) {
    try {
      const { urlId, corpora } = JSON.parse(payload);
      const folderId = convertUrlToId_(urlId);

      // Cache for refresh functionality
      cacheRequestData_(folderId, corpora);

      // Fetch directory data
      const directoryData = fetchDirectoryData_(folderId, corpora);

      return {
        success: true,
        data: directoryData
      };
    } catch (error) {
      console.error('Error in getFilesAndFolders:', error);
      throw new Error(`Failed to retrieve files and folders: ${error.message}`);
    }
  }

  /**
   * Gets cached folder ID from user properties
   * @returns {Object|null} {folderId, corpora} or null
   */
  function getCachedFolderId() {
    try {
      const cached = PropertiesService.getUserProperties().getProperty(CACHE_KEY_REFRESH);

      if (!cached) {
        return null;
      }

      const { id, corpora } = JSON.parse(cached);
      return {
        folderId: id,
        corpora: corpora || DEFAULT_CORPORA
      };
    } catch (error) {
      console.error('Error getting cached folder ID:', error);
      return null;
    }
  }

  /**
   * Gets Google Drive storage quota information
   * Called from React app via google.script.run
   * @returns {Object} {success: boolean, data: Object}
   */
  function getDriveQuota() {
    try {
      // In Drive API v2 (Apps Script default), fields are quotaBytesTotal, quotaBytesUsed, etc.
      // Calling Drive.About.get() without field masks returns all fields safely in v2.
      const about = Drive.About.get();

      const quota = about.storageQuota || {};
      const limit = parseInt(quota.limit || about.quotaBytesTotal) || 0;
      const usage = parseInt(quota.usage || about.quotaBytesUsed) || 0;
      const usageInDrive = parseInt(quota.usageInDrive || about.quotaBytesUsedAggregate || about.quotaBytesUsed) || usage;
      const usageInDriveTrash = parseInt(quota.usageInDriveTrash || about.quotaBytesUsedInTrash) || 0;
      const userEmail = (about.user && (about.user.emailAddress || about.user.permissionId)) || null;

      return {
        success: true,
        data: {
          limit: limit,
          usage: usage,
          usageInDrive: usageInDrive,
          usageInDriveTrash: usageInDriveTrash,
          userEmail: userEmail,
          available: Math.max(0, limit - usage),
          percentUsed: limit > 0 ? ((usage / limit) * 100).toFixed(2) : 0
        }
      };
    } catch (error) {
      console.error('Error getting Drive quota:', error);
      return {
        success: false,
        error: 'Failed to retrieve storage quota: ' + error.message
      };
    }
  }

  /**
   * Executes Drive API calls with exponential backoff on transient errors
   * @param {Function} fn - API call function
   * @param {number} [maxRetries=3] - Maximum retry attempts
   * @returns {*} Result of fn()
   */
  function callWithBackoff_(fn, maxRetries = 3) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return fn();
      } catch (err) {
        const msg = (err && err.message) ? err.message : String(err);
        const isRetryable = msg.includes('rateLimitExceeded') ||
                            msg.includes('userRateLimitExceeded') ||
                            msg.includes('quotaExceeded') ||
                            msg.includes('403') ||
                            msg.includes('429') ||
                            msg.includes('500') ||
                            msg.includes('503') ||
                            msg.includes('Backend Error');
        if (attempt < maxRetries && isRetryable) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt) + Math.floor(Math.random() * 500), 8000);
          console.warn(`Drive API transient error (${msg}). Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
          Utilities.sleep(delayMs);
        } else {
          throw err;
        }
      }
    }
  }

  /**
   * Moves a list of files to Google Drive Trash with backoff and Safety Vault logging
   * @param {Array<string>|Object|string} payload - Array of file IDs or { fileIds, totalBytes, folderName }
   * @returns {Object} {success: boolean, trashedCount: number, failedCount: number, trashedIds: Array<string>, errors: Array<Object>}
   */
  function trashFiles(payload) {
    let fileIds = payload;
    let totalBytes = 0;
    let folderName = 'Drive Folder';

    if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload);
        if (Array.isArray(parsed)) {
          fileIds = parsed;
        } else if (parsed && Array.isArray(parsed.fileIds)) {
          fileIds = parsed.fileIds;
          totalBytes = parsed.totalBytes || 0;
          folderName = parsed.folderName || 'Drive Folder';
        }
      } catch (e) {
        fileIds = [payload];
      }
    } else if (payload && !Array.isArray(payload) && Array.isArray(payload.fileIds)) {
      fileIds = payload.fileIds;
      totalBytes = payload.totalBytes || 0;
      folderName = payload.folderName || 'Drive Folder';
    }

    if (!fileIds || !Array.isArray(fileIds)) {
      return { success: false, error: 'Invalid fileIds array' };
    }

    const trashed = [];
    const failed = [];

    for (let i = 0; i < fileIds.length; i++) {
      const id = fileIds[i];
      try {
        callWithBackoff_(function () {
          if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.trash) {
            Drive.Files.trash(id);
          } else {
            DriveApp.getFileById(id).setTrashed(true);
          }
        });
        trashed.push(id);
      } catch (err) {
        try {
          DriveApp.getFileById(id).setTrashed(true);
          trashed.push(id);
        } catch (fallbackErr) {
          failed.push({ id: id, error: err.message || fallbackErr.message });
        }
      }
    }

    // Safety Vault: Record successful trashed files to user properties for multi-session undo
    if (trashed.length > 0) {
      try {
        const vaultRecord = {
          batchId: 'vault_' + Date.now(),
          timestamp: new Date().toISOString(),
          fileIds: trashed,
          count: trashed.length,
          totalBytes: totalBytes,
          folderName: folderName,
          status: 'active'
        };
        PropertiesService.getUserProperties().setProperty('dc_safety_vault_last_batch', JSON.stringify(vaultRecord));
      } catch (vaultErr) {
        console.warn('Could not save safety vault snapshot:', vaultErr);
      }
    }

    return {
      success: trashed.length > 0 || (failed.length === 0 && fileIds.length === 0),
      trashedCount: trashed.length,
      failedCount: failed.length,
      trashedIds: trashed,
      errors: failed
    };
  }

  /**
   * Restores a list of files from Google Drive Trash (Undo operation) with backoff
   * @param {Array<string>|string} payload - Array of file IDs or JSON string
   * @returns {Object} {success: boolean, restoredCount: number, failedCount: number, restoredIds: Array<string>, errors: Array<Object>}
   */
  function untrashFiles(payload) {
    let fileIds = payload;
    if (typeof payload === 'string') {
      try {
        fileIds = JSON.parse(payload);
      } catch (e) {
        fileIds = [payload];
      }
    }
    if (!fileIds || !Array.isArray(fileIds)) {
      return { success: false, error: 'Invalid fileIds array' };
    }

    const restored = [];
    const failed = [];

    for (let i = 0; i < fileIds.length; i++) {
      const id = fileIds[i];
      try {
        callWithBackoff_(function () {
          if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.untrash) {
            Drive.Files.untrash(id);
          } else {
            DriveApp.getFileById(id).setTrashed(false);
          }
        });
        restored.push(id);
      } catch (err) {
        try {
          DriveApp.getFileById(id).setTrashed(false);
          restored.push(id);
        } catch (fallbackErr) {
          failed.push({ id: id, error: err.message || fallbackErr.message });
        }
      }
    }

    return {
      success: restored.length > 0 || (failed.length === 0 && fileIds.length === 0),
      restoredCount: restored.length,
      failedCount: failed.length,
      restoredIds: restored,
      errors: failed
    };
  }

  /**
   * Retrieves active Safety Vault status from user properties
   * @returns {Object} Safety vault batch details or { hasActiveBatch: false }
   */
  function getSafetyVaultStatus() {
    try {
      const raw = PropertiesService.getUserProperties().getProperty('dc_safety_vault_last_batch');
      if (!raw) return { hasActiveBatch: false, batch: null };
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.status !== 'active') {
        return { hasActiveBatch: false, batch: null };
      }
      // Check if batch is within 48 hours
      const elapsedMs = Date.now() - new Date(parsed.timestamp).getTime();
      if (elapsedMs > 48 * 60 * 60 * 1000) {
        return { hasActiveBatch: false, batch: null };
      }
      return { hasActiveBatch: true, batch: parsed };
    } catch (e) {
      console.error('Error in getSafetyVaultStatus:', e);
      return { hasActiveBatch: false, batch: null, error: e.message };
    }
  }

  /**
   * Restores all files in the current Safety Vault batch back to Google Drive
   * @returns {Object} Restoration result
   */
  function restoreSafetyVaultBatch() {
    try {
      const raw = PropertiesService.getUserProperties().getProperty('dc_safety_vault_last_batch');
      if (!raw) return { success: false, error: 'No active Safety Vault batch found' };
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.fileIds || parsed.fileIds.length === 0) {
        return { success: false, error: 'Safety Vault batch contains no files' };
      }

      const result = untrashFiles(parsed.fileIds);
      parsed.status = 'restored';
      parsed.restoredAt = new Date().toISOString();
      PropertiesService.getUserProperties().setProperty('dc_safety_vault_last_batch', JSON.stringify(parsed));

      return {
        success: result.success,
        restoredCount: result.restoredCount,
        restoredIds: result.restoredIds,
        errors: result.errors,
        batch: parsed
      };
    } catch (e) {
      console.error('Error in restoreSafetyVaultBatch:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Dismisses the current active Safety Vault batch
   * @returns {Object} { success: boolean }
   */
  function dismissSafetyVaultBatch() {
    try {
      const raw = PropertiesService.getUserProperties().getProperty('dc_safety_vault_last_batch');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.status = 'dismissed';
        PropertiesService.getUserProperties().setProperty('dc_safety_vault_last_batch', JSON.stringify(parsed));
      }
      return { success: true };
    } catch (e) {
      console.error('Error in dismissSafetyVaultBatch:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Moves a list of files to a designated Google Drive Archive folder
   * Supports year-based partitioning (_DriveCleaner_Archive/YYYY/) and tracks original parents for undo.
   * @param {string|Object} payload - JSON string or object { fileIds, targetFolderName, targetFolderId, organizeByYear }
   * @returns {Object} Result {success, archivedCount, failedCount, archivedIds, targetFolderName, targetFolderId, targetFolderUrl, parentMappings, errors}
   */
  function archiveFiles(payload) {
    try {
      const options = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const fileIds = options.fileIds || [];
      const rootArchiveName = options.targetFolderName || '_DriveCleaner_Archive';
      const organizeByYear = options.organizeByYear !== false; // default true

      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        return { success: true, archivedCount: 0, failedCount: 0, archivedIds: [], errors: [] };
      }

      // 1. Resolve or create root archive folder
      let archiveRootFolder;
      if (options.targetFolderId) {
        try {
          archiveRootFolder = DriveApp.getFolderById(options.targetFolderId);
        } catch (e) {
          console.warn('Custom archive folder ID not found, using root archive folder:', e.message);
        }
      }

      if (!archiveRootFolder) {
        const rootFolders = DriveApp.getRootFolder().getFoldersByName(rootArchiveName);
        if (rootFolders.hasNext()) {
          archiveRootFolder = rootFolders.next();
        } else {
          archiveRootFolder = DriveApp.getRootFolder().createFolder(rootArchiveName);
        }
      }

      // 2. Resolve or create year subfolder if requested
      let destinationFolder = archiveRootFolder;
      if (organizeByYear) {
        const yearStr = String(new Date().getFullYear());
        const yearFolders = archiveRootFolder.getFoldersByName(yearStr);
        if (yearFolders.hasNext()) {
          destinationFolder = yearFolders.next();
        } else {
          destinationFolder = archiveRootFolder.createFolder(yearStr);
        }
      }

      const archived = [];
      const failed = [];
      const parentMappings = [];

      // 3. Move files to target folder
      for (let i = 0; i < fileIds.length; i++) {
        const id = fileIds[i];
        try {
          const file = DriveApp.getFileById(id);
          const parents = file.getParents();
          const origParents = [];
          while (parents.hasNext()) {
            origParents.push(parents.next().getId());
          }

          // Move to archive folder
          file.moveTo(destinationFolder);

          archived.push(id);
          parentMappings.push({
            fileId: id,
            originalParentId: origParents[0] || 'root',
            allOriginalParents: origParents,
            archivedParentId: destinationFolder.getId()
          });
        } catch (err) {
          failed.push({ id: id, error: err.message });
        }
      }

      return {
        success: archived.length > 0 || (failed.length === 0 && fileIds.length === 0),
        archivedCount: archived.length,
        failedCount: failed.length,
        archivedIds: archived,
        targetFolderName: destinationFolder.getName(),
        targetFolderId: destinationFolder.getId(),
        targetFolderUrl: destinationFolder.getUrl(),
        parentMappings: parentMappings,
        errors: failed
      };
    } catch (error) {
      console.error('Error in archiveFiles:', error);
      return {
        success: false,
        error: 'Failed to archive files: ' + error.message
      };
    }
  }

  /**
   * Restores previously archived files back to their original parent folders (Undo operation)
   * @param {string|Object} payload - JSON string or object { items: [{ fileId, originalParentId }] }
   * @returns {Object} Result {success, restoredCount, failedCount, restoredIds, errors}
   */
  function unarchiveFiles(payload) {
    try {
      const options = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const items = options.items || [];

      if (!items || !Array.isArray(items) || items.length === 0) {
        return { success: true, restoredCount: 0, failedCount: 0, restoredIds: [], errors: [] };
      }

      const restored = [];
      const failed = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const fileId = typeof item === 'string' ? item : item.fileId;
        const targetParentId = item.originalParentId;

        try {
          const file = DriveApp.getFileById(fileId);
          let targetFolder;

          if (targetParentId && targetParentId !== 'root') {
            targetFolder = DriveApp.getFolderById(targetParentId);
          } else {
            targetFolder = DriveApp.getRootFolder();
          }

          file.moveTo(targetFolder);
          restored.push(fileId);
        } catch (err) {
          failed.push({ id: fileId, error: err.message });
        }
      }

      return {
        success: restored.length > 0 || (failed.length === 0 && items.length === 0),
        restoredCount: restored.length,
        failedCount: failed.length,
        restoredIds: restored,
        errors: failed
      };
    } catch (error) {
      console.error('Error in unarchiveFiles:', error);
      return {
        success: false,
        error: 'Failed to unarchive files: ' + error.message
      };
    }
  }

  // ============================================
  // PRIVATE HELPER FUNCTIONS
  // ============================================

  /**
   * Fetches directory data for specified folder
   * @param {string} rootFolderId - Root folder ID
   * @param {string} corpora - 'drive' or 'user'
   * @returns {Array<Array>} 2D array of file/folder data
   * @private
   */
  function fetchDirectoryData_(rootFolderId, corpora) {
    console.time('fetchDirectoryData');

    // eslint-disable-next-line no-undef
    const directoryData = getFileandFoldersData(rootFolderId, corpora);

    console.timeEnd('fetchDirectoryData');
    return directoryData;
  }

  /**
   * Caches request data to user properties
   * @param {string} folderId - Folder ID
   * @param {string} corpora - 'drive' or 'user'
   * @private
   */
  function cacheRequestData_(folderId, corpora) {
    const cacheData = JSON.stringify({ id: folderId, corpora });
    PropertiesService.getUserProperties().setProperty(CACHE_KEY_REFRESH, cacheData);
  }

  /**
   * Converts URL to folder ID
   * @param {string} urlOrId - Drive URL or folder ID
   * @returns {string} Folder ID or 'root'
   * @private
   */
  function convertUrlToId_(urlOrId) {
    // Handle My Drive root
    if (!urlOrId || urlOrId.toLowerCase() === 'root') {
      return 'root';
    }

    // Check if already an ID (no slashes)
    if (!urlOrId.includes('/')) {
      return urlOrId;
    }

    // Extract ID from URL
    const folderMatch = urlOrId.match(/folders\/([A-Za-z0-9_-]+)/);
    return folderMatch ? folderMatch[1] : urlOrId;
  }

  // ============================================
  // EXPORT PUBLIC API
  // ============================================

  return {
    serveWebApp: serveWebApp,
    getOAuthToken: getOAuthToken,
    getFilesAndFolders: getFilesAndFolders,
    getCachedFolderId: getCachedFolderId,
    getDriveQuota: getDriveQuota,
    trashFiles: trashFiles,
    untrashFiles: untrashFiles,
    getSafetyVaultStatus: getSafetyVaultStatus,
    restoreSafetyVaultBatch: restoreSafetyVaultBatch,
    dismissSafetyVaultBatch: dismissSafetyVaultBatch,
    archiveFiles: archiveFiles,
    unarchiveFiles: unarchiveFiles
  };

})();

// ============================================
// GLOBAL WEB APP ENTRY POINT
// ============================================

/**
 * Web app doGet entry point
 * Must be in global scope for Apps Script to recognize it
 * @param {Object} e - Event object with query parameters
 * @returns {HtmlOutput|TextOutput} Web app HTML or test results
 */
function doGet(e) {
  // Check for test endpoints
  if (e && e.parameter && e.parameter.test) {
    const testName = e.parameter.test;
    let result;

    switch(testName) {
      case 'metadata':
        // eslint-disable-next-line no-undef
        result = testSmartScanMetadata();
        break;
      case 'scan':
        // eslint-disable-next-line no-undef
        result = testSmartScanSampleFolder();
        break;
      case 'analyzer':
        // eslint-disable-next-line no-undef
        result = testLargeFilesAnalyzer();
        break;
      case 'all':
        // eslint-disable-next-line no-undef
        result = runAllSmartScanTests();
        break;
      case 'quota':
        result = getDriveQuota();
        break;
      default:
        result = { error: 'Unknown test. Use ?test=metadata, ?test=scan, ?test=analyzer, ?test=quota, or ?test=all' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Serve the regular web app
  return DriveCleanerWebApp.serveWebApp();
}

/**
 * Legacy function name for backwards compatibility
 * @deprecated Use DriveCleanerWebApp.getOAuthToken() instead
 * @returns {string} OAuth token
 */
function getOAuthToken() {
  return DriveCleanerWebApp.getOAuthToken();
}

/**
 * Legacy function name for backwards compatibility
 * @deprecated Use DriveCleanerWebApp.getFilesAndFolders() instead
 * @param {string} payload - JSON payload
 * @returns {Object} Response object
 */
function getFilesAndFoldersForWeb(payload) {
  return DriveCleanerWebApp.getFilesAndFolders(payload);
}

/**
 * Legacy function name for backwards compatibility
 * @deprecated Use DriveCleanerWebApp.getCachedFolderId() instead
 * @returns {Object|null} Cached folder data
 */
function getCachedFolderId() {
  return DriveCleanerWebApp.getCachedFolderId();
}

/**
 * Gets Drive quota information
 * Called from React app via google.script.run
 * @returns {Object} Quota data object
 */
function getDriveQuota() {
  return DriveCleanerWebApp.getDriveQuota();
}

/**
 * Moves specified files to Google Drive Trash
 * Called from React app via google.script.run
 * @param {Array<string>} fileIds - File IDs to trash
 * @returns {Object} Result {success, trashedCount, failedCount, trashedIds, errors}
 */
function trashFiles(fileIds) {
  return DriveCleanerWebApp.trashFiles(fileIds);
}

/**
 * Restores specified files from Google Drive Trash (Undo operation)
 * Called from React app via google.script.run
 * @param {Array<string>} fileIds - File IDs to restore
 * @returns {Object} Result {success, restoredCount, failedCount, restoredIds, errors}
 */
function untrashFiles(fileIds) {
  return DriveCleanerWebApp.untrashFiles(fileIds);
}

/**
 * Moves specified files to Google Drive Archive folder
 * Called from React app via google.script.run
 * @param {string|Object} payload - Archive payload
 * @returns {Object} Result
 */
function archiveFiles(payload) {
  return DriveCleanerWebApp.archiveFiles(payload);
}

/**
 * Restores specified files back to their original parent folders from archive
 * Called from React app via google.script.run
 * @param {string|Object} payload - Unarchive payload
 * @returns {Object} Result
 */
function unarchiveFiles(payload) {
  return DriveCleanerWebApp.unarchiveFiles(payload);
}

/**
 * Retrieves active Safety Vault status from user properties
 * Called from React app via google.script.run
 * @returns {Object} Safety vault batch details or { hasActiveBatch: false }
 */
function getSafetyVaultStatus() {
  return DriveCleanerWebApp.getSafetyVaultStatus();
}

/**
 * Restores all files in the current Safety Vault batch back to Google Drive
 * Called from React app via google.script.run
 * @returns {Object} Restoration result
 */
function restoreSafetyVaultBatch() {
  return DriveCleanerWebApp.restoreSafetyVaultBatch();
}

/**
 * Dismisses the current active Safety Vault batch
 * Called from React app via google.script.run
 * @returns {Object} { success: boolean }
 */
function dismissSafetyVaultBatch() {
  return DriveCleanerWebApp.dismissSafetyVaultBatch();
}

// ============================================
// AUTOMATION & TIME-DRIVEN TRIGGERS API
// ============================================

/**
 * Synchronize project triggers with automation config
 * Called from React app via google.script.run
 * @param {string|Object} config - Automation config
 * @returns {Object} Result
 */
function syncAutomationTriggers(config) {
  // eslint-disable-next-line no-undef
  return typeof TriggerManager !== 'undefined'
    ? TriggerManager.syncTriggers(config)
    : { success: false, error: 'TriggerManager not loaded' };
}

/**
 * Gets automation and active trigger status
 * Called from React app via google.script.run
 * @returns {Object} Status
 */
function getAutomationStatus() {
  // eslint-disable-next-line no-undef
  return typeof TriggerManager !== 'undefined'
    ? TriggerManager.getAutomationStatus()
    : { success: false, error: 'TriggerManager not loaded' };
}

/**
 * Sends a test digest email immediately
 * Called from React app via google.script.run
 * @param {string} [recipientEmail] - Target email
 * @returns {Object} Result
 */
function sendTestDigestEmail(recipientEmail) {
  // eslint-disable-next-line no-undef
  return typeof TriggerManager !== 'undefined'
    ? TriggerManager.sendScheduledDigestEmail(recipientEmail)
    : { success: false, error: 'TriggerManager not loaded' };
}

/**
 * Runs a background audit immediately
 * Called from React app via google.script.run
 * @returns {Object} Result
 */
function runScheduledAuditNow() {
  // eslint-disable-next-line no-undef
  return typeof TriggerManager !== 'undefined'
    ? TriggerManager.runScheduledAudit()
    : { success: false, error: 'TriggerManager not loaded' };
}

/**
 * Global trigger handler for Scheduled Background Audit
 * Triggered automatically by Google Apps Script time-driven trigger
 */
function runScheduledAudit() {
  // eslint-disable-next-line no-undef
  if (typeof TriggerManager !== 'undefined') {
    return TriggerManager.runScheduledAudit();
  }
}

/**
 * Global trigger handler for Weekly Email Digest
 * Triggered automatically by Google Apps Script time-driven trigger
 */
function sendScheduledDigestEmail() {
  // eslint-disable-next-line no-undef
  if (typeof TriggerManager !== 'undefined') {
    return TriggerManager.sendScheduledDigestEmail();
  }
}

// ============================================
// SMART FOLDER REORGANIZER API
// ============================================

/**
 * Analyzes Drive folder structure and computes hierarchy health score
 * Called from React app via google.script.run
 * @param {string} [rootFolderId] - Root folder ID
 * @returns {Object} Report
 */
function analyzeFolderStructure(rootFolderId) {
  // eslint-disable-next-line no-undef
  return typeof FolderReorganizer !== 'undefined'
    ? FolderReorganizer.analyzeStructure(rootFolderId)
    : { success: false, error: 'FolderReorganizer not loaded' };
}

/**
 * Executes a proposed folder reorganization plan
 * Called from React app via google.script.run
 * @param {string|Object} plan - Reorganization plan
 * @returns {Object} Result
 */
function executeFolderReorganization(plan) {
  // eslint-disable-next-line no-undef
  return typeof FolderReorganizer !== 'undefined'
    ? FolderReorganizer.executeReorganization(plan)
    : { success: false, error: 'FolderReorganizer not loaded' };
}

/**
 * Restores files to original folders from a reorganization restore point
 * Called from React app via google.script.run
 * @param {string} restorePointId - Restore point ID
 * @returns {Object} Result
 */
function restoreFolderReorganization(restorePointId) {
  // eslint-disable-next-line no-undef
  return typeof FolderReorganizer !== 'undefined'
    ? FolderReorganizer.restoreReorganization(restorePointId)
    : { success: false, error: 'FolderReorganizer not loaded' };
}

// ============================================
// GOOGLE DRIVE LABELS & TAXONOMY API
// ============================================

/**
 * Gets labels registry and file mappings
 * Called from React app via google.script.run
 * @returns {Object} Labels registry
 */
function getDriveLabelsRegistry() {
  // eslint-disable-next-line no-undef
  return typeof LabelsManager !== 'undefined'
    ? LabelsManager.getRegistry()
    : { success: false, error: 'LabelsManager not loaded' };
}

/**
 * Applies a label to files
 * Called from React app via google.script.run
 * @param {string|Object} payload - { fileIds, labelId }
 * @returns {Object} Result
 */
function applyDriveLabel(payload) {
  // eslint-disable-next-line no-undef
  return typeof LabelsManager !== 'undefined'
    ? LabelsManager.applyLabel(payload)
    : { success: false, error: 'LabelsManager not loaded' };
}

/**
 * Removes a label from files
 * Called from React app via google.script.run
 * @param {string|Object} payload - { fileIds, labelId }
 * @returns {Object} Result
 */
function removeDriveLabel(payload) {
  // eslint-disable-next-line no-undef
  return typeof LabelsManager !== 'undefined'
    ? LabelsManager.removeLabel(payload)
    : { success: false, error: 'LabelsManager not loaded' };
}

/**
 * Saves a custom label definition
 * Called from React app via google.script.run
 * @param {string|Object} payload - Label object
 * @returns {Object} Result
 */
function saveCustomDriveLabel(payload) {
  // eslint-disable-next-line no-undef
  return typeof LabelsManager !== 'undefined'
    ? LabelsManager.saveCustomLabel(payload)
    : { success: false, error: 'LabelsManager not loaded' };
}

/**
 * Gets list of accessible Google Workspace Shared Drives
 * Called from React app via google.script.run
 * @returns {Object} List of Shared Drives
 */
function getSharedDrivesList() {
  // eslint-disable-next-line no-undef
  return typeof SharedDrivesManager !== 'undefined'
    ? SharedDrivesManager.getSharedDrivesList()
    : { success: false, error: 'SharedDrivesManager not loaded' };
}

/**
 * Runs deep hygiene audit on a Shared Drive
 * Called from React app via google.script.run
 * @param {string} driveId - The Shared Drive ID
 * @returns {Object} Detailed audit report
 */
function auditSharedDrive(driveId) {
  // eslint-disable-next-line no-undef
  return typeof SharedDrivesManager !== 'undefined'
    ? SharedDrivesManager.auditSharedDrive(driveId)
    : { success: false, error: 'SharedDrivesManager not loaded' };
}

/**
 * Analyzes video, audio, and photos for storage, bursts, and compression
 * Called from React app via google.script.run
 * @param {string|Object} payload - { rootFolderId, corpora } or JSON string
 * @returns {Object} Detailed media optimization report
 */
function analyzeMediaFiles(payload) {
  try {
    var params = payload;
    if (typeof payload === 'string') {
      try {
        params = JSON.parse(payload);
      } catch (e) {
        params = { rootFolderId: payload, corpora: 'user' };
      }
    }
    var rootFolderId = (params && params.rootFolderId) || 'root';
    var corpora = (params && params.corpora) || 'user';

    // eslint-disable-next-line no-undef
    return typeof MediaOptimizer !== 'undefined'
      ? MediaOptimizer.analyzeMediaFiles(rootFolderId, corpora)
      : { success: false, error: 'MediaOptimizer not loaded' };
  } catch (err) {
    console.error('Error in analyzeMediaFiles:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Runs security & sharing exposure audit
 * Called from React app via google.script.run
 * @param {string|Object} payload - { rootFolderId, corpora } or JSON string
 * @returns {Object} Security audit report
 */
function auditSecurityPermissions(payload) {
  try {
    var params = payload;
    if (typeof payload === 'string') {
      try {
        params = JSON.parse(payload);
      } catch (e) {
        params = { rootFolderId: payload, corpora: 'user' };
      }
    }
    var rootFolderId = (params && params.rootFolderId) || 'root';
    var corpora = (params && params.corpora) || 'user';

    // eslint-disable-next-line no-undef
    return typeof SecurityAuditManager !== 'undefined'
      ? SecurityAuditManager.auditSecurityPermissions(rootFolderId, corpora)
      : { success: false, error: 'SecurityAuditManager not loaded' };
  } catch (err) {
    console.error('Error in auditSecurityPermissions:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Revokes public access on a file
 * @param {string} fileId
 * @returns {Object}
 */
function revokePublicAccess(fileId) {
  // eslint-disable-next-line no-undef
  return typeof SecurityAuditManager !== 'undefined'
    ? SecurityAuditManager.revokePublicAccess(fileId)
    : { success: false, error: 'SecurityAuditManager not loaded' };
}

/**
 * Bulk revokes public access across multiple files
 * @param {Array<string>} fileIds
 * @returns {Object}
 */
function bulkRevokePublicAccess(fileIds) {
  // eslint-disable-next-line no-undef
  return typeof SecurityAuditManager !== 'undefined'
    ? SecurityAuditManager.bulkRevokePublicAccess(fileIds)
    : { success: false, error: 'SecurityAuditManager not loaded' };
}

/**
 * Revokes a specific collaborator permission
 * @param {Object} payload - { fileId, permissionId }
 * @returns {Object}
 */
function revokeCollaboratorAccess(payload) {
  // eslint-disable-next-line no-undef
  return typeof SecurityAuditManager !== 'undefined'
    ? SecurityAuditManager.revokeCollaboratorAccess(payload.fileId, payload.permissionId)
    : { success: false, error: 'SecurityAuditManager not loaded' };
}

/**
 * Bulk revokes all permissions matching an external domain
 * @param {Object} payload - { domain, fileIds }
 * @returns {Object}
 */
function bulkRevokeDomainAccess(payload) {
  // eslint-disable-next-line no-undef
  return typeof SecurityAuditManager !== 'undefined'
    ? SecurityAuditManager.bulkRevokeDomainAccess(payload.domain, payload.fileIds)
    : { success: false, error: 'SecurityAuditManager not loaded' };
}

/**
 * Downgrades editor to viewer
 * @param {Object} payload - { fileId, permissionId }
 * @returns {Object}
 */
function downgradeEditorToViewer(payload) {
  // eslint-disable-next-line no-undef
  return typeof SecurityAuditManager !== 'undefined'
    ? SecurityAuditManager.downgradeEditorToViewer(payload.fileId, payload.permissionId)
    : { success: false, error: 'SecurityAuditManager not loaded' };
}

// ============================================
// INCREMENTAL SYNC & DRIVE CHANGES API
// ============================================

/**
 * Retrieves the starting change token from Drive API Changes resource
 * Called from React app via google.script.run
 * @returns {Object} { success, changeToken, largestChangeId, timestamp }
 */
function getStartChangeToken() {
  // eslint-disable-next-line no-undef
  return typeof SyncManager !== 'undefined'
    ? SyncManager.getStartChangeToken()
    : { success: false, error: 'SyncManager not loaded' };
}

/**
 * Synchronizes incremental changes since a given change token
 * Called from React app via google.script.run
 * @param {string|Object} payload - { changeToken, corpora } or changeToken string
 * @returns {Object} Delta changes package
 */
function syncIncrementalChanges(payload) {
  try {
    var params = payload;
    if (typeof payload === 'string') {
      try {
        params = JSON.parse(payload);
      } catch (e) {
        params = { changeToken: payload, corpora: 'user' };
      }
    }
    var changeToken = (params && (params.changeToken || params.savedChangeId)) || null;
    var corpora = (params && params.corpora) || 'user';

    // eslint-disable-next-line no-undef
    return typeof SyncManager !== 'undefined'
      ? SyncManager.syncIncrementalChanges(changeToken, corpora)
      : { success: false, error: 'SyncManager not loaded' };
  } catch (err) {
    console.error('Error in syncIncrementalChanges:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves comprehensive trash lifecycle audit overview
 * Called from React app via google.script.run
 * @returns {Object} Trash lifecycle data
 */
function getTrashGovernanceOverview() {
  // eslint-disable-next-line no-undef
  return typeof TrashGovernanceManager !== 'undefined'
    ? TrashGovernanceManager.getTrashOverview()
    : { success: false, error: 'TrashGovernanceManager not loaded' };
}

/**
 * Restores a list of files from Google Drive Trash
 * Called from React app via google.script.run
 * @param {Array<string>|string} payload - Array of file IDs or JSON string
 * @returns {Object} Restoration result
 */
function restoreTrashFiles(payload) {
  try {
    var fileIds = payload;
    if (typeof payload === 'string') {
      try {
        fileIds = JSON.parse(payload);
      } catch (e) {
        fileIds = [payload];
      }
    }
    // eslint-disable-next-line no-undef
    return typeof TrashGovernanceManager !== 'undefined'
      ? TrashGovernanceManager.restoreTrashFiles(fileIds)
      : { success: false, error: 'TrashGovernanceManager not loaded' };
  } catch (err) {
    console.error('Error in restoreTrashFiles:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Permanently and irreversibly purges a list of files from Google Drive Trash
 * Called from React app via google.script.run
 * @param {Array<string>|string} payload - Array of file IDs or JSON string
 * @returns {Object} Permanent purge result
 */
function purgeTrashFilesPermanently(payload) {
  try {
    var fileIds = payload;
    if (typeof payload === 'string') {
      try {
        fileIds = JSON.parse(payload);
      } catch (e) {
        fileIds = [payload];
      }
    }
    // eslint-disable-next-line no-undef
    return typeof TrashGovernanceManager !== 'undefined'
      ? TrashGovernanceManager.purgeTrashFilesPermanently(fileIds)
      : { success: false, error: 'TrashGovernanceManager not loaded' };
  } catch (err) {
    console.error('Error in purgeTrashFilesPermanently:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Permanently and irreversibly empties all Google Drive Trash
 * Called from React app via google.script.run
 * @returns {Object} Empty trash result
 */
function emptyDriveTrashPermanently() {
  // eslint-disable-next-line no-undef
  return typeof TrashGovernanceManager !== 'undefined'
    ? TrashGovernanceManager.emptyDriveTrashPermanently()
    : { success: false, error: 'TrashGovernanceManager not loaded' };
}

/**
 * Run this function in the Google Apps Script editor to authorize all Drive permissions!
 * Open editor: https://script.google.com/a/andyedwards.uk/d/1qkpaDFbdqq3OlpMCEdOUk68nr3svvVk3mmhhmHykRIbvaBUimsx2uN-G/edit
 * Select 'authorizeDriveCleaner' in the function dropdown at top, then click 'Run'.
 * Click 'Review Permissions', select your account, and click 'Allow'.
 */
function authorizeDriveCleaner() {
  console.log('Testing Drive authorization...');
  const root = DriveApp.getRootFolder();
  console.log('DriveApp root folder:', root.getName());
  const about = Drive.About.get();
  console.log('Drive API user:', about.user ? (about.user.displayName || about.user.emailAddress) : 'Authorized');
  console.log('Total quota bytes:', about.quotaBytesTotal || (about.storageQuota && about.storageQuota.limit));
  const token = ScriptApp.getOAuthToken();
  console.log('OAuth token obtained successfully:', !!token);
  return 'SUCCESS: Drive Cleaner is fully authorized!';
}

