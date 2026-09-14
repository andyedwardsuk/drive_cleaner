//########### DATA ROT & DIGITAL HOARDING ANALYZER ###########

/**
 * @fileoverview Data ROT (Redundant, Obsolete, Trivial) analysis and Digital
 * Hoarding assessment engine for Google Drive Smart Scan.
 *
 * Implements enterprise Information Governance ROT methodology combined with
 * academic Digital Hoarding Questionnaire (DHQ) scoring and file freshness
 * decay modeling.
 *
 * @author Drive Cleaner Dev Team
 * @version 1.0.0
 */

/**
 * ROT Analysis Result Structure
 * @typedef {Object} ROTAnalysisResultProps
 * @property {number} count - Total unique ROT items
 * @property {number} total_size_bytes - Total size of ROT items in bytes
 * @property {string} category_name - Human-readable category name
 * @property {string} category_type - Technical category identifier
 * @property {Object} breakdown - Summary counts & sizes by R, O, T
 * @property {Object} clutter_index - Clutter index score and breakdown
 * @property {Object} hoarding_score - DHQ hoarding score, rating and subscales
 * @property {Object} freshness_distribution - Distribution across freshness stages
 * @property {Array<Object>} items - All flagged ROT items with classification
 */

/**
 * Version naming regexes to identify near-duplicates and multiple draft/final versions
 */
const VERSION_PATTERNS = [
  /\s*[\(\[]?(?:v(?:er(?:sion)?)?\.?\s*\d+(?:\.\d+)*|copy(?:\s+of)?|final(?:\s*final)*|draft|rev(?:ision)?\s*\d+|_\d{1,3})[\)\]]?$/i,
  /^(?:copy\s+of\s+|draft\s*[-_:]\s*)/i,
  /\s*\(\d+\)$/
];

/**
 * Screenshot filename patterns
 */
const SCREENSHOT_PATTERNS = [
  /^Screenshot \d{4}-\d{2}-\d{2}/i,
  /^Screen Shot \d{4}-\d{2}-\d{2}/i,
  /^Screenshot_\d{8}[-_]\d{6}/i,
  /^Captura de pantalla/i,
  /^Schermopname/i
];

/**
 * Temp and cache file patterns
 */
const TEMP_SYSTEM_NAMES = [
  'desktop.ini',
  'thumbs.db',
  '.ds_store',
  '.localized',
  'icon\r'
];

/**
 * Strip version / copy qualifiers from a filename to find base canonical name
 * @param {string} fileName - File name to normalize
 * @returns {string} Normalized base name
 */
function getCanonicalBaseName_(fileName) {
  if (!fileName || typeof fileName !== 'string') return '';

  const extIndex = fileName.lastIndexOf('.');
  const baseName = extIndex > 0 ? fileName.substring(0, extIndex) : fileName;
  const ext = extIndex > 0 ? fileName.substring(extIndex).toLowerCase() : '';

  let normalized = baseName.trim();
  for (const pattern of VERSION_PATTERNS) {
    normalized = normalized.replace(pattern, '').trim();
  }

  return `${normalized.toLowerCase()}${ext}`;
}

/**
 * Calculate days between a date string and now
 * @param {string|null} dateString - ISO date string
 * @param {Date} now - Current date
 * @returns {number|null} Days elapsed or null
 */
