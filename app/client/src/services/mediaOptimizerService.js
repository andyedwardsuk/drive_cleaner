/**
 * Google Photos & Media Optimizer Service
 *
 * Bridges to Google Apps Script `MediaOptimizer.analyzeMediaFiles` via `google.script.run`,
 * with high-fidelity local development simulation.
 */

const MOCK_MEDIA_ITEMS = [
  // --- High-Bitrate / Heavy Videos ---
  {
    fileId: 'media_vid_01',
    id: 'media_vid_01',
    title: 'Drone_4K_60fps_Coastline_B-Roll.mp4',
    fileName: 'Drone_4K_60fps_Coastline_B-Roll.mp4',
    mimeType: 'video/mp4',
    extension: 'mp4',
    sizeBytes: 2450000000, // ~2.45 GB
    mediaType: 'video',
    width: 3840,
    height: 2160,
    dimensions: '3840 × 2160',
    resolutionCategory: '4K UHD',
    durationMillis: 335000,
    durationFormatted: '5:35',
    bitrateBps: 58500000,
    bitrateFormatted: '58.5 Mbps',
    isHighBitrate: true,
    cameraMake: 'DJI',
    cameraModel: 'Mavic 3 Cine',
    captureTime: '2026-08-12T14:20:00Z',
    createdDate: '2026-08-12T14:20:00Z',
    modifiedDate: '2026-08-12T14:35:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    driveLink: 'https://drive.google.com/file/d/media_vid_01/view',
    compression: {
      category: 'High-Bitrate / 4K Video',
      targetFormat: 'HEVC / H.265 (CRF 20) MP4',
      savingsPercent: 70,
      estimatedSavingsBytes: 1715000000,
      projectedSizeBytes: 735000000,
      reason: 'Ultra-high 58.5 Mbps bitrate. Transcoding to modern H.265 reclaims ~1.7 GB while maintaining 4K clarity.'
    }
  },
  {
    fileId: 'media_vid_02',
    id: 'media_vid_02',
    title: 'Architecture_Design_Sprint_Recording.mov',
    fileName: 'Architecture_Design_Sprint_Recording.mov',
    mimeType: 'video/quicktime',
    extension: 'mov',
    sizeBytes: 3800000000, // ~3.8 GB
    mediaType: 'video',
    width: 1920,
    height: 1080,
    dimensions: '1920 × 1080',
    resolutionCategory: '1080p FHD',
    durationMillis: 4320000,
    durationFormatted: '1:12:00',
    bitrateBps: 7037000,
    bitrateFormatted: '7.0 Mbps',
    isHighBitrate: false,
    cameraMake: 'ScreenCapture',
    cameraModel: 'QuickTime Pro',
    captureTime: '2026-07-04T10:00:00Z',
    createdDate: '2026-07-04T10:00:00Z',
    modifiedDate: '2026-07-04T11:15:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    driveLink: 'https://drive.google.com/file/d/media_vid_02/view',
    compression: {
      category: 'Legacy MOV Screen Recording',
      targetFormat: 'AV1 / WebM (CRF 28)',
      savingsPercent: 75,
      estimatedSavingsBytes: 2850000000,
      projectedSizeBytes: 950000000,
      reason: 'Uncompressed audio and intra-frame MOV track. Compressing to AV1 reclaims 2.85 GB for presentation archives.'
    }
  },
  {
    fileId: 'media_vid_03',
    id: 'media_vid_03',
    title: 'Customer_Case_Study_Interview_Take_3.mov',
    fileName: 'Customer_Case_Study_Interview_Take_3.mov',
    mimeType: 'video/quicktime',
    extension: 'mov',
    sizeBytes: 1950000000, // ~1.95 GB
    mediaType: 'video',
    width: 3840,
    height: 2160,
    dimensions: '3840 × 2160',
    resolutionCategory: '4K UHD',
    durationMillis: 220000,
    durationFormatted: '3:40',
    bitrateBps: 70900000,
    bitrateFormatted: '70.9 Mbps',
    isHighBitrate: true,
    cameraMake: 'Sony',
    cameraModel: 'FX3 Cinema',
    captureTime: '2026-08-20T16:15:00Z',
    createdDate: '2026-08-20T16:15:00Z',
    modifiedDate: '2026-08-20T16:25:00Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
    driveLink: 'https://drive.google.com/file/d/media_vid_03/view',
    compression: {
      category: 'ProRes Intra-Frame Video',
      targetFormat: 'HEVC / H.265 (CRF 18)',
      savingsPercent: 72,
      estimatedSavingsBytes: 1404000000,
      projectedSizeBytes: 546000000,
      reason: 'Raw cinema camera bitrate of 70.9 Mbps. Transcoding to production H.265 reclaims 1.4 GB.'
    }
  },

  // --- Photo Burst Group 1: Sony A7 IV Landscape Burst (5 shots) ---
  {
    fileId: 'media_burst_01_1',
    id: 'media_burst_01_1',
    title: 'DSC04892.ARW',
    fileName: 'DSC04892.ARW',
    mimeType: 'image/x-sony-arw',
    extension: 'arw',
    sizeBytes: 49500000, // ~49.5 MB
    mediaType: 'image',
    width: 7008,
    height: 4672,
    dimensions: '7008 × 4672',
    resolutionCategory: '4K UHD',
    cameraMake: 'Sony',
    cameraModel: 'ILCE-7M4',
    captureTime: '2026-09-02T06:14:10Z',
    createdDate: '2026-09-02T06:14:10Z',
    modifiedDate: '2026-09-02T06:14:10Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    driveLink: 'https://drive.google.com/file/d/media_burst_01_1/view',
    burstGroupId: 'burst_1',
    isBestShot: false,
    compression: {
      category: 'RAW Camera Asset',
      targetFormat: 'Modern WebP (90% Q)',
      savingsPercent: 82,
      estimatedSavingsBytes: 40590000,
      projectedSizeBytes: 8910000,
      reason: 'Uncompressed Sony RAW file.'
    }
  },
  {
    fileId: 'media_burst_01_2',
    id: 'media_burst_01_2',
    title: 'DSC04893.ARW',
    fileName: 'DSC04893.ARW',
    mimeType: 'image/x-sony-arw',
    extension: 'arw',
    sizeBytes: 51200000, // ~51.2 MB (Best Shot)
    mediaType: 'image',
    width: 7008,
    height: 4672,
    dimensions: '7008 × 4672',
    resolutionCategory: '4K UHD',
    cameraMake: 'Sony',
    cameraModel: 'ILCE-7M4',
    captureTime: '2026-09-02T06:14:11Z',
    createdDate: '2026-09-02T06:14:11Z',
    modifiedDate: '2026-09-02T06:14:11Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    driveLink: 'https://drive.google.com/file/d/media_burst_01_2/view',
    burstGroupId: 'burst_1',
    isBestShot: true, // Designated keeper!
    compression: {
      category: 'RAW Camera Asset',
      targetFormat: 'Modern WebP (90% Q)',
      savingsPercent: 82,
      estimatedSavingsBytes: 41984000,
      projectedSizeBytes: 9216000,
      reason: 'Primary keeper shot with optimal sharpness.'
    }
  },
  {
    fileId: 'media_burst_01_3',
    id: 'media_burst_01_3',
    title: 'DSC04894.ARW',
    fileName: 'DSC04894.ARW',
    mimeType: 'image/x-sony-arw',
    extension: 'arw',
    sizeBytes: 48900000,
    mediaType: 'image',
    width: 7008,
    height: 4672,
    dimensions: '7008 × 4672',
    resolutionCategory: '4K UHD',
    cameraMake: 'Sony',
    cameraModel: 'ILCE-7M4',
    captureTime: '2026-09-02T06:14:12Z',
    createdDate: '2026-09-02T06:14:12Z',
    modifiedDate: '2026-09-02T06:14:12Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    driveLink: 'https://drive.google.com/file/d/media_burst_01_3/view',
    burstGroupId: 'burst_1',
    isBestShot: false,
    compression: {
      category: 'RAW Camera Asset',
      targetFormat: 'Modern WebP (90% Q)',
      savingsPercent: 82,
      estimatedSavingsBytes: 40098000,
      projectedSizeBytes: 8802000,
      reason: 'Burst tailing candidate.'
    }
  },
  {
    fileId: 'media_burst_01_4',
    id: 'media_burst_01_4',
    title: 'DSC04895.ARW',
    fileName: 'DSC04895.ARW',
    mimeType: 'image/x-sony-arw',
    extension: 'arw',
    sizeBytes: 49100000,
    mediaType: 'image',
    width: 7008,
    height: 4672,
    dimensions: '7008 × 4672',
    resolutionCategory: '4K UHD',
    cameraMake: 'Sony',
    cameraModel: 'ILCE-7M4',
    captureTime: '2026-09-02T06:14:13Z',
    createdDate: '2026-09-02T06:14:13Z',
    modifiedDate: '2026-09-02T06:14:13Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80',
    driveLink: 'https://drive.google.com/file/d/media_burst_01_4/view',
    burstGroupId: 'burst_1',
    isBestShot: false,
    compression: {
      category: 'RAW Camera Asset',
      targetFormat: 'Modern WebP (90% Q)',
      savingsPercent: 82,
      estimatedSavingsBytes: 40262000,
      projectedSizeBytes: 8838000,
      reason: 'Burst tailing candidate.'
    }
  },

  // --- Photo Burst Group 2: iPhone 15 Pro Action Burst (3 shots) ---
  {
    fileId: 'media_burst_02_1',
    id: 'media_burst_02_1',
    title: 'IMG_9142.HEIC',
    fileName: 'IMG_9142.HEIC',
    mimeType: 'image/heic',
    extension: 'heic',
    sizeBytes: 11400000, // 11.4 MB
    mediaType: 'image',
    width: 4032,
    height: 3024,
    dimensions: '4032 × 3024',
    resolutionCategory: '4K UHD',
    cameraMake: 'Apple',
    cameraModel: 'iPhone 15 Pro',
    captureTime: '2026-08-15T18:30:10Z',
    createdDate: '2026-08-15T18:30:10Z',
    modifiedDate: '2026-08-15T18:30:10Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    driveLink: 'https://drive.google.com/file/d/media_burst_02_1/view',
    burstGroupId: 'burst_2',
    isBestShot: false,
    compression: {
      category: 'Heavy HEIC Capture',
      targetFormat: 'Optimized WebP',
      savingsPercent: 55,
      estimatedSavingsBytes: 6270000,
      projectedSizeBytes: 5130000,
      reason: 'Burst action shot.'
    }
  },
  {
    fileId: 'media_burst_02_2',
    id: 'media_burst_02_2',
    title: 'IMG_9143.HEIC',
    fileName: 'IMG_9143.HEIC',
    mimeType: 'image/heic',
    extension: 'heic',
    sizeBytes: 12200000, // 12.2 MB (Best Shot)
    mediaType: 'image',
    width: 4032,
    height: 3024,
    dimensions: '4032 × 3024',
    resolutionCategory: '4K UHD',
    cameraMake: 'Apple',
    cameraModel: 'iPhone 15 Pro',
    captureTime: '2026-08-15T18:30:11Z',
    createdDate: '2026-08-15T18:30:11Z',
    modifiedDate: '2026-08-15T18:30:11Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    driveLink: 'https://drive.google.com/file/d/media_burst_02_2/view',
    burstGroupId: 'burst_2',
    isBestShot: true, // Best keeper
    compression: {
      category: 'Heavy HEIC Capture',
      targetFormat: 'Optimized WebP',
      savingsPercent: 55,
      estimatedSavingsBytes: 6710000,
      projectedSizeBytes: 5490000,
      reason: 'Clean focused expression portrait.'
    }
  },
  {
    fileId: 'media_burst_02_3',
    id: 'media_burst_02_3',
    title: 'IMG_9144.HEIC',
    fileName: 'IMG_9144.HEIC',
    mimeType: 'image/heic',
    extension: 'heic',
    sizeBytes: 11100000,
    mediaType: 'image',
    width: 4032,
    height: 3024,
    dimensions: '4032 × 3024',
    resolutionCategory: '4K UHD',
    cameraMake: 'Apple',
    cameraModel: 'iPhone 15 Pro',
    captureTime: '2026-08-15T18:30:12Z',
    createdDate: '2026-08-15T18:30:12Z',
    modifiedDate: '2026-08-15T18:30:12Z',
    thumbnailLink: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    driveLink: 'https://drive.google.com/file/d/media_burst_02_3/view',
    burstGroupId: 'burst_2',
    isBestShot: false,
    compression: {
      category: 'Heavy HEIC Capture',
      targetFormat: 'Optimized WebP',
      savingsPercent: 55,
      estimatedSavingsBytes: 6105000,
      projectedSizeBytes: 4995000,
      reason: 'Burst tailing candidate.'
    }
  },

  // --- Uncompressed Audio Files ---
  {
    fileId: 'media_audio_01',
    id: 'media_audio_01',
    title: 'Podcast_Episode_24_Multitrack_Master.wav',
    fileName: 'Podcast_Episode_24_Multitrack_Master.wav',
    mimeType: 'audio/wav',
    extension: 'wav',
    sizeBytes: 940000000, // ~940 MB
    mediaType: 'audio',
    durationMillis: 3600000,
    durationFormatted: '1:00:00',
    bitrateBps: 2088888,
    bitrateFormatted: '2.1 Mbps',
    createdDate: '2026-06-10T11:00:00Z',
    modifiedDate: '2026-06-10T12:00:00Z',
    thumbnailLink: null,
    driveLink: 'https://drive.google.com/file/d/media_audio_01/view',
    compression: {
      category: 'Uncompressed Audio',
      targetFormat: 'AAC (256 kbps) / MP3',
      savingsPercent: 85,
      estimatedSavingsBytes: 799000000,
      projectedSizeBytes: 141000000,
      reason: 'Lossless 24-bit 48kHz WAV audio master. Transcoding to 256kbps AAC saves ~800 MB with imperceptible difference.'
    }
  },
  {
    fileId: 'media_audio_02',
    id: 'media_audio_02',
    title: 'Soundtrack_Original_Score_Orchestral.aiff',
    fileName: 'Soundtrack_Original_Score_Orchestral.aiff',
    mimeType: 'audio/aiff',
    extension: 'aiff',
    sizeBytes: 460000000, // ~460 MB
    mediaType: 'audio',
    durationMillis: 1740000,
    durationFormatted: '29:00',
    bitrateBps: 2114942,
    bitrateFormatted: '2.1 Mbps',
    createdDate: '2026-05-22T09:30:00Z',
    modifiedDate: '2026-05-22T10:15:00Z',
    thumbnailLink: null,
    driveLink: 'https://drive.google.com/file/d/media_audio_02/view',
    compression: {
      category: 'Uncompressed Audio',
      targetFormat: 'AAC (256 kbps) / FLAC',
      savingsPercent: 85,
      estimatedSavingsBytes: 391000000,
      projectedSizeBytes: 69000000,
      reason: 'Heavy linear PCM AIFF file. Transcoding saves 391 MB.'
    }
  }
]

