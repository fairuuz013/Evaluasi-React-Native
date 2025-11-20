import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: (options?: { clearCart?: boolean }) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const startTime = Date.now();
    
    try {
      // MULTI-GET: Ambil semua data penting sekaligus
      const initialData = await storage.getAppInitialData();
      
      // BARU: Cek apakah token sudah expired
      const isExpired = await storage.isTokenExpired();
      
      if (initialData.token && !isExpired) {
        // Token valid, set token
        setToken(initialData.token);
        console.log('✅ Token valid, user authenticated');
      } else if (initialData.token && isExpired) {
        // Token expired, auto logout
        console.log('🚫 Token expired, auto logout');
        await storage.cleanupOnLogout();
        setToken(null);
      } else {
        // Tidak ada token
        setToken(null);
      }
      
      // Data lain tetap di-load
      console.log('Theme setting:', initialData.theme);
      console.log('Notification status:', initialData.notifications);
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      setToken(null); // Fallback: assume not logged in
    } finally {
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      console.log(`AppInitialLoad: ${loadTime}ms`);
      setIsLoading(false);
    }
  };

  const login = async (newToken: string) => {
    // BARU: Set token dengan expiry default 60 menit
    await storage.setToken(newToken, 60); // 60 menit expiry
    setToken(newToken);
  };

  // Logout tetap sama...
  const logout = async (options?: { clearCart?: boolean }) => {
    try {
      console.log('🚪 Logging out with cleanup...');
      await storage.cleanupOnLogout(options);
      setToken(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      await storage.removeToken();
      setToken(null);
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
    <AuthContext.Provider value={{ token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);