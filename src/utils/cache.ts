import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'cache_';
const TTL = 30 * 60 * 1000; // 30 menit

export const cache = {
  set: async (key: string, data: any): Promise<void> => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  get: async (key: string): Promise<any | null> => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > TTL;

      if (isExpired) {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }
};