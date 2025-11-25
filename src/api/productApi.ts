import apiClient from './apiClient';
import { productCache } from '../utils/cache';
import { createRetryableApiCall } from '../utils/retry';

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

// Interface untuk response products list
interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

// Retry configuration khusus untuk product API
const PRODUCT_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1500,
  maxDelay: 8000,
};

export const productApi = {
  /**
   * Get product detail dengan cache-first strategy + retry
   */
  getProduct: async (productId: number): Promise<Product> => {
    try {
      // 1. Cek cache dulu
      const cachedProduct = await productCache.getProduct(productId);
      if (cachedProduct) {
        console.log(`🔄 Using cached product: ${productId}`);
        return cachedProduct;
      }

      // 2. Jika tidak ada cache, fetch dari API dengan retry
      console.log(`🌐 Fetching product from API: ${productId}`);
      
      const fetchProductWithRetry = createRetryableApiCall(
        () => apiClient.get<Product>(`/products/${productId}`),
        PRODUCT_RETRY_CONFIG
      );
      
      const response = await fetchProductWithRetry();
      const product = response.data;

      // 3. Simpan ke cache untuk next time
      await productCache.setProduct(product);
      
      return product;
    } catch (error: any) {
      console.error(`❌ Error fetching product ${productId}:`, error);
      
      // Fallback: coba cache lagi untuk offline support
      const staleCache = await productCache.getProduct(productId);
      if (staleCache) {
        console.log(`🔄 Using stale cache as fallback: ${productId}`);
        return staleCache;
      }
      
      // Propagate error ke ErrorBoundary
      throw new Error(`Gagal memuat produk: ${error.message}`);
    }
  },

  /**
   * Refresh product data (ignore cache) dengan retry
   */
  refreshProduct: async (productId: number): Promise<Product> => {
    try {
      console.log(`🔄 Force refreshing product: ${productId}`);
      
      const fetchProductWithRetry = createRetryableApiCall(
        () => apiClient.get<Product>(`/products/${productId}`),
        PRODUCT_RETRY_CONFIG
      );
      
      const response = await fetchProductWithRetry();
      const product = response.data;

      // Update cache dengan data terbaru
      await productCache.setProduct(product);
      
      return product;
    } catch (error: any) {
      console.error(`❌ Error refreshing product ${productId}:`, error);
      throw new Error(`Gagal memperbarui produk: ${error.message}`);
    }
  },

  /**
   * Get multiple products dengan retry
   */
  getProducts: async (limit: number = 10, skip: number = 0): Promise<ProductsResponse> => {
    try {
      const fetchProductsWithRetry = createRetryableApiCall(
        () => apiClient.get<ProductsResponse>(`/products?limit=${limit}&skip=${skip}`),
        PRODUCT_RETRY_CONFIG
      );
      
      const response = await fetchProductsWithRetry();
      return response.data;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error(`Gagal memuat daftar produk: ${error.message}`);
    }
  },

  /**
   * Search products dengan retry
   */
  searchProducts: async (query: string): Promise<ProductsResponse> => {
    try {
      const searchProductsWithRetry = createRetryableApiCall(
        () => apiClient.get<ProductsResponse>(`/products/search?q=${query}`),
        PRODUCT_RETRY_CONFIG
      );
      
      const response = await searchProductsWithRetry();
      return response.data;
    } catch (error: any) {
      console.error('Error searching products:', error);
      throw new Error(`Gagal mencari produk: ${error.message}`);
    }
  }
};