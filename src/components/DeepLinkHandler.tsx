import React, { useEffect, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../api/productApi';
import { parseDeepLink, DeepLinkAction } from '../utils/deeplink';
import { Linking } from 'react-native';

/**
 * DeepLinkHandler - Component untuk handle deep link actions
 * Termasuk warm start (app background) dan URL events
 */
export default function DeepLinkHandler() {
  const navigation = useNavigation<any>();
  const { addToCart } = useCart();
  const { token } = useAuth();
  const appState = useRef(AppState.currentState);

  // Handle deep link action
  const handleDeepLinkAction = async (action: DeepLinkAction) => {
    try {
      console.log(`🎯 Handling deep link action: ${action.type}`, action.payload);

      switch (action.type) {
        case 'add-to-cart': {
          const { productId, quantity = 1 } = action.payload;
          
          if (!token) {
            Alert.alert(
              'Login Required',
              'Silakan login terlebih dahulu untuk menambahkan produk ke keranjang',
              [
                { text: 'Batal', style: 'cancel' },
                { 
                  text: 'Login', 
                  onPress: () => navigation.navigate('Login')
                }
              ]
            );
            return;
          }

          // Fetch product details
          const product = await productApi.getProduct(productId);
          
          // Add to cart
          addToCart({
            id: product.id,
            name: product.title,
            price: product.price,
            imageUrl: product.thumbnail,
            quantity: quantity,
          });

          Alert.alert(
            'Success 🎉',
            `"${product.title}" berhasil ditambahkan ke keranjang!`,
            [
              { text: 'Lanjut Belanja', style: 'cancel' },
              { 
                text: 'Lihat Keranjang', 
                onPress: () => navigation.navigate('CartScreen')
              }
            ]
          );
          break;
        }

        case 'view-product': {
          const { productId } = action.payload;
          navigation.navigate('ProductDetail', { productId });
          break;
        }

        case 'open-cart': {
          if (!token) {
            navigation.navigate('Login');
            return;
          }
          navigation.navigate('CartScreen');
          break;
        }

        case 'checkout': {
          if (!token) {
            navigation.navigate('Login');
            return;
          }
          // Navigate to checkout atau cart screen
          navigation.navigate('CartScreen');
          break;
        }

        default:
          console.warn(`⚠️ Unhandled deep link action: ${action.type}`);
      }
    } catch (error: any) {
      console.error('❌ Error handling deep link action:', error);
      Alert.alert('Error', `Gagal memproses deep link: ${error.message}`);
    }
  };

  // Handle URL events (cold start & warm start)
  const handleUrl = async (url: string | null) => {
    if (!url) return;

    console.log(`🔗 Deep link received: ${url}`);
    
    const action = parseDeepLink(url);
    if (action) {
      await handleDeepLinkAction(action);
    }
  };

  // Setup event listeners
  useEffect(() => {
    console.log('🔗 Setting up deep link listeners...');

    // Handle initial URL (cold start)
    Linking.getInitialURL().then(handleUrl);

    // Handle URL events (warm start)
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    // Handle app state changes untuk warm start
    const appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Jika app dari background ke active, cek jika ada pending deep link
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        Linking.getInitialURL().then(handleUrl);
      }
      
      appState.current = nextAppState;
    });

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up deep link listeners...');
      linkingSubscription.remove();
      appStateSubscription.remove();
    };
  }, []); // Empty dependency array karena kita mau setup sekali saja

  // Component ini tidak render apapun (invisible component)
  return null;
}