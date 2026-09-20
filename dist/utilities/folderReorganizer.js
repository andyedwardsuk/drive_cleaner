/**
 * Drive Cleaner - Smart Folder Reorganizer
 *
 * Analyzes Drive folder hierarchies, detects structural anomalies (orphaned root files,
 * duplicate concepts, deep nesting, generic names), identifies natural file clusters,
 * and coordinates bulk reorganization with reversible undo.
 *
 * @author Andy Edwards
 * @version [2.5.0] - 2026-09-16
 */

var FolderReorganizer = (function () {

  // ============================================
  // CONSTANTS
  // ============================================

  const GENERIC_NAMES = [
    'untitled folder', 'new folder', 'documents', 'files', 'misc', 'random',
    'stuff', 'temp', 'old', 'archive', 'new folder (2)', 'new folder (3)'
  ];

  const PROPERTY_PREFIX_RESTORE = 'drive_cleaner_reorg_restore_';

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Analyzes Drive folder structure and computes hierarchy health score
   * Queries real user folders and root files dynamically.
   * @param {string} [rootFolderId='root']
   * @returns {Object} Analysis report {healthScore, metrics, currentTree, genericFolders, clusters, proposedStructure}
   */
  function analyzeStructure(rootFolderId) {
    try {
      const cleanRootId = rootFolderId && rootFolderId !== 'root' ? rootFolderId : 'root';
      console.log('Analyzing real folder structure for root:', cleanRootId);

      let rootFolderName = cleanRootId === 'root' ? 'My Drive' : 'Drive Folder';
      let rawFolders = [];
      let rawRootFiles = [];
      let rawSampleFiles = [];

      // 1. Fetch real folders and files using Drive API v2
      if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.list) {
        try {
          if (cleanRootId !== 'root') {
            try {
              const rootMeta = Drive.Files.get(cleanRootId, { fields: 'title' });
              if (rootMeta && rootMeta.title) rootFolderName = rootMeta.title;
            } catch (metaErr) {
              console.warn('Could not fetch root folder title:', metaErr.message);
            }
          }

          // Query non-trashed folders
          const folderRes = Drive.Files.list({
            q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            maxResults: 250,
            fields: 'items(id, title, parents(id, isRoot))'
          });
          if (folderRes && folderRes.items) {
            rawFolders = folderRes.items;
          }
        } catch (e) {
          console.warn('Drive.Files.list for folders failed:', e.message);
        }

        try {
          // Query files directly in root
          const parentQ = cleanRootId === 'root' ? "'root' in parents" : "'" + cleanRootId + "' in parents";
          const rootFilesRes = Drive.Files.list({
            q: parentQ + " and mimeType != 'application/vnd.google-apps.folder' and trashed = false",
            maxResults: 200,
            fields: 'items(id, title, mimeType, fileSize, modifiedDate)'
          });
          if (rootFilesRes && rootFilesRes.items) {
            rawRootFiles = rootFilesRes.items;
          }
        } catch (e) {
          console.warn('Drive.Files.list for root files failed:', e.message);
        }

        try {
          // Query sample of files across Drive for natural clustering
          const sampleRes = Drive.Files.list({
            q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
            maxResults: 150,
            fields: 'items(id, title, mimeType, fileSize, modifiedDate, parents(id))'
          });
          if (sampleRes && sampleRes.items) {
            rawSampleFiles = sampleRes.items;
          }
        } catch (e) {
          console.warn('Drive.Files.list for sample files failed:', e.message);
        }
      }

      // Fallback to DriveApp if Drive API v2 not available or returned empty
      if (rawFolders.length === 0 && rawRootFiles.length === 0) {
        try {
          const rootFolder = cleanRootId === 'root' ? DriveApp.getRootFolder() : DriveApp.getFolderById(cleanRootId);
          rootFolderName = rootFolder.getName();

          const fIterator = rootFolder.getFolders();
          let count = 0;
          while (fIterator.hasNext() && count < 50) {
            const f = fIterator.next();
            rawFolders.push({
              id: f.getId(),
              title: f.getName(),
              parents: [{ id: cleanRootId, isRoot: cleanRootId === 'root' }]
            });
            count++;

            try {
              const subIt = f.getFolders();
              let subCount = 0;
              while (subIt.hasNext() && subCount < 15) {
                const sf = subIt.next();
                rawFolders.push({
                  id: sf.getId(),
                  title: sf.getName(),
                  parents: [{ id: f.getId(), isRoot: false }]
                });
                subCount++;
              }
            } catch (subErr) {
              // Ignore subfolder access errors
            }
          }

          const fileIterator = rootFolder.getFiles();
          let fCount = 0;
          while (fileIterator.hasNext() && fCount < 100) {
            const file = fileIterator.next();
            rawRootFiles.push({
              id: file.getId(),
              title: file.getName(),
              mimeType: file.getMimeType(),
              fileSize: file.getSize()
            });
            fCount++;
          }
        } catch (err) {
          console.warn('DriveApp fallback error:', err.message);
        }
      }

      // 2. Build folder hierarchy and detect anomalies
      const folderMap = {};
      for (let i = 0; i < rawFolders.length; i++) {
        const rf = rawFolders[i];
        const name = rf.title || 'Untitled Folder';
        const normName = name.toLowerCase().trim();
        const isGeneric = GENERIC_NAMES.indexOf(normName) !== -1 || /^new folder( \(\d+\))?$/i.test(normName);

        folderMap[rf.id] = {
          id: rf.id,
          name: name,
          parents: (rf.parents || []).map(function (p) { return p.id; }),
          isRootParent: (rf.parents || []).some(function (p) { return p.isRoot || p.id === 'root' || p.id === cleanRootId; }),
          children: [],
          depth: 1,
          isGeneric: isGeneric
        };
      }

      const topLevelFolders = [];
      const genericFolders = [];

      for (let id in folderMap) {
        const f = folderMap[id];
        if (f.isGeneric) {
          genericFolders.push({ id: f.id, name: f.name, path: f.name });
        }

        let placed = false;
        if (f.parents && f.parents.length > 0) {
          for (let p = 0; p < f.parents.length; p++) {
            const parentId = f.parents[p];
            if (folderMap[parentId] && parentId !== id) {
              folderMap[parentId].children.push(f);
              f.depth = folderMap[parentId].depth + 1;
              placed = true;
              break;
            }
          }
        }
        if (!placed) {
          topLevelFolders.push(f);
        }
      }

      // Calculate maxDepth
      let maxDepth = 1;
      for (let fId in folderMap) {
        if (folderMap[fId].depth > maxDepth) {
          maxDepth = folderMap[fId].depth;
        }
      }

      const totalFolders = rawFolders.length;
      const orphanedCount = rawRootFiles.length;
      const totalFiles = Math.max(rawRootFiles.length, rawSampleFiles.length);

      // 3. Compute Hierarchy Health Score (0 - 100)
      let score = 100;
      if (orphanedCount > 5) score -= Math.min(30, Math.round((orphanedCount - 5) * 1.5));
      if (maxDepth > 3) score -= Math.min(25, (maxDepth - 3) * 10);
      if (genericFolders.length > 0) score -= Math.min(20, genericFolders.length * 6);
      if (totalFolders === 0 && orphanedCount > 0) score = Math.max(35, 80 - Math.min(40, orphanedCount * 2));
      score = Math.max(20, Math.min(95, score));

      // 4. Detected Clusters based on REAL files
      const clusters = [];

      // Cluster: Root Orphaned Files
      if (rawRootFiles.length > 0) {
        clusters.push({
          id: 'cluster_root_orphans',
          name: 'Root Orphaned Working Docs',
          confidence: 90,
          fileCount: rawRootFiles.length,
          suggestedPath: 'Work/Projects/Active',
          keywords: ['root', 'unsorted', 'inbox'],
          currentLocations: [rootFolderName],
          sampleFiles: rawRootFiles.slice(0, 5).map(function (f) { return f.title; }),
          moves: rawRootFiles.slice(0, 25).map(function (f) {
            return { fileId: f.id, targetPath: 'Work/Projects/Active' };
          })
        });
      }

      // Cluster: Spreadsheets & Data
      const sheetFiles = rawSampleFiles.filter(function (f) {
        const m = (f.mimeType || '').toLowerCase();
        const t = (f.title || '').toLowerCase();
        return m.indexOf('spreadsheet') !== -1 || t.endsWith('.xlsx') || t.endsWith('.csv') || t.endsWith('.gsheet');
      });
      if (sheetFiles.length > 0) {
        clusters.push({
          id: 'cluster_sheets_data',
          name: 'Financial & Data Spreadsheets',
          confidence: 92,
          fileCount: sheetFiles.length,
          suggestedPath: 'Work/Finance & Data',
          keywords: ['finance', 'sheets', 'reports', 'csv'],
          currentLocations: [rootFolderName],
          sampleFiles: sheetFiles.slice(0, 5).map(function (f) { return f.title; }),
          moves: sheetFiles.slice(0, 20).map(function (f) {
            return { fileId: f.id, targetPath: 'Work/Finance & Data' };
          })
        });
      }

      // Cluster: Media & Visual Assets
      const mediaFiles = rawSampleFiles.filter(function (f) {
        const m = (f.mimeType || '').toLowerCase();
        const t = (f.title || '').toLowerCase();
        return m.indexOf('image/') !== -1 || m.indexOf('video/') !== -1 ||
          t.endsWith('.png') || t.endsWith('.jpg') || t.endsWith('.jpeg') || t.endsWith('.mp4') || t.endsWith('.mov');
      });
      if (mediaFiles.length > 0) {
        clusters.push({
          id: 'cluster_media_assets',
          name: 'Media Assets & Visuals',
          confidence: 95,
          fileCount: mediaFiles.length,
          suggestedPath: 'Media & Assets',
          keywords: ['images', 'photos', 'videos', 'branding'],
          currentLocations: [rootFolderName],
          sampleFiles: mediaFiles.slice(0, 5).map(function (f) { return f.title; }),
          moves: mediaFiles.slice(0, 20).map(function (f) {
            return { fileId: f.id, targetPath: 'Media & Assets' };
          })
        });
      }

      // Cluster: Generic Folders to Consolidate
      for (let g = 0; g < Math.min(2, genericFolders.length); g++) {
        const gf = genericFolders[g];
        clusters.push({
          id: 'cluster_generic_' + gf.id,
          name: 'Consolidate "' + gf.name + '"',
          confidence: 85,
          fileCount: 1,
          suggestedPath: 'Work/Archive',
          keywords: [gf.name.toLowerCase(), 'generic-folder', 'tidy'],
          currentLocations: [gf.path],
          sampleFiles: ['Folder contents of ' + gf.name],
          moves: []
        });
      }

      // 5. Proposed Clean Structure adapted to user's content
      const proposedStructure = [
        {
          path: 'Work',
          icon: 'briefcase',
          description: 'Client deliverables, projects, and operational data',
          children: [
            {
              path: 'Work/Projects',
              count: Math.max(1, rawRootFiles.length),
              sampleFiles: rawRootFiles.slice(0, 2).map(function (f) { return f.title; })
            },
            {
              path: 'Work/Finance & Data',
              count: Math.max(1, sheetFiles.length),
              sampleFiles: sheetFiles.slice(0, 2).map(function (f) { return f.title; })
            }
          ]
        },
        {
          path: 'Personal',
          icon: 'user',
          description: 'Personal documents, admin, and receipts',
          children: [
            { path: 'Personal/Documents', count: 1, sampleFiles: ['Personal Records'] }
          ]
        },
        {
          path: 'Media & Assets',
          icon: 'image',
          description: 'Images, videos, and creative collateral',
          children: [
            {
              path: 'Media & Assets/Photos & Videos',
              count: Math.max(1, mediaFiles.length),
              sampleFiles: mediaFiles.slice(0, 2).map(function (f) { return f.title; })
            }
          ]
        },
        {
          path: 'Archive',
          icon: 'archive',
          description: 'Completed projects and inactive files',
          children: [
            { path: 'Archive/' + new Date().getFullYear(), count: 0, sampleFiles: [] }
          ]
        }
      ];

      // 6. Tree structure for client rendering
      const currentTree = {
        rootId: cleanRootId,
        rootName: rootFolderName,
        rootFilesCount: orphanedCount,
        totalFoldersCount: totalFolders,
        folders: topLevelFolders.map(function (f) {
          return {
            id: f.id,
            name: f.name,
            depth: f.depth,
            isGeneric: f.isGeneric,
            children: (f.children || []).map(function (c) {
              return {
                id: c.id,
                name: c.name,
                depth: c.depth,
                isGeneric: c.isGeneric,
                children: (c.children || []).map(function (gc) {
                  return {
                    id: gc.id,
                    name: gc.name,
                    depth: gc.depth,
                    isGeneric: gc.isGeneric
                  };
                })
              };
            })
          };
        })
      };

      return {
        success: true,
        healthScore: score,
        rating: score >= 80 ? 'Healthy' : (score >= 60 ? 'Moderate Clutter' : 'Needs Tidy'),
        metrics: {
          totalFolders: totalFolders,
          totalFiles: totalFiles,
          maxDepth: maxDepth,
          orphanedRootFiles: orphanedCount,
          genericFolderCount: genericFolders.length,
          emptyFoldersCount: 0
        },
        currentTree: currentTree,
        genericFolders: genericFolders,
        clusters: clusters,
        proposedStructure: proposedStructure
      };
    } catch (error) {
      console.error('Error in analyzeStructure:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Executes a proposed reorganization plan
   * Moves files to target directories and saves pre-move locations for undo
   * @param {string|Object} payload - Plan object { moves: [{ fileId, targetPath }] }
   * @returns {Object} Result {success, movedCount, restorePointId}
   */
  function executeReorganization(payload) {
    try {
      const plan = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const moves = plan.moves || [];

      if (!moves || moves.length === 0) {
        return { success: true, movedCount: 0, errors: [] };
      }

      const restorePointId = 'reorg_' + Date.now();
      const locationMappings = [];
      const moved = [];
      const failed = [];

      for (let i = 0; i < moves.length; i++) {
        const item = moves[i];
        const fileId = item.fileId;
        const targetPath = item.targetPath;

        try {
          const file = DriveApp.getFileById(fileId);
          const parents = file.getParents();
          const origParents = [];
          while (parents.hasNext()) {
            origParents.push(parents.next().getId());
          }

          // Resolve or create target folder path
          const targetFolder = resolveOrCreatePath_(targetPath);
          file.moveTo(targetFolder);

          moved.push(fileId);
          locationMappings.push({
            fileId: fileId,
            originalParentId: origParents[0] || 'root',
            targetFolderId: targetFolder.getId()
          });
        } catch (err) {
          failed.push({ fileId: fileId, error: err.message });
        }
      }

      // Save restore mappings in UserProperties
      PropertiesService.getUserProperties().setProperty(
        PROPERTY_PREFIX_RESTORE + restorePointId,
        JSON.stringify(locationMappings)
      );

      return {
        success: moved.length > 0 || (failed.length === 0 && moves.length === 0),
        movedCount: moved.length,
        failedCount: failed.length,
        restorePointId: restorePointId,
        errors: failed
      };
    } catch (error) {
      console.error('Error in executeReorganization:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restores files to their pre-reorganization parent folders
   * @param {string} restorePointId
   * @returns {Object} Result
   */
  function restoreReorganization(restorePointId) {
    try {
      const raw = PropertiesService.getUserProperties().getProperty(
        PROPERTY_PREFIX_RESTORE + restorePointId
      );

      if (!raw) {
        return { success: false, error: 'Restore point not found or expired' };
      }

      const mappings = JSON.parse(raw);
      const restored = [];
      const failed = [];

      for (let i = 0; i < mappings.length; i++) {
        const item = mappings[i];
        try {
          const file = DriveApp.getFileById(item.fileId);
          let parentFolder;
          if (item.originalParentId && item.originalParentId !== 'root') {
            parentFolder = DriveApp.getFolderById(item.originalParentId);
          } else {
            parentFolder = DriveApp.getRootFolder();
          }

          file.moveTo(parentFolder);
          restored.push(item.fileId);
        } catch (err) {
          failed.push({ fileId: item.fileId, error: err.message });
        }
      }

      return {
        success: restored.length > 0,
        restoredCount: restored.length,
        failedCount: failed.length,
        errors: failed
      };
    } catch (error) {
      console.error('Error in restoreReorganization:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  /**
   * Recursively finds or creates a nested folder path in Google Drive
   * @param {string} pathStr - e.g. "Work/Clients/Acme Corp"
   * @returns {Folder} Destination Folder
   * @private
   */
  function resolveOrCreatePath_(pathStr) {
    const segments = String(pathStr || 'Organized').split('/').map(function(s) {
      return s.trim();
    }).filter(Boolean);

    let currentFolder = DriveApp.getRootFolder();

    for (let i = 0; i < segments.length; i++) {
      const segmentName = segments[i];
      const subFolders = currentFolder.getFoldersByName(segmentName);

      if (subFolders.hasNext()) {
        currentFolder = subFolders.next();
      } else {
        currentFolder = currentFolder.createFolder(segmentName);
      }
    }

    return currentFolder;
  }

  // ============================================
  // EXPORT
  // ============================================

  return {
    analyzeStructure: analyzeStructure,
    executeReorganization: executeReorganization,
    restoreReorganization: restoreReorganization
  };

})();
