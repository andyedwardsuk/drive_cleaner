//########### LIST ALL FILES AND FOLDERS ###########

/**#######################################################################################
 *                                    PROJECT DETAILS
 * #######################################################################################
 * This project creates List all files and folders in a selected folder.
 * The user selectes a folder by clicking the menu "List Files/Folders" > "List All Files and Folders"
 * Alternatively, the user may wish to refresh the list by selecting "List Files/Folders" > "Refresh"
 *
 * @license https://docs.google.com/document/d/1kn5lof_GtJyTLa74BSAQxEFVkVfrNy8e4Ilr8a3pJQQ
 * @author Scott Donald <yagisanatode@gmail.com>
 * @version [0.1.0] - 2024-01-29
 *
 */


/**
 * Creates the menu items for the List.
 * Simple trigger that is run when the Sheet is opened.
 */
function onOpen() {

  const ui = SpreadsheetApp.getUi();
  ui.createMenu('List Files/Folders')
    .addItem('List All Files and Folders', 'listFilesAndFolders_v2')
    .addItem('Refresh', 'refresh')
    .addToUi();
};

function listFilesAndFolders_v2(){
  const html = HtmlService.createHtmlOutputFromFile("index")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle("List all files and folders")
    .setHeight(340)
    .setWidth(500)

  const ui = SpreadsheetApp.getUi()

  ui.showModalDialog(html, "List all files and folders")
}

/**
 * Called when "List All Files and Folders" menu items is selected.
 * Generates a dialogue for the user to enter their folder id.
 * Stores the id of the current folder.
 */
function listFilesAndFolders() {
  var folderId = Browser.inputBox('Enter folder ID', Browser.Buttons.OK_CANCEL);
  if (folderId === "cancel") return;

  if (folderId === "") {
    Browser.msgBox('Folder ID is invalid');
    return;
  }
  PropertiesService.getUserProperties().setProperty("refresh", folderId)
  getFileandFolders(folderId);
};


/**
 * Called when "Refresh" is selected.
 * Retrieves the stored ID and reruns the process.
 *
 */
function refresh() {
  const hasProp = PropertiesService.getUserProperties().getProperty("refresh")

  if(hasProp){
    const {id, corpora} = JSON.parse(hasProp)
    getFileandFolders(id, corpora)
  }
}


/**
 * Submits the directory data from the payload called from the dialogue box.
 * @param {JSON} paload - {urlId, corpora}
 */
function submitDirectory(payload){
  console.log(payload)

  const {urlId, corpora} = JSON.parse(payload)

  console.log(urlId, corpora)


  // Convert URL to id
  const id = convertUrlToId(urlId)

  PropertiesService.getUserProperties().setProperty("refresh", JSON.stringify({
    id,
    corpora
  }))

  console.log( id, corpora)
  getFileandFolders(id, corpora)

}


/**
 * Update with max query string
 * @param {String} rootId - The main rood id.
 * @param {String} corpora - either 'drive' or 'user'
 */
