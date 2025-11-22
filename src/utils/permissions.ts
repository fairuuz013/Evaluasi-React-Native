import { PermissionsAndroid, Platform, Alert } from 'react-native';

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