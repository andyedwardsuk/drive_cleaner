//########### METADATA PARSER UTILITY ###########

/**
 * Metadata parser for Drive API file objects
 * Transforms raw Drive API responses into enriched, formatted metadata
 *
 * Handles all metadata fields from Drive API v2:
 * - Basic: id, title, mimeType
 * - Size: fileSize (bytes + formatted)
 * - Dates: createdDate, modifiedDate, lastViewedByMeDate
 * - Ownership: owners, ownerNames
 * - Sharing: shared, permissions
 * - Additional: starred, description, thumbnailLink, fileExtension
 *
 * @author Andy Edwards
 * @version 1.0.0
 */

/**
 * Parse and enrich file metadata from Drive API response
 * Main function that orchestrates metadata extraction and formatting
 *
 * @param {Object} driveFileObject - Raw file object from Drive API
 * @param {Object} parentFolder - Parent folder object { id, name }
 * @returns {Object} Enriched metadata object with all fields formatted
 *
 * @example
 * const rawFile = { id: '123', title: 'document.pdf', fileSize: '1024', ... };
 * const parentFolder = { id: 'abc', name: 'My Folder' };
 * const metadata = parseFileMetadata(rawFile, parentFolder);
 * // Returns: { fileId: '123', fileName: 'document.pdf', formattedSize: '1.00 KB', ... }
 */
function parseFileMetadata(driveFileObject, parentFolder) {
  try {
    // Validate input
    if (!driveFileObject) {
      throw new Error('Drive file object is required');
    }

    // Extract and parse all metadata fields
    const metadata = {
      // === Basic Information ===
      fileId: driveFileObject.id || '',
      fileName: driveFileObject.title || 'Untitled',
      mimeType: driveFileObject.mimeType || '',
      // eslint-disable-next-line no-undef
      fileCategory: getMimeTypeCategory(driveFileObject.mimeType),

      // === File Size ===
      fileSizeBytes: parseInt(driveFileObject.fileSize) || 0,
      // eslint-disable-next-line no-undef
      fileSizeFormatted: formatFileSize(parseInt(driveFileObject.fileSize) || 0),

      // === Dates ===
      createdDate: driveFileObject.createdDate || null,
      // eslint-disable-next-line no-undef
      createdDateFormatted: formatDate(driveFileObject.createdDate),
      modifiedDate: driveFileObject.modifiedDate || null,
      // eslint-disable-next-line no-undef
      modifiedDateFormatted: formatDate(driveFileObject.modifiedDate),
      lastViewedDate: driveFileObject.lastViewedByMeDate || null,
      // eslint-disable-next-line no-undef
      lastViewedDateFormatted: formatDate(driveFileObject.lastViewedByMeDate),

      // === Ownership & Sharing ===
      ownerNames: extractOwnerNames(driveFileObject.ownerNames),
      ownerFormatted: formatOwnerInfo(driveFileObject.owners),
      shared: driveFileObject.shared || false,
      // eslint-disable-next-line no-undef
      sharingStatus: formatSharingStatus(driveFileObject.shared, driveFileObject.permissions),

      // === Parent Folder ===
      parentName: parentFolder ? parentFolder.name : 'Unknown',
      parentId: parentFolder ? parentFolder.id : '',

      // === Additional Metadata ===
      starred: driveFileObject.starred || false,
      description: driveFileObject.description || '',
      thumbnailLink: driveFileObject.thumbnailLink || '',
      // eslint-disable-next-line no-undef
      fileExtension: getFileExtension(driveFileObject.title),
      driveLink: driveFileObject.alternateLink || '',

      // === Icon (visual indicator) ===
      icon: getFileIcon(driveFileObject.mimeType),
    };

    return metadata;

  } catch (error) {
    Logger.log(`Error parsing file metadata: ${error.message}`);
    // Return minimal metadata to prevent breaking
    return {
      fileId: driveFileObject.id || 'unknown',
      fileName: driveFileObject.title || 'Error',
      error: error.message
    };
  }
}

/**
 * Extract owner names from ownerNames array
 * Drive API returns ownerNames as array of strings
 *
 * @param {Array} ownerNamesArray - Array of owner names from Drive API
 * @returns {string} Comma-separated owner names or 'Unknown'
 *
 * @example
 * extractOwnerNames(['John Smith', 'Jane Doe']) // Returns "John Smith, Jane Doe"
 * extractOwnerNames([]) // Returns "Unknown"
 */
function extractOwnerNames(ownerNamesArray) {
  if (!ownerNamesArray || !Array.isArray(ownerNamesArray) || ownerNamesArray.length === 0) {
    return 'Unknown';
  }

  return ownerNamesArray.join(', ');
}

