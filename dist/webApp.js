//########### WEB APP FUNCTIONS ###########

/**
 * Serves the web application
 * This is the entry point for the Google Apps Script Web App
 * @returns {HtmlOutput} The HTML output for the web app
 */
function doGet() {
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
 * Now includes caching for improved performance on repeated scans
 *
 * @param {String} rootId - The main root id.
 * @param {String} corpora - either 'drive' or 'user'
 * @returns {Array<Array>} 2D array of file/folder data with enhanced metadata
 */
function getFileandFoldersData(rootId, corpora) {
  console.time("getFilesAndFoldersData")

  // Generate cache key
  const cacheKey = generateCacheKey(rootId, corpora)

  // Attempt to get cached data
  const cachedData = getCachedScanData(cacheKey)
  if (cachedData) {
    Logger.log(`Returning cached data for ${rootId} (${cachedData.length} files)`)
    console.timeEnd("getFilesAndFoldersData")
    return cachedData
  }

  Logger.log(`Cache miss - performing fresh scan for ${rootId}`)

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

  // Cache the results (6 hour TTL)
  const cacheSuccess = setCachedScanData(cacheKey, directoryArray)
  if (cacheSuccess) {
    Logger.log(`Scan results cached for ${rootId} (${directoryArray.length} files)`)
  }

  console.timeEnd("getFilesAndFoldersData")
  return directoryArray
}
