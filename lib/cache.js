const cache = new Map()

/**
 * Get cached data if it exists and is still fresh
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if not found/expired
 */
export function getCached(key) {
  const item = cache.get(key)
  if (!item) return null

  // Check if cache has expired
  if (Date.now() - item.timestamp > item.duration) {
    cache.delete(key)
    return null
  }

  return item.data
}

/**
 * Set data in cache with expiration
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} duration - Cache duration in milliseconds (default: 60 seconds)
 */
export function setCached(key, data, duration = 60000) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    duration,
  })
}

/**
 * Clear all cache entries
 */
export function clearCache() {
  cache.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  }
}