function getFileandFolders(rootId, corpora) {
  console.time("getFilesAndFoldersIds")

  const ss = SpreadsheetApp.getActive()
  const ui = SpreadsheetApp.getUi()

  ss.toast("This may take a moment", "Retrieving files...")

  const sheet = ss.getActiveSheet()
  sheet.clear();

  const maxNumOfFoldersPerQuery = "250"; // "598" @see test_queryLen()

  let pageToken = null;
  let folderData = {};
  let driveId = "";
  let directoryArray = [
    [
      "Icon",
      "File Name",
      "File ID",
      "Parent Name",
      "Parent ID",
      "File MIME type",

    ]
  ];

  let folders = []
  if (rootId === 'root') {
      const resp = Drive.Files.get(rootId, {
        'fields': 'title, id, driveId',
        'supportsAllDrives': true,
      })

    folders = [{ name: resp.title, id: resp.id }]
    driveId = resp.driveId
  } else {
    try{

      var resp = Drive.Files.get(rootId, {
        'fields': 'title, driveId',
        'supportsAllDrives': true,
      })

    }catch(e){
      ui.alert("🤖 ERROR", `!!! No folder found with this id:${rootId} !!!`, ui.ButtonSet.OK)
    }
    folders = [
      {
        name: resp.title,
        id: rootId
      }
    ];

    driveId = resp.driveId;
  }
  console.log(driveId)

  // Set first path
  FOLDER_LIST[folders[0].id] = folders[0].name


  // Temporarily stores any extra folders that could not be added to the query.
  let foldersRemaining = []


  // Iterate over each folder in the fodlers arrage.
  while (folders.length) {
    let items = [];// Stores all found files and folders.

    // If the folder length is greater than or equal to the Max num of folders per query,
    // Then store any extra folders in the foldersRemaining array.
    // Alternatively, if the folder len is less than the max num then clear the fodlers remaining array.
    if (folders.length > maxNumOfFoldersPerQuery) {
      foldersRemaining = folders.splice(maxNumOfFoldersPerQuery)
    } else {
      foldersRemaining = [];
    }

    // If a page token is present from our call to the Google Drive API, there are multiple pages. Here we iterate over them
    // storing the items retrieved from each version in the items variable.
    do {

      folderData = getItemsForFolderArray_(folders, pageToken, driveId, corpora) // Calls the Drive API to retireve all items.
      items = items.concat(folderData.items); // Extracts the items array from the folder data object.
      // console.log(items)
      pageToken = folderData.nextPageToken;

    } while (pageToken); // if page token exists, repeat.

    const itemArrays = createFileArrays_(items, folders);

    // Store remaining folders and new child folders.
    folders = [...foldersRemaining, ...itemArrays.childFolderIds];


    directoryArray = directoryArray.concat(itemArrays.spreadsheetFormatted);

  };



  const totalRange = sheet
    .getRange(1, 1, directoryArray.length, directoryArray[0].length)
    .setValues(directoryArray);

  totalRange.applyRowBanding();

  sheet.getRange("1:1").setFontWeight("bold")
  sheet.getRange("B2:C").setWrap(true)

  console.timeEnd("getFilesAndFoldersIds");
  ss.toast("Files retrieved.")
};


/**
 * Retrieves the current list of items from the selected folders from the Drive API.
 *
 * @see FIELDS {@link https://developers.google.com/drive/api/guides/fields-parameter}
 *
 * Fields can be modified to your preference here. You can nest fields by using brackets.
 * @param {Array<Object>} folders - all parent folders to query [{id, name}]
 * @param {String|null} pageToken - The page token should there be more items to retrieve or null if not.
 * @param {string|undefined} driveId - The source Shared Drive ID or undefined if My Drive.
 * @param {string} corpora - 'drive' or 'user'.
 * @returns {Object} Object containing a page token and an array of found items of files and
 * folders {items<array>, nextpageToken}.
 */
function getItemsForFolderArray_(folders, pageToken, driveId, corpora) {

  const queryString = createQueryString_(folders);
  // console.log("queryString", queryString)
  let payload =
  {
    'q': queryString,
    'fields': `items(id, title, mimeType, parents(id), alternateLink), nextPageToken`,
    'supportsAllDrives': true,
    'includeItemsFromAllDrives': true,

  };

  if(driveId && corpora === "drive"){
    payload.corpora = corpora
    payload.driveId = driveId
  }
  if (pageToken) payload.pageToken = pageToken;
  console.log("PAYLOAD", payload)

  return Drive.Files.list(payload);
}



/**
 * Generates the query string
 *
 * called from getCurrentDirectory()
 *
 * @see QUERY {@link https://developers.google.com/drive/api/guides/ref-search-terms}
 *
 * @param {Array<Object>} folders - Array of objects containg [{id, name}]
 * @returns {String} The query string for the Drive API request.
 */
function createQueryString_(folders) {

  let queryString = ""


  // If just one folder no need to add brackets.
  if (folders.length === 1) {
    queryString = `'${folders[0].id}' in parents `
    // Iterate through each folder and create the query for each.
  } else {
    queryString = `(`
    folders.forEach((folder, idx) => {
      queryString += (idx === folders.length - 1) ? `'${folder.id}' in parents ` : `'${folder.id}' in parents OR `
    })
    queryString += `) `
  }

  // Add any extra queries here. You might add a list of file types.
  queryString += `AND trashed=false`
  // console.log(queryString.length, folders.length)

  return queryString;
};





