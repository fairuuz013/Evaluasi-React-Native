import apiClient from './apiClient';
import { cache } from '../utils/cache';

export interface Category {
  id: number;
  name: string;
  image: string;
}

const CATEGORIES_CACHE_KEY = 'categories';

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    try {
      // CACHE-FIRST: Cek cache dulu
      const cachedCategories = await cache.get(CATEGORIES_CACHE_KEY);
      if (cachedCategories) {
        console.log('📦 Using cached categories');
        return cachedCategories;
      }

      // Jika tidak ada cache, fetch dari API
      console.log('🌐 Fetching categories from API');
      const response = await apiClient.get<Category[]>('/categories');
      
      // Simpan ke cache
      await cache.set(CATEGORIES_CACHE_KEY, response.data);
      
      return response.data;
    } catch (error) {
      console.log('❌ Network error, trying cache...');
      // Fallback ke cache jika offline
      const staleCache = await cache.get(CATEGORIES_CACHE_KEY);
      return staleCache || [];
    }
  },

  // Refresh data dan update cache
  refreshCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get<Category[]>('/categories');
      await cache.set(CATEGORIES_CACHE_KEY, response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};