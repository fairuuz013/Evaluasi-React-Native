import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { View, Text } from 'react-native'; // IMPORT Text
import { storage } from '../utils/storage';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const savedToken = await storage.getToken();
      setToken(savedToken);
    } catch (error) {
      console.error('Error checking token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string) => {
    await storage.setToken(newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await storage.removeToken();
    setToken(null);
  };

  // FIX: Jangan return string langsung
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text> {/* PAKAI TEXT COMPONENT */}
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};