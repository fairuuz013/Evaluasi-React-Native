import { Linking } from 'react-native';

// Types untuk deep link actions
export interface DeepLinkAction {
  type: 'add-to-cart' | 'view-product' | 'open-cart' | 'checkout';
  payload: any;
}

export interface AddToCartPayload {
  productId: number;
  quantity?: number;
}

export interface ViewProductPayload {
  productId: number;
}

/**
 * Parse deep link URL menjadi action object
 */
export const parseDeepLink = (url: string): DeepLinkAction | null => {
  try {
    console.log(`🔗 Parsing deep link: ${url}`);
    
    // Remove scheme prefix untuk parsing manual
    const cleanUrl = url.replace('miniecom://', '');
    
    // Split URL menjadi parts
    const parts = cleanUrl.split('/').filter(part => part.length > 0);
    
    if (parts.length === 0) {
      console.warn('⚠️ Empty deep link');
      return null;
    }
    
    const action = parts[0]; // 'add-to-cart', 'view-product', dll
    const productId = parts[1] ? parseInt(parts[1], 10) : null;
    
    switch (action) {
      case 'add-to-cart':
        if (!productId || isNaN(productId)) {
          console.error('❌ Invalid product ID in deep link');
          return null;
        }
        return {
          type: 'add-to-cart',
          payload: {
            productId,
            quantity: 1
          } as AddToCartPayload
        };
        
      case 'view-product':
        if (!productId || isNaN(productId)) {
          console.error('❌ Invalid product ID in deep link');
          return null;
        }
        return {
          type: 'view-product',
          payload: {
            productId
          } as ViewProductPayload
        };
        
      case 'cart':
        return {
          type: 'open-cart',
          payload: {}
        };
        
      case 'checkout':
        return {
          type: 'checkout',
          payload: {}
        };
        
      default:
        console.warn(`⚠️ Unknown deep link action: ${action}`);
        return null;
    }
  } catch (error) {
    console.error('❌ Error parsing deep link:', error);
    return null;
  }
};

/**
 * Generate deep link URL untuk add-to-cart
 */
export const generateAddToCartDeepLink = (productId: number): string => {
  return `miniecom://add-to-cart/${productId}`;
};

/**
 * Generate deep link URL untuk view-product
 */
export const generateViewProductDeepLink = (productId: number): string => {
  return `miniecom://view-product/${productId}`;
};

/**
 * Generate deep link URL untuk open cart
 */
export const generateOpenCartDeepLink = (): string => {
  return 'miniecom://cart';
};

/**
 * Generate deep link URL untuk checkout
 */
export const generateCheckoutDeepLink = (): string => {
  return 'miniecom://checkout';
};

/**
 * Validate product ID
 */
export const isValidProductId = (productId: number): boolean => {
  return Number.isInteger(productId) && productId > 0;
};

/**
 * Test deep link (untuk development)
 */
export const testDeepLink = async (url: string): Promise<void> => {
  try {
    console.log(`🧪 Testing deep link: ${url}`);
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
      console.log('✅ Deep link opened successfully');
    } else {
      console.error('❌ Cannot open deep link');
    }
  } catch (error) {
    console.error('❌ Error testing deep link:', error);
  }
};