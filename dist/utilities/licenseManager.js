/**
 * License & Entitlement Manager
 * Manages Free tier monthly quotas, Pro license activation, and usage tracking
 * via Google Apps Script PropertiesService.getUserProperties().
 */

const FREE_MONTHLY_CLEANUP_LIMIT = 100;
const LICENSE_STORAGE_KEY = 'dc_license_state';

/**
 * Gets current calendar month in 'YYYY-MM' format
 * @returns {string}
 */
function getCurrentMonthString_() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Retrieves raw stored license state or initializes default Free tier
 * @returns {Object}
 */
function getRawLicenseState_() {
  try {
    const userProps = PropertiesService.getUserProperties();
    const raw = userProps.getProperty(LICENSE_STORAGE_KEY);
    const currentMonth = getCurrentMonthString_();

    let state = null;
    if (raw) {
      try {
        state = JSON.parse(raw);
      } catch (e) {
        console.warn('Failed to parse license state, reinitializing', e);
      }
    }

    if (!state) {
      state = {
        tier: 'free',
        licenseKey: null,
        activatedAt: null,
        expiresAt: null,
        monthlyUsage: {
          month: currentMonth,
          count: 0,
        },
      };
      userProps.setProperty(LICENSE_STORAGE_KEY, JSON.stringify(state));
    } else {
      // Monthly quota rollover check
      if (!state.monthlyUsage || state.monthlyUsage.month !== currentMonth) {
        state.monthlyUsage = {
          month: currentMonth,
          count: 0,
        };
        userProps.setProperty(LICENSE_STORAGE_KEY, JSON.stringify(state));
      }
    }

    return state;
  } catch (err) {
    console.error('Error in getRawLicenseState_:', err);
    return {
      tier: 'free',
      licenseKey: null,
      activatedAt: null,
      expiresAt: null,
      monthlyUsage: {
        month: getCurrentMonthString_(),
        count: 0,
      },
    };
  }
}

/**
 * Gets full sanitized license state with calculated quota metrics
 * @returns {Object}
 */
function getLicenseState_() {
  const state = getRawLicenseState_();
  const isPro = state.tier === 'pro';
  const cleaned = state.monthlyUsage?.count || 0;
  const limit = isPro ? Infinity : FREE_MONTHLY_CLEANUP_LIMIT;
  const remaining = isPro ? Infinity : Math.max(0, limit - cleaned);
  const percent = isPro ? 0 : Math.min(100, Math.round((cleaned / limit) * 100));

  return {
    tier: state.tier,
    isPro,
    licenseKey: state.licenseKey
      ? `${state.licenseKey.slice(0, 7)}••••••••`
      : null,
    activatedAt: state.activatedAt,
    expiresAt: state.expiresAt || 'Lifetime',
    monthlyUsage: {
      month: state.monthlyUsage?.month || getCurrentMonthString_(),
      cleaned,
      limit: isPro ? 'Unlimited' : limit,
      remaining: isPro ? 'Unlimited' : remaining,
      percent,
    },
  };
}

/**
 * Cryptographic Checksum Salts
 */
const LICENSE_PRO_SALT = 'DC_SALT_2026_STORAGE_PRO';
const LICENSE_ENT_SALT = 'DC_SALT_2026_STORAGE_ENT';

/**
 * Computes deterministic 4-character checksum for a license payload
 * Uses 32-bit FNV-1a hash algorithm mapped into base36 character set [0-9A-Z]
 * @param {string} payload
 * @param {string} [salt]
 * @returns {string} 4-character uppercase checksum
 */
function computeLicenseChecksum_(payload, salt) {
  const str = payload + ':' + (salt || LICENSE_PRO_SALT);
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const unsigned = hash >>> 0;
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const c1 = chars[unsigned % 36];
  const c2 = chars[Math.floor(unsigned / 36) % 36];
  const c3 = chars[Math.floor(unsigned / (36 * 36)) % 36];
  const c4 = chars[Math.floor(unsigned / (36 * 36 * 36)) % 36];
  return '' + c1 + c2 + c3 + c4;
}

/**
 * Generates a cryptographically signed license key
 * @param {string} [seed] - Optional seed string (e.g. buyer email or order ID)
 * @param {'pro'|'enterprise'} [tier='pro']
 * @returns {string} Formatted, signed key
 */
