import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { storage, STORAGE_KEYS } from '../utils/storage';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: (options?: { clearCart?: boolean }) => void; // UPDATE: tambah parameter options
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
      
      setToken(initialData.token);
      
      // Data lain bisa disimpan di state/context lain nanti
      console.log('Theme setting:', initialData.theme);
      console.log('Notification status:', initialData.notifications);
      
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      console.log(`AppInitialLoad: ${loadTime}ms`);
      setIsLoading(false);
    }
  };

  const login = async (newToken: string) => {
    await storage.setToken(newToken);
    setToken(newToken);
  };

  // UPDATE: Logout dengan cleanup options
  const logout = async (options?: { clearCart?: boolean }) => {
    try {
      console.log('🚪 Logging out with cleanup...');
      
      // Gunakan multiRemove untuk hapus data sensitif
      await storage.cleanupOnLogout(options);
      
      // Update state
      setToken(null);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Fallback: hapus token saja
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