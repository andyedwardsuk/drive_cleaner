/**
 * Drive Cleaner - Cloud Trash Lifecycle & Permanent Purge Governance Manager
 *
 * Provides deep auditing of files sitting in Google Drive Trash consuming storage quota;
 * tracks the 30-day automatic permanent deletion countdown;
 * detects potential accidental deletions;
 * enables 1-click restoration to Drive, selective permanent purge, and guarded total trash emptying.
 *
 * @author Andy Edwards
 * @version [3.1.0] - 2026-09-17
 */

var TrashGovernanceManager = (function () {

  // ============================================
  // CONSTANTS & RETENTION CONFIGURATION
  // ============================================

  const RETENTION_DAYS = 30; // Google's default 30-day auto-purge retention
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  // ============================================
  // HELPERS
  // ============================================

  function formatBytes(bytes) {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function detectCategory(mimeType, title) {
    if (!mimeType) mimeType = '';
    const lowerMime = mimeType.toLowerCase();
    const lowerTitle = (title || '').toLowerCase();

    if (lowerMime.includes('video/') || /\.(mp4|mov|avi|mkv|wmv|flv|webm)$/.test(lowerTitle)) {
      return 'video';
    }
    if (lowerMime.includes('image/') || /\.(jpg|jpeg|png|gif|webp|svg|heic|raw|cr2|nef)$/.test(lowerTitle)) {
      return 'image';
    }
    if (lowerMime.includes('audio/') || /\.(mp3|wav|flac|aac|m4a|ogg)$/.test(lowerTitle)) {
      return 'audio';
    }
    if (lowerMime.includes('spreadsheet') || lowerMime.includes('excel') || /\.(xls|xlsx|csv|tsv)$/.test(lowerTitle)) {
      return 'spreadsheet';
    }
    if (lowerMime.includes('presentation') || lowerMime.includes('powerpoint') || /\.(ppt|pptx|key)$/.test(lowerTitle)) {
      return 'presentation';
    }
    if (lowerMime.includes('document') || lowerMime.includes('word') || lowerMime.includes('pdf') || /\.(doc|docx|pdf|txt|rtf|md)$/.test(lowerTitle)) {
      return 'document';
    }
    if (lowerMime.includes('zip') || lowerMime.includes('compressed') || lowerMime.includes('tar') || /\.(zip|rar|7z|tar|gz|bz2)$/.test(lowerTitle)) {
      return 'archive';
    }
    return 'other';
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Fetches and audits all items currently in Google Drive Trash
   * @returns {Object} Comprehensive trash lifecycle overview
   */
  function getTrashOverview() {
    try {
      let rawItems = [];
      const now = Date.now();

      // 1. Try Google Drive API v2 Advanced Service
      if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.list) {
        let pageToken = null;
        let count = 0;
        const maxFetch = 1500;

        do {
          const payload = {
            q: 'trashed = true',
            maxResults: Math.min(500, maxFetch - count),
            fields: 'items(id, title, mimeType, fileSize, createdDate, modifiedDate, explicitlyTrashedDate, alternateLink, thumbnailLink, iconLink, fileExtension, ownerNames), nextPageToken'
          };
          if (pageToken) payload.pageToken = pageToken;

          const res = Drive.Files.list(payload);
          if (res && res.items && res.items.length > 0) {
            rawItems = rawItems.concat(res.items);
            count += res.items.length;
          }
          pageToken = res.nextPageToken;
        } while (pageToken && count < maxFetch);
      } else {
        // Fallback: DriveApp.getTrashedFiles()
        const trashedIterator = DriveApp.getTrashedFiles();
        let count = 0;
        while (trashedIterator.hasNext() && count < 500) {
          const file = trashedIterator.next();
          rawItems.push({
            id: file.getId(),
            title: file.getName(),
            mimeType: file.getMimeType(),
            fileSize: file.getSize(),
            createdDate: file.getDateCreated().toISOString(),
            modifiedDate: file.getLastUpdated().toISOString(),
            explicitlyTrashedDate: file.getLastUpdated().toISOString(),
            alternateLink: file.getUrl(),
            thumbnailLink: null,
            iconLink: null,
            ownerNames: [file.getOwner() ? file.getOwner().getEmail() : 'Me']
          });
          count++;
        }
      }

      // 2. Audit and classify items
      let totalBytes = 0;
      let criticalCount = 0;    // < 7 days left
      let approachingCount = 0; // 7-14 days left
      let midwayCount = 0;      // 15-21 days left
      let freshCount = 0;       // > 21 days left (recently trashed)

      const categoryCounts = {
        video: 0,
        image: 0,
        audio: 0,
        spreadsheet: 0,
        presentation: 0,
        document: 0,
        archive: 0,
        other: 0
      };

      const categoryBytes = {
        video: 0,
        image: 0,
        audio: 0,
        spreadsheet: 0,
        presentation: 0,
        document: 0,
        archive: 0,
        other: 0
      };

      const analyzedFiles = [];
      let accidentalCandidatesCount = 0;

      for (let i = 0; i < rawItems.length; i++) {
        const item = rawItems[i];
        const bytes = parseInt(item.fileSize || '0', 10) || 0;
        totalBytes += bytes;

        const category = detectCategory(item.mimeType, item.title);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        categoryBytes[category] = (categoryBytes[category] || 0) + bytes;

        // Calculate Days in Trash & Remaining Days until 30d auto-purge
        const trashDateStr = item.explicitlyTrashedDate || item.modifiedDate || item.createdDate;
        const trashTimestamp = trashDateStr ? new Date(trashDateStr).getTime() : now;
        const msInTrash = Math.max(0, now - trashTimestamp);
        const daysInTrash = Math.floor(msInTrash / MS_PER_DAY);
        const daysRemaining = Math.max(0, RETENTION_DAYS - daysInTrash);

        // Classify countdown urgency
        let urgencyTier = 'fresh';
        if (daysRemaining <= 7) {
          urgencyTier = 'critical';
          criticalCount++;
        } else if (daysRemaining <= 14) {
          urgencyTier = 'approaching';
          approachingCount++;
        } else if (daysRemaining <= 21) {
          urgencyTier = 'midway';
          midwayCount++;
        } else {
          urgencyTier = 'fresh';
          freshCount++;
        }

        // Detect Accidental Deletion Candidate
        // e.g. trashed very recently (within 3 days) AND either large (> 50MB) or workspace doc / sheet / archive
        const isRecent = daysInTrash <= 3;
        const isLarge = bytes > (50 * 1024 * 1024);
        const isWorkDoc = category === 'document' || category === 'spreadsheet' || category === 'presentation';
        const isAccidentalCandidate = isRecent && (isLarge || isWorkDoc);

        if (isAccidentalCandidate) {
          accidentalCandidatesCount++;
        }

        analyzedFiles.push({
          id: item.id,
          title: item.title || 'Untitled',
          mimeType: item.mimeType || 'application/octet-stream',
          category: category,
          fileSize: bytes,
          fileSizeFormatted: formatBytes(bytes),
          createdDate: item.createdDate || null,
          modifiedDate: item.modifiedDate || null,
          trashedDate: trashDateStr || null,
          daysInTrash: daysInTrash,
          daysRemaining: daysRemaining,
          urgencyTier: urgencyTier,
          isAccidentalCandidate: isAccidentalCandidate,
          alternateLink: item.alternateLink || null,
          thumbnailLink: item.thumbnailLink || null,
          ownerNames: item.ownerNames || []
        });
      }

      // Sort files: critical expiring first, then largest
      analyzedFiles.sort(function (a, b) {
        if (a.daysRemaining !== b.daysRemaining) {
          return a.daysRemaining - b.daysRemaining;
        }
        return b.fileSize - a.fileSize;
      });

      return {
        success: true,
        summary: {
          totalCount: rawItems.length,
          totalBytes: totalBytes,
          totalBytesFormatted: formatBytes(totalBytes),
          criticalCount: criticalCount,
          approachingCount: approachingCount,
          midwayCount: midwayCount,
          freshCount: freshCount,
          accidentalCandidatesCount: accidentalCandidatesCount,
          retentionPeriodDays: RETENTION_DAYS
        },
        categoryBreakdown: {
          counts: categoryCounts,
          bytes: categoryBytes,
          formattedBytes: Object.keys(categoryBytes).reduce(function (acc, key) {
            acc[key] = formatBytes(categoryBytes[key]);
            return acc;
          }, {})
        },
        files: analyzedFiles
      };
    } catch (err) {
      console.error('Error getting trash overview:', err);
      return {
        success: false,
        error: err.message,
        summary: {
          totalCount: 0,
          totalBytes: 0,
          totalBytesFormatted: '0 B',
          criticalCount: 0,
          approachingCount: 0,
          midwayCount: 0,
          freshCount: 0,
          accidentalCandidatesCount: 0
        },
        categoryBreakdown: { counts: {}, bytes: {}, formattedBytes: {} },
        files: []
      };
    }
  }

  /**
   * Restores a list of files from Google Drive Trash back to Drive
   * @param {Array<string>} fileIds
   * @returns {Object} Operation summary
   */
  function restoreTrashFiles(fileIds) {
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return { success: false, error: 'No file IDs provided for restoration' };
    }

    const restored = [];
    const failed = [];

    for (let i = 0; i < fileIds.length; i++) {
      const id = fileIds[i];
      try {
        if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.untrash) {
          Drive.Files.untrash(id);
        } else {
          DriveApp.getFileById(id).setTrashed(false);
        }
        restored.push(id);
      } catch (err) {
        try {
          DriveApp.getFileById(id).setTrashed(false);
          restored.push(id);
        } catch (fallbackErr) {
          failed.push({ id: id, error: err.message || fallbackErr.message });
        }
      }
    }

    return {
      success: restored.length > 0 || (failed.length === 0 && fileIds.length === 0),
      restoredCount: restored.length,
      failedCount: failed.length,
      restoredIds: restored,
      errors: failed
    };
  }

  /**
   * Permanently and irreversibly purges a specific list of files from Google Drive Trash
   * @param {Array<string>} fileIds
   * @returns {Object} Operation summary
   */
  function purgeTrashFilesPermanently(fileIds) {
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return { success: false, error: 'No file IDs provided for permanent purge' };
    }

    const purged = [];
    const failed = [];

    for (let i = 0; i < fileIds.length; i++) {
      const id = fileIds[i];
      try {
        if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.remove) {
          Drive.Files.remove(id);
          purged.push(id);
        } else {
          failed.push({ id: id, error: 'Permanent removal requires Advanced Drive API v2 service' });
        }
      } catch (err) {
        failed.push({ id: id, error: err.message });
      }
    }

    return {
      success: purged.length > 0 || (failed.length === 0 && fileIds.length === 0),
      purgedCount: purged.length,
      failedCount: failed.length,
      purgedIds: purged,
      errors: failed
    };
  }

  /**
   * Permanently and irreversibly purges all items from Google Drive Trash
   * @returns {Object} Operation summary
   */
  function emptyDriveTrashPermanently() {
    try {
      if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.emptyTrash) {
        Drive.Files.emptyTrash();
        return {
          success: true,
          message: 'Google Drive Trash was completely and permanently emptied'
        };
      } else {
        return {
          success: false,
          error: 'Emptying trash requires Advanced Drive API v2 service'
        };
      }
    } catch (err) {
      console.error('Error emptying trash:', err);
      return {
        success: false,
        error: err.message
      };
    }
  }

  return {
    getTrashOverview: getTrashOverview,
    restoreTrashFiles: restoreTrashFiles,
    purgeTrashFilesPermanently: purgeTrashFilesPermanently,
    emptyDriveTrashPermanently: emptyDriveTrashPermanently
  };

})();
