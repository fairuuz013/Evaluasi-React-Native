import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Alert, Platform } from 'react-native';
import { requestStoragePermission, requestCameraPermission } from './permissions';

export interface KTPPhoto {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  savedToGallery?: boolean;
}

export const requestStoragePermissionAndSave = async (): Promise<KTPPhoto | null> => {
  try {
    // 1. Minta izin kamera dulu
    const hasCameraPermission = await requestCameraPermission();
    if (!hasCameraPermission) {
      Alert.alert('Izin Ditolak', 'Tidak dapat mengakses kamera tanpa izin');
      return null;
    }

    // 2. Minta izin penyimpanan
    const hasStoragePermission = await requestStoragePermission();
    
    let options: any = {
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      includeBase64: false,
      cameraType: 'back',
    };

    if (hasStoragePermission) {
      options.saveToPhotos = true;
    } else {
      Alert.alert(
        'Izin Penyimpanan Ditolak',
        'Foto KTP tidak akan disimpan ke galeri publik. Foto hanya akan disimpan di aplikasi.',
        [{ text: 'OK', style: 'default' }]
      );
    }

    // 3. Buka kamera dengan error handling
    const result = await launchCamera(options);

    // 🔥 CEK ERROR CODE: KAMERA TIDAK TERSEDIA
    if (result.errorCode === 'camera_unavailable') {
      // Tampilkan Alert dengan opsi buka galeri
      return new Promise((resolve) => {
        Alert.alert(
          'Kamera Tidak Tersedia',
          'Kamera tidak bisa dibuka. Mungkin sedang dipakai aplikasi lain atau rusak. Gunakan Galeri?',
          [
            {
              text: 'Buka Galeri',
              onPress: async () => {
                const galleryPhoto = await pickKTPFromGallery();
                resolve(galleryPhoto);
              },
            },
            {
              text: 'Batal',
              style: 'cancel',
              onPress: () => resolve(null),
            },
          ]
        );
      });
    }

    if (result.didCancel) {
      console.log('User cancelled camera');
      return null;
    }

    if (result.errorCode) {
      // Handle error lainnya
      Alert.alert('Error', `Gagal mengambil foto: ${result.errorMessage}`);
      return null;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const ktpPhoto: KTPPhoto = {
        uri: asset.uri!,
        fileName: asset.fileName || `ktp_${Date.now()}.jpg`,
        type: asset.type,
        fileSize: asset.fileSize,
        savedToGallery: hasStoragePermission,
      };

      if (hasStoragePermission) {
        Alert.alert(
          'Sukses', 
          'Foto KTP berhasil diambil dan disimpan ke galeri sebagai backup',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Sukses', 
          'Foto KTP berhasil diambil (hanya disimpan di aplikasi)',
          [{ text: 'OK', style: 'default' }]
        );
      }

      return ktpPhoto;
    }

    return null;
  } catch (error) {
    console.error('Error in KTP camera:', error);
    Alert.alert('Error', 'Terjadi kesalahan saat mengambil foto KTP');
    return null;
  }
};

// 🔥 UPDATE FUNCTION INI JUGA DENGAN ERROR HANDLING YANG SAMA
export const openCameraWithFallback = async (): Promise<KTPPhoto | null> => {
  try {
    const hasCameraPermission = await requestCameraPermission();
    if (!hasCameraPermission) {
      Alert.alert('Izin Ditolak', 'Tidak dapat mengakses kamera');
      return null;
    }

    const result = await launchCamera({
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      cameraType: 'back',
    });

    // 🔥 HANDLE CAMERA UNAVAILABLE ERROR
    if (result.errorCode === 'camera_unavailable') {
      return new Promise((resolve) => {
        Alert.alert(
          'Kamera Tidak Tersedia',
          'Kamera tidak bisa dibuka. Gunakan Galeri?',
          [
            {
              text: 'Buka Galeri',
              onPress: async () => {
                const galleryPhoto = await pickKTPFromGallery();
                resolve(galleryPhoto);
              },
            },
            {
              text: 'Batal',
              style: 'cancel',
              onPress: () => resolve(null),
            },
          ]
        );
      });
    }

    if (result.didCancel) return null;
    
    if (result.errorCode) {
      Alert.alert('Error', `Kamera error: ${result.errorMessage}`);
      return null;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri!,
        fileName: asset.fileName,
        type: asset.type,
        fileSize: asset.fileSize,
      };
    }

    return null;
  } catch (error) {
    console.error('Camera error:', error);
    Alert.alert('Error', 'Tidak dapat membuka kamera');
    return null;
  }
};

// Fungsi pick dari galeri (tetap sama)
export const pickKTPFromGallery = async (): Promise<KTPPhoto | null> => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      includeBase64: false,
    });

    if (result.didCancel) {
      return null;
    }

    if (result.errorCode) {
      Alert.alert('Error', `Galeri error: ${result.errorMessage}`);
      return null;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri!,
        fileName: asset.fileName || `ktp_${Date.now()}.jpg`,
        type: asset.type,
        fileSize: asset.fileSize,
        savedToGallery: false,
      };
    }

    return null;
  } catch (error) {
    console.error('Error picking KTP from gallery:', error);
    Alert.alert('Error', 'Terjadi kesalahan saat memilih foto KTP');
    return null;
  }
};