function getDaysElapsed_(dateString, now) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  const diffTime = Math.max(0, now.getTime() - date.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine freshness stage of a file
 * @param {number|null} daysElapsed - Days since last activity
 * @returns {string} 'fresh' | 'aging' | 'stale' | 'rotting' | 'decayed'
 */
function getFreshnessLevel_(daysElapsed) {
  if (daysElapsed === null || daysElapsed === undefined) return 'stale';
  if (daysElapsed <= 90) return 'fresh'; // 0-3 months
  if (daysElapsed <= 180) return 'aging'; // 3-6 months
  if (daysElapsed <= 365) return 'stale'; // 6-12 months
  if (daysElapsed <= 730) return 'rotting'; // 12-24 months
  return 'decayed'; // 24+ months
}

/**
 * Find redundant files (duplicates and multiple version iterations)
 * @param {Array<Object>} files - Structured file list
 * @returns {Object} { items: Array<Object>, count: number, total_size_bytes: number }
 */
function findRedundantFiles_(files) {
  const nameSizeMap = new Map();
  const canonicalMap = new Map();
  const redundantFileIds = new Set();
  const redundantItems = [];

  // Group by name + size (exact duplicates)
  for (const file of files) {
    if (file.mime_type === 'application/vnd.google-apps.folder') continue;

    const exactKey = `${file.file_name.toLowerCase()}:::${file.size_bytes || 0}`;
    if (!nameSizeMap.has(exactKey)) {
      nameSizeMap.set(exactKey, []);
    }
    nameSizeMap.get(exactKey).push(file);

    // Group by canonical base name for version chains
    const canonicalKey = getCanonicalBaseName_(file.file_name);
    if (canonicalKey.length > 3) {
      if (!canonicalMap.has(canonicalKey)) {
        canonicalMap.set(canonicalKey, []);
      }
      canonicalMap.get(canonicalKey).push(file);
    }
  }

  // Exact duplicates: mark subsequent items as redundant
  for (const [_key, group] of nameSizeMap.entries()) {
    if (group.length > 1) {
      // Sort oldest to newest, keep first (original)
      group.sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0));
      for (let i = 1; i < group.length; i++) {
        const file = group[i];
        redundantFileIds.add(file.file_id);
        redundantItems.push({
          ...file,
          rot_type: 'redundant',
          rot_reason: 'exact_duplicate',
          redundancy_detail: `Exact duplicate of "${group[0].file_name}"`,
          savings_bytes: file.size_bytes || 0
        });
      }
    }
  }

  // Version chains: if 2+ files share canonical name with version cues
  for (const [_key, group] of canonicalMap.entries()) {
    if (group.length > 1) {
      // Check if any has version patterns
      const hasVersionPattern = group.some(f =>
        VERSION_PATTERNS.some(p => p.test(f.file_name))
      );

      if (hasVersionPattern) {
        // Sort newest to oldest; older versions are redundant candidates
        group.sort((a, b) => new Date(b.modified_date || 0) - new Date(a.modified_date || 0));
        for (let i = 1; i < group.length; i++) {
          const file = group[i];
          if (!redundantFileIds.has(file.file_id)) {
            redundantFileIds.add(file.file_id);
            redundantItems.push({
              ...file,
              rot_type: 'redundant',
              rot_reason: 'superseded_version',
              redundancy_detail: `Superseded by newer version "${group[0].file_name}"`,
              savings_bytes: file.size_bytes || 0
            });
          }
        }
      }
    }
  }

  const totalSize = redundantItems.reduce((sum, item) => sum + (item.savings_bytes || 0), 0);

  return {
    items: redundantItems,
    count: redundantItems.length,
    total_size_bytes: totalSize
  };
}

/**
 * Find obsolete files (inactive for 12+ months)
 * @param {Array<Object>} files - Structured file list
 * @param {number} [thresholdMonths=12] - Inactivity threshold in months
 * @param {Date} now - Current timestamp
 * @returns {Object} { items: Array<Object>, count: number, total_size_bytes: number }
 */
function findObsoleteFiles_(files, thresholdMonths = 12, now = new Date()) {
  const thresholdDays = thresholdMonths * 30.5;
  const obsoleteItems = [];

  for (const file of files) {
    if (file.mime_type === 'application/vnd.google-apps.folder') continue;

    // Use last_viewed_date if present, fall back to modified_date
    const activityDate = file.last_viewed_date || file.modified_date;
    const daysElapsed = getDaysElapsed_(activityDate, now);

    if (daysElapsed !== null && daysElapsed >= thresholdDays) {
      const yearsElapsed = (daysElapsed / 365).toFixed(1);
      const freshness = getFreshnessLevel_(daysElapsed);

      obsoleteItems.push({
        ...file,
        rot_type: 'obsolete',
        rot_reason: daysElapsed >= 730 ? 'decayed_2yr' : 'inactive_1yr',
        days_inactive: daysElapsed,
        freshness_level: freshness,
        redundancy_detail: `Inactive for ${yearsElapsed} years (last active: ${activityDate ? activityDate.substring(0, 10) : 'unknown'})`,
        savings_bytes: file.size_bytes || 0
      });
    }
  }

  const totalSize = obsoleteItems.reduce((sum, item) => sum + (item.savings_bytes || 0), 0);

  return {
    items: obsoleteItems,
    count: obsoleteItems.length,
    total_size_bytes: totalSize
  };
}

/**
 * Find trivial files (screenshots, untitled, tiny stubs, temporary files)
 * @param {Array<Object>} files - Structured file list
 * @returns {Object} { items: Array<Object>, count: number, total_size_bytes: number, breakdown: Object }
 */
