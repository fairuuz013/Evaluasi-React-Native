import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 👉 PASTIKAN INTERFACE DIEKSPORT
export interface ImageAsset {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
}

// 👉 PASTIKAN FUNCTION DIEKSPORT
export const openImagePicker = async (): Promise<ImageAsset[]> => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5, // Maksimal 5 foto
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.8,
    });

    if (result.didCancel) {
      console.log('User cancelled image picker');
      return [];
    }

    if (result.errorCode) {
      console.log('ImagePicker Error: ', result.errorMessage);
      throw new Error(result.errorMessage || 'Failed to pick images');
    }

    if (result.assets && result.assets.length > 0) {
      // Format data yang akan disimpan
      const selectedAssets: ImageAsset[] = result.assets.map(asset => ({
        uri: asset.uri!,
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.type,
        fileSize: asset.fileSize,
      }));

      // Simpan ke AsyncStorage
      await AsyncStorage.setItem(
        '@ecom:newProductAssets',
        JSON.stringify(selectedAssets)
      );

      console.log('Images saved to AsyncStorage:', selectedAssets.length);
      return selectedAssets;
    }

    return [];
  } catch (error) {
    console.error('Error in image picker:', error);
    throw error;
  }
};

// 👉 PASTIKAN FUNCTION INI DIEKSPORT
export const getStoredProductAssets = async (): Promise<ImageAsset[]> => {
  try {
    const stored = await AsyncStorage.getItem('@ecom:newProductAssets');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting stored assets:', error);
    return [];
  }
};

// 👉 TAMBAHKAN FUNCTION CLEAR JIKA DIPERLUKAN
export const clearStoredProductAssets = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@ecom:newProductAssets');
  } catch (error) {
    console.error('Error clearing stored assets:', error);
  }
};