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
 * Validates and activates a license key
 * Supports:
 * - Test / evaluation keys: DC-PRO-TEST-2026, DC-PRO-EVAL-2026
 * - Commercial format: DC-PRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}
 * - Enterprise / domain tokens: DC-ENT-[A-Z0-9]+
 * @param {string} key
 * @returns {Object}
 */
function activateLicenseKey_(key) {
  if (!key || typeof key !== 'string') {
    return { success: false, error: 'License key cannot be empty.' };
  }

  const trimmed = key.trim().toUpperCase();

  // Validate format
  const isTestKey = trimmed === 'DC-PRO-TEST-2026' || trimmed === 'DC-PRO-EVAL-2026';
  const isCommercialKey = /^DC-PRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(trimmed);
  const isEnterpriseKey = /^DC-ENT-[A-Z0-9]{6,}$/.test(trimmed);

  if (!isTestKey && !isCommercialKey && !isEnterpriseKey) {
    return {
      success: false,
      error: 'Invalid license key format. Expected DC-PRO-XXXX-XXXX-XXXX or valid activation token.',
    };
  }

  try {
    const userProps = PropertiesService.getUserProperties();
    const state = getRawLicenseState_();

    state.tier = 'pro';
    state.licenseKey = trimmed;
    state.activatedAt = new Date().toISOString();
    state.expiresAt = isTestKey ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : 'lifetime';

    userProps.setProperty(LICENSE_STORAGE_KEY, JSON.stringify(state));

    return {
      success: true,
      tier: 'pro',
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
}