function findTrivialFiles_(files) {
  const trivialItems = [];
  const breakdown = {
    screenshots: 0,
    untitled: 0,
    tiny_stubs: 0,
    temp_system: 0
  };

  for (const file of files) {
    if (file.mime_type === 'application/vnd.google-apps.folder') continue;

    const fileName = file.file_name || '';
    const size = file.size_bytes || 0;
    const lowerName = fileName.toLowerCase();

    let isTrivial = false;
    let reason = '';
    let detail = '';

    // 1. Screenshot pattern
    if (SCREENSHOT_PATTERNS.some(p => p.test(fileName))) {
      isTrivial = true;
      reason = 'screenshot';
      detail = 'Default screenshot naming pattern';
      breakdown.screenshots++;
    }
    // 2. Untitled file pattern
    else if (/^Untitled/i.test(fileName) || /^Sin título/i.test(fileName) || /^Sans titre/i.test(fileName)) {
      isTrivial = true;
      reason = 'untitled';
      detail = 'Unlabelled default document name';
      breakdown.untitled++;
    }
    // 3. Temp / system file
    else if (TEMP_SYSTEM_NAMES.includes(lowerName) || lowerName.startsWith('~$') || lowerName.endsWith('.tmp') || lowerName.endsWith('.crdownload')) {
      isTrivial = true;
      reason = 'temp_system';
      detail = 'System or temporary cached file';
      breakdown.temp_system++;
    }
    // 4. Tiny placeholder stub (<10 KB, but not Google Workspace files that default to 0 bytes)
    else if (size > 0 && size < 10240 && !file.mime_type.startsWith('application/vnd.google-apps.')) {
      isTrivial = true;
      reason = 'tiny_stub';
      detail = `Tiny stub file (${size} bytes)`;
      breakdown.tiny_stubs++;
    }

    if (isTrivial) {
      trivialItems.push({
        ...file,
        rot_type: 'trivial',
        rot_reason: reason,
        redundancy_detail: detail,
        savings_bytes: size
      });
    }
  }

  const totalSize = trivialItems.reduce((sum, item) => sum + (item.savings_bytes || 0), 0);

  return {
    items: trivialItems,
    count: trivialItems.length,
    total_size_bytes: totalSize,
    breakdown
  };
}

/**
 * Calculate Clutter Index (0-100, target < 20)
 * @param {Array<Object>} files - Structured file list
 * @param {Object} rotCounts - { redundant, obsolete, trivial, total }
 * @param {Date} now - Current timestamp
 * @returns {Object} Clutter Index breakdown and score
 */
function calculateClutterIndex_(files, rotCounts, now) {
  const total = Math.max(1, files.length);

  // 1. ROT Ratio: % of total files that are Redundant, Obsolete, or Trivial
  const rotCount = rotCounts.redundant + rotCounts.obsolete + rotCounts.trivial;
  const rotRatio = Math.min(100, (rotCount / total) * 100);

  // 2. Disorganization: % of files untitled or duplicated
  const disorganizationCount = rotCounts.untitled + rotCounts.duplicates;
  const disorganization = Math.min(100, (disorganizationCount / total) * 100);

  // 3. Inertia: % of files obsolete (>1 year inactive)
  const inertia = Math.min(100, (rotCounts.obsolete / total) * 100);

  // 4. Data Gravity: Average age in days * total files / 36,500
  let totalAgeDays = 0;
  let filesWithDates = 0;
  for (const file of files) {
    const d = getDaysElapsed_(file.last_viewed_date || file.modified_date || file.created_date, now);
    if (d !== null) {
      totalAgeDays += d;
      filesWithDates++;
    }
  }
  const avgAgeDays = filesWithDates > 0 ? Math.round(totalAgeDays / filesWithDates) : 0;
  const dataGravity = Math.min(100, (avgAgeDays * total) / 36500);

  // Weighted score
  const rawScore = (rotRatio * 0.4) + (disorganization * 0.3) + (inertia * 0.2) + (dataGravity * 0.1);
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  return {
    score,
    target: 20,
    average_age_days: avgAgeDays,
    breakdown: {
      rot_ratio: Math.round(rotRatio),
      disorganization: Math.round(disorganization),
      inertia: Math.round(inertia),
      data_gravity: Math.round(dataGravity)
    }
  };
}

/**
 * Calculate Digital Hoarding Questionnaire (DHQ) Score (0-100)
 * @param {Array<Object>} files - Structured file list
 * @param {Object} rotCounts - Summary counts
 * @returns {Object} DHQ assessment results
 */
