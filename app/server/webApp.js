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
      const about = Drive.About.get({
        fields: 'storageQuota,user'
      });

      const quota = about.storageQuota || {};

      return {
        success: true,
        data: {
          // Total storage limit in bytes
          limit: parseInt(quota.limit) || 0,
          // Total storage used across all services in bytes
          usage: parseInt(quota.usage) || 0,
          // Storage used in Drive in bytes
          usageInDrive: parseInt(quota.usageInDrive) || 0,
          // Storage used in Drive trash
          usageInDriveTrash: parseInt(quota.usageInDriveTrash) || 0,
          // User email
          userEmail: about.user ? about.user.emailAddress : null,
          // Calculated values
          available: (parseInt(quota.limit) || 0) - (parseInt(quota.usage) || 0),
          percentUsed: quota.limit ? ((parseInt(quota.usage) / parseInt(quota.limit)) * 100).toFixed(2) : 0
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
    getDriveQuota: getDriveQuota
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
 * Run this function in the Google Apps Script editor to authorize all Drive permissions!
 * Open editor: https://script.google.com/a/andyedwards.uk/d/1qkpaDFbdqq3OlpMCEdOUk68nr3svvVk3mmhhmHykRIbvaBUimsx2uN-G/edit
 * Select 'authorizeDriveCleaner' in the function dropdown at top, then click 'Run'.
 * Click 'Review Permissions', select your account, and click 'Allow'.
 */
function authorizeDriveCleaner() {
  console.log('Testing Drive authorization...');
  const root = DriveApp.getRootFolder();
  console.log('DriveApp root folder:', root.getName());
  const quota = Drive.About.get({ fields: 'user,storageQuota' });
  console.log('Drive API user:', quota.user.displayName);
  const token = ScriptApp.getOAuthToken();
  console.log('OAuth token obtained successfully:', !!token);
  return 'SUCCESS: Drive Cleaner is fully authorized!';
}

