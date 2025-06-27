/**
 * Cache Service
 * Provides local storage caching for database responses
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheService {
  private static instance: CacheService;
  private readonly PREFIX = "chakshu_cache_";
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Store data in cache with expiry
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl,
      };

      localStorage.setItem(`${this.PREFIX}${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn("Failed to store in cache:", error);
    }
  }

  /**
   * Get data from cache if not expired
   */
  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`${this.PREFIX}${key}`);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);

      if (Date.now() > cacheItem.expiry) {
        this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn("Failed to get from cache:", error);
      return null;
    }
  }

  /**
   * Delete item from cache
   */
  delete(key: string): void {
    try {
      localStorage.removeItem(`${this.PREFIX}${key}`);
    } catch (error) {
      console.warn("Failed to delete from cache:", error);
    }
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }

  /**
   * Check if cache item exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache info for debugging
   */
  getInfo(key: string): { exists: boolean; age?: number; expired?: boolean } {
    try {
      const cached = localStorage.getItem(`${this.PREFIX}${key}`);
      if (!cached) return { exists: false };

      const cacheItem: CacheItem<any> = JSON.parse(cached);
      const now = Date.now();

      return {
        exists: true,
        age: now - cacheItem.timestamp,
        expired: now > cacheItem.expiry,
      };
    } catch (error) {
      return { exists: false };
    }
  }
}

export const cacheService = CacheService.getInstance();
export default cacheService;
