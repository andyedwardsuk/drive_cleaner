/**
 * Drive Cleaner - List All Files and Folders
 *
 * Provides functionality to list all files and folders in Google Drive
 * with support for both My Drive and Shared Drives.
 *
 * @license https://docs.google.com/document/d/1kn5lof_GtJyTLa74BSAQxEFVkVfrNy8e4Ilr8a3pJQQ
 * @author Scott Donald <yagisanatode@gmail.com>
 * @author Andy Edwards (refactored)
 * @version [0.2.0] - 2025-11-17
 */

var DriveFileList = (function () {

  // ============================================
  // PRIVATE CONSTANTS
  // ============================================

  /** Maximum folders per Drive API query to avoid URL length limits */
  const MAX_FOLDERS_PER_QUERY = 250;

  /** MIME type identifier for Google Drive folders */
  const MIME_TYPE_FOLDER = 'application/vnd.google-apps.folder';

  /** User property key for caching folder refresh data */
  const CACHE_KEY_REFRESH = 'refresh';

  /** Spreadsheet header row labels */
  const HEADER_LABELS = ['Icon', 'File Name', 'File ID', 'Parent Name', 'Parent ID', 'File MIME type'];

  /** Icon constants */
  const ICON_FOLDER = '📂';
  const ICON_FILE = '📃';

  // ============================================
  // PUBLIC API FUNCTIONS
  // ============================================

  /**
   * Creates menu items when spreadsheet opens
   * Called by global onOpen() trigger
   */
  function createMenu() {
    const userInterface = SpreadsheetApp.getUi();
    userInterface.createMenu('List Files/Folders')
      .addItem('List All Files and Folders', 'DriveFileList.showPickerDialog')
      .addItem('Refresh', 'DriveFileList.refreshList')
      .addToUi();
  }

  /**
   * Shows folder picker dialog to user
   */
  function showPickerDialog() {
    const htmlOutput = HtmlService.createHtmlOutputFromFile('index')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setTitle('List all files and folders')
      .setHeight(340)
      .setWidth(500);

    const userInterface = SpreadsheetApp.getUi();
    userInterface.showModalDialog(htmlOutput, 'List all files and folders');
  }

  /**
   * Refreshes file list using cached folder ID
   */
  function refreshList() {
    const cachedData = getCachedFolderData_();

    if (cachedData) {
      const { folderId, corpora } = cachedData;
      listFilesAndFolders(folderId, corpora);
    }
  }

  /**
   * Processes directory submission from picker dialog
   * @param {string} payload - JSON string containing {urlId, corpora}
   */
  function submitDirectory(payload) {
    const { urlId, corpora } = JSON.parse(payload);
    const folderId = convertUrlToId_(urlId);

    cacheFolderData_(folderId, corpora);
    listFilesAndFolders(folderId, corpora);
  }

  /**
   * Main function to list all files and folders and write to spreadsheet
   * @param {string} rootFolderId - Root folder ID or 'root' for My Drive
   * @param {string} corpora - Either 'drive' (Shared Drive) or 'user' (My Drive)
   */
  function listFilesAndFolders(rootFolderId, corpora) {
    console.time('listFilesAndFolders');

    const activeSpreadsheet = SpreadsheetApp.getActive();
    const activeSheet = activeSpreadsheet.getActiveSheet();

    activeSpreadsheet.toast('This may take a moment', 'Retrieving files...');

    // Fetch all directory data
    const directoryData = fetchAllDirectoryData_(rootFolderId, corpora);

    // Write to sheet
    writeDataToSheet_(activeSheet, directoryData);

    // Format sheet
    formatSheet_(activeSheet);

    console.timeEnd('listFilesAndFolders');
    activeSpreadsheet.toast('Files retrieved.');
  }

  // ============================================
  // PRIVATE HELPER FUNCTIONS
  // ============================================

  /**
   * Fetches all directory data recursively
   * @param {string} rootFolderId - Root folder ID
   * @param {string} corpora - 'drive' or 'user'
   * @returns {Array<Array>} 2D array of file/folder data
   * @private
   */
  function fetchAllDirectoryData_(rootFolderId, corpora) {
    const rootFolder = getRootFolderInfo_(rootFolderId);
    const folderPathLookup = new Map([[rootFolder.id, rootFolder.name]]);

    let directoryRows = [HEADER_LABELS];
    let foldersToProcess = [rootFolder];
    let foldersRemaining = [];

    // Process folders in batches
    while (foldersToProcess.length > 0) {
      // Split into batches if needed
      if (foldersToProcess.length > MAX_FOLDERS_PER_QUERY) {
        foldersRemaining = foldersToProcess.splice(MAX_FOLDERS_PER_QUERY);
      } else {
        foldersRemaining = [];
      }

      // Fetch items from current batch of folders
      const items = fetchAllItemsFromFolders_(foldersToProcess, rootFolder.driveId, corpora);

      // Process items into rows and extract child folders
      const processedData = processItemsIntoRows_(items, foldersToProcess, folderPathLookup);

      // Queue child folders for next iteration
      foldersToProcess = [...foldersRemaining, ...processedData.childFolders];
      directoryRows = directoryRows.concat(processedData.rows);
    }

    return directoryRows;
  }

  /**
   * Gets root folder information from Drive API
   * @param {string} folderId - Folder ID or 'root'
   * @returns {Object} {id, name, driveId}
   * @private
   */
  function getRootFolderInfo_(folderId) {
    if (!folderId || folderId === 'root') {
      try {
        const response = Drive.Files.get('root', {
          fields: 'title, id, driveId',
          supportsAllDrives: true,
          supportsTeamDrives: true
        });
        return {
          id: response.id || 'root',
          name: response.title || 'My Drive',
          driveId: undefined
        };
      } catch (e) {
        return { id: 'root', name: 'My Drive', driveId: undefined };
      }
    }

    let lastError = null;

    // 1. Try Drive.Files.get with supportsAllDrives & supportsTeamDrives
    try {
      const response = Drive.Files.get(folderId, {
        fields: 'title, id, driveId',
        supportsAllDrives: true,
        supportsTeamDrives: true
      });

      return {
        id: response.id || folderId,
        name: response.title || 'Untitled Folder',
        driveId: response.driveId
      };
    } catch (error) {
      lastError = error;
      console.warn(`Drive.Files.get failed for ${folderId}: ${error.message}`);
    }

    // 2. Try Drive.Drives.get if Shared Drive
    try {
      if (typeof Drive !== 'undefined' && Drive.Drives && Drive.Drives.get) {
        const driveRes = Drive.Drives.get(folderId);
        if (driveRes && driveRes.name) {
          return {
            id: folderId,
            name: driveRes.name,
            driveId: folderId
          };
        }
      }
    } catch (e) {
      console.warn(`Drive.Drives.get failed for ${folderId}: ${e.message}`);
    }

    // 3. Try DriveApp.getFolderById
    try {
      const folder = DriveApp.getFolderById(folderId);
      if (folder) {
        return {
          id: folder.getId(),
          name: folder.getName(),
          driveId: undefined
        };
      }
    } catch (e) {
      console.warn(`DriveApp.getFolderById failed for ${folderId}: ${e.message}`);
    }

    // Attempt Spreadsheet UI alert safely if available
    try {
      const userInterface = SpreadsheetApp.getUi();
      if (userInterface) {
        userInterface.alert(
          '🤖 ERROR',
          `No folder found with ID: ${folderId}`,
          userInterface.ButtonSet.OK
        );
      }
    } catch (e) {
      // Running in web app context - SpreadsheetApp.getUi is not available
    }

    const errorDetails = lastError ? lastError.message : 'Folder not accessible or does not exist.';
    throw new Error(`No folder found with ID: ${folderId} (${errorDetails})`);
  }

  /**
   * Fetches all items from folders with pagination support
   * @param {Array<Object>} folders - Array of {id, name} objects
   * @param {string} driveId - Shared Drive ID or undefined
   * @param {string} corpora - 'drive' or 'user'
   * @returns {Array<Object>} All items found
   * @private
   */
  function fetchAllItemsFromFolders_(folders, driveId, corpora) {
    let allItems = [];
    let pageToken = null;

    do {
      const response = queryDriveApi_(folders, pageToken, driveId, corpora);
      allItems = allItems.concat(response.items);
      pageToken = response.nextPageToken;
    } while (pageToken);

    return allItems;
  }

  /**
   * Queries Drive API for items in specified folders
   * @param {Array<Object>} folders - Folders to query
   * @param {string|null} pageToken - Pagination token
   * @param {string} driveId - Shared Drive ID
   * @param {string} corpora - 'drive' or 'user'
   * @returns {Object} Drive API response {items, nextPageToken}
   * @private
   */
  function queryDriveApi_(folders, pageToken, driveId, corpora) {
    const queryString = buildQueryString_(folders);

    const requestPayload = {
      q: queryString,
      fields: 'items(id, title, mimeType, parents(id), fileSize, createdDate, modifiedDate, lastViewedByMeDate, ownerNames, owners(displayName, emailAddress), shared, permissions, starred, description, thumbnailLink, fileExtension, alternateLink), nextPageToken',
      supportsAllDrives: true,
      supportsTeamDrives: true,
      includeItemsFromAllDrives: true
    };

    // Add Shared Drive parameters if applicable
    if (driveId && corpora === 'drive') {
      requestPayload.corpora = corpora;
      requestPayload.driveId = driveId;
    }

    if (pageToken) {
      requestPayload.pageToken = pageToken;
    }

    return Drive.Files.list(requestPayload);
  }

  /**
   * Builds Drive API query string from folder array
   * @param {Array<Object>} folders - Folders with id property
   * @returns {string} Query string for Drive API
   * @private
   */
  function buildQueryString_(folders) {
    const parentQueries = folders.map(folder => `'${folder.id}' in parents`);

    const parentClause = folders.length === 1
      ? parentQueries[0]
      : `(${parentQueries.join(' OR ')})`;

    return `${parentClause} AND trashed=false`;
  }

  /**
   * Processes Drive items into spreadsheet rows and extracts child folders
   * @param {Array<Object>} items - Drive API items
   * @param {Array<Object>} parentFolders - Parent folders being processed
   * @param {Map<string, string>} folderPathLookup - Folder ID to path mapping
   * @returns {Object} {rows: Array<Array>, childFolders: Array<Object>}
   * @private
   */
  function processItemsIntoRows_(items, parentFolders, folderPathLookup) {
    const rows = [];
    const childFolders = [];

    items.forEach(item => {
      const isFolder = item.mimeType === MIME_TYPE_FOLDER;
      const parentFolderId = item.parents[0].id;
      const parentFolder = parentFolders.find(folder => folder.id === parentFolderId);

      // Build spreadsheet row
      const row = createItemRow_(item, parentFolder, isFolder);
      rows.push(row);

      // Track child folders and update path lookup
      if (isFolder) {
        const folderPath = buildFolderPath_(item.title, parentFolderId, folderPathLookup);
        folderPathLookup.set(item.id, folderPath);
        childFolders.push({ id: item.id, name: item.title });
      }
    });

    return { rows, childFolders };
  }

  /**
   * Creates a spreadsheet row for a Drive item
   * Uses metadata parser to extract and format all enhanced metadata
   *
   * @param {Object} item - Drive item from Drive API
   * @param {Object} parentFolder - Parent folder object { id, name }
   * @param {boolean} isFolder - Whether item is a folder
   * @returns {Array} Spreadsheet row with enhanced metadata
   * @private
   */
  function createItemRow_(item, parentFolder, isFolder) {
    // eslint-disable-next-line no-undef
    const metadata = parseFileMetadata(item, parentFolder);
    // eslint-disable-next-line no-undef
    return parseForSpreadsheet(metadata);
  }

  /**
   * Builds full folder path from parent path and folder name
   * @param {string} folderName - Folder name
   * @param {string} parentFolderId - Parent folder ID
   * @param {Map<string, string>} folderPathLookup - Path lookup map
   * @returns {string} Full folder path
   * @private
   */
  function buildFolderPath_(folderName, parentFolderId, folderPathLookup) {
    const parentPath = folderPathLookup.get(parentFolderId);
    return `${parentPath}/${folderName}`;
  }

  /**
   * Creates a HYPERLINK formula for Google Sheets
   * @param {string} folderId - Folder ID
   * @param {string} displayText - Text to display
   * @returns {string} HYPERLINK formula
   * @private
   */
  function createHyperlinkFormula_(folderId, displayText) {
    return `=HYPERLINK("https://drive.google.com/drive/folders/${folderId}","${displayText}")`;
  }

  /**
   * Converts URL or ID to folder ID
   * @param {string} urlOrId - Google Drive URL or folder ID
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

  /**
   * Caches folder data to user properties for refresh functionality
   * @param {string} folderId - Folder ID
   * @param {string} corpora - 'drive' or 'user'
   * @private
   */
  function cacheFolderData_(folderId, corpora) {
    const cacheData = JSON.stringify({ id: folderId, corpora });
    PropertiesService.getUserProperties().setProperty(CACHE_KEY_REFRESH, cacheData);
  }

  /**
   * Retrieves cached folder data from user properties
   * @returns {Object|null} {folderId, corpora} or null if not cached
   * @private
   */
  function getCachedFolderData_() {
    const cached = PropertiesService.getUserProperties().getProperty(CACHE_KEY_REFRESH);

    if (!cached) {
      return null;
    }

    const { id, corpora } = JSON.parse(cached);
    return {
      folderId: id,
      corpora: corpora || 'user'
    };
  }

  /**
   * Writes directory data to spreadsheet
   * @param {Sheet} sheet - Target sheet
   * @param {Array<Array>} data - 2D array of data
   * @private
   */
  function writeDataToSheet_(sheet, data) {
    sheet.clear();

    const targetRange = sheet.getRange(1, 1, data.length, data[0].length);
    targetRange.setValues(data);
  }

  /**
   * Formats the spreadsheet for better readability
   * @param {Sheet} sheet - Sheet to format
   * @private
   */
  function formatSheet_(sheet) {
    // Apply row banding for readability
    sheet.getDataRange().applyRowBanding();

    // Bold header row
    sheet.getRange('1:1').setFontWeight('bold');

    // Wrap text in name and ID columns
    sheet.getRange('B2:C').setWrap(true);
  }

  // ============================================
  // EXPORT PUBLIC API
  // ============================================

  return {
    createMenu: createMenu,
    showPickerDialog: showPickerDialog,
    refreshList: refreshList,
    submitDirectory: submitDirectory,
    listFilesAndFolders: listFilesAndFolders
  };

})();

// ============================================
// GLOBAL SIMPLE TRIGGERS
// ============================================

/**
 * Simple trigger called when spreadsheet opens
 * Must be in global scope for Apps Script to recognize it
 */
function onOpen() {
  DriveFileList.createMenu();
}

/**
 * Legacy function name for backwards compatibility
 * @deprecated Use DriveFileList.showPickerDialog() instead
 */
function listFilesAndFolders_v2() {
  DriveFileList.showPickerDialog();
}

/**
 * Legacy function name for backwards compatibility
 * @deprecated Use DriveFileList.refreshList() instead
 */
function refresh() {
  DriveFileList.refreshList();
}

/**
 * Legacy function name for backwards compatibility
 * @deprecated Use DriveFileList.submitDirectory() instead
 * @param {string} payload - JSON payload
 */
function submitDirectory(payload) {
  DriveFileList.submitDirectory(payload);
}
