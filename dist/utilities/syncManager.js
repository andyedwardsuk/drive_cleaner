/**
 * Drive Cleaner - Incremental Sync & Drive Changes API Manager
 *
 * Implements sub-second incremental synchronization using Google Drive API v2 Changes resource.
 * Tracks changes starting from largestChangeId to deliver lightweight deltas
 * (created, modified, deleted) without full drive re-scanning.
 *
 * @author Andy Edwards
 * @version [3.0.0] - 2026-09-17
 */

var SyncManager = (function () {

  // ============================================
  // PUBLIC API FUNCTIONS
  // ============================================

  /**
   * Retrieves the current start change token (largestChangeId) from Google Drive
   * @returns {Object} { success: boolean, changeToken: string, largestChangeId: number }
   */
  function getStartChangeToken() {
    try {
      let largestChangeId = '1';

      if (typeof Drive !== 'undefined') {
        if (Drive.About && Drive.About.get) {
          const about = Drive.About.get({ fields: 'largestChangeId' });
          if (about && about.largestChangeId) {
            largestChangeId = String(about.largestChangeId);
          }
        } else if (Drive.Changes && Drive.Changes.list) {
          const res = Drive.Changes.list({ maxResults: 1 });
          if (res && res.largestChangeId) {
            largestChangeId = String(res.largestChangeId);
          }
        }
      }

      return {
        success: true,
        changeToken: largestChangeId,
        largestChangeId: parseInt(largestChangeId, 10) || 1,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Failed to get start change token: ' + err.message);
      return {
        success: false,
        error: err.message,
        changeToken: '1'
      };
    }
  }

  /**
   * Fetches incremental file changes that occurred since the provided change token
   * @param {string|number} savedChangeId - The largestChangeId from previous sync
   * @param {string} corpora - 'user' or 'drive'
   * @returns {Object} Delta changes package
   */
  function syncIncrementalChanges(savedChangeId, corpora) {
    const startTime = new Date().getTime();
    try {
      if (!savedChangeId) {
        // No prior token provided, return start token
        const tokenRes = getStartChangeToken();
        return {
          success: true,
          isInitialSync: true,
          newChangeId: tokenRes.changeToken,
          createdFiles: [],
          modifiedFiles: [],
          deletedFileIds: [],
          totalChanges: 0,
          syncTimeMs: new Date().getTime() - startTime
        };
      }

      const startChangeIdNum = parseInt(savedChangeId, 10);
      let newChangeId = String(savedChangeId);
      const createdFiles = [];
      const modifiedFiles = [];
      const deletedFileIds = [];

      if (typeof Drive !== 'undefined' && Drive.Changes && Drive.Changes.list) {
        const queryParams = {
          startChangeId: startChangeIdNum + 1,
          maxResults: 1000,
          includeDeleted: true,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        };

        const response = Drive.Changes.list(queryParams);
        const items = response.items || [];
        newChangeId = response.largestChangeId ? String(response.largestChangeId) : newChangeId;

        items.forEach(function (change) {
          const fileId = change.fileId || (change.file && change.file.id);
          if (!fileId) return;

          if (change.deleted || (change.file && change.file.trashed)) {
            deletedFileIds.push(fileId);
          } else if (change.file) {
            const parsedFile = parseChangeFile_(change.file);
            // Distinguish new vs modified using createdDate vs modifiedDate proximity
            const created = new Date(change.file.createdDate || 0).getTime();
            const modified = new Date(change.file.modifiedDate || 0).getTime();
            if (Math.abs(modified - created) < 10000) {
              createdFiles.push(parsedFile);
            } else {
              modifiedFiles.push(parsedFile);
            }
          }
        });
      }

      const syncTimeMs = new Date().getTime() - startTime;

      return {
        success: true,
        isInitialSync: false,
        previousChangeId: String(savedChangeId),
        newChangeId: newChangeId,
        createdFiles: createdFiles,
        modifiedFiles: modifiedFiles,
        deletedFileIds: deletedFileIds,
        totalChanges: createdFiles.length + modifiedFiles.length + deletedFileIds.length,
        syncTimeMs: syncTimeMs,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Incremental sync error: ' + err.message);
      return {
        success: false,
        error: err.message,
        newChangeId: String(savedChangeId || '1'),
        createdFiles: [],
        modifiedFiles: [],
        deletedFileIds: [],
        totalChanges: 0,
        syncTimeMs: new Date().getTime() - startTime
      };
    }
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  /**
   * Formats a raw Drive API file object from Changes API into consistent metadata
   * @param {Object} file
   * @returns {Object}
   * @private
   */
  function parseChangeFile_(file) {
    const parentId = file.parents && file.parents[0] ? file.parents[0].id : 'root';
    return {
      fileId: file.id,
      id: file.id,
      fileName: file.title || 'Untitled',
      title: file.title || 'Untitled',
      mimeType: file.mimeType || '',
      sizeBytes: parseInt(file.fileSize, 10) || 0,
      fileSizeBytes: parseInt(file.fileSize, 10) || 0,
      modifiedDate: file.modifiedDate || null,
      createdDate: file.createdDate || null,
      lastViewedDate: file.lastViewedByMeDate || null,
      ownerNames: file.ownerNames && file.ownerNames[0] ? file.ownerNames[0] : 'You',
      sharingStatus: file.shared ? 'Shared' : 'Private',
      shared: !!file.shared,
      starred: !!(file.labels && file.labels.starred),
      parentId: parentId,
      parentName: 'Drive Folder',
      driveLink: file.alternateLink || ('https://drive.google.com/file/d/' + file.id + '/view'),
      thumbnailLink: file.thumbnailLink || null
    };
  }

  return {
    getStartChangeToken: getStartChangeToken,
    syncIncrementalChanges: syncIncrementalChanges
  };

})();
