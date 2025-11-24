import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { KeychainService } from '../utils/keychain';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  isQuickLoginAvailable: boolean;
  login: (token: string, enableBiometric?: boolean) => void;
  quickLogin: () => Promise<boolean>;
  logout: (options?: { clearCart?: boolean }) => void;
  forceLogout: (reason?: string) => Promise<void>; // 🔥 BARU: Force logout untuk lockout
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isLoading: true,
  isQuickLoginAvailable: false,
  login: () => {},
  quickLogin: async () => false,
  logout: () => {},
  forceLogout: async () => {}, // 🔥 BARU
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuickLoginAvailable, setIsQuickLoginAvailable] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const startTime = Date.now();
    
    try {
      const initialData = await storage.getAppInitialData();
      const isExpired = await storage.isTokenExpired();
      
      if (initialData.token && !isExpired) {
        setToken(initialData.token);
        console.log('✅ Token valid, user authenticated');
        
        const hasKeychainToken = await KeychainService.getToken();
        setIsQuickLoginAvailable(!!hasKeychainToken);
      } else if (initialData.token && isExpired) {
        console.log('🚫 Token expired, auto logout');
        await storage.cleanupOnLogout();
        await KeychainService.deleteToken();
        setToken(null);
        setIsQuickLoginAvailable(false);
      } else {
        setToken(null);
        setIsQuickLoginAvailable(false);
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      setToken(null);
      setIsQuickLoginAvailable(false);
    } finally {
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      console.log(`AppInitialLoad: ${loadTime}ms`);
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, enableBiometric: boolean = false) => {
    try {
      await storage.setToken(newToken, 60);
      setToken(newToken);
      
      const keychainSuccess = await KeychainService.saveToken(newToken, enableBiometric);
      setIsQuickLoginAvailable(keychainSuccess);
      
      console.log(`✅ Login successful, quick login ${keychainSuccess ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  // 🔥 UPDATE: Quick Login dengan lockout handling
  const quickLogin = async (): Promise<boolean> => {
    try {
      console.log('🔐 Attempting quick login...');
      
      const result = await KeychainService.getTokenWithBiometric();
      
      if (result.isLockout) {
        // 🔥 BARU: Trigger force logout jika detect lockout
        console.log('🚨 Lockout detected during quick login, forcing security cleanup');
        await forceLogout('Biometric lockout detected');
        return false;
      }
      
      if (result.token) {
        await storage.setToken(result.token, 60);
        setToken(result.token);
        console.log('✅ Quick login successful');
        return true;
      }
      
      console.log('❌ Quick login failed');
      return false;
    } catch (error) {
      console.error('Error during quick login:', error);
      return false;
    }
  };

  const logout = async (options?: { clearCart?: boolean }) => {
    try {
      console.log('🚪 Logging out with cleanup...');
      await storage.cleanupOnLogout(options);
      await KeychainService.deleteToken();
      setToken(null);
      setIsQuickLoginAvailable(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      await storage.removeToken();
      await KeychainService.deleteToken();
      setToken(null);
      setIsQuickLoginAvailable(false);
    }
  };

  // 🔥 BARU: Force Logout untuk security lockout
  const forceLogout = async (reason: string = 'Security violation'): Promise<void> => {
    try {
      console.log(`🚨 FORCE LOGOUT INITIATED: ${reason}`);
      
      /**
       * PENTING: Force logout ini critical untuk keamanan karena:
       * 1. Menghapus semua data sensitif secara immediate
       * 2. Mencegah further access attempts selama sensor terkunci
       * 3. Memaksa user untuk login ulang dengan metode yang lebih secure
       * 4. Melindungi dari brute force attacks pada biometric sensor
       */
      
      // 1. Emergency cleanup Keychain - hapus semua data sensitif
      await KeychainService.emergencyCleanup();
      
      // 2. Clear semua local storage
      await storage.cleanupOnLogout({ clearCart: true });
      
      // 3. Reset state
      setToken(null);
      setIsQuickLoginAvailable(false);
      
      // 4. Show security alert kepada user
      Alert.alert(
        'Security Alert',
        `Untuk keamanan akun Anda, kami telah melakukan logout otomatis. 
        
Alasan: ${reason}

Silakan login kembali menggunakan email dan password.`,
        [{ text: 'OK' }]
      );
      
      console.log('✅ Force logout completed successfully');
      
    } catch (error) {
      console.error('❌ Force logout failed:', error);
      
      // Fallback: Force reset state meskipun cleanup gagal
      setToken(null);
      setIsQuickLoginAvailable(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      token, 
      isLoading, 
      isQuickLoginAvailable,
      login, 
      quickLogin,
      logout,
      forceLogout // 🔥 BARU: Expose forceLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);