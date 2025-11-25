import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { TokenValidator } from '../utils/tokenValidator';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

/**
 * ProtectedRoute - Wrapper untuk halaman yang membutuhkan authentication
 * Cek token di Keychain dan redirect ke login jika tidak valid
 */
export default function ProtectedRoute({ 
  children, 
  fallbackComponent 
}: ProtectedRouteProps) {
  const { token, isLoading } = useAuth();
  const navigation = useNavigation();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [token, isLoading]);

  const checkAuthStatus = async () => {
    try {
      if (isLoading) {
        return; // Tunggu sampai AuthContext selesai loading
      }

      if (!token) {
        console.log('🔐 ProtectedRoute: No token found');
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      // Validasi token expiry
      const shouldRedirect = await TokenValidator.checkTokenAndRedirect();
      
      if (shouldRedirect) {
        console.log('🔐 ProtectedRoute: Token expired, redirecting...');
        setIsValid(false);
      } else {
        console.log('🔐 ProtectedRoute: Token valid');
        setIsValid(true);
      }
    } catch (error) {
      console.error('🔐 ProtectedRoute: Error checking auth status:', error);
      setIsValid(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRedirectToLogin = () => {
    navigation.navigate('Login' as never);
  };

  // Loading state
  if (isLoading || isChecking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Memeriksa autentikasi...</Text>
      </View>
    );
  }

  // Jika tidak valid, tampilkan fallback atau redirect UI
  if (!isValid) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <View style={styles.center}>
        <Text style={styles.title}>Akses Dibatasi</Text>
        <Text style={styles.message}>
          Anda perlu login untuk mengakses halaman ini
        </Text>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleRedirectToLogin}
        >
          <Text style={styles.loginButtonText}>Login Sekarang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Token valid, render children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});