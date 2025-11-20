import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'cache_';
const DEFAULT_TTL = 30 * 60 * 1000; // 30 menit default

// Interface untuk cache data dengan TTL
export interface CacheData<T> {
  value: T;
  ttl: number; // Time To Live dalam milliseconds
  timestamp: number;
}

export const cache = {
  /**
   * Set data ke cache dengan TTL spesifik
   */
  set: async <T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> => {
    try {
      const cacheData: CacheData<T> = {
        value: data,
        ttl: ttl,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${key}`, 
        JSON.stringify(cacheData)
      );
      
      console.log(`💾 Cache SET: ${key} (TTL: ${ttl / 1000 / 60} menit)`);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  /**
   * Get data dari cache dengan TTL validation
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) {
        console.log(`💾 Cache MISS: ${key}`);
        return null;
      }

      const cacheData: CacheData<T> = JSON.parse(cached);
      const now = Date.now();
      const isExpired = now - cacheData.timestamp > cacheData.ttl;

      if (isExpired) {
        console.log(`💾 Cache EXPIRED: ${key}`);
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      console.log(`💾 Cache HIT: ${key}`);
      return cacheData.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Remove specific cache key
   */
  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      console.log(`💾 Cache REMOVED: ${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  },

  /**
   * Clear all cache (useful for logout or storage cleanup)
   */
  clearAll: async (): Promise<void> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`💾 Cache CLEARED: ${cacheKeys.length} items`);
      }
    } catch (error) {
      console.error('Cache clearAll error:', error);
    }
  },

  /**
   * Get cache info (for debugging)
   */
  getInfo: async (key: string): Promise<{ exists: boolean; isExpired: boolean; age: number }> => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) {
        return { exists: false, isExpired: true, age: 0 };
      }

      const cacheData: CacheData<any> = JSON.parse(cached);
      const now = Date.now();
      const age = now - cacheData.timestamp;
      const isExpired = age > cacheData.ttl;

      return {
        exists: true,
        isExpired,
        age: Math.floor(age / 1000) // age in seconds
      };
    } catch (error) {
      console.error('Cache getInfo error:', error);
      return { exists: false, isExpired: true, age: 0 };
    }
  }
};

// Helper functions untuk product cache
export const productCache = {
  /**
   * Generate dynamic cache key untuk product detail
   */
  generateKey: (productId: number): string => {
    return `product_detail:${productId}`;
  },

  /**
   * Cache product detail dengan TTL 15 menit
   */
  setProduct: async (product: any): Promise<void> => {
    const key = productCache.generateKey(product.id);
    await cache.set(key, product, 15 * 60 * 1000); // 15 menit TTL
  },

  /**
   * Get cached product detail
   */
  getProduct: async (productId: number): Promise<any | null> => {
    const key = productCache.generateKey(productId);
    return await cache.get(key);
  },

  /**
   * Remove cached product
   */
  removeProduct: async (productId: number): Promise<void> => {
    const key = productCache.generateKey(productId);
    await cache.remove(key);
  }
};