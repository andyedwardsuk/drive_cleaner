/**
 * Drive Cleaner - Drive API Helpers
 *
 * Shared utilities for interacting with Google Drive API.
 * Used by both spreadsheet and web app interfaces.
 *
 * @author Andy Edwards
 * @version [0.2.0] - 2025-11-17
 */

var DriveApiHelpers = (function () {

  // ============================================
  // PRIVATE CONSTANTS
  // ============================================

  /** Maximum folders per Drive API query to avoid URL length limits */
  const MAX_FOLDERS_PER_QUERY = 250;

  /** MIME type identifier for Google Drive folders */
  const MIME_TYPE_FOLDER = 'application/vnd.google-apps.folder';

  // ============================================
  // PUBLIC API FUNCTIONS
  // ============================================

  /**
   * Fetches all file and folder data from specified root
   * Returns data array without writing to sheet (for web app)
   * @param {string} rootFolderId - Root folder ID or 'root'
   * @param {string} corpora - 'drive' (Shared Drive) or 'user' (My Drive)
   * @returns {Array<Array>} 2D array of file/folder data
   */
  function getFileAndFolderData(rootFolderId, corpora) {
    console.time('getFileAndFolderData');

    const rootFolder = getRootFolderInfo_(rootFolderId);
    const folderPathLookup = new Map([[rootFolder.id, rootFolder.name]]);

    let directoryRows = [];
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

      // Fetch items from current batch
      const items = fetchAllItemsFromFolders_(foldersToProcess, rootFolder.driveId, corpora);

      // Process items
      const processedData = processItemsIntoRows_(items, foldersToProcess, folderPathLookup);

      // Queue child folders
      foldersToProcess = [...foldersRemaining, ...processedData.childFolders];
      directoryRows = directoryRows.concat(processedData.rows);
    }

    console.timeEnd('getFileAndFolderData');
    return directoryRows;
  }

  // ============================================
  // PRIVATE HELPER FUNCTIONS
  // ============================================

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

    // 1. Try Drive.Files.get with supportsAllDrives and supportsTeamDrives (Drive API v2)
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

    // 2. Try Drive.Drives.get if folderId is a Shared Drive root
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

    // 3. Try DriveApp.getFolderById as fallback
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

    const errorDetails = lastError ? lastError.message : 'Folder not accessible or does not exist.';
    throw new Error(
      `No folder found with ID: ${folderId} (${errorDetails}). ` +
      'Please ensure that the folder is shared with your account, not in Trash, and that you have view access.'
    );
  }

  /**
   * Fetches all items from folders with pagination
   * @param {Array<Object>} folders - Array of {id, name}
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
   * @returns {Object} {items, nextPageToken}
   * @private
   */
  function queryDriveApi_(folders, pageToken, driveId, corpora) {
    const queryString = buildQueryString_(folders);

    const requestPayload = {
      q: queryString,
      fields: 'items(id, title, mimeType, parents(id), fileSize, createdDate, modifiedDate, lastViewedByMeDate, ownerNames, owners(displayName, emailAddress), shared, permissions, labels(starred), description, thumbnailLink, fileExtension, alternateLink), nextPageToken',
      supportsAllDrives: true,
      supportsTeamDrives: true,
      includeItemsFromAllDrives: true
    };

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
   * Processes Drive items into rows and extracts child folders
   * Uses metadata parser to extract and format all enhanced metadata
   *
   * @param {Array<Object>} items - Drive API items
   * @param {Array<Object>} parentFolders - Parent folders
   * @param {Map<string, string>} folderPathLookup - Folder ID to path map
   * @returns {Object} {rows: Array<Array>, childFolders: Array<Object>}
   * @private
   */
  function processItemsIntoRows_(items, parentFolders, folderPathLookup) {
    const rows = [];
    const childFolders = [];

    items.forEach(item => {
      const isFolder = item.mimeType === MIME_TYPE_FOLDER;
      const parentFolderId = item.parents[0].id;
      const parentFolder = findParentFolder_(item.parents, parentFolders);

      // Parse metadata and create row using metadata parser
      // eslint-disable-next-line no-undef
      const metadata = parseFileMetadata(item, parentFolder);
      // eslint-disable-next-line no-undef
      const row = parseForSpreadsheet(metadata);
      rows.push(row);

      // Track child folders
      if (isFolder) {
        const folderPath = `${folderPathLookup.get(parentFolderId)}/${item.title}`;
        folderPathLookup.set(item.id, folderPath);
        childFolders.push({ id: item.id, name: item.title });
      }
    });

    return { rows, childFolders };
  }

  /**
   * Finds parent folder from item's parents array
   * @param {Array<Object>} itemParents - Item's parents array
   * @param {Array<Object>} parentFolders - Available parent folders
   * @returns {Object} Parent folder object
   * @private
   */
  function findParentFolder_(itemParents, parentFolders) {
    const parentFolderIds = itemParents.map(parent => parent.id);
    return parentFolders.find(folder => parentFolderIds.includes(folder.id));
  }

  // ============================================
  // EXPORT PUBLIC API
  // ============================================

  return {
    getFileAndFolderData: getFileAndFolderData
  };

})();

// ============================================
// LEGACY FUNCTION NAMES
// ============================================

/**
 * Legacy function name for backwards compatibility
 * @deprecated Use DriveApiHelpers.getFileAndFolderData() instead
 * @param {string} rootId - Root folder ID
 * @param {string} corpora - 'drive' or 'user'
 * @returns {Array<Array>} Directory data
 */
function getFileandFoldersData(rootId, corpora) {
  return DriveApiHelpers.getFileAndFolderData(rootId, corpora);
}