function generateSignedLicenseKey_(seed, tier) {
  const activeTier = tier === 'enterprise' ? 'enterprise' : 'pro';
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let b1 = '';
  let b2 = '';

  if (seed && typeof seed === 'string' && seed.length >= 4) {
    let h1 = 0x811c9dc5;
    let h2 = 0x27d4eb2f;
    for (let i = 0; i < seed.length; i++) {
      h1 = Math.imul(h1 ^ seed.charCodeAt(i), 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ seed.charCodeAt(i), 0x01000193) >>> 0;
    }
    for (let j = 0; j < 4; j++) {
      b1 += chars[(h1 >>> (j * 6)) % 36];
      b2 += chars[(h2 >>> (j * 6)) % 36];
    }
  } else {
    for (let i = 0; i < 4; i++) {
      b1 += chars[Math.floor(Math.random() * 36)];
      b2 += chars[Math.floor(Math.random() * 36)];
    }
  }

  const salt = activeTier === 'enterprise' ? LICENSE_ENT_SALT : LICENSE_PRO_SALT;
  const payload = activeTier === 'enterprise' ? b1 + b2 : b1 + '-' + b2;
  const checksum = computeLicenseChecksum_(payload, salt);

  return activeTier === 'enterprise'
    ? 'DC-ENT-' + b1 + b2 + '-' + checksum
    : 'DC-PRO-' + b1 + '-' + b2 + '-' + checksum;
}

/**
 * Verifies authenticity of a license key via cryptographic checksum
 * @param {string} key
 * @returns {{valid: boolean, tier?: string, isEvaluation?: boolean, error?: string}}
 */
function verifyLicenseKeyAuthenticity_(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'License key cannot be empty.' };
  }

  const trimmed = key.trim().toUpperCase();

  // 1. Evaluation & Developer test keys
  if (trimmed === 'DC-PRO-TEST-2026' || trimmed === 'DC-PRO-EVAL-2026') {
    return { valid: true, tier: 'pro', isEvaluation: true };
  }

  // 2. Commercial Pro keys: DC-PRO-XXXX-YYYY-ZZZZ (where ZZZZ is checksum of XXXX-YYYY)
  const proMatch = trimmed.match(/^DC-PRO-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/);
  if (proMatch) {
    const payload = proMatch[1] + '-' + proMatch[2];
    const expectedChecksum = computeLicenseChecksum_(payload, LICENSE_PRO_SALT);
    if (proMatch[3] === expectedChecksum) {
      return { valid: true, tier: 'pro', isEvaluation: false };
    }
    return { valid: false, error: 'Invalid license key checksum. Verification failed.' };
  }

  // 3. Enterprise tokens: DC-ENT-[PAYLOAD]-[CHECKSUM]
  const entMatch = trimmed.match(/^DC-ENT-([A-Z0-9]{4,16})-([A-Z0-9]{4})$/);
  if (entMatch) {
    const payload = entMatch[1];
    const expectedChecksum = computeLicenseChecksum_(payload, LICENSE_ENT_SALT);
    if (entMatch[2] === expectedChecksum) {
      return { valid: true, tier: 'enterprise', isEvaluation: false };
    }
    return { valid: false, error: 'Invalid enterprise license signature.' };
  }

  return {
    valid: false,
    error: 'Unrecognized license key format. Expected DC-PRO-XXXX-XXXX-XXXX or valid activation token.'
  };
}

/**
 * Validates and activates a license key
 * Supports:
 * - Test / evaluation keys: DC-PRO-TEST-2026, DC-PRO-EVAL-2026
 * - Cryptographically signed commercial format: DC-PRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[CHECKSUM]
 * - Enterprise / domain tokens: DC-ENT-[A-Z0-9]{4,16}-[CHECKSUM]
 * @param {string} key
 * @returns {Object}
 */