function calculateHoardingScore_(files, rotCounts) {
  const total = Math.max(1, files.length);

  // Subscale 1: Clutter Volume (0-25)
  // Evaluates sheer file volume and storage accumulation
  let clutterVolume = 0;
  if (total > 1000) clutterVolume += 15;
  else if (total > 500) clutterVolume += 10;
  else if (total > 200) clutterVolume += 5;
  else clutterVolume += 2;

  const totalBytes = files.reduce((acc, f) => acc + (f.size_bytes || 0), 0);
  const gigabytes = totalBytes / (1024 * 1024 * 1024);
  if (gigabytes > 30) clutterVolume += 10;
  else if (gigabytes > 15) clutterVolume += 7;
  else if (gigabytes > 5) clutterVolume += 4;
  else clutterVolume += 1;
  clutterVolume = Math.min(25, clutterVolume);

  // Subscale 2: Disorganization (0-25)
  // Untitled items, messy root, duplicates
  const disorgRatio = ((rotCounts.untitled + rotCounts.duplicates + rotCounts.temp) / total) * 100;
  const disorganization = Math.min(25, Math.round((disorgRatio / 100) * 25 * 2.5));

  // Subscale 3: Accumulation (0-25)
  // Inactive stagnant files (>1 yr) and trivial placeholders kept indefinitely
  const accumRatio = ((rotCounts.obsolete + rotCounts.trivial) / total) * 100;
  const accumulation = Math.min(25, Math.round((accumRatio / 100) * 25 * 2.0));

  // Subscale 4: Emotional Attachment / Version Hoarding (0-25)
  // Retaining multiple redundant drafts/copies without cleaning
  const attachRatio = (rotCounts.redundant / total) * 100;
  const attachment = Math.min(25, Math.round((attachRatio / 100) * 25 * 3.0));

  const totalScore = Math.min(100, clutterVolume + disorganization + accumulation + attachment);

  let rating;
  if (totalScore <= 20) {
    rating = { level: 'Minimal', color: 'green', icon: '✨', description: 'Clean & minimalist' };
  } else if (totalScore <= 40) {
    rating = { level: 'Mild', color: 'blue', icon: '📂', description: 'Well-managed with minor clutter' };
  } else if (totalScore <= 60) {
    rating = { level: 'Moderate', color: 'yellow', icon: '📦', description: 'Noticeable digital clutter accumulating' };
  } else if (totalScore <= 80) {
    rating = { level: 'Significant', color: 'orange', icon: '🗄️', description: 'High accumulation of stagnant files' };
  } else {
    rating = { level: 'Severe', color: 'red', icon: '🚨', description: 'Critical digital clutter, cleanup strongly advised' };
  }

  return {
    total_score: totalScore,
    rating,
    components: {
      clutter_volume: clutterVolume,
      disorganization,
      accumulation,
      attachment
    }
  };
}

/**
 * Calculate freshness distribution across 5 decay stages
 * @param {Array<Object>} files - Structured file list
 * @param {Date} now - Current timestamp
 * @returns {Object} Counts and percentages across 5 stages
 */
function calculateFreshnessDistribution_(files, now) {
  const distribution = {
    fresh: { count: 0, label: 'Fresh', period: '0-3 months', color: 'emerald' },
    aging: { count: 0, label: 'Aging', period: '3-6 months', color: 'amber' },
    stale: { count: 0, label: 'Stale', period: '6-12 months', color: 'orange' },
    rotting: { count: 0, label: 'Rotting', period: '12-24 months', color: 'rose' },
    decayed: { count: 0, label: 'Decayed', period: '24+ months', color: 'slate' }
  };

  for (const file of files) {
    if (file.mime_type === 'application/vnd.google-apps.folder') continue;

    const days = getDaysElapsed_(file.last_viewed_date || file.modified_date || file.created_date, now);
    const level = getFreshnessLevel_(days);
    distribution[level].count++;
  }

  const total = Math.max(1, files.length);
  for (const key in distribution) {
    distribution[key].percentage = Math.round((distribution[key].count / total) * 100);
  }

  return distribution;
}

/**
 * Analyze files for ROT (Redundant, Obsolete, Trivial) classification
 *
 * Primary entry point for Data ROT & Hoarding Analysis.
 *
 * @param {Array<Object>} filesData - Structured file objects from analysis context
 * @returns {ROTAnalysisResultProps} Complete ROT analysis with scores and items
 */
