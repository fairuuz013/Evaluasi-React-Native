import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeychainService } from './keychain';

// ==============================
// STORAGE KEYS
// ==============================
export const STORAGE_KEYS = {
  THEME_MODE: 'theme_mode',
  NOTIFICATION_STATUS: 'notification_status',
  CART_ITEMS: 'cart_items',
  TOKEN_EXPIRED_AT: 'token_expired_at',
  WISHLIST_ITEMS: 'wishlist_items',
  WISHLIST_META: 'wishlist_meta',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// Interface untuk Wishlist
export interface WishlistMeta {
  count: number;
  updatedAt: string;
}

export interface DebugStorageInfo {
  keys: string[];
  keychainStatus: string;
  expiredAt?: string | null;
  wishlistCount?: number;
}

// SIMPLIFIED STORAGE OBJECT - HAPUS INTERFACE COMPLEX
export const storage = {
  // ===== TOKEN FUNCTIONS =====
  setToken: async (token: string, expiresInMinutes: number = 60): Promise<void> => {
    const success = await KeychainService.saveToken(token);
    if (!success) {
      throw new Error('Failed to save token to secure storage');
    }
    
    const expiredAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRED_AT, expiredAt);
    console.log(`✅ Token expiry set: ${expiredAt}`);
  },

  getToken: async (): Promise<string | null> => {
    return await KeychainService.getToken();
  },

  getTokenExpiry: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRED_AT);
  },

  isTokenExpired: async (): Promise<boolean> => {
    try {
      const expiredAt = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRED_AT);
      if (!expiredAt) return true;
      
      const now = new Date();
      const expiryDate = new Date(expiredAt);
      const isExpired = now >= expiryDate;
      
      console.log(`🔍 Token expiry check: ${expiredAt}, Now: ${now.toISOString()}, Expired: ${isExpired}`);
      return isExpired;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  },

  removeToken: async (): Promise<void> => {
    await KeychainService.deleteToken();
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRED_AT);
  },

  // ===== APP DATA FUNCTIONS =====
  getAppInitialData: async (): Promise<{
    token: string | null;
    theme: string | null;
    notifications: string | null;
    expiredAt: string | null;
    wishlist: number[];
    wishlistMeta: WishlistMeta;
  }> => {
    try {
      const keys = [
        STORAGE_KEYS.THEME_MODE,
        STORAGE_KEYS.NOTIFICATION_STATUS,
        STORAGE_KEYS.TOKEN_EXPIRED_AT,
        STORAGE_KEYS.WISHLIST_ITEMS,
        STORAGE_KEYS.WISHLIST_META,
      ];

      const values = await AsyncStorage.multiGet(keys);
      const token = await KeychainService.getToken();

      return {
        token: token,
        theme: values[0][1],
        notifications: values[1][1],
        expiredAt: values[2][1],
        wishlist: values[3][1] ? JSON.parse(values[3][1]) : [],
        wishlistMeta: values[4][1] ? JSON.parse(values[4][1]) : {
          count: 0,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error in multiGet:', error);
      return {
        token: null,
        theme: null,
        notifications: null,
        expiredAt: null,
        wishlist: [],
        wishlistMeta: {
          count: 0,
          updatedAt: new Date().toISOString()
        }
      };
    }
  },

  // ===== CART FUNCTIONS =====
  saveCart: async (cartItems: any[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CART_ITEMS,
        JSON.stringify(cartItems)
      );
      console.log('🛒 Cart saved:', cartItems.length, 'items');
    } catch (error: any) {
      console.error('Error saving cart:', error);
      throw error;
    }
  },

  getCart: async (): Promise<any[]> => {
    try {
      const cartData = await AsyncStorage.getItem(STORAGE_KEYS.CART_ITEMS);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  },

  mergeCartItem: async (itemId: number, updates: Partial<any>): Promise<void> => {
    try {
      const currentCart = await storage.getCart();
      const updatedCart = currentCart.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      await storage.saveCart(updatedCart);
    } catch (error) {
      console.error('Error merging cart item:', error);
      throw error;
    }
  },

  clearCart: async (): Promise<void> => {
    await AsyncStorage.removeItem(STORAGE_KEYS.CART_ITEMS);
  },

  // ===== WISHLIST FUNCTIONS =====
  getWishlist: async (): Promise<number[]> => {
    try {
      const wishlistData = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST_ITEMS);
      return wishlistData ? JSON.parse(wishlistData) : [];
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return [];
    }
  },

  saveWishlist: async (productIds: number[]): Promise<void> => {
    try {
      const meta: WishlistMeta = {
        count: productIds.length,
        updatedAt: new Date().toISOString()
      };

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.WISHLIST_ITEMS, JSON.stringify(productIds)],
        [STORAGE_KEYS.WISHLIST_META, JSON.stringify(meta)]
      ]);

      console.log('💖 Wishlist saved:', productIds.length, 'items');
    } catch (error) {
      console.error('Error saving wishlist:', error);
      throw error;
    }
  },

  addToWishlist: async (productId: number): Promise<void> => {
    try {
      const currentWishlist = await storage.getWishlist();
      if (currentWishlist.includes(productId)) {
        return;
      }
      const updatedWishlist = [...currentWishlist, productId];
      await storage.saveWishlist(updatedWishlist);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  removeFromWishlist: async (productId: number): Promise<void> => {
    try {
      const currentWishlist = await storage.getWishlist();
      const updatedWishlist = currentWishlist.filter(id => id !== productId);
      await storage.saveWishlist(updatedWishlist);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  toggleWishlist: async (productId: number): Promise<boolean> => {
    try {
      const currentWishlist = await storage.getWishlist();
      const isInWishlist = currentWishlist.includes(productId);
      
      if (isInWishlist) {
        await storage.removeFromWishlist(productId);
        return false;
      } else {
        await storage.addToWishlist(productId);
        return true;
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  },

  getWishlistMeta: async (): Promise<WishlistMeta> => {
    try {
      const metaData = await AsyncStorage.getItem(STORAGE_KEYS.WISHLIST_META);
      return metaData ? JSON.parse(metaData) : {
        count: 0,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting wishlist meta:', error);
      return {
        count: 0,
        updatedAt: new Date().toISOString()
      };
    }
  },

  isInWishlist: async (productId: number): Promise<boolean> => {
    try {
      const wishlist = await storage.getWishlist();
      return wishlist.includes(productId);
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  },

  // ===== CLEANUP FUNCTIONS =====
  cleanupOnLogout: async (options?: { clearCart?: boolean }): Promise<void> => {
    try {
      console.log('🧹 Cleaning up on logout...');
      await KeychainService.deleteToken();

      const keysToRemove = [STORAGE_KEYS.TOKEN_EXPIRED_AT];
      if (options?.clearCart) {
     
      }

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }

      console.log('✅ Logout cleanup completed');
    } catch (error) {
      console.error('❌ Error during logout cleanup:', error);
      await KeychainService.deleteToken();
    }
  },

  // ===== DEBUGGING =====
  debugStorage: async (): Promise<DebugStorageInfo> => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const token = await KeychainService.getToken();
      const expiredAt = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRED_AT);
      const wishlistMeta = await storage.getWishlistMeta();
      
      return {
        keys: [...allKeys],
        keychainStatus: token ? '✅ Token exists in Keychain' : '❌ No token in Keychain',
        expiredAt: expiredAt,
        wishlistCount: wishlistMeta.count
      };
    } catch (error) {
      console.error('Error debugging storage:', error);
      return {
        keys: [],
        keychainStatus: '❌ Error checking Keychain',
        expiredAt: null,
        wishlistCount: 0
      };
    }
  },
};