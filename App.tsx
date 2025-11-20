import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext';
import { WishlistProvider } from './src/context/WishlistContext';
import RootNavigator from './src/routes/RootNavigator';
import DeepLinkHandler from './src/components/DeepLinkHandler'; // BARU

// Deep Link Configuration
const linking = {
  prefixes: ['miniecom://'],
  config: {
    screens: {
      // Public routes
      Login: 'login',

      // Main app routes
      Drawer: {
        screens: {
          Home: 'home',
          Product: 'products',
          Profile: 'profile',
          CartScreen: 'cart',
        }
      },

      // Stack screens
      ProductDetail: 'product/:id',
      Checkout: 'checkout',

      // Deep link actions (bukan screen, tapi akan dihandle oleh DeepLinkHandler)
      'deep-link-actions': {
        screens: {
          'add-to-cart': 'add-to-cart/:productId',
          'view-product': 'view-product/:productId',
        }
      }
    },
  },
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NavigationContainer
            // linking={linking}
            fallback={
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
              </View>
            }
          >
            {/* BARU: Tambah DeepLinkHandler untuk handle warm start */}
            <DeepLinkHandler />
            <RootNavigator />
          </NavigationContainer>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}