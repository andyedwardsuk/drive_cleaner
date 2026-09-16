/**
 * Drive Cleaner - Shared Drives (Team Drive) Hygiene Manager
 *
 * Manages Google Workspace Shared Drives discovery, hygiene audits,
 * external member exposure risk analysis, and dormant repository detection.
 *
 * @author Andy Edwards
 * @version [2.7.0] - 2026-09-16
 */

var SharedDrivesManager = (function () {

  // ============================================
  // CONSTANTS
  // ============================================

  const DORMANT_THRESHOLD_DAYS = 180;
  const LARGE_FILE_THRESHOLD_BYTES = 50 * 1024 * 1024; // 50MB

  // ============================================
  // PUBLIC API FUNCTIONS
  // ============================================

  /**
   * Retrieves all Shared Drives accessible by the user
   * @returns {Object} { success: boolean, sharedDrives: Array<Object>, isWorkspace: boolean, message?: string }
   */
  function getSharedDrivesList() {
    try {
      let drives = [];
      let isWorkspace = true;

      // 1. Try Drive.Drives.list (Drive API v2 / v3 advanced service)
      try {
        if (typeof Drive !== 'undefined' && Drive.Drives && Drive.Drives.list) {
          const response = Drive.Drives.list({
            maxResults: 100,
            useDomainAdminAccess: false
          });
          const items = response.items || response.drives || [];
          drives = items.map(function (drive) {
            return formatDriveItem_(drive);
          });
        } else if (typeof Drive !== 'undefined' && Drive.Teamdrives && Drive.Teamdrives.list) {
          const response = Drive.Teamdrives.list({
            maxResults: 100,
            useDomainAdminAccess: false
          });
          const items = response.items || [];
          drives = items.map(function (drive) {
            return formatDriveItem_(drive);
          });
        } else {
          isWorkspace = false;
        }
      } catch (driveErr) {
        console.warn('Drive.Drives.list error or not available: ' + driveErr.message);
        isWorkspace = false;
      }

      return {
        success: true,
        sharedDrives: drives,
        isWorkspace: isWorkspace,
        count: drives.length
      };
    } catch (err) {
      console.error('Failed to get Shared Drives list: ' + err.message);
      return {
        success: false,
        sharedDrives: [],
        isWorkspace: false,
        error: err.message
      };
    }
  }

  /**
   * Performs an in-depth hygiene audit on a single Shared Drive
   * @param {string} driveId - The Shared Drive ID
   * @returns {Object} Detailed audit report with hygiene score and risk findings
   */
  function auditSharedDrive(driveId) {
    try {
      if (!driveId) {
        throw new Error('Missing required driveId parameter');
      }

      // Fetch file and folder rows using DriveApiHelpers
      let rows = [];
      try {
        rows = DriveApiHelpers.getFileAndFolderData(driveId, 'drive');
      } catch (scanErr) {
        console.warn('Scan failed via DriveApiHelpers: ' + scanErr.message);
      }

      const now = new Date().getTime();
      let totalBytes = 0;
      let fileCount = 0;
      let folderCount = 0;
      let latestModified = 0;
      let externalExposureFiles = [];
      let staleLargeFiles = [];
      let emptyFolders = [];
      let mimeTypeBreakdown = {};

      rows.forEach(function (row) {
        // [name, id, mimeType, sizeBytes, modifiedDate, createdDate, webViewLink, path, owners, sharingAccess]
        const name = row[0] || 'Untitled';
        const id = row[1];
        const mimeType = row[2] || '';
        const sizeBytes = Number(row[3]) || 0;
        const modifiedDate = row[4] ? new Date(row[4]).getTime() : 0;
        const webViewLink = row[6] || '';
        const path = row[7] || '/';
        const sharingAccess = row[9] || '';

        if (mimeType === 'application/vnd.google-apps.folder') {
          folderCount++;
        } else {
          fileCount++;
          totalBytes += sizeBytes;
          if (modifiedDate > latestModified) {
            latestModified = modifiedDate;
          }

          // Track MIME category
          const cat = categorizeMimeType_(mimeType);
          mimeTypeBreakdown[cat] = (mimeTypeBreakdown[cat] || 0) + sizeBytes;

          // Check External Exposure
          const isPublicOrExternal = sharingAccess && (
            sharingAccess.toLowerCase().indexOf('anyone') !== -1 ||
            sharingAccess.toLowerCase().indexOf('external') !== -1 ||
            sharingAccess.toLowerCase().indexOf('public') !== -1
          );
          if (isPublicOrExternal) {
            externalExposureFiles.push({
              id: id,
              name: name,
              sizeBytes: sizeBytes,
              mimeType: mimeType,
              modifiedDate: row[4],
              path: path,
              webViewLink: webViewLink,
              sharingAccess: sharingAccess,
              reason: 'Public or External Access'
            });
          }

          // Check Large Stale Files
          const ageDays = (now - modifiedDate) / (1000 * 60 * 60 * 24);
          if (sizeBytes >= LARGE_FILE_THRESHOLD_BYTES && ageDays >= DORMANT_THRESHOLD_DAYS) {
            staleLargeFiles.push({
              id: id,
              name: name,
              sizeBytes: sizeBytes,
              mimeType: mimeType,
              modifiedDate: row[4],
              path: path,
              webViewLink: webViewLink,
              ageDays: Math.floor(ageDays),
              reason: 'Large (>50MB) and untouched for ' + Math.floor(ageDays) + ' days'
            });
          }
        }
      });

      // Calculate Dormant Status
      const daysSinceLastActive = latestModified > 0
        ? Math.floor((now - latestModified) / (1000 * 60 * 60 * 24))
        : 999;
      const isDormant = daysSinceLastActive >= DORMANT_THRESHOLD_DAYS;

      // Compute Hygiene Score (100 base)
      let hygieneScore = 100;
      if (isDormant) hygieneScore -= 30;
      if (externalExposureFiles.length > 0) hygieneScore -= Math.min(25, externalExposureFiles.length * 5);
      if (staleLargeFiles.length > 0) hygieneScore -= Math.min(25, staleLargeFiles.length * 4);
      hygieneScore = Math.max(10, Math.min(100, hygieneScore));

      return {
        success: true,
        driveId: driveId,
        hygieneScore: hygieneScore,
        summary: {
          fileCount: fileCount,
          folderCount: folderCount,
          totalBytes: totalBytes,
          daysSinceLastActive: daysSinceLastActive,
          isDormant: isDormant
        },
        riskFlags: {
          externalExposureCount: externalExposureFiles.length,
          staleLargeFileCount: staleLargeFiles.length,
          isDormant: isDormant
        },
        categories: mimeTypeBreakdown,
        externalExposureFiles: externalExposureFiles.slice(0, 50),
        staleLargeFiles: staleLargeFiles.slice(0, 50),
        auditedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('Failed to audit Shared Drive ' + driveId + ': ' + err.message);
      return {
        success: false,
        driveId: driveId,
        error: err.message
      };
    }
  }

  // ============================================
  // PRIVATE HELPER FUNCTIONS
  // ============================================

  function formatDriveItem_(drive) {
    const restrictions = drive.restrictions || {};
    const capabilities = drive.capabilities || {};

    return {
      id: drive.id,
      name: drive.name || drive.title || 'Untitled Shared Drive',
      createdDate: drive.createdDate || drive.createdTime || null,
      hidden: drive.hidden || false,
      restrictions: {
        domainUsersOnly: restrictions.domainUsersOnly !== false,
        adminManagedRestrictions: restrictions.adminManagedRestrictions || false,
        copyRequiresWriterPermission: restrictions.copyRequiresWriterPermission || false
      },
      capabilities: {
        canAddChildren: capabilities.canAddChildren !== false,
        canDeleteDrive: capabilities.canDeleteDrive || false,
        canManageMembers: capabilities.canManageMembers || false,
        canTrashChildren: capabilities.canTrashChildren !== false
      }
    };
  }

  function categorizeMimeType_(mimeType) {
    if (!mimeType) return 'Other';
    if (mimeType.indexOf('google-apps.document') !== -1 || mimeType.indexOf('word') !== -1 || mimeType.indexOf('text') !== -1) return 'Documents';
    if (mimeType.indexOf('google-apps.spreadsheet') !== -1 || mimeType.indexOf('excel') !== -1 || mimeType.indexOf('sheet') !== -1) return 'Spreadsheets';
    if (mimeType.indexOf('google-apps.presentation') !== -1 || mimeType.indexOf('powerpoint') !== -1) return 'Presentations';
    if (mimeType.indexOf('image/') !== -1) return 'Images';
    if (mimeType.indexOf('video/') !== -1) return 'Videos';
    if (mimeType.indexOf('pdf') !== -1) return 'PDFs';
    if (mimeType.indexOf('zip') !== -1 || mimeType.indexOf('tar') !== -1 || mimeType.indexOf('compressed') !== -1) return 'Archives';
    return 'Other';
  }

  // ============================================
  // EXPOSE PUBLIC API
  // ============================================

  return {
    getSharedDrivesList: getSharedDrivesList,
    auditSharedDrive: auditSharedDrive
  };

})();
