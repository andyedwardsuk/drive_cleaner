//########### CACHE MANAGER UTILITY ###########

/**
 * Cache management utility for Drive Cleaner
 * Provides consistent caching interface for scan results with automatic expiry
 *
 * Uses Google Apps Script CacheService for session-based caching
 * Default TTL: 6 hours (21600 seconds) - balances freshness vs performance
 *
 * @author Andy Edwards
 * @version 1.0.0
 */

/**
 * Default cache TTL in seconds (6 hours)
 * Chosen to balance data freshness with API quota savings
 * @const {number}
 */
const DEFAULT_CACHE_TTL_SECONDS = 21600; // 6 hours

/**
 * Maximum cache entry size (approximate limit for CacheService)
 * CacheService has a 100KB limit per entry
 * @const {number}
 */
const MAX_CACHE_SIZE_BYTES = 100000; // 100KB

/**
 * Generate cache key for scan results
 * Creates consistent key from folder ID and corpora type
 *
 * @param {string} folderId - Folder ID or 'root' for My Drive
 * @param {string} corpora - Either 'user' (My Drive) or 'drive' (Shared Drive)
 * @returns {string} Cache key (e.g., "scan_root_user", "scan_abc123_drive")
 *
 * @example
 * generateCacheKey('root', 'user') // Returns "scan_root_user"
 * generateCacheKey('1a2b3c4d', 'drive') // Returns "scan_1a2b3c4d_drive"
 */
function generateCacheKey(folderId, corpora) {
  // Validate inputs
  if (!folderId) {
    throw new Error('Folder ID is required for cache key generation');
  }

  const corporaValue = corpora || 'user';

  // Generate key with prefix for namespacing
  const cacheKey = `scan_${folderId}_${corporaValue}`;

  return cacheKey;
}

/**
 * Get cached scan data for a folder
 * Returns parsed data if cache hit, null if cache miss or expired
 *
 * @param {string} cacheKey - Cache key from generateCacheKey()
 * @returns {Array|null} Cached scan data array or null if not found
 *
 * @example
 * const cacheKey = generateCacheKey('root', 'user');
 * const cachedData = getCachedScanData(cacheKey);
 * if (cachedData) {
 *   Logger.log('Cache hit!');
 *   return cachedData;
 * }
 */
function getCachedScanData(cacheKey) {
  try {
    // Get cache instance
    const cache = CacheService.getScriptCache();

    // Attempt to retrieve cached data
    const cachedValue = cache.get(cacheKey);

    // Cache miss
    if (!cachedValue) {
      Logger.log(`Cache miss for key: ${cacheKey}`);
      return null;
    }

    // Parse cached JSON
    const cachedData = JSON.parse(cachedValue);

    Logger.log(`Cache hit for key: ${cacheKey} (${cachedData.length} files)`);
    return cachedData;

  } catch (error) {
    // Log error but don't throw - gracefully degrade to cache miss
    Logger.log(`Error reading cache for key ${cacheKey}: ${error.message}`);
    return null;
  }
}

/**
 * Set cached scan data for a folder
 * Stores scan results with automatic expiry
 *
 * @param {string} cacheKey - Cache key from generateCacheKey()
 * @param {Array} scanData - Array of file data to cache
 * @param {number} ttlSeconds - Time to live in seconds (default: 6 hours)
 * @returns {boolean} True if cached successfully, false if error or too large
 *
 * @example
 * const cacheKey = generateCacheKey('root', 'user');
 * const success = setCachedScanData(cacheKey, fileArray, 21600);
 * if (success) {
 *   Logger.log('Data cached successfully');
 * }
 */
function setCachedScanData(cacheKey, scanData, ttlSeconds) {
  try {
    // Use default TTL if not provided
    const cacheTtl = ttlSeconds || DEFAULT_CACHE_TTL_SECONDS;

    // Validate scan data
    if (!scanData || !Array.isArray(scanData)) {
      Logger.log(`Invalid scan data for caching (key: ${cacheKey})`);
      return false;
    }

    // Serialise data to JSON
    const serialisedData = JSON.stringify(scanData);

    // Check size (approximate - JSON string length in bytes)
    const dataSizeBytes = new Blob([serialisedData]).getBytes().length;

    if (dataSizeBytes > MAX_CACHE_SIZE_BYTES) {
      Logger.log(`Cache data too large (${dataSizeBytes} bytes > ${MAX_CACHE_SIZE_BYTES} bytes limit). Consider chunking.`);
      return false;
    }

    // Get cache instance
    const cache = CacheService.getScriptCache();

    // Store in cache with TTL
    cache.put(cacheKey, serialisedData, cacheTtl);

    Logger.log(`Cached ${scanData.length} files for ${cacheTtl}s (key: ${cacheKey})`);
    return true;

  } catch (error) {
    // Log error but don't throw - caching failure shouldn't break functionality
    Logger.log(`Error caching data for key ${cacheKey}: ${error.message}`);
    return false;
  }
}

/**
 * Invalidate (clear) cached scan data for a folder
 * Useful when user manually refreshes or modifies files
 *
 * @param {string} cacheKey - Cache key from generateCacheKey()
 * @returns {boolean} True if removed, false if error
 *
 * @example
 * const cacheKey = generateCacheKey('root', 'user');
 * invalidateCache(cacheKey);
 */
function invalidateCache(cacheKey) {
  try {
    const cache = CacheService.getScriptCache();
    cache.remove(cacheKey);
    Logger.log(`Cache invalidated for key: ${cacheKey}`);
    return true;
  } catch (error) {
    Logger.log(`Error invalidating cache for key ${cacheKey}: ${error.message}`);
    return false;
  }
}

/**
 * Clear all Drive Cleaner caches
 * WARNING: Removes all cached scan data
 * Use sparingly - primarily for debugging or user-initiated "Clear Cache" action
 *
 * @returns {boolean} True if cleared, false if error
 *
 * @example
 * clearAllCaches(); // Clears all scan caches
 */
function clearAllCaches() {
  try {
    const cache = CacheService.getScriptCache();
    cache.removeAll(['scan_']); // Remove all keys starting with 'scan_'
    Logger.log('All Drive Cleaner caches cleared');
    return true;
  } catch (error) {
    Logger.log(`Error clearing all caches: ${error.message}`);
    return false;
  }
}

/**
 * Get cache statistics (for debugging/monitoring)
 * Checks if a specific cache key exists without retrieving data
 *
 * @param {string} cacheKey - Cache key to check
 * @returns {Object} Statistics object with exists and approximate size
 *
 * @example
 * const stats = getCacheStats('scan_root_user');
 * console.log(stats); // { exists: true, size: 45620 }
 */
function getCacheStats(cacheKey) {
  try {
    const cache = CacheService.getScriptCache();
    const cachedValue = cache.get(cacheKey);

    if (!cachedValue) {
      return { exists: false, size: 0 };
    }

    const sizeBytes = new Blob([cachedValue]).getBytes().length;

    return {
      exists: true,
      size: sizeBytes
    };

  } catch (error) {
    Logger.log(`Error getting cache stats for ${cacheKey}: ${error.message}`);
    return { exists: false, size: 0, error: error.message };
  }
}
