import apiClient from './apiClient';
import { cache } from '../utils/cache';
import { createRetryableApiCall } from '../utils/retry';

export interface Category {
  id: number;
  name: string;
  image: string;
}

const CATEGORIES_CACHE_KEY = 'categories';

// Retry config untuk categories
const CATEGORY_RETRY_CONFIG = {
  maxAttempts: 2,
  baseDelay: 1000,
};

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    try {
      // CACHE-FIRST
      const cachedCategories = await cache.get<Category[]>(CATEGORIES_CACHE_KEY);

      if (Array.isArray(cachedCategories)) {
        console.log('📦 Using cached categories');
        return cachedCategories as Category[];
      }

      console.log('🌐 Fetching categories from API');

      // Fetch dengan retry
      const fetchCategoriesWithRetry = createRetryableApiCall(
        () => apiClient.get('/products/categories'),
        CATEGORY_RETRY_CONFIG
      );

      const response = await fetchCategoriesWithRetry();
      const categoryNames: string[] = response.data;

      // Convert ke Category[]
      const categories: Category[] = categoryNames.map((name, index) => ({
        id: index + 1,
        name: name,
        image: `https://picsum.photos/100/100?random=${index + 1}`,
      }));

      // Save ke cache
      await cache.set(CATEGORIES_CACHE_KEY, categories);

      return categories;
    } catch (error: any) {
      console.log('❌ Network error, trying cache...', error.message);

      // Fallback offline
      const staleCache = await cache.get<Category[]>(CATEGORIES_CACHE_KEY);
      return Array.isArray(staleCache) ? staleCache : [];
    }
  },

  // Force Refresh dengan retry
  refreshCategories: async (): Promise<Category[]> => {
    try {
      console.log('🔄 Force refreshing categories from API');

      const fetchCategoriesWithRetry = createRetryableApiCall(
        () => apiClient.get('/products/categories'),
        CATEGORY_RETRY_CONFIG
      );

      const response = await fetchCategoriesWithRetry();
      const categoryNames: string[] = response.data;
      
      const categories: Category[] = categoryNames.map((name, index) => ({
        id: index + 1,
        name: name,
        image: `https://picsum.photos/100/100?random=${index + 1}`,
      }));

      await cache.set(CATEGORIES_CACHE_KEY, categories);

      return categories;
    } catch (error: any) {
      console.error('Error refreshing categories:', error.message);
      throw new Error(`Gagal memuat kategori: ${error.message}`);
    }
  },
};