export const mediaOptimizerService = {
  /**
   * Scans and analyzes media files
   * @param {Object} [params] - { rootFolderId, corpora }
   * @returns {Promise<Object>}
   */
  analyzeMediaFiles: (params = {}) => {
    return new Promise((resolve, reject) => {
      const rootFolderId = params.rootFolderId || 'root'
      const corpora = params.corpora || 'user'

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((response) => {
            if (response && response.success !== false) {
              resolve(response)
            } else {
              reject(new Error(response?.error || 'Failed to analyze media files'))
            }
          })
          .withFailureHandler((err) => {
            console.error('GAS analyzeMediaFiles error:', err)
            reject(err)
          })
          .analyzeMediaFiles(JSON.stringify({ rootFolderId, corpora }))
      } else {
        // Local Vite Dev Simulation
        console.log('[Dev Simulation] Analyzing media for:', { rootFolderId, corpora })
        setTimeout(() => {
          const allMedia = [...MOCK_MEDIA_ITEMS]
          const videos = allMedia.filter((m) => m.mediaType === 'video')
          const images = allMedia.filter((m) => m.mediaType === 'image')
          const audio = allMedia.filter((m) => m.mediaType === 'audio')
          const compressionCandidates = allMedia.filter((m) => !!m.compression)

          const photoBursts = [
            {
              groupId: 'burst_1',
              index: 1,
              title: 'Photo Burst #1 (4 shots)',
              cameraModel: 'Sony ILCE-7M4',
              captureTime: '2026-09-02T06:14:10Z',
              bestShotId: 'media_burst_01_2',
              items: allMedia.filter((m) => m.burstGroupId === 'burst_1'),
              tailingsCount: 3,
              totalBytes: 198700000,
              avgPhotoSizeBytes: 49675000,
              potentialSavingsBytes: 147500000
            },
            {
              groupId: 'burst_2',
              index: 2,
              title: 'Photo Burst #2 (3 shots)',
              cameraModel: 'Apple iPhone 15 Pro',
              captureTime: '2026-08-15T18:30:10Z',
              bestShotId: 'media_burst_02_2',
              items: allMedia.filter((m) => m.burstGroupId === 'burst_2'),
              tailingsCount: 2,
              totalBytes: 34700000,
              avgPhotoSizeBytes: 11566666,
              potentialSavingsBytes: 22500000
            }
          ]

          const totalMediaBytes = allMedia.reduce((acc, m) => acc + m.sizeBytes, 0)
          const compressionSavings = compressionCandidates.reduce(
            (acc, m) => acc + (m.compression?.estimatedSavingsBytes || 0),
            0
          )
          const burstSavings = photoBursts.reduce((acc, b) => acc + b.potentialSavingsBytes, 0)
          const totalPotentialSavingsBytes = compressionSavings + burstSavings

          resolve({
            success: true,
            summary: {
              totalMediaCount: allMedia.length,
              totalMediaBytes: totalMediaBytes,
              totalPotentialSavingsBytes: totalPotentialSavingsBytes,
              potentialSavingsPercent: Math.round((totalPotentialSavingsBytes / totalMediaBytes) * 100),
              videoCount: videos.length,
              videoTotalBytes: videos.reduce((acc, v) => acc + v.sizeBytes, 0),
              imageCount: images.length,
              imageTotalBytes: images.reduce((acc, img) => acc + img.sizeBytes, 0),
              burstGroupCount: photoBursts.length,
              burstPhotosCount: photoBursts.reduce((acc, b) => acc + b.items.length, 0),
              burstTailingsCount: photoBursts.reduce((acc, b) => acc + b.tailingsCount, 0),
              compressionCandidateCount: compressionCandidates.length
            },
            videos,
            photoBursts,
            compressionCandidates,
            allMedia
          })
        }, 500)
      }
    })
  }
}
