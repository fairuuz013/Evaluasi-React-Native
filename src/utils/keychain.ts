import { Platform } from 'react-native';
import * as Keychain from 'react-native-keychain';

// 🔥 BARU: Types untuk biometry type
export type BiometryType = 'FaceID' | 'TouchID' | 'Biometrics' | 'None';

export const KeychainService = {
  // ===============================
  // 🔥 BARU: GET DETAILED BIOMETRY TYPE
  // ===============================
  getBiometryType: async (): Promise<BiometryType> => {
    try {
      const supported = await Keychain.getSupportedBiometryType();
      
      console.log('🔍 Raw biometry type:', supported);
      
      if (!supported) {
        return 'None';
      }
      
      // Mapping biometry type ke label yang user-friendly
      if (supported === Keychain.BIOMETRY_TYPE.FACE_ID) {
        return 'FaceID';
      } else if (supported === Keychain.BIOMETRY_TYPE.FACE) {
        return 'FaceID';
      } else if (supported === Keychain.BIOMETRY_TYPE.TOUCH_ID) {
        return 'TouchID';
      } else if (supported === Keychain.BIOMETRY_TYPE.FINGERPRINT) {
        return 'TouchID';
      } else if (supported === Keychain.BIOMETRY_TYPE.IRIS) {
        return 'Biometrics';
      } else {
        return 'Biometrics';
      }
    } catch (error) {
      console.error('❌ Error getting biometry type:', error);
      return 'None';
    }
  },

  // ===============================
  // 🔥 BARU: GET BIOMETRY DISPLAY INFO
  // ===============================
  getBiometryDisplayInfo: async (): Promise<{
    type: BiometryType;
    displayName: string;
    buttonText: string;
    hintText: string;
    promptMessage: string;
  }> => {
    const biometryType = await KeychainService.getBiometryType();
    
    switch (biometryType) {
      case 'FaceID':
        return {
          type: 'FaceID',
          displayName: 'Face ID',
          buttonText: '📱 Login dengan Face ID',
          hintText: 'Gunakan Face ID untuk login cepat',
          promptMessage: 'Pindai Wajah untuk Masuk'
        };
        
      case 'TouchID':
        return {
          type: 'TouchID',
          displayName: 'Touch ID',
          buttonText: '👆 Login dengan Touch ID',
          hintText: 'Gunakan sidik jari untuk login cepat',
          promptMessage: 'Tempelkan Jari untuk Masuk'
        };
        
      case 'Biometrics':
        return {
          type: 'Biometrics',
          displayName: 'Biometrik',
          buttonText: '🔐 Login dengan Biometrik',
          hintText: 'Gunakan biometrik untuk login cepat',
          promptMessage: 'Autentikasi Biometrik untuk Masuk'
        };
        
      default:
        return {
          type: 'None',
          displayName: 'Biometrik',
          buttonText: '🔐 Login dengan Biometrik',
          hintText: 'Gunakan biometrik untuk login cepat',
          promptMessage: 'Autentikasi Biometrik untuk Masuk'
        };
    }
  },

  // ===============================
  // CEK TOKEN ADA ATAU TIDAK
  // ===============================
  hasStoredToken: async (): Promise<boolean> => {
    try {
      const result = await Keychain.getGenericPassword();
      return !!result;
    } catch (err) {
      console.log('❌ Error checking stored token:', err);
      return false;
    }
  },

  // ===============================
  // AMBIL TOKEN BIASA
  // ===============================
  getToken: async (): Promise<string | null> => {
    try {
      const result = await Keychain.getGenericPassword();
      if (!result) return null;
      return result.password;
    } catch (err) {
      console.log('❌ Error getting token:', err);
      return null;
    }
  },

  // ===============================
  // DETEKSI LOCKOUT & FATAL ERRORS
  // ===============================
  isLockoutError: (error: any): boolean => {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toString() || '';
    
    const lockoutIndicators = [
      'lockout',
      'locked',
      'too many attempts',
      'maximum attempts',
      'authentication failed too many times',
      'biometric locked',
      'permanently locked',
      'not available',
      'hardware not available'
    ];
    
    const fatalErrorCodes = [
      'LOCKOUT',
      'TIMEOUT',
      'UNABLE_TO_AUTHENTICATE',
      'HARDWARE_UNAVAILABLE'
    ];
    
    const isLockout = 
      lockoutIndicators.some(indicator => errorMessage.includes(indicator)) ||
      fatalErrorCodes.some(code => errorCode.includes(code));
    
    console.log('🔒 Lockout detection:', {
      errorMessage,
      errorCode,
      isLockout
    });
    
    return isLockout;
  },

  // ===============================
  // CEK SENSOR AVAILABLE + NOT ENROLLED
  // ===============================
  isSensorAvailable: async (): Promise<{ 
    available: boolean; 
    error?: string;
    isNotEnrolled?: boolean;
    isLockout?: boolean;
    biometryType?: BiometryType; // 🔥 BARU: Include biometry type
  }> => {
    try {
      const supported = await Keychain.getSupportedBiometryType();
      
      if (supported === null) {
        return { 
          available: false, 
          error: 'Biometric tidak tersedia di device ini' 
        };
      }

      // 🔥 BARU: Get biometry type untuk response
      const biometryType = await KeychainService.getBiometryType();

      // Coba test authentication untuk detect "Not Enrolled"
      try {
        const testResult = await Keychain.getGenericPassword({
          authenticationPrompt: {
            title: 'Test Biometric',
            subtitle: 'Testing biometric availability',
          }
        });
        
        // Jika sampai sini tanpa error, sensor available dan enrolled
        return { 
          available: true,
          biometryType // 🔥 BARU: Include biometry type
        };
      } catch (testError: any) {
        console.log('🔍 Biometric test error:', testError);
        
        // Check untuk "Not Enrolled" error
        const errorMessage = testError.message?.toLowerCase() || '';
        const errorCode = testError.code?.toString() || '';
        
        const isNotEnrolled = 
          errorMessage.includes('not enrolled') ||
          errorMessage.includes('no biometric') ||
          errorMessage.includes('enrolled') ||
          errorCode.includes('NOT_ENROLLED') ||
          errorCode.includes('BIOMETRIC_NOT_ENROLLED');
        
        // Check untuk lockout
        const isLockout = KeychainService.isLockoutError(testError);
        
        if (isLockout) {
          return { 
            available: false, 
            error: 'Biometric sensor locked due to too many failed attempts',
            isLockout: true,
            biometryType // 🔥 BARU: Include biometry type
          };
        }
        
        if (isNotEnrolled) {
          return { 
            available: false, 
            error: 'Biometric not enrolled',
            isNotEnrolled: true,
            biometryType // 🔥 BARU: Include biometry type
          };
        }
        
        return { 
          available: false, 
          error: `Biometric error: ${testError.message}`,
          biometryType // 🔥 BARU: Include biometry type
        };
      }
    } catch (err: any) {
      console.log('❌ Error checking sensor availability:', err);
      return { 
        available: false, 
        error: err.message || 'Unknown error checking biometric' 
      };
    }
  },

  // ===============================
  // CEK BIOMETRIC SUPPORT
  // ===============================
  isBiometricSupported: async (): Promise<boolean> => {
    try {
      const supported = await Keychain.getSupportedBiometryType();
      return supported !== null;
    } catch (err) {
      console.log('❌ Error checking biometric support:', err);
      return false;
    }
  },

  // ===============================
  // SIMPAN TOKEN + BIOMETRIC
  // ===============================
  saveToken: async (token: string, enableBiometric = false): Promise<boolean> => {
    try {
      let options: any = {
        service: 'com.miniecommerce.auth',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      };

      if (enableBiometric) {
        options = {
          ...options,
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
          authenticationPrompt:
            Platform.OS === 'ios'
              ? { title: 'Authenticate to enable quick login' }
              : 'Authenticate to enable quick login',
        };
      }

      await Keychain.setGenericPassword('authUser', token, options);
      return true;
    } catch (err) {
      console.log('❌ Error saving token:', err);
      return false;
    }
  },

  // ===============================
  // AMBIL TOKEN DENGAN BIOMETRIC + LOCKOUT HANDLING
  // ===============================
  getTokenWithBiometric: async (): Promise<{ 
    token: string | null; 
    isLockout?: boolean;
    error?: string;
  }> => {
    try {
      // 🔥 BARU: Get biometry info untuk prompt yang personalized
      const biometryInfo = await KeychainService.getBiometryDisplayInfo();
      
      const biometricOptions: any =
        Platform.OS === 'ios'
          ? {
              authenticationPrompt: {
                title: 'Authenticate to login',
                subtitle: biometryInfo.promptMessage, // 🔥 BARU: Gunakan prompt yang personalized
              },
            }
          : {
              authenticationPrompt: biometryInfo.promptMessage, // 🔥 BARU: Gunakan prompt yang personalized
            };

      const result = await Keychain.getGenericPassword(biometricOptions);

      if (!result) return { token: null };
      return { token: result.password };
    } catch (err: any) {
      console.log('❌ Error getting token with biometric:', err);
      
      // Deteksi lockout error
      const isLockout = KeychainService.isLockoutError(err);
      
      if (isLockout) {
        console.log('🚨 BIOMETRIC LOCKOUT DETECTED - FORCING SECURITY CLEANUP');
        return { 
          token: null, 
          isLockout: true,
          error: 'Biometric sensor locked due to security violations'
        };
      }
      
      if (err.message?.includes('canceled')) {
        return { token: null };
      }
      
      return { token: null, error: err.message };
    }
  },

  // ===============================
  // SIMPLE PROMPT UNTUK KONFIRMASI TRANSAKSI + LOCKOUT HANDLING
  // ===============================
  simplePrompt: async (
    promptMessage: string, 
    config?: {
      title?: string;
      subtitle?: string;
      description?: string;
      cancel?: string;
    }
  ): Promise<{ 
    success: boolean; 
    isLockout?: boolean;
    error?: string;
  }> => {
    try {
      console.log('🔐 Starting biometric prompt for transaction...');
      
      // Cek sensor availability dulu
      const sensorCheck = await KeychainService.isSensorAvailable();
      
      if (!sensorCheck.available) {
        if (sensorCheck.isLockout) {
          return { 
            success: false, 
            isLockout: true,
            error: 'Biometric sensor locked - security violation detected'
          };
        }
        if (sensorCheck.isNotEnrolled) {
          return { 
            success: false, 
            error: 'NOT_ENROLLED' 
          };
        }
        return { 
          success: false, 
          error: sensorCheck.error || 'Biometric not available' 
        };
      }
      
      // 🔥 BARU: Get biometry info untuk prompt yang personalized
      const biometryInfo = await KeychainService.getBiometryDisplayInfo();
      
      const credentials = await Keychain.getGenericPassword({
        service: 'com.miniecommerce.auth',
        authenticationPrompt: {
          title: config?.title || 'Konfirmasi Transaksi',
          subtitle: config?.subtitle || promptMessage,
          description: config?.description || biometryInfo.promptMessage, // 🔥 BARU: Gunakan prompt personalized
          cancel: config?.cancel || 'Batal'
        }
      });
      
      // Jika berhasil authenticate, return true
      if (credentials) {
        console.log('✅ Biometric confirmation successful');
        return { success: true };
      }
      
      console.log('❌ Biometric confirmation failed or canceled');
      return { success: false };
    } catch (error: any) {
      console.error('❌ Biometric prompt error:', error);
      
      // Deteksi lockout dalam simplePrompt
      const isLockout = KeychainService.isLockoutError(error);
      
      if (isLockout) {
        console.log('🚨 TRANSACTION LOCKOUT DETECTED - FORCING SECURITY CLEANUP');
        return { 
          success: false, 
          isLockout: true,
          error: 'Security violation detected - biometric locked'
        };
      }
      
      if (error.message === 'NOT_ENROLLED') {
        return { 
          success: false, 
          error: 'NOT_ENROLLED' 
        };
      }
      
      return { 
        success: false, 
        error: error.message 
      };
    }
  },

  // ===============================
  // FORCE SECURITY CLEANUP - HAPUS SEMUA DATA SENSITIF
  // ===============================
  emergencyCleanup: async (): Promise<boolean> => {
    try {
      console.log('🚨 EMERGENCY SECURITY CLEANUP INITIATED');
      
      // Hapus semua credential dari Keychain
      await Keychain.resetGenericPassword();
      
      // Hapus specific service credentials juga
      await Keychain.resetGenericPassword({ service: 'com.miniecommerce.auth' });
      
      console.log('✅ Emergency security cleanup completed');
      return true;
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
      return false;
    }
  },

  // ===============================
  // HAPUS TOKEN
  // ===============================
  deleteToken: async (): Promise<boolean> => {
    try {
      return await Keychain.resetGenericPassword();
    } catch (err) {
      console.log('❌ Error deleting token:', err);
      return false;
    }
  },
};