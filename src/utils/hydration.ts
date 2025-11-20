import { storage, STORAGE_KEYS } from './storage';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';

export interface HydrationResult {
  success: boolean;
  data: {
    user: {
      token: string | null;
      expiredAt: string | null;
    };
    theme: string | null;
    notifications: string | null;
    cart: any[];
    wishlist: {
      items: number[];
      meta: any;
    };
    products: any[];
    categories: any[];
  };
  errors: string[];
  duration: number;
}

export const hydrateAllData = async (): Promise<HydrationResult> => {
  const startTime = Date.now();
  const errors: string[] = [];
  
  try {
    console.log('🚀 Starting full app hydration...');

    // Load semua data secara paralel
    const [
      appData,
      cartData,
      wishlistData,
      productsData,
      categoriesData
    ] = await Promise.allSettled([
      // 1. Data aplikasi dasar
      storage.getAppInitialData(),
      
      // 2. Data cart
      storage.getCart(),
      
      // 3. Data wishlist
      Promise.all([
        storage.getWishlist(),
        storage.getWishlistMeta()
      ]),
      
      // 4. Data produk (cache atau API)
      productApi.getProducts().catch(() => []),
      
      // 5. Data kategori
      categoryApi.getCategories().catch(() => [])
    ]);

    // Process results
    const userData = appData.status === 'fulfilled' ? appData.value : {
      token: null,
      theme: null,
      notifications: null,
      expiredAt: null,
      wishlist: [],
      wishlistMeta: { count: 0, updatedAt: new Date().toISOString() }
    };

    const cart = cartData.status === 'fulfilled' ? cartData.value : [];
    
    const [wishlistItems, wishlistMeta] = wishlistData.status === 'fulfilled' 
      ? wishlistData.value 
      : [[], { count: 0, updatedAt: new Date().toISOString() }];

    const products = productsData.status === 'fulfilled' ? productsData.value : [];
    const categories = categoriesData.status === 'fulfilled' ? categoriesData.value : [];

    // Collect errors
    if (appData.status === 'rejected') errors.push('App data loading failed');
    if (cartData.status === 'rejected') errors.push('Cart loading failed');
    if (wishlistData.status === 'rejected') errors.push('Wishlist loading failed');
    if (productsData.status === 'rejected') errors.push('Products loading failed');
    if (categoriesData.status === 'rejected') errors.push('Categories loading failed');

    const duration = Date.now() - startTime;
    
    console.log(`✅ Hydration completed in ${duration}ms`, {
      user: !!userData.token,
      cartItems: cart.length,
      wishlistItems: wishlistItems.length,
      products: products.length,
      categories: categories.length,
      errors: errors.length
    });

    return {
      success: errors.length === 0,
      data: {
        user: {
          token: userData.token,
          expiredAt: userData.expiredAt
        },
        theme: userData.theme,
        notifications: userData.notifications,
        cart,
        wishlist: {
          items: wishlistItems,
          meta: wishlistMeta
        },
        products,
        categories
      },
      errors,
      duration
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Hydration failed:', error);
    
    return {
      success: false,
      data: {
        user: { token: null, expiredAt: null },
        theme: null,
        notifications: null,
        cart: [],
        wishlist: { items: [], meta: { count: 0, updatedAt: new Date().toISOString() } },
        products: [],
        categories: []
      },
      errors: ['Hydration process failed'],
      duration
    };
  }
};