/**
 * Format owner information from owners array
 * Provides detailed owner info including email
 *
 * @param {Array} ownersArray - Array of owner objects from Drive API
 * @returns {string} Formatted owner info (name and email)
 *
 * @example
 * formatOwnerInfo([{ displayName: 'John', emailAddress: 'john@example.com' }])
 * // Returns "John (john@example.com)"
 */
function formatOwnerInfo(ownersArray) {
  if (!ownersArray || !Array.isArray(ownersArray) || ownersArray.length === 0) {
    return 'Unknown';
  }

  // Use first owner (files typically have one owner)
  const primaryOwner = ownersArray[0];
  // eslint-disable-next-line no-undef
  return formatOwner(primaryOwner);
}

/**
 * Get appropriate icon/emoji for file type
 * Returns emoji representation based on MIME type
 *
 * @param {string} mimeType - MIME type from Drive API
 * @returns {string} Emoji icon representing file type
 *
 * @example
 * getFileIcon('application/vnd.google-apps.folder') // Returns "📂"
 * getFileIcon('image/jpeg') // Returns "🖼️"
 * getFileIcon('application/pdf') // Returns "📄"
 */
function getFileIcon(mimeType) {
  if (!mimeType) {
    return '📄'; // Default document icon
  }

  // Google Apps types
  if (mimeType.includes('folder')) return '📂';
  if (mimeType.includes('document')) return '📝';
  if (mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('presentation')) return '📽️';
  if (mimeType.includes('form')) return '📋';
  if (mimeType.includes('drawing')) return '🎨';

  // Standard MIME types
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
  if (mimeType.startsWith('text/')) return '📃';

  return '📄'; // Default
}

/**
 * Parse file array for spreadsheet output
 * Converts metadata object to array format for web interface
 * Array format matches frontend expectations in DashboardView.jsx
 *
 * @param {Object} metadata - Parsed metadata from parseFileMetadata()
 * @returns {Array} Array of values for spreadsheet row (15 elements)
 *
 * @example
 * const metadata = parseFileMetadata(file, folder);
 * const row = parseForSpreadsheet(metadata);
 * // Returns: ["📄", "document.pdf", "1.5 MB", "Document", "17/11/2024", ...]
 */
function parseForSpreadsheet(metadata) {
  return [
    metadata.icon,                      // [0] Icon
    metadata.fileName,                  // [1] File Name
    metadata.fileSizeFormatted,         // [2] File Size (formatted)
    metadata.fileCategory,              // [3] File Category
    metadata.modifiedDateFormatted,     // [4] Last Modified
    metadata.createdDateFormatted,      // [5] Created Date
    metadata.lastViewedDateFormatted,   // [6] Last Viewed
    metadata.ownerNames,                // [7] Owner(s)
    metadata.sharingStatus,             // [8] Sharing Status
    metadata.starred ? '⭐' : '',       // [9] Starred indicator
    metadata.parentName,                // [10] Parent Folder Name
    metadata.fileId,                    // [11] File ID
    metadata.driveLink,                 // [12] Drive Link
    metadata.mimeType,                  // [13] MIME Type
    metadata.fileSizeBytes,             // [14] Size (bytes - for sorting)
  ];
}

/**
 * Parse file array for web interface
 * Converts metadata object to format expected by React frontend
 * Includes both raw and formatted values for flexibility
 *
 * @param {Object} metadata - Parsed metadata from parseFileMetadata()
 * @returns {Object} Object formatted for web client consumption
 *
 * @example
 * const metadata = parseFileMetadata(file, folder);
 * const webData = parseForWeb(metadata);
 * // Returns object with snake_case properties for frontend
 */
function parseForWeb(metadata) {
  return {
    // Using snake_case for data properties (project convention)
    file_id: metadata.fileId,
    file_name: metadata.fileName,
    mime_type: metadata.mimeType,
    file_category: metadata.fileCategory,
    icon: metadata.icon,

    // Size
    file_size_bytes: metadata.fileSizeBytes,
    file_size_formatted: metadata.fileSizeFormatted,

    // Dates (both raw ISO and formatted)
    created_date: metadata.createdDate,
    created_date_formatted: metadata.createdDateFormatted,
    modified_date: metadata.modifiedDate,
    modified_date_formatted: metadata.modifiedDateFormatted,
    last_viewed_date: metadata.lastViewedDate,
    last_viewed_date_formatted: metadata.lastViewedDateFormatted,

    // Owner & Sharing
    owner_names: metadata.ownerNames,
    owner_formatted: metadata.ownerFormatted,
    shared: metadata.shared,
    sharing_status: metadata.sharingStatus,

    // Parent
    parent_name: metadata.parentName,
    parent_id: metadata.parentId,

    // Additional
    starred: metadata.starred,
    description: metadata.description,
    thumbnail_link: metadata.thumbnailLink,
    file_extension: metadata.fileExtension,
    drive_link: metadata.driveLink,
  };
}
