/**
 * Drive Cleaner - Google Photos & Media Optimization Manager
 *
 * Analyzes video duration, resolution, and bitrate storage consumption;
 * detects photo bursts and near-duplicate image groups with "Best Shot" recommendations;
 * calculates cloud space compression projections for uncompressed RAW, ProRes, HEIC, and WAV files.
 *
 * @author Andy Edwards
 * @version [2.8.0] - 2026-09-16
 */

var MediaOptimizer = (function () {

  // ============================================
  // CONSTANTS & FORMAT DICTIONARIES
  // ============================================

  const RAW_EXTENSIONS = new Set([
    'cr2', 'cr3', 'nef', 'arw', 'dng', 'rw2', 'orf', 'raf', 'pef', 'srw', 'tiff', 'tif'
  ]);

  const UNCOMPRESSED_AUDIO_EXTENSIONS = new Set([
    'wav', 'aiff', 'aif', 'flac', 'pcm'
  ]);

  const PRORES_VIDEO_EXTENSIONS = new Set([
    'mov', 'mxf', 'avi'
  ]);

  const HIGH_BITRATE_THRESHOLD_BPS = 35 * 1000 * 1000; // 35 Mbps
  const BURST_TIME_WINDOW_MS = 4000; // 4 seconds between shots

  // ============================================
  // PUBLIC API FUNCTIONS
  // ============================================

  /**
   * Scans and analyzes media files in the specified root folder or drive
   * @param {string} rootFolderId - Folder ID or 'root'
   * @param {string} corpora - 'user' or 'drive'
   * @returns {Object} Comprehensive media analysis report
   */
  function analyzeMediaFiles(rootFolderId, corpora) {
    try {
      const folderId = rootFolderId || 'root';
      const targetCorpora = corpora || 'user';

      let items = [];

      // Query Drive API v2 for images, videos, and audio
      try {
        if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.list) {
          const query = [
            'trashed = false',
            '(mimeType contains "image/" or mimeType contains "video/" or mimeType contains "audio/" or fileExtension in ("cr2","nef","arw","dng","wav","flac","mov","raw"))'
          ].join(' and ');

          const requestPayload = {
            q: query,
            fields: 'items(id, title, mimeType, parents(id), fileSize, createdDate, modifiedDate, lastViewedByMeDate, ownerNames, alternateLink, thumbnailLink, fileExtension, videoMediaMetadata(width, height, durationMillis), imageMediaMetadata(width, height, rotation, time, cameraMake, cameraModel, exposureTime, isoSpeed)), nextPageToken',
            maxResults: 1000,
            supportsAllDrives: true,
            supportsTeamDrives: true,
            includeItemsFromAllDrives: true
          };

          if (targetCorpora === 'drive' && folderId !== 'root') {
            requestPayload.corpora = 'drive';
            requestPayload.driveId = folderId;
          }

          let pageToken = null;
          let count = 0;
          do {
            if (pageToken) requestPayload.pageToken = pageToken;
            const res = Drive.Files.list(requestPayload);
            if (res.items && res.items.length > 0) {
              items = items.concat(res.items);
              count += res.items.length;
            }
            pageToken = res.nextPageToken;
          } while (pageToken && count < 2000);
        }
      } catch (driveErr) {
        console.warn('Drive API query in MediaOptimizer encountered an issue: ' + driveErr.message);
      }

      return processMediaItems_(items);
    } catch (err) {
      console.error('Failed to analyze media files: ' + err.message);
      return {
        success: false,
        error: err.message,
        summary: {},
        videos: [],
        photoBursts: [],
        compressionCandidates: [],
        allMedia: []
      };
    }
  }

  // ============================================
  // INTERNAL PROCESSING & CLUSTERING
  // ============================================

  /**
   * Transforms raw Drive items into enriched media models and calculates clusters
   * @param {Array<Object>} rawItems
   * @returns {Object}
   * @private
   */
  function processMediaItems_(rawItems) {
    let totalMediaBytes = 0;
    let totalPotentialSavingsBytes = 0;
    const mediaList = [];
    const videoList = [];
    const imageList = [];
    const audioList = [];
    const compressionCandidates = [];

    rawItems.forEach(function (item) {
      const parsed = enrichMediaItem_(item);
      if (!parsed) return;

      mediaList.push(parsed);
      totalMediaBytes += parsed.sizeBytes;

      if (parsed.mediaType === 'video') {
        videoList.push(parsed);
      } else if (parsed.mediaType === 'image') {
        imageList.push(parsed);
      } else if (parsed.mediaType === 'audio') {
        audioList.push(parsed);
      }

      if (parsed.compression) {
        compressionCandidates.push(parsed);
        totalPotentialSavingsBytes += (parsed.compression.estimatedSavingsBytes || 0);
      }
    });

    // Detect Photo Bursts & Near Duplicates
    const photoBursts = detectPhotoBursts_(imageList);
    photoBursts.forEach(function (group) {
      // Add savings for burst tailings (all photos except best shot)
      const tailingsSavings = group.tailingsCount * (group.avgPhotoSizeBytes || 0);
      totalPotentialSavingsBytes += tailingsSavings;
    });

    // Sort videos by size descending
    videoList.sort(function (a, b) {
      return b.sizeBytes - a.sizeBytes;
    });

    // Sort compression candidates by savings descending
    compressionCandidates.sort(function (a, b) {
      return (b.compression?.estimatedSavingsBytes || 0) - (a.compression?.estimatedSavingsBytes || 0);
    });

    const summary = {
      totalMediaCount: mediaList.length,
      totalMediaBytes: totalMediaBytes,
      totalPotentialSavingsBytes: totalPotentialSavingsBytes,
      potentialSavingsPercent: totalMediaBytes > 0
        ? Math.min(100, Math.round((totalPotentialSavingsBytes / totalMediaBytes) * 100))
        : 0,
      videoCount: videoList.length,
      videoTotalBytes: videoList.reduce(function (acc, v) { return acc + v.sizeBytes; }, 0),
      imageCount: imageList.length,
      imageTotalBytes: imageList.reduce(function (acc, img) { return acc + img.sizeBytes; }, 0),
      burstGroupCount: photoBursts.length,
      burstPhotosCount: photoBursts.reduce(function (acc, b) { return acc + b.items.length; }, 0),
      burstTailingsCount: photoBursts.reduce(function (acc, b) { return acc + b.tailingsCount; }, 0),
      compressionCandidateCount: compressionCandidates.length
    };

    return {
      success: true,
      summary: summary,
      videos: videoList,
      photoBursts: photoBursts,
      compressionCandidates: compressionCandidates,
      allMedia: mediaList
    };
  }

  /**
   * Enriches a raw Drive file with media dimensions, duration, bitrate, and compression recommendations
   * @param {Object} item
   * @returns {Object|null}
   * @private
   */
  function enrichMediaItem_(item) {
    const title = item.title || 'Untitled';
    const mimeType = (item.mimeType || '').toLowerCase();
    const ext = ((item.fileExtension || title.split('.').pop() || '')).toLowerCase();
    const sizeBytes = parseInt(item.fileSize) || 0;

    let mediaType = 'other';
    if (mimeType.startsWith('video/') || PRORES_VIDEO_EXTENSIONS.has(ext)) {
      mediaType = 'video';
    } else if (mimeType.startsWith('image/') || RAW_EXTENSIONS.has(ext)) {
      mediaType = 'image';
    } else if (mimeType.startsWith('audio/') || UNCOMPRESSED_AUDIO_EXTENSIONS.has(ext)) {
      mediaType = 'audio';
    }

    if (mediaType === 'other') return null;

    const vMeta = item.videoMediaMetadata || {};
    const iMeta = item.imageMediaMetadata || {};

    const width = vMeta.width || iMeta.width || 0;
    const height = vMeta.height || iMeta.height || 0;
    const durationMillis = vMeta.durationMillis ? parseInt(vMeta.durationMillis) : 0;
    const durationSeconds = durationMillis > 0 ? durationMillis / 1000 : 0;

    // Bitrate calculation
    let bitrateBps = 0;
    if (mediaType === 'video' && durationSeconds > 0 && sizeBytes > 0) {
      bitrateBps = Math.round((sizeBytes * 8) / durationSeconds);
    }

    // Resolution category
    let resolutionCategory = 'Standard';
    if (width >= 3800 || height >= 2100) {
      resolutionCategory = '4K UHD';
    } else if (width >= 2500 || height >= 1400) {
      resolutionCategory = '1440p QHD';
    } else if (width >= 1900 || height >= 1000) {
      resolutionCategory = '1080p FHD';
    } else if (width >= 1200 || height >= 700) {
      resolutionCategory = '720p HD';
    } else if (width > 0 && height > 0) {
      resolutionCategory = 'SD';
    }

    // Compression recommendation calculation
    const compression = evaluateCompressionRecommendation_(title, ext, mimeType, sizeBytes, width, height, bitrateBps);

    return {
      fileId: item.id,
      id: item.id,
      title: title,
      fileName: title,
      mimeType: item.mimeType,
      extension: ext,
      sizeBytes: sizeBytes,
      mediaType: mediaType,
      width: width,
      height: height,
      dimensions: (width && height) ? (width + ' × ' + height) : null,
      resolutionCategory: resolutionCategory,
      durationMillis: durationMillis,
      durationFormatted: formatDuration_(durationSeconds),
      bitrateBps: bitrateBps,
      bitrateFormatted: bitrateBps > 0 ? (bitrateBps / 1000000).toFixed(1) + ' Mbps' : null,
      isHighBitrate: bitrateBps >= HIGH_BITRATE_THRESHOLD_BPS,
      cameraMake: iMeta.cameraMake || null,
      cameraModel: iMeta.cameraModel || null,
      captureTime: iMeta.time || item.createdDate || null,
      modifiedDate: item.modifiedDate || null,
      createdDate: item.createdDate || null,
      thumbnailLink: item.thumbnailLink || null,
      driveLink: item.alternateLink || ('https://drive.google.com/file/d/' + item.id + '/view'),
      compression: compression
    };
  }

  /**
   * Evaluates if a file is an uncompressed/heavy format and calculates savings
   * @private
   */
  function evaluateCompressionRecommendation_(title, ext, mimeType, sizeBytes, width, height, bitrateBps) {
    if (sizeBytes <= 1024 * 1024) return null; // Ignore files under 1MB

    // 1. RAW Photo Formats
    if (RAW_EXTENSIONS.has(ext)) {
      const estimatedSavingsBytes = Math.round(sizeBytes * 0.82); // 82% savings
      return {
        category: 'RAW Camera Asset',
        targetFormat: 'Modern WebP / AVIF (90% Q)',
        savingsPercent: 82,
        estimatedSavingsBytes: estimatedSavingsBytes,
        projectedSizeBytes: sizeBytes - estimatedSavingsBytes,
        reason: 'Uncompressed RAW camera capture contains non-debayered sensor data. Converting to WebP/AVIF retains high visual fidelity at an ~82% storage reduction.'
      };
    }

    // 2. Heavy HEIC / High-Res Mobile Photo
    if (ext === 'heic' || ext === 'heif') {
      if (sizeBytes > 8 * 1024 * 1024) {
        const estimatedSavingsBytes = Math.round(sizeBytes * 0.55);
        return {
          category: 'Heavy HEIC Capture',
          targetFormat: 'Optimized WebP',
          savingsPercent: 55,
          estimatedSavingsBytes: estimatedSavingsBytes,
          projectedSizeBytes: sizeBytes - estimatedSavingsBytes,
          reason: 'Large high-megabyte HEIC image. Optimization to high-efficiency WebP reclaims up to 55% space.'
        };
      }
    }

    // 3. Uncompressed Audio (WAV, AIFF, FLAC)
    if (UNCOMPRESSED_AUDIO_EXTENSIONS.has(ext) || mimeType.includes('wav') || mimeType.includes('aiff')) {
      const estimatedSavingsBytes = Math.round(sizeBytes * 0.85); // 85% savings
      return {
        category: 'Uncompressed Audio',
        targetFormat: 'AAC (256 kbps) / MP3',
        savingsPercent: 85,
        estimatedSavingsBytes: estimatedSavingsBytes,
        projectedSizeBytes: sizeBytes - estimatedSavingsBytes,
        reason: 'Lossless PCM / uncompressed audio tracks consume massive linear byte rates. Transcoding to 256kbps AAC preserves studio transparency while saving 85% space.'
      };
    }

    // 4. Heavy Video / ProRes / Animation
    if (PRORES_VIDEO_EXTENSIONS.has(ext) || bitrateBps > HIGH_BITRATE_THRESHOLD_BPS || sizeBytes > 500 * 1024 * 1024) {
      if (ext === 'mov' || ext === 'avi' || bitrateBps > HIGH_BITRATE_THRESHOLD_BPS) {
        const estimatedSavingsBytes = Math.round(sizeBytes * 0.70); // 70% savings
        return {
          category: 'High-Bitrate / ProRes Video',
          targetFormat: 'HEVC / H.265 (CRF 20) or AV1 MP4',
          savingsPercent: 70,
          estimatedSavingsBytes: estimatedSavingsBytes,
          projectedSizeBytes: sizeBytes - estimatedSavingsBytes,
          reason: 'Excessive bitrate or intra-frame video codec. Transcoding to modern H.265 / AV1 slashes video storage by ~70% without perceptible artifacting.'
        };
      }
    }

    return null;
  }

  /**
   * Groups images into rapid bursts and near-duplicates
   * @param {Array<Object>} images
   * @returns {Array<Object>} Array of photo burst groups
   * @private
   */
  function detectPhotoBursts_(images) {
    if (!images || images.length < 2) return [];

    // Sort chronologically by captureTime or createdDate
    const sortedImages = [...images].sort(function (a, b) {
      const tA = new Date(a.captureTime || a.createdDate || 0).getTime();
      const tB = new Date(b.captureTime || b.createdDate || 0).getTime();
      return tA - tB;
    });

    const burstGroups = [];
    let currentBurst = [];

    for (let i = 0; i < sortedImages.length; i++) {
      const img = sortedImages[i];
      if (currentBurst.length === 0) {
        currentBurst.push(img);
        continue;
      }

      const prev = currentBurst[currentBurst.length - 1];
      const timePrev = new Date(prev.captureTime || prev.createdDate || 0).getTime();
      const timeCurr = new Date(img.captureTime || img.createdDate || 0).getTime();
      const deltaMs = Math.abs(timeCurr - timePrev);

      // Check if sequential shots: close time window (< 4s) or matching camera model + sequential numbers
      const isTimeBurst = (deltaMs <= BURST_TIME_WINDOW_MS && deltaMs > 0);
      const isCameraMatch = (prev.cameraModel && img.cameraModel && prev.cameraModel === img.cameraModel);
      const isSequentialName = isSequentialFilename_(prev.fileName, img.fileName);

      if ((isTimeBurst && (isCameraMatch || !prev.cameraModel)) || (isSequentialName && deltaMs < 15000)) {
        currentBurst.push(img);
      } else {
        if (currentBurst.length >= 2) {
          burstGroups.push(createBurstGroup_(currentBurst, burstGroups.length + 1));
        }
        currentBurst = [img];
      }
    }

    if (currentBurst.length >= 2) {
      burstGroups.push(createBurstGroup_(currentBurst, burstGroups.length + 1));
    }

    return burstGroups;
  }

  /**
   * Determines whether two filenames are sequential (e.g. IMG_1042 vs IMG_1043)
   * @private
   */
  function isSequentialFilename_(name1, name2) {
    if (!name1 || !name2) return false;
    const num1Match = name1.match(/(\d+)(?:\.[^.]+)?$/);
    const num2Match = name2.match(/(\d+)(?:\.[^.]+)?$/);
    if (!num1Match || !num2Match) return false;

    const n1 = parseInt(num1Match[1], 10);
    const n2 = parseInt(num2Match[1], 10);
    return Math.abs(n2 - n1) === 1;
  }

  /**
   * Formats a group of burst photos and designates the Best Shot
   * @private
   */
  function createBurstGroup_(items, index) {
    // Select best shot based on highest resolution, largest file size (less compressed), or primary index
    let bestShot = items[0];
    items.forEach(function (shot) {
      const shotScore = (shot.width * shot.height) + (shot.sizeBytes / 1000);
      const currentBestScore = (bestShot.width * bestShot.height) + (bestShot.sizeBytes / 1000);
      if (shotScore > currentBestScore) {
        bestShot = shot;
      }
    });

    const totalBytes = items.reduce(function (acc, it) { return acc + it.sizeBytes; }, 0);
    const tailingsCount = items.length - 1;
    const avgSizeBytes = Math.round(totalBytes / items.length);

    // Mark best shot flag on items
    const taggedItems = items.map(function (it) {
      return Object.assign({}, it, {
        isBestShot: it.fileId === bestShot.fileId,
        burstGroupId: 'burst_' + index
      });
    });

    return {
      groupId: 'burst_' + index,
      index: index,
      title: 'Photo Burst #' + index + ' (' + items.length + ' shots)',
      cameraModel: items[0].cameraModel || 'Camera / Mobile',
      captureTime: items[0].captureTime || items[0].createdDate,
      items: taggedItems,
      bestShotId: bestShot.fileId,
      tailingsCount: tailingsCount,
      totalBytes: totalBytes,
      avgPhotoSizeBytes: avgSizeBytes,
      potentialSavingsBytes: tailingsCount * avgSizeBytes
    };
  }

  /**
   * Formats duration in seconds to MM:SS or HH:MM:SS
   * @private
   */
  function formatDuration_(seconds) {
    if (!seconds || seconds <= 0) return '0:00';
    const s = Math.round(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    const pad = function (n) { return n < 10 ? '0' + n : '' + n; };

    if (hrs > 0) {
      return hrs + ':' + pad(mins) + ':' + pad(secs);
    }
    return mins + ':' + pad(secs);
  }

  return {
    analyzeMediaFiles: analyzeMediaFiles
  };

})();
