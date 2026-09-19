/**
 * License & Entitlement Service
 * Bridges client licensing and cleanup quota checks to Google Apps Script
 * with smooth fallback and test simulation for local development.
 */

const LOCAL_STORAGE_KEY = 'drive_cleaner_local_license';

function getLocalMonth() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export const licenseService = {
  /**
   * Retrieves active license state and monthly quota usage
   * @returns {Promise<Object>}
   */
  getLicenseState: () => {
    return new Promise((resolve) => {
      if (typeof google === 'undefined' || !google.script || !google.script.run) {
        // Local Vite Dev Simulation
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            return resolve(parsed);
          }
        } catch (e) {
          console.warn('Error reading local license:', e);
        }

        return resolve({
          tier: 'free',
          isPro: false,
          licenseKey: null,
          activatedAt: null,
          expiresAt: null,
          monthlyUsage: {
            month: getLocalMonth(),
            cleaned: 18,
            limit: 100,
            remaining: 82,
            percent: 18,
          },
        });
      }

      google.script.run
        .withSuccessHandler((res) => resolve(res))
        .withFailureHandler((err) => {
          console.error('Failed to get license state from GAS:', err);
          resolve({
            tier: 'free',
            isPro: false,
            licenseKey: null,
            activatedAt: null,
            expiresAt: null,
            monthlyUsage: {
              month: getLocalMonth(),
              cleaned: 0,
              limit: 100,
              remaining: 100,
              percent: 0,
            },
          });
        })
        .getLicenseState();
    });
  },

  /**
   * Activates a Pro license key
   * @param {string} key
   * @returns {Promise<{success: boolean, message?: string, error?: string, state?: Object}>}
   */
  activateLicenseKey: (key) => {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.script || !google.script.run) {
        const trimmed = (key || '').trim().toUpperCase();
        const isTestKey = trimmed === 'DC-PRO-TEST-2026' || trimmed === 'DC-PRO-EVAL-2026';
        const isCommercialKey = /^DC-PRO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(trimmed);

        if (!isTestKey && !isCommercialKey) {
          return resolve({
            success: false,
            error: 'Invalid key format. Expected DC-PRO-XXXX-XXXX-XXXX or test key DC-PRO-TEST-2026.',
          });
        }

        const state = {
          tier: 'pro',
          isPro: true,
          licenseKey: `${trimmed.slice(0, 7)}••••••••`,
          activatedAt: new Date().toISOString(),
          expiresAt: 'Lifetime',
          monthlyUsage: {
            month: getLocalMonth(),
            cleaned: 18,
            limit: 'Unlimited',
            remaining: 'Unlimited',
            percent: 0,
          },
        };

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        return resolve({
          success: true,
          tier: 'pro',
          message: 'Drive Cleaner Pro activated successfully! (Local simulation)',
          state,
        });
      }

      google.script.run
        .withSuccessHandler((res) => resolve(res))
        .withFailureHandler((err) => reject(err))
        .activateLicenseKey(key);
    });
  },

  /**
   * Deactivates active license key and reverts to Free plan
   * @returns {Promise<{success: boolean, message?: string, state?: Object}>}
   */
  deactivateLicenseKey: () => {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined' || !google.script || !google.script.run) {
        const state = {
          tier: 'free',
          isPro: false,
          licenseKey: null,
          activatedAt: null,
          expiresAt: null,
          monthlyUsage: {
            month: getLocalMonth(),
            cleaned: 18,
            limit: 100,
            remaining: 82,
            percent: 18,
          },
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        return resolve({
          success: true,
          tier: 'free',
          message: 'License deactivated. Reverted to Free plan.',
          state,
        });
      }

      google.script.run
        .withSuccessHandler((res) => resolve(res))
        .withFailureHandler((err) => reject(err))
        .deactivateLicenseKey();
    });
  },

  /**
   * Checks if user can clean a given number of files under their monthly quota
   * @param {number} fileCount
   * @returns {Promise<{ allowed: boolean, remaining: number, limit: number, isPro: boolean }>}
   */
  checkCleanupQuota: (fileCount) => {
    return new Promise((resolve) => {
      if (typeof google === 'undefined' || !google.script || !google.script.run) {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.isPro) {
              return resolve({ allowed: true, remaining: Infinity, limit: Infinity, isPro: true });
            }
          }
        } catch (e) {
          // ignore
        }

        const remaining = 82;
        return resolve({
          allowed: fileCount <= remaining,
          remaining,
          limit: 100,
          isPro: false,
        });
      }

      google.script.run
        .withSuccessHandler((res) => resolve(res))
        .withFailureHandler(() => {
          resolve({ allowed: true, remaining: 100, limit: 100, isPro: false });
        })
        .checkCleanupQuota(fileCount);
    });
  },
};

export default licenseService;