/**
 * Iterates through all found items and creates two arrays:
 * 1) spreadsheetFormatted - A 2d array to be added to the selected sheet tab.
 * conatins [[image, file title, file id, parent name, parent id, file mimeType]]
 * 2) childFolderIds - used to update the folder variable [{id, name}]
 * @param {Array<Object>} folderArray - Array of objects containg [{id, title, mimeType, parents[{id}]}]
 * @param {Array<Object>} folders - Array of objects containg [{id, name}]
 * @returns {Object}
 *
 */
function createFileArrays_(folderArray, folders) {

  let fileArrays = {
    spreadsheetFormatted: [],
    childFolderIds: []
  };

  // Iterate over each found item.
  folderArray.forEach(file => {
    // console.log("CURRENT FILE",file)

    const isFolder = file.mimeType === "application/vnd.google-apps.folder"; // Is current file a folder?

    console.log(file.parents, folders)
    //## For shreadsheetFormatted ##
    const fileParentFolderIds = file.parents.map(parent => parent.id)
    let parentFolder = folders.find(folder => fileParentFolderIds.includes(folder.id))
    // console.log(file)


    const parentFolderId = `=HYPERLINK("https://drive.google.com/drive/folders/${parentFolder.id}","${parentFolder.id}")`

    const image = (isFolder) ? "📂" : "📃"
    const fileData = [
      image,                    // File or Folder imgage
      file.title,               // File|Folder Name
      file.id,                  // File|Folder ID
      parentFolder.name,        // Parent Folder Name
      parentFolderId,           // Parent Folder ID
      file.mimeType             // File|Folder MimeType
    ]




    fileArrays.spreadsheetFormatted = fileArrays.spreadsheetFormatted.concat([fileData])


    //## For childFolderIds ##
    if (isFolder) {
      fileArrays.childFolderIds = fileArrays.childFolderIds.concat([
        {
          name: file.title,
          id: file.id
        }
      ])
    }
  })

  return fileArrays;
};



const FOLDER_LIST = {}
/**
 * Returns the filepath of the current file/folder.
 * If a folder is the file, then the the path is added to the path list.
 * @param {Object} file - file.title, file.id
 * @returns {String} The file path
 */
function getPath(file, isFolder, parentFolderId) {
  // console.log(file)
  let path = ""
  // if
  if (isFolder) {
    if (FOLDER_LIST.hasOwnProperty(file.id)) {
      path = FOLDER_LIST[file.id] // The root folder path.
    } else {
      // New path
      const newPath = `${FOLDER_LIST[parentFolderId]}/${file.title}`
      FOLDER_LIST[file.id] = newPath
      path = newPath
    }
  } else {
    path = FOLDER_LIST[parentFolderId]
  }

  // console.log("FOLDER_LIST:", FOLDER_LIST)
  return path;
}



/**
 * Convers a URL to an id. If the ID is blank ("") then it will convert to 'root' for MyDrive
 * @param {String} urlId - url or id generated by user.
 * @returns {String} the folder id or 'root'.
 */
function convertUrlToId(urlId){

  // Handle for My Drive
  if(urlId.length == 0 || urlId.toLowerCase() == 'root') return 'root'

  // Check if just ID provided.
  const isId = urlId.match(/\//)
  console.log(isId)
  if(!isId){
    return urlId
  }else{
    const match = urlId.match(/folders\/([A-Za-z0-9\_\-].*)|folders\/([A-Za-z0-9\_\-].*)\//)
    if(!match) return urlId
    const id = match[1].replace("/", "")
    return id
  }
}


function convertUrlToId_test(){
  const eg = 'https://drive.google.com/drive/folders/0AKg4gkqTIiD3Uk9PVA/'
  const eg2 = '0AKg4gkqTIiD3Uk9PVA'
  const eg3 = "https://yagisanatode.com"
  convertUrlToId(eg)
  convertUrlToId(eg2)
  convertUrlToId(eg3)

}

