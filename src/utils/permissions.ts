import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

// ===============================
// IZIN PENYIMPANAN (Existing)
// ===============================
export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true; // iOS tidak perlu permission ini
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Izin Penyimpanan Foto',
        message: 'Aplikasi membutuhkan izin untuk menyimpan foto KTP ke galeri sebagai backup',
        buttonPositive: 'Izinkan',
        buttonNegative: 'Tolak',
        buttonNeutral: 'Nanti Saja',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Izin penyimpanan diberikan');
      return true;
    } else {
      console.log('Izin penyimpanan ditolak');
      return false;
    }
  } catch (err) {
    console.warn('Error requesting storage permission:', err);
    return false;
  }
};

// ===============================
// IZIN KAMERA (Existing)
// ===============================
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Izin Kamera',
        message: 'Aplikasi membutuhkan akses kamera untuk mengambil foto KTP',
        buttonPositive: 'Izinkan',
        buttonNegative: 'Tolak',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Error requesting camera permission:', err);
    return false;
  }
};

// ===============================
// 🔥 BARU: IZIN LOKASI UNTUK TOKO TERDEKAT
// ===============================
export const requestLocationPermission = async (): Promise<boolean> => {
  // Untuk iOS, kita akan handle dengan permission system yang berbeda
  if (Platform.OS !== 'android') {
    console.log('📍 Location permission handling for iOS would use different API');
    return true; // Untuk demo, return true. Di production perlu implementasi iOS location permission
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Izin Akses Lokasi',
        message: 'Kami butuh lokasi Anda untuk menampilkan toko terdekat secara akurat.',
        buttonPositive: 'Izinkan',
        buttonNegative: 'Tolak',
        buttonNeutral: 'Tanya Nanti',
      }
    );

    console.log('📍 Location permission result:', granted);

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('✅ Izin lokasi diberikan');
      return true;
    } else {
      console.log('❌ Izin lokasi ditolak');
      
      // 🔥 BARU: Tampilkan penjelasan tambahan jika user menolak
      if (granted === PermissionsAndroid.RESULTS.DENIED) {
        Alert.alert(
          'Izin Lokasi Diperlukan',
          'Fitur "Toko Terdekat" membutuhkan akses lokasi untuk menampilkan toko-toko di sekitar Anda. Anda dapat mengaktifkannya nanti di Settings.',
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Settings', 
              onPress: async () => {
                try {
                  // 🔥 PERBAIKAN: Gunakan Linking.openSettings() yang lebih universal
                  await Linking.openSettings();
                } catch (error) {
                  console.error('Error opening settings:', error);
                  Alert.alert('Error', 'Tidak dapat membuka pengaturan');
                }
              }
            }
          ]
        );
      }
      
      return false;
    }
  } catch (err) {
    console.warn('❌ Error requesting location permission:', err);
    return false;
  }
};

// ===============================
// 🔥 BARU: CEK STATUS IZIN LOKASI
// ===============================
export const checkLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true; // Untuk demo
  }

  try {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    console.log('📍 Location permission status:', result);
    return result;
  } catch (err) {
    console.warn('Error checking location permission:', err);
    return false;
  }
};

// ===============================
// 🔥 BARU: REQUEST MULTIPLE PERMISSIONS SEKALIGUS
// ===============================
export const requestMultiplePermissions = async (): Promise<{
  location: boolean;
  camera?: boolean;
  storage?: boolean;
}> => {
  if (Platform.OS !== 'android') {
    return { location: true };
  }

  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ];

    const granted = await PermissionsAndroid.requestMultiple(permissions);

    const results = {
      location: granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED,
      camera: granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED,
      storage: granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED,
    };

    console.log('🔐 Multiple permissions result:', results);
    return results;
  } catch (err) {
    console.warn('Error requesting multiple permissions:', err);
    return { location: false };
  }
};