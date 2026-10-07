/**
 * In-memory cache with TTL for GitHub repository analysis and API responses.
 * Avoids redundant requests to GitHub API and LLM within a session.
 */
class MemoryCache {
  constructor(defaultTTL = 15 * 60 * 1000, maxItems = 100) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL; // 15 minutes
    this.maxItems = maxItems;
  }

  set(key, value, ttl = this.defaultTTL) {
    // If cache exceeds limit, remove oldest key
    if (this.cache.size >= this.maxItems) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const repoCache = new MemoryCache(20 * 60 * 1000, 100);
export const aiCache = new MemoryCache(30 * 60 * 1000, 200);
export default repoCache;
