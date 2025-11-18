//########### WEB APP FUNCTIONS ###########

/**
 * Serves the web application
 * This is the entry point for the Google Apps Script Web App
 * @param {Object} e - Event object with query parameters
 * @returns {HtmlOutput|TextOutput} The HTML output for the web app or test results
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
      default:
        result = { error: 'Unknown test. Use ?test=metadata, ?test=scan, ?test=analyzer, or ?test=all' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Serve the regular web app
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Drive Cleaner')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

/**
 * Gets the OAuth token for the Drive Picker API
 * @returns {String} The OAuth access token
 */
function getOAuthToken() {
  try {
    return ScriptApp.getOAuthToken()
  } catch (error) {
    console.error('Error getting OAuth token:', error)
    throw new Error('Failed to get OAuth token: ' + error.message)
  }
}

/**
 * Gets files and folders for the web interface
 * Called from the React app via google.script.run
 * @param {String} payload - JSON string containing {urlId, corpora}
 * @returns {Object} Object containing the file/folder data
 */
function getFilesAndFoldersForWeb(payload) {
  try {
    const { urlId, corpora } = JSON.parse(payload)
    const id = convertUrlToId(urlId)

    // Store the folder ID and corpora for refresh
    PropertiesService.getUserProperties().setProperty("refresh", JSON.stringify({
      id,
      corpora
    }))

    // Get the data using the existing function
    const data = getFileandFoldersData(id, corpora)

    return {
      success: true,
      data: data
    }
  } catch (error) {
    console.error('Error in getFilesAndFoldersForWeb:', error)
    throw new Error('Failed to retrieve files and folders: ' + error.message)
  }
}

/**
 * Gets the cached folder ID from user properties
 * @returns {Object|null} Object containing {folderId, corpora} or null
 */
function getCachedFolderId() {
  try {
    const cached = PropertiesService.getUserProperties().getProperty("refresh")
    if (cached) {
      const { id, corpora } = JSON.parse(cached)
      return {
        folderId: id,
        corpora: corpora || 'user'
      }
    }
    return null
  } catch (error) {
    console.error('Error getting cached folder ID:', error)
    return null
  }
}

/**
 * Modified version of getFileandFolders that returns data instead of writing to sheet
 * @param {String} rootId - The main root id.
 * @param {String} corpora - either 'drive' or 'user'
 * @returns {Array<Array>} 2D array of file/folder data
 */
function getFileandFoldersData(rootId, corpora) {
  console.time("getFilesAndFoldersData")

  const maxNumOfFoldersPerQuery = "250"
  let pageToken = null
  let folderData = {}
  let driveId = ""
  let directoryArray = []

  let folders = []
  if (rootId === 'root') {
    const resp = Drive.Files.get(rootId, {
      'fields': 'title, id, driveId',
      'supportsAllDrives': true,
    })
    folders = [{ name: resp.title, id: resp.id }]
    driveId = resp.driveId
  } else {
    try {
      var resp = Drive.Files.get(rootId, {
        'fields': 'title, driveId',
        'supportsAllDrives': true,
      })
    } catch(e) {
      throw new Error(`No folder found with this id: ${rootId}`)
    }
    folders = [{ name: resp.title, id: rootId }]
    driveId = resp.driveId
  }

  // Set first path
  FOLDER_LIST[folders[0].id] = folders[0].name

  // Temporarily stores any extra folders that could not be added to the query
  let foldersRemaining = []

  // Iterate over each folder in the folders array
  while (folders.length) {
    let items = []

    if (folders.length > maxNumOfFoldersPerQuery) {
      foldersRemaining = folders.splice(maxNumOfFoldersPerQuery)
    } else {
      foldersRemaining = []
    }

    do {
      folderData = getItemsForFolderArray_(folders, pageToken, driveId, corpora)
      items = items.concat(folderData.items)
      pageToken = folderData.nextPageToken
    } while (pageToken)

    const itemArrays = createFileArrays_(items, folders)
    folders = [...foldersRemaining, ...itemArrays.childFolderIds]
    directoryArray = directoryArray.concat(itemArrays.spreadsheetFormatted)
  }

  console.timeEnd("getFilesAndFoldersData")
  return directoryArray
}
