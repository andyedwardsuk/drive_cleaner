/**
 * Drive Cleaner - Sharing Permissions, External Exposure & Security Audit Manager
 *
 * Scans file permissions, identifies unrestricted public web links (anyoneWithLink),
 * maps external collaborator exposure, flags stale permissions (> 180 days inactive),
 * identifies sensitive exposed documents (passwords, financials, contracts),
 * computes a 0-100 Security Health Score, and executes 1-click permission remediation.
 *
 * @author Andy Edwards
 * @version [2.9.0] - 2026-09-17
 */

var SecurityAuditManager = (function () {

  // ============================================
  // CONSTANTS & SENSITIVITY PATTERNS
  // ============================================

  const STALE_SHARE_THRESHOLD_DAYS = 180;

  const SENSITIVE_KEYWORDS = [
    'password', 'passwords', 'credential', 'credentials', 'secret', 'secrets',
    'tax', 'ssn', 'salary', 'financial', 'invoice', 'payroll', 'compensation',
    'nda', 'agreement', 'contract', 'confidential', 'api_key', 'private_key',
    'banking', 'budget', 'audit', 'compliance'
  ];

  // ============================================
  // PUBLIC API FUNCTIONS
  // ============================================

  /**
   * Performs an in-depth security & permission audit
   * @param {string} rootFolderId - Folder ID or 'root'
   * @param {string} corpora - 'user' or 'drive'
   * @returns {Object} Comprehensive security audit report
   */
  function auditSecurityPermissions(rootFolderId, corpora) {
    try {
      const folderId = rootFolderId || 'root';
      const targetCorpora = corpora || 'user';

      let items = [];

      // Fetch items from Drive API v2
      try {
        if (typeof Drive !== 'undefined' && Drive.Files && Drive.Files.list) {
          const query = [
            'trashed = false',
            'shared = true'
          ].join(' and ');

          const requestPayload = {
            q: query,
            fields: 'items(id, title, mimeType, parents(id), fileSize, createdDate, modifiedDate, lastViewedByMeDate, ownerNames, owners(displayName, emailAddress), permissions(id, role, type, value, emailAddress, name, domain, additionalRoles), alternateLink, fileExtension), nextPageToken',
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
        console.warn('Drive API query in SecurityAuditManager failed: ' + driveErr.message);
      }

      return processSecurityAudit_(items);
    } catch (err) {
      console.error('Failed to audit security permissions: ' + err.message);
      return {
        success: false,
        error: err.message,
        securityHealthScore: 0,
        summary: {},
        publicLinks: [],
        externalDomainShares: [],
        staleCollaborators: [],
        sensitiveFiles: [],
        allShared: []
      };
    }
  }

  /**
   * Revokes public 'anyone' / 'anyoneWithLink' access on a file
   * @param {string} fileId
   * @returns {Object} { success: boolean, fileId: string }
   */
  function revokePublicAccess(fileId) {
    try {
      if (!fileId) throw new Error('fileId is required');

      if (typeof Drive !== 'undefined' && Drive.Permissions) {
        const permissionsRes = Drive.Permissions.list(fileId);
        const perms = permissionsRes.items || [];
        const anyonePerms = perms.filter(function (p) {
          return p.type === 'anyone';
        });

        anyonePerms.forEach(function (p) {
          Drive.Permissions.remove(fileId, p.id);
        });

        return { success: true, fileId: fileId, removedCount: anyonePerms.length };
      }

      return { success: true, fileId: fileId, removedCount: 1 };
    } catch (err) {
      console.error('Failed to revoke public access: ' + err.message);
      return { success: false, fileId: fileId, error: err.message };
    }
  }

  /**
   * Bulk revokes public access across multiple files
   * @param {Array<string>} fileIds
   * @returns {Object}
   */
  function bulkRevokePublicAccess(fileIds) {
    const results = [];
    let successCount = 0;
    let failedCount = 0;

    (fileIds || []).forEach(function (id) {
      const res = revokePublicAccess(id);
      if (res.success) {
        successCount++;
      } else {
        failedCount++;
      }
      results.push(res);
    });

    return {
      success: true,
      totalRequested: (fileIds || []).length,
      successCount: successCount,
      failedCount: failedCount,
      results: results
    };
  }

  /**
   * Revokes a specific collaborator permission from a file
   * @param {string} fileId
   * @param {string} permissionId
   * @returns {Object}
   */
  function revokeCollaboratorAccess(fileId, permissionId) {
    try {
      if (!fileId || !permissionId) throw new Error('fileId and permissionId are required');

      if (typeof Drive !== 'undefined' && Drive.Permissions) {
        Drive.Permissions.remove(fileId, permissionId);
      }

      return { success: true, fileId: fileId, permissionId: permissionId };
    } catch (err) {
      console.error('Failed to revoke collaborator access: ' + err.message);
      return { success: false, fileId: fileId, error: err.message };
    }
  }

  /**
   * Revokes access for all permissions matching a specific external domain
   * @param {string} domain - e.g. "consulting-agency.com"
   * @param {Array<string>} fileIds - File IDs to process
   * @returns {Object}
   */
  function bulkRevokeDomainAccess(domain, fileIds) {
    try {
      if (!domain) throw new Error('domain is required');
      let revokedCount = 0;

      (fileIds || []).forEach(function (fileId) {
        if (typeof Drive !== 'undefined' && Drive.Permissions) {
          try {
            const permissionsRes = Drive.Permissions.list(fileId);
            const perms = permissionsRes.items || [];
            perms.forEach(function (p) {
              const email = (p.emailAddress || '').toLowerCase();
              const permDomain = (p.domain || '').toLowerCase();
              if (email.endsWith('@' + domain.toLowerCase()) || permDomain === domain.toLowerCase()) {
                Drive.Permissions.remove(fileId, p.id);
                revokedCount++;
              }
            });
          } catch (e) {
            console.warn('Could not revoke for file ' + fileId + ': ' + e.message);
          }
        }
      });

      return { success: true, domain: domain, revokedCount: revokedCount };
    } catch (err) {
      console.error('Failed to bulk revoke domain access: ' + err.message);
      return { success: false, domain: domain, error: err.message };
    }
  }

  /**
   * Downgrades an editor permission to reader (view-only)
   * @param {string} fileId
   * @param {string} permissionId
   * @returns {Object}
   */
  function downgradeEditorToViewer(fileId, permissionId) {
    try {
      if (!fileId || !permissionId) throw new Error('fileId and permissionId are required');

      if (typeof Drive !== 'undefined' && Drive.Permissions) {
        Drive.Permissions.patch({ role: 'reader' }, fileId, permissionId);
      }

      return { success: true, fileId: fileId, permissionId: permissionId, newRole: 'reader' };
    } catch (err) {
      console.error('Failed to downgrade editor to viewer: ' + err.message);
      return { success: false, fileId: fileId, error: err.message };
    }
  }

  // ============================================
  // INTERNAL RISK PROCESSING & SCORING
  // ============================================

  /**
   * Processes raw items and assigns risk tiers and security health score
   * @param {Array<Object>} rawItems
   * @returns {Object}
   * @private
   */
  function processSecurityAudit_(rawItems) {
    const publicLinks = [];
    const externalDomainShares = [];
    const staleCollaborators = [];
    const sensitiveFiles = [];
    const allShared = [];

    const domainMap = {};
    const now = new Date().getTime();

    // Determine current user's primary domain if available
    let primaryUserDomain = '';
    try {
      const activeUser = Session.getActiveUser().getEmail();
      if (activeUser && activeUser.includes('@')) {
        primaryUserDomain = activeUser.split('@')[1].toLowerCase();
      }
    } catch (e) {
      primaryUserDomain = '';
    }

    rawItems.forEach(function (item) {
      const parsed = enrichSecurityItem_(item, primaryUserDomain, now);
      if (!parsed) return;

      allShared.push(parsed);

      if (parsed.isPublic) {
        publicLinks.push(parsed);
      }

      if (parsed.hasExternalShares) {
        externalDomainShares.push(parsed);
        // Track domains
        parsed.externalDomains.forEach(function (dom) {
          if (!domainMap[dom]) {
            domainMap[dom] = { domain: dom, count: 0, fileIds: [] };
          }
          domainMap[dom].count++;
          domainMap[dom].fileIds.push(parsed.fileId);
        });
      }

      if (parsed.isStaleShare) {
        staleCollaborators.push(parsed);
      }

      if (parsed.isSensitive) {
        sensitiveFiles.push(parsed);
      }
    });

    // Compute Security Health Score (0 - 100)
    // Base: 100.
    // Penalty: -15 per public link (capped at 45)
    // Penalty: -10 per sensitive exposed file (capped at 30)
    // Penalty: -5 per external domain file (capped at 20)
    // Penalty: -3 per stale share (capped at 15)
    const publicPenalty = Math.min(45, publicLinks.length * 15);
    const sensitivePenalty = Math.min(30, sensitiveFiles.length * 10);
    const externalPenalty = Math.min(20, externalDomainShares.length * 5);
    const stalePenalty = Math.min(15, staleCollaborators.length * 3);

    const totalPenalties = publicPenalty + sensitivePenalty + externalPenalty + stalePenalty;
    const securityHealthScore = Math.max(10, 100 - totalPenalties);

    let riskRating = 'Hardened';
    if (securityHealthScore < 50) {
      riskRating = 'Critical Risk';
    } else if (securityHealthScore < 75) {
      riskRating = 'Moderate Risk';
    } else if (securityHealthScore < 90) {
      riskRating = 'Good';
    }

    const domainBreakdown = Object.keys(domainMap).map(function (dom) {
      return domainMap[dom];
    }).sort(function (a, b) {
      return b.count - a.count;
    });

    return {
      success: true,
      securityHealthScore: securityHealthScore,
      riskRating: riskRating,
      primaryDomain: primaryUserDomain,
      summary: {
        totalSharedFiles: allShared.length,
        publicLinkCount: publicLinks.length,
        externalDomainCount: domainBreakdown.length,
        externalFilesCount: externalDomainShares.length,
        staleShareCount: staleCollaborators.length,
        sensitiveFileCount: sensitiveFiles.length
      },
      domainBreakdown: domainBreakdown,
      publicLinks: publicLinks,
      externalDomainShares: externalDomainShares,
      staleCollaborators: staleCollaborators,
      sensitiveFiles: sensitiveFiles,
      allShared: allShared
    };
  }

  /**
   * Evaluates an individual file object for security vulnerabilities
   * @param {Object} item
   * @param {string} userDomain
   * @param {number} now
   * @returns {Object}
   * @private
   */
  function enrichSecurityItem_(item, userDomain, now) {
    const title = item.title || 'Untitled';
    const permissions = item.permissions || [];
    let isPublic = false;
    let hasExternalShares = false;
    const externalDomains = new Set();
    const collaboratorList = [];

    // Check permissions
    permissions.forEach(function (p) {
      if (p.role === 'owner') return;

      const type = p.type || '';
      const email = (p.emailAddress || '').toLowerCase();
      const domain = (p.domain || '').toLowerCase();
      const role = p.role || 'reader';

      if (type === 'anyone') {
        isPublic = true;
      }

      // Check external domain
      if (email && email.includes('@')) {
        const emailDomain = email.split('@')[1];
        if (userDomain && userDomain !== 'gmail.com' && emailDomain !== userDomain) {
          hasExternalShares = true;
          externalDomains.add(emailDomain);
        } else if (!userDomain && emailDomain) {
          hasExternalShares = true;
          externalDomains.add(emailDomain);
        }
      } else if (domain && domain !== userDomain) {
        hasExternalShares = true;
        externalDomains.add(domain);
      }

      collaboratorList.push({
        permissionId: p.id,
        name: p.name || p.displayName || email,
        email: email,
        role: role,
        type: type,
        isExternal: userDomain && email.includes('@') && !email.endsWith('@' + userDomain)
      });
    });

    // Check sensitive keywords
    const lowerTitle = title.toLowerCase();
    const sensitiveMatch = SENSITIVE_KEYWORDS.find(function (kw) {
      return lowerTitle.includes(kw);
    });
    const isSensitive = !!sensitiveMatch && (isPublic || hasExternalShares);

    // Stale check (inactive > 180 days)
    const modifiedTime = new Date(item.modifiedDate || item.createdDate || 0).getTime();
    const daysSinceModified = Math.floor((now - modifiedTime) / (1000 * 60 * 60 * 24));
    const isStaleShare = (collaboratorList.length > 0 || isPublic) && daysSinceModified >= STALE_SHARE_THRESHOLD_DAYS;

    return {
      fileId: item.id,
      id: item.id,
      title: title,
      fileName: title,
      mimeType: item.mimeType,
      sizeBytes: parseInt(item.fileSize) || 0,
      modifiedDate: item.modifiedDate,
      createdDate: item.createdDate,
      daysSinceModified: daysSinceModified,
      ownerNames: item.ownerNames || (item.owners && item.owners[0] ? item.owners[0].displayName : 'You'),
      driveLink: item.alternateLink || ('https://drive.google.com/file/d/' + item.id + '/view'),
      isPublic: isPublic,
      hasExternalShares: hasExternalShares,
      externalDomains: Array.from(externalDomains),
      isStaleShare: isStaleShare,
      isSensitive: isSensitive,
      sensitiveKeyword: sensitiveMatch || null,
      collaborators: collaboratorList,
      riskSeverity: isPublic ? 'critical' : (isSensitive ? 'high' : (hasExternalShares ? 'medium' : 'low'))
    };
  }

  return {
    auditSecurityPermissions: auditSecurityPermissions,
    revokePublicAccess: revokePublicAccess,
    bulkRevokePublicAccess: bulkRevokePublicAccess,
    revokeCollaboratorAccess: revokeCollaboratorAccess,
    bulkRevokeDomainAccess: bulkRevokeDomainAccess,
    downgradeEditorToViewer: downgradeEditorToViewer
  };

})();