function activateLicenseKey_(key) {
  if (!key || typeof key !== 'string') {
    return { success: false, error: 'License key cannot be empty.' };
  }

  const trimmed = key.trim().toUpperCase();
  const authResult = verifyLicenseKeyAuthenticity_(trimmed);

  if (!authResult.valid) {
    return {
      success: false,
      error: authResult.error || 'Invalid license key. Verification failed.',
    };
  }

  try {
    const userProps = PropertiesService.getUserProperties();
    const state = getRawLicenseState_();

    state.tier = authResult.tier || 'pro';
    state.licenseKey = trimmed;
    state.activatedAt = new Date().toISOString();
    state.expiresAt = authResult.isEvaluation
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : 'lifetime';

    userProps.setProperty(LICENSE_STORAGE_KEY, JSON.stringify(state));

    return {
      success: true,
      tier: state.tier,
      message: 'Drive Cleaner Pro activated successfully! Unlimited cleanup and automated triggers unlocked.',
      state: getLicenseState_(),
    };
  } catch (err) {
    console.error('Failed to save license activation:', err);
    return { success: false, error: 'Failed to activate license: ' + err.message };
  }
}

/**
 * Deactivates active license key and reverts user to Free plan
 * @returns {Object}
 */
function deactivateLicenseKey_() {
  try {
    const userProps = PropertiesService.getUserProperties();
    const state = getRawLicenseState_();

    state.tier = 'free';
    state.licenseKey = null;
    state.activatedAt = null;
    state.expiresAt = null;

    userProps.setProperty(LICENSE_STORAGE_KEY, JSON.stringify(state));

    return {
      success: true,
      tier: 'free',
      message: 'License deactivated. Reverted to Free plan.',
      state: getLicenseState_(),
    };
  } catch (err) {
    console.error('Failed to deactivate license:', err);
    return { success: false, error: 'Failed to deactivate license: ' + err.message };
  }
}

/**
 * Checks if user can clean a given number of files under their monthly quota
 * @param {number} fileCount
 * @returns {{ allowed: boolean, remaining: number, limit: number, isPro: boolean }}
 */
function checkCleanupQuota_(fileCount) {
  const state = getRawLicenseState_();
  const isPro = state.tier === 'pro';

  if (isPro) {
    return { allowed: true, remaining: Infinity, limit: Infinity, isPro: true };
  }

  const cleaned = state.monthlyUsage?.count || 0;
  const remaining = Math.max(0, FREE_MONTHLY_CLEANUP_LIMIT - cleaned);
  const allowed = (cleaned + fileCount) <= FREE_MONTHLY_CLEANUP_LIMIT;

  return {
    allowed,
    cleaned,
    remaining,
    limit: FREE_MONTHLY_CLEANUP_LIMIT,
    isPro: false,
  };
}

/**
 * Records cleanup usage against the monthly quota
 * @param {number} fileCount
 * @returns {Object}
 */
function recordCleanupQuota_(fileCount) {
  if (!fileCount || fileCount <= 0) return { success: true };

  try {
    const userProps = PropertiesService.getUserProperties();
    const state = getRawLicenseState_();

    if (state.tier === 'pro') {
      return { success: true, isPro: true };
    }

    state.monthlyUsage.count = (state.monthlyUsage.count || 0) + fileCount;
    userProps.setProperty(LICENSE_STORAGE_KEY, JSON.stringify(state));

    return {
      success: true,
      isPro: false,
      cleaned: state.monthlyUsage.count,
      remaining: Math.max(0, FREE_MONTHLY_CLEANUP_LIMIT - state.monthlyUsage.count),
    };
  } catch (err) {
    console.error('Failed to record cleanup quota:', err);
    return { success: false, error: err.message };
  }
}

// Export to global scope for Apps Script execution
if (typeof globalThis !== 'undefined') {
  globalThis.getLicenseState_ = getLicenseState_;
  globalThis.activateLicenseKey_ = activateLicenseKey_;
  globalThis.deactivateLicenseKey_ = deactivateLicenseKey_;
  globalThis.checkCleanupQuota_ = checkCleanupQuota_;
  globalThis.recordCleanupQuota_ = recordCleanupQuota_;
  globalThis.computeLicenseChecksum_ = computeLicenseChecksum_;
  globalThis.generateSignedLicenseKey_ = generateSignedLicenseKey_;
  globalThis.verifyLicenseKeyAuthenticity_ = verifyLicenseKeyAuthenticity_;
}
