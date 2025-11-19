import AsyncStorage from '@react-native-async-storage/async-storage';

// Key constants untuk konsistensi
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  THEME_MODE: 'theme_mode',
  NOTIFICATION_STATUS: 'notification_status',
  CART_ITEMS: 'cart_items',
} as const;

// Data yang akan dihapus saat logout
const LOGOUT_CLEANUP_KEYS = [
  STORAGE_KEYS.AUTH_TOKEN,
  // Tambahkan keys lain yang ingin dihapus saat logout
  // STORAGE_KEYS.CART_ITEMS, // Opsional: hapus cart juga saat logout
];

export const storage = {
  // ===== FUNGSI YANG SUDAH ADA - TETAP SAMA =====
  // Single operations (seperti sebelumnya)
  setToken: async (token: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  getToken: async () => {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  removeToken: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // MULTI-GET OPTIMIZATION: Ambil semua data penting sekaligus
  getAppInitialData: async (): Promise<{
    token: string | null;
    theme: string | null;
    notifications: string | null;
  }> => {
    try {
      const keys = [
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.THEME_MODE,
        STORAGE_KEYS.NOTIFICATION_STATUS,
      ];

      // AMBIL SEMUA DATA SEKALIGUS - LEBIH CEPAT!
      const values = await AsyncStorage.multiGet(keys);
      
      // Convert array of [key, value] pairs ke object
      const result = {
        token: values[0][1], // index 0 = AUTH_TOKEN
        theme: values[1][1], // index 1 = THEME_MODE  
        notifications: values[2][1], // index 2 = NOTIFICATION_STATUS
      };

      console.log('MultiGet result:', result);
      return result;
    } catch (error) {
      console.error('Error in multiGet:', error);
      return {
        token: null,
        theme: null,
        notifications: null,
      };
    }
  },

  // Untuk future use - set theme
  setTheme: async (theme: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, theme);
  },

  // Untuk future use - set notifications
  setNotifications: async (status: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_STATUS, status);
  },

  // ================= CART PERSISTENCE =================
  saveCart: async (cartItems: any[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(cartItems));
      console.log('🛒 Cart saved:', cartItems.length, 'items');
    } catch (error: any) {
      // HANDLE QUOTA EXCEEDED ERROR
      if (error?.message?.includes('QuotaExceededError') || error?.message?.includes('quota')) {
        console.warn('⚠️ Storage quota exceeded, clearing old data...');
        await storage.clearOldData();
        // Retry after clearing
        await AsyncStorage.setItem(STORAGE_KEYS.CART_ITEMS, JSON.stringify(cartItems));
      } else {
        throw error;
      }
    }
  },

  // Merge cart item (optimized untuk update quantity)
  mergeCartItem: async (itemId: number, updates: Partial<any>): Promise<void> => {
    try {
      const currentCart = await storage.getCart();
      const updatedCart = currentCart.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      );
      await storage.saveCart(updatedCart);
      console.log('🛒 Cart item merged:', itemId);
    } catch (error: any) {
      if (error?.message?.includes('QuotaExceededError')) {
        console.warn('⚠️ Storage quota exceeded during merge');
        await storage.handleQuotaExceeded();
      }
      throw error;
    }
  },

  // Get cart items
  getCart: async (): Promise<any[]> => {
    try {
      const cartData = await AsyncStorage.getItem(STORAGE_KEYS.CART_ITEMS);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  },

  // Clear cart
  clearCart: async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
  },

  // Handle Quota Exceeded - Clear non-essential data
  handleQuotaExceeded: async (): Promise<void> => {
    try {
      console.log('🔄 Clearing non-essential data due to quota exceeded...');
      // Hapus cart data tapi keep auth token
      await AsyncStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
      console.log('✅ Cart data cleared');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Clear old cache data (untuk maintenance)
  clearOldData: async (): Promise<void> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('cache_'));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log('🧹 Old cache cleared');
      }
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  },

  // ================= LOGOUT CLEANUP =================
  /**
   * Hapus semua data sensitif saat logout menggunakan multiRemove
   */
  cleanupOnLogout: async (options?: { clearCart?: boolean }): Promise<void> => {
    try {
      console.log('🧹 Cleaning up on logout...');
      
      let keysToRemove = [...LOGOUT_CLEANUP_KEYS];
      
      // Opsional: hapus cart juga
      if (options?.clearCart) {
        keysToRemove.push(STORAGE_KEYS.CART_ITEMS);
        console.log('🗑️ Cart will be cleared');
      }
      
      // Hapus semua keys sekaligus dengan multiRemove - LEBIH EFISIEN!
      await AsyncStorage.multiRemove(keysToRemove);
      
      console.log('✅ Logout cleanup completed');
    } catch (error) {
      console.error('❌ Error during logout cleanup:', error);
      // Fallback: hapus token saja
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  },

  /**
   * Debug: Lihat semua keys di storage
   */
  debugStorage: async (): Promise<string[]> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('📋 Storage keys:', allKeys);
      return allKeys;
    } catch (error) {
      console.error('Error debugging storage:', error);
      return [];
    }
  }
};