import React, { useState, useEffect } from 'react'; // 🔥 BARU: Tambah useEffect
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import QuickLoginButton from '../components/QuickLoginButton';
import { KeychainService } from '../utils/keychain'; // 🔥 BARU: Import KeychainService

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const { login } = useAuth();
  
  // 🔥 BARU: State untuk biometry display name
  const [biometryDisplayName, setBiometryDisplayName] = useState('Biometrik');

  // 🔥 BARU: useEffect untuk load biometry info
  useEffect(() => {
    loadBiometryDisplayName();
  }, []);

  // 🔥 BARU: Fungsi untuk load biometry display name
  const loadBiometryDisplayName = async () => {
    try {
      const info = await KeychainService.getBiometryDisplayInfo();
      setBiometryDisplayName(info.displayName);
    } catch (error) {
      console.error('Error loading biometry display name:', error);
      // Fallback ke default
      setBiometryDisplayName('Biometrik');
    }
  };

  const handleManualLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }

    try {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + Date.now();
      await login(mockToken, enableBiometric);
      
      // 🔥 BARU: Gunakan biometry display name yang dynamic
      Alert.alert('Login Berhasil', 
        enableBiometric 
          ? `Login berhasil! Quick login dengan ${biometryDisplayName.toLowerCase()} diaktifkan.` 
          : 'Login berhasil!'
      );
    } catch (error) {
      Alert.alert('Login Gagal', 'Terjadi error saat login');
    }
  };

  const handleQuickLoginSuccess = () => {
    console.log('✅ Quick login success - user diarahkan otomatis');
  };

  const handleQuickLoginError = (error: string) => {
    console.log('Quick login error:', error);
  };

  // Handle not enrolled - show PIN modal
  const handleNotEnrolled = () => {
    console.log('🔄 Biometric not enrolled, showing PIN fallback');
    setShowPINModal(true);
  };

  // Handle lockout
  const handleLockout = () => {
    console.log('🔒 Lockout detected');
    // Force logout sudah dihandle di QuickLoginButton
  };

  const verifyPIN = async (pin: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(pin === '1234');
      }, 1000);
    });
  };

  const handlePINLogin = async () => {
    if (!pinCode || pinCode.length < 4) {
      Alert.alert('Error', 'PIN harus minimal 4 digit');
      return;
    }

    try {
      const isValidPIN = await verifyPIN(pinCode);
      
      if (isValidPIN) {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.PIN_' + Date.now();
        await login(mockToken, false);
        setShowPINModal(false);
        setPinCode('');
        Alert.alert('Login Berhasil', 'Login dengan PIN berhasil!');
      } else {
        Alert.alert('PIN Salah', 'PIN yang Anda masukkan tidak valid');
        setPinCode('');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi error saat verifikasi PIN');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Login</Text>

      {/* TOMBOL QUICK LOGIN */}
      <QuickLoginButton 
        onSuccess={handleQuickLoginSuccess}
        onError={handleQuickLoginError}
        onNotEnrolled={handleNotEnrolled}
        onLockout={handleLockout} // 🔥 BARU: Tambah onLockout handler
      />

      <Text style={styles.divider}>atau</Text>

      {/* FORM LOGIN MANUAL */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* SWITCH BIOMETRIC */}
        <View style={styles.biometricOption}>
          {/* 🔥 BARU: Gunakan biometry display name yang dynamic */}
          <Text style={styles.biometricText}>
            Aktifkan login cepat dengan {biometryDisplayName.toLowerCase()}
          </Text>
          <Switch
            value={enableBiometric}
            onValueChange={setEnableBiometric}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleManualLogin}>
          <Text style={styles.loginButtonText}>Login Manual</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL PIN FALLBACK */}
      <Modal
        visible={showPINModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPINModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Login dengan PIN</Text>
            {/* 🔥 BARU: Gunakan biometry display name yang dynamic */}
            <Text style={styles.modalSubtitle}>
              {biometryDisplayName} belum dikonfigurasi. Silakan gunakan PIN Anda.
            </Text>
            
            <TextInput
              style={styles.pinInput}
              placeholder="Masukkan PIN"
              value={pinCode}
              onChangeText={setPinCode}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              textAlign="center"
            />
            
            <Text style={styles.pinHint}>
              PIN default untuk demo: 1234
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.pinButton}
                onPress={handlePINLogin}
              >
                <Text style={styles.pinButtonText}>Login dengan PIN</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.pinButton, styles.cancelButton]}
                onPress={() => {
                  setShowPINModal(false);
                  setPinCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 32,
  },
  divider: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#666',
    fontSize: 16,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  biometricOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  biometricText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  pinHint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  pinButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  pinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});