function analyzeROT(filesData) {
  console.log(`Starting ROT Analysis on ${filesData ? filesData.length : 0} items...`);

  if (!filesData || filesData.length === 0) {
    return {
      count: 0,
      total_size_bytes: 0,
      category_name: 'Data ROT Analysis',
      category_type: 'rot_analysis',
      breakdown: {
        redundant: { count: 0, total_size_bytes: 0 },
        obsolete: { count: 0, total_size_bytes: 0 },
        trivial: { count: 0, total_size_bytes: 0 }
      },
      clutter_index: { score: 0, target: 20, breakdown: { rot_ratio: 0, disorganization: 0, inertia: 0, data_gravity: 0 } },
      hoarding_score: { total_score: 0, rating: { level: 'Minimal', color: 'green', icon: '✨' }, components: { clutter_volume: 0, disorganization: 0, accumulation: 0, attachment: 0 } },
      freshness_distribution: {
        fresh: { count: 0, percentage: 0 },
        aging: { count: 0, percentage: 0 },
        stale: { count: 0, percentage: 0 },
        rotting: { count: 0, percentage: 0 },
        decayed: { count: 0, percentage: 0 }
      },
      items: []
    };
  }

  const now = new Date();

  // 1. Analyze categories
  const redundant = findRedundantFiles_(filesData);
  const obsolete = findObsoleteFiles_(filesData, 12, now);
  const trivial = findTrivialFiles_(filesData);

  // 2. Build unified, deduplicated list of ROT items with combined classifications
  const itemMap = new Map();

  // Helper to add/merge item
  function mergeRotItem(item, type, reason, detail) {
    if (!itemMap.has(item.file_id)) {
      const days = getDaysElapsed_(item.last_viewed_date || item.modified_date || item.created_date, now);
      itemMap.set(item.file_id, {
        file_id: item.file_id,
        file_name: item.file_name,
        mime_type: item.mime_type,
        parent_name: item.parent_name || 'My Drive',
        size_bytes: item.size_bytes || 0,
        modified_date: item.modified_date,
        last_viewed_date: item.last_viewed_date,
        drive_link: item.drive_link || '',
        days_inactive: days,
        freshness_level: getFreshnessLevel_(days),
        rot_types: [type],
        rot_reasons: [reason],
        details: [detail]
      });
    } else {
      const existing = itemMap.get(item.file_id);
      if (!existing.rot_types.includes(type)) {
        existing.rot_types.push(type);
      }
      if (!existing.rot_reasons.includes(reason)) {
        existing.rot_reasons.push(reason);
      }
      existing.details.push(detail);
    }
  }

  for (const item of redundant.items) {
    mergeRotItem(item, 'redundant', item.rot_reason, item.redundancy_detail);
  }
  for (const item of obsolete.items) {
    mergeRotItem(item, 'obsolete', item.rot_reason, item.redundancy_detail);
  }
  for (const item of trivial.items) {
    mergeRotItem(item, 'trivial', item.rot_reason, item.redundancy_detail);
  }

  const unifiedItems = Array.from(itemMap.values());
  const totalRotSize = unifiedItems.reduce((acc, f) => acc + (f.size_bytes || 0), 0);

  // 3. Compute Clutter Index and Hoarding Score
  const rotCounts = {
    redundant: redundant.count,
    obsolete: obsolete.count,
    trivial: trivial.count,
    untitled: trivial.breakdown.untitled,
    duplicates: redundant.count,
    temp: trivial.breakdown.temp_system
  };

  const clutterIndex = calculateClutterIndex_(filesData, rotCounts, now);
  const hoardingScore = calculateHoardingScore_(filesData, rotCounts);
  const freshnessDistribution = calculateFreshnessDistribution_(filesData, now);

  console.log(`ROT Analysis complete: ${unifiedItems.length} ROT items identified (Clutter Index: ${clutterIndex.score}, Hoarding Score: ${hoardingScore.total_score})`);

  return {
    count: unifiedItems.length,
    total_size_bytes: totalRotSize,
    category_name: 'Data ROT Analysis',
    category_type: 'rot_analysis',
    breakdown: {
      redundant: { count: redundant.count, total_size_bytes: redundant.total_size_bytes },
      obsolete: { count: obsolete.count, total_size_bytes: obsolete.total_size_bytes },
      trivial: { count: trivial.count, total_size_bytes: trivial.total_size_bytes, detail: trivial.breakdown }
    },
    clutter_index: clutterIndex,
    hoarding_score: hoardingScore,
    freshness_distribution: freshnessDistribution,
    items: unifiedItems
  };
}
