import React, { useState, useEffect } from 'react'; // 🔥 BARU: Tambah useEffect
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  View,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { KeychainService, BiometryType } from '../utils/keychain'; // 🔥 BARU: Import types

interface QuickLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onNotEnrolled?: () => void;
  onLockout?: () => void;
}

const QuickLoginButton: React.FC<QuickLoginButtonProps> = ({
  onSuccess,
  onError,
  onNotEnrolled,
  onLockout
}) => {
  const { quickLogin, isQuickLoginAvailable, forceLogout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // 🔥 BARU: State untuk biometry type dan display info
  const [biometryInfo, setBiometryInfo] = useState<{
    type: BiometryType;
    displayName: string;
    buttonText: string;
    hintText: string;
    promptMessage: string;
  } | null>(null);

  // 🔥 BARU: useEffect untuk load biometry info saat komponen mount
  useEffect(() => {
    loadBiometryInfo();
  }, []);

  // 🔥 BARU: Fungsi untuk load biometry info
  const loadBiometryInfo = async () => {
    try {
      const info = await KeychainService.getBiometryDisplayInfo();
      setBiometryInfo(info);
      console.log('📱 Biometry info loaded:', info);
    } catch (error) {
      console.error('❌ Error loading biometry info:', error);
      // Fallback ke default
      setBiometryInfo({
        type: 'Biometrics',
        displayName: 'Biometrik',
        buttonText: '🔐 Login dengan Biometrik',
        hintText: 'Gunakan biometrik untuk login cepat',
        promptMessage: 'Autentikasi Biometrik untuk Masuk'
      });
    }
  };

  const openBiometricSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:TOUCHID_PASSCODE');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('❌ Error opening settings:', error);
      Alert.alert('Error', 'Tidak dapat membuka pengaturan device');
    }
  };

  const handleQuickLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      console.log('🔐 Starting quick login process...');

      // Cek sensor availability sebelum quick login
      const sensorCheck = await KeychainService.isSensorAvailable();

      // Handle lockout pada pre-check
      if (sensorCheck.isLockout) {
        console.log('🚨 Lockout detected in pre-check, forcing security cleanup');
        onLockout?.();
        await forceLogout('Biometric sensor locked - too many failed attempts');
        return;
      }

      if (!sensorCheck.available) {
        if (sensorCheck.isNotEnrolled) {
          console.log('❌ Biometric not enrolled, showing PIN fallback');
          onNotEnrolled?.();
          
          // 🔥 BARU: Gunakan display name yang sesuai
          const displayName = biometryInfo?.displayName || 'Biometrik';
          
          Alert.alert(
            `${displayName} Belum Dikonfigurasi`,
            `${displayName} belum diatur di HP ini. Silakan atur di Settings atau gunakan PIN manual.`,
            [
              { text: 'Settings', onPress: openBiometricSettings },
              { text: 'Gunakan PIN', onPress: () => onNotEnrolled?.() },
              { text: 'Batal', style: 'cancel' }
            ]
          );
          return;
        } else {
          const errorMsg = sensorCheck.error || 'Biometric tidak tersedia';
          console.log('❌', errorMsg);
          onError?.(errorMsg);
          Alert.alert('Biometric Error', errorMsg);
          return;
        }
      }

      // Jika sensor available, lanjut dengan quick login
      const success = await quickLogin();

      if (success) {
        console.log('✅ Quick login berhasil');
        onSuccess?.();
      } else {
        const errorMsg = 'Autentikasi gagal atau dibatalkan. Silakan login manual.';
        console.log('❌', errorMsg);
        onError?.(errorMsg);
        Alert.alert('Login Gagal', errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Quick login error:', error);

      // Handle NOT_ENROLLED error
      if (error.message === 'NOT_ENROLLED') {
        onNotEnrolled?.();
        
        // 🔥 BARU: Gunakan display name yang sesuai
        const displayName = biometryInfo?.displayName || 'Biometrik';
        
        Alert.alert(
          `${displayName} Belum Dikonfigurasi`,
          `${displayName} belum diatur di HP ini. Silakan gunakan PIN manual.`,
          [
            { text: 'Gunakan PIN', onPress: () => onNotEnrolled?.() },
            { text: 'Batal', style: 'cancel' }
          ]
        );
      } 
      // Handle LOCKOUT error
      else if (error.message?.includes('lockout') || error.isLockout) {
        console.log('🚨 Lockout detected in error handling');
        onLockout?.();
        await forceLogout('Security violation - biometric lockout detected');
      }
      else {
        const errorMsg = error.message || 'Terjadi error saat quick login';
        onError?.(errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isQuickLoginAvailable || !biometryInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleQuickLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          // 🔥 BARU: Gunakan button text yang dynamic
          <Text style={styles.buttonText}>{biometryInfo.buttonText}</Text>
        )}
      </TouchableOpacity>
      
      {/* 🔥 BARU: Gunakan hint text yang dynamic */}
      <Text style={styles.hint}>
        {biometryInfo.hintText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default QuickLoginButton;