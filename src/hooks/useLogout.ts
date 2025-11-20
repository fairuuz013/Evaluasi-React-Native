import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const useLogout = () => {
  const navigation = useNavigation();
  const { logout: authLogout } = useAuth();
  const { clearCart: contextClearCart } = useCart();

  const logout = useCallback(async (options?: { clearCart?: boolean }) => {
    try {
      console.log('🚪 Starting logout process...');
      
      // Cek apakah ada cleanup yang sedang berjalan
      const isCleanupInProgress = await storage.isCleanupInProgress();
      if (isCleanupInProgress) {
        console.log('⚠️ Cleanup already in progress, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Clear context states terlebih dahulu
      contextClearCart();
      authLogout(options);

      // Clear storage
      await storage.clearAllStorage();

      // Reset navigation ke LoginScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });

      console.log('✅ Logout completed successfully');
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      
      // Fallback: tetap reset navigation meski ada error
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
    }
  }, [navigation, authLogout, contextClearCart]);

  return { logout };
};