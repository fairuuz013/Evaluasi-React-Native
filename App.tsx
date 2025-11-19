import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { CartProvider } from './src/context/CartContext';
import { AuthProvider } from './src/context/AuthContext'; // PASTIKAN PATH BENAR
import RootNavigator from './src/routes/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}