// In-memory caching layer with TTL support
// Suitable for: trending stories, blind spot calculations, user stats

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class Cache<T = any> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private defaultTTL: number; // milliseconds

  constructor(defaultTTLSeconds = 3600) {
    this.defaultTTL = defaultTTLSeconds * 1000; // Convert to ms
  }

  /**
   * Set a value with optional custom TTL
   */
  set(key: string, value: T, ttlSeconds?: number): void {
    const ttl = (ttlSeconds ?? (this.defaultTTL / 1000)) * 1000;
    const expiresAt = Date.now() + ttl;

    // Clear existing timer
    const existingTimer = this.timers.get(key);
    if (existingTimer) clearTimeout(existingTimer);

    // Set new entry
    this.store.set(key, { value, expiresAt });

    // Auto-delete on expiration
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl);
    this.timers.set(key, timer);
  }

  /**
   * Get a value, returns null if expired or not found
   */
  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key immediately
   */
  delete(key: string): void {
    const timer = this.timers.get(key);
    if (timer) clearTimeout(timer);
    this.store.delete(key);
    this.timers.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.store.clear();
    this.timers.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.store.keys()).filter(k => this.has(k));
  }
}

// ============================================================================
// GLOBAL CACHE INSTANCES
// ============================================================================

export const trendingStoriesCache = new Cache(10 * 60); // 10 minutes
export const blindspotCache = new Cache(6 * 3600); // 6 hours
export const userStatsCache = new Cache(12 * 3600); // 12 hours
export const sourceCache = new Cache(24 * 3600); // 24 hours

// ============================================================================
// CACHE INVALIDATION HELPERS
// ============================================================================

export function invalidateTrendingCache(): void {
  trendingStoriesCache.clear();
}

export function invalidateBlindspotCache(): void {
  blindspotCache.clear();
}

export function invalidateUserStatsCache(userId?: string): void {
  if (userId) {
    userStatsCache.delete(`user:${userId}`);
  } else {
    userStatsCache.clear();
  }
}

export function invalidateSourceCache(): void {
  sourceCache.clear();
}

/**
 * Called after new articles are inserted or clusters are created
 */
export function invalidateOnDataChange(): void {
  invalidateTrendingCache();
  invalidateBlindspotCache();
  invalidateSourceCache();
  userStatsCache.clear(); // Clear all user stats
}

// ============================================================================
// CACHE INSTRUMENTATION
// ============================================================================

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

const cacheMetrics: Record<string, { hits: number; misses: number }> = {
  trending: { hits: 0, misses: 0 },
  blindspot: { hits: 0, misses: 0 },
  userStats: { hits: 0, misses: 0 },
  source: { hits: 0, misses: 0 },
};

export function recordCacheHit(cacheName: string): void {
  if (cacheMetrics[cacheName]) {
    cacheMetrics[cacheName].hits++;
  }
}

export function recordCacheMiss(cacheName: string): void {
  if (cacheMetrics[cacheName]) {
    cacheMetrics[cacheName].misses++;
  }
}

export function getCacheStats(): Record<string, CacheStats> {
  const stats: Record<string, CacheStats> = {};
  for (const [name, metrics] of Object.entries(cacheMetrics)) {
    const total = metrics.hits + metrics.misses;
    stats[name] = {
      hits: metrics.hits,
      misses: metrics.misses,
      hitRate: total > 0 ? metrics.hits / total : 0,
    };
  }
  return stats;
}

export function resetCacheStats(): void {
  for (const name of Object.keys(cacheMetrics)) {
    cacheMetrics[name] = { hits: 0, misses: 0 };
  }
}
