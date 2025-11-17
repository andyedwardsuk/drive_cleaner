//########### FORMATTERS UTILITY ###########

/**
 * Utility functions for formatting file metadata
 * Provides consistent formatting for file sizes, dates, and owner information
 *
 * @author Andy Edwards
 * @version 1.0.0
 */

/**
 * Format file size from bytes to human-readable format
 * Handles bytes, KB, MB, GB, TB with 2 decimal places
 *
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB", "256 KB")
 *
 * @example
 * formatFileSize(1536) // Returns "1.50 KB"
 * formatFileSize(1048576) // Returns "1.00 MB"
 * formatFileSize(0) // Returns "0 Bytes"
 */
function formatFileSize(bytes) {
  // Handle null, undefined, or 0
  if (!bytes || bytes === 0) {
    return '0 Bytes';
  }

  // Define size units
  const sizeUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const kiloByte = 1024;

  // Calculate appropriate unit index
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(kiloByte));
  const clampedIndex = Math.min(unitIndex, sizeUnits.length - 1);

  // Calculate size in selected unit
  const sizeInUnit = bytes / Math.pow(kiloByte, clampedIndex);

  // Format with 2 decimal places for KB and above, no decimals for Bytes
  const formattedSize = clampedIndex === 0
    ? sizeInUnit.toString()
    : sizeInUnit.toFixed(2);

  return `${formattedSize} ${sizeUnits[clampedIndex]}`;
}

/**
 * Format ISO date string to UK date format (DD/MM/YYYY HH:MM)
 * Handles null/undefined dates gracefully
 *
 * @param {string} dateString - ISO date string from Drive API
 * @returns {string} Formatted date in UK format or "Never" if null
 *
 * @example
 * formatDate("2024-11-17T14:30:00.000Z") // Returns "17/11/2024 14:30"
 * formatDate(null) // Returns "Never"
 */
function formatDate(dateString) {
  // Handle null, undefined, or empty string
  if (!dateString) {
    return 'Never';
  }

  try {
    // Parse date string
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Extract date components
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Return UK format: DD/MM/YYYY HH:MM
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    Logger.log(`Error formatting date: ${error.message}`);
    return 'Invalid Date';
  }
}

/**
 * Extract file extension from filename
 * Returns lowercase extension without the dot
 *
 * @param {string} filename - Full filename with extension
 * @returns {string} File extension (e.g., "pdf", "docx") or "unknown"
 *
 * @example
 * getFileExtension("document.pdf") // Returns "pdf"
 * getFileExtension("archive.tar.gz") // Returns "gz"
 * getFileExtension("noextension") // Returns "unknown"
 */
function getFileExtension(filename) {
  // Handle null, undefined, or empty string
  if (!filename) {
    return 'unknown';
  }

  // Find last dot in filename
  const lastDotIndex = filename.lastIndexOf('.');

  // No extension found
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return 'unknown';
  }

  // Extract and return extension in lowercase
  const extension = filename.substring(lastDotIndex + 1).toLowerCase();
  return extension;
}

/**
 * Format owner information from Drive API owner object
 * Returns owner name and email in readable format
 *
 * @param {Object} ownerObject - Owner object from Drive API
 * @param {string} ownerObject.displayName - Owner's display name
 * @param {string} ownerObject.emailAddress - Owner's email address
 * @returns {string} Formatted owner info (e.g., "John Smith (john@example.com)")
 *
 * @example
 * formatOwner({ displayName: "John Smith", emailAddress: "john@example.com" })
 * // Returns "John Smith (john@example.com)"
 */
function formatOwner(ownerObject) {
  // Handle null or undefined owner
  if (!ownerObject) {
    return 'Unknown';
  }

  const ownerName = ownerObject.displayName || 'Unknown';
  const ownerEmail = ownerObject.emailAddress || '';

  // Return name only if no email, otherwise name with email in parentheses
  if (!ownerEmail) {
    return ownerName;
  }

  return `${ownerName} (${ownerEmail})`;
}

/**
 * Format sharing status from Drive API permissions
 * Returns human-readable sharing status
 *
 * @param {boolean} shared - Whether file is shared
 * @param {Array} permissions - Permissions array from Drive API (optional)
 * @returns {string} Sharing status (e.g., "Private", "Shared", "Public")
 *
 * @example
 * formatSharingStatus(false) // Returns "Private"
 * formatSharingStatus(true) // Returns "Shared"
 */
function formatSharingStatus(shared, permissions) {
  // Handle not shared
  if (!shared) {
    return 'Private';
  }

  // Check if publicly shared (if permissions array provided)
  if (permissions && Array.isArray(permissions)) {
    const hasPublicPermission = permissions.some(function(perm) {
      return perm.type === 'anyone';
    });

    if (hasPublicPermission) {
      return 'Public';
    }
  }

  // Default to shared
  return 'Shared';
}

/**
 * Get MIME type category for file type filtering
 * Categorises MIME types into broad categories
 *
 * @param {string} mimeType - MIME type from Drive API
 * @returns {string} Category (e.g., "Document", "Image", "Video", "Folder")
 *
 * @example
 * getMimeTypeCategory("application/pdf") // Returns "Document"
 * getMimeTypeCategory("image/jpeg") // Returns "Image"
 * getMimeTypeCategory("application/vnd.google-apps.folder") // Returns "Folder"
 */
function getMimeTypeCategory(mimeType) {
  // Handle null or undefined
  if (!mimeType) {
    return 'Unknown';
  }

  // Google Apps types
  if (mimeType.includes('google-apps')) {
    if (mimeType.includes('folder')) return 'Folder';
    if (mimeType.includes('document')) return 'Document';
    if (mimeType.includes('spreadsheet')) return 'Spreadsheet';
    if (mimeType.includes('presentation')) return 'Presentation';
    if (mimeType.includes('form')) return 'Form';
    if (mimeType.includes('drawing')) return 'Drawing';
    return 'Google Apps';
  }

  // Standard MIME types
  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('video/')) return 'Video';
  if (mimeType.startsWith('audio/')) return 'Audio';
  if (mimeType.startsWith('application/pdf')) return 'Document';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'Document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation';
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return 'Archive';
  if (mimeType.startsWith('text/')) return 'Text';

  return 'Other';
}
