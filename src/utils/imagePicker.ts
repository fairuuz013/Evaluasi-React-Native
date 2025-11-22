import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ImageAsset {
  uri: string;
  fileName?: string;
  type?: string;
  fileSize?: number;
  base64?: string;
}

export interface Base64Preview {
  uri: string;
  base64: string;
  fileName: string;
  timestamp: number;
}

// FUNCTION BARU: UNTUK PREVIEW CEPAT BASE64
export const openImageLibraryWithBase64 = async (): Promise<ImageAsset[]> => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.7,
      includeBase64: true,
      includeExtra: true,
    });

    if (result.didCancel) {
      return [];
    }

    if (result.errorCode) {
      console.log('ImagePicker Error: ', result.errorMessage);
      throw new Error(result.errorMessage || 'Failed to pick images');
    }

    if (result.assets && result.assets.length > 0) {
      const selectedAssets: ImageAsset[] = result.assets.map(asset => ({
        uri: asset.uri!,
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.type,
        fileSize: asset.fileSize,
        base64: asset.base64,
      }));

      // SIMPAN BASE64 PREVIEW KE ASYNCSTORAGE
      await saveBase64Preview(selectedAssets);

      await AsyncStorage.setItem(
        '@ecom:newProductAssets',
        JSON.stringify(selectedAssets)
      );

      console.log('Images with base64 saved:', selectedAssets.length);
      return selectedAssets;
    }

    return [];
  } catch (error) {
    console.error('Error in image picker with base64:', error);
    throw error;
  }
};

// FUNCTION BARU: SIMPAN BASE64 PREVIEW
export const saveBase64Preview = async (assets: ImageAsset[]): Promise<void> => {
  try {
    const base64Previews: Base64Preview[] = assets
      .filter(asset => asset.base64)
      .map(asset => ({
        uri: asset.uri,
        base64: asset.base64!,
        fileName: asset.fileName || 'preview.jpg',
        timestamp: Date.now(),
      }));

    if (base64Previews.length > 0) {
      await AsyncStorage.setItem(
        '@ecom:base64Previews',
        JSON.stringify(base64Previews)
      );
      console.log('Base64 previews saved:', base64Previews.length);
    }
  } catch (error) {
    console.error('Error saving base64 previews:', error);
  }
};

// FUNCTION BARU: LOAD BASE64 PREVIEWS
export const getBase64Previews = async (): Promise<Base64Preview[]> => {
  try {
    const stored = await AsyncStorage.getItem('@ecom:base64Previews');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting base64 previews:', error);
    return [];
  }
};

// FUNCTION BARU: CLEAR BASE64 PREVIEWS
export const clearBase64Previews = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@ecom:base64Previews');
  } catch (error) {
    console.error('Error clearing base64 previews:', error);
  }
};

// FUNCTION YANG SUDAH ADA (LENGKAPI)
export const openImagePicker = async (): Promise<ImageAsset[]> => {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.8,
      includeExtra: true,
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
      const selectedAssets: ImageAsset[] = result.assets.map(asset => ({
        uri: asset.uri!,
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.type,
        fileSize: asset.fileSize,
      }));

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

export const getStoredProductAssets = async (): Promise<ImageAsset[]> => {
  try {
    const stored = await AsyncStorage.getItem('@ecom:newProductAssets');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting stored assets:', error);
    return [];
  }
};

export const clearStoredProductAssets = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@ecom:newProductAssets');
  } catch (error) {
    console.error('Error clearing stored assets:', error);
  }
};

// FUNCTION TAMBAHAN: OPEN CAMERA (jika belum ada)
export const openCamera = async (): Promise<ImageAsset | null> => {
  try {
    const result = await launchCamera({
      mediaType: 'photo',
      maxWidth: 600,
      maxHeight: 600,
      quality: 0.8,
      includeExtra: true,
    });

    if (result.didCancel) {
      return null;
    }

    if (result.errorCode) {
      console.log('Camera Error: ', result.errorMessage);
      throw new Error(result.errorMessage || 'Failed to take photo');
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri!,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.type,
        fileSize: asset.fileSize,
      };
    }

    return null;
  } catch (error) {
    console.error('Error in camera:', error);
    throw error;
  }
};

// FUNCTION TAMBAHAN: OPEN CAMERA WITH BASE64
export const openCameraWithBase64 = async (): Promise<ImageAsset | null> => {
  try {
    const result = await launchCamera({
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.7,
      includeBase64: true,
      includeExtra: true,
    });

    if (result.didCancel) {
      return null;
    }

    if (result.errorCode) {
      console.log('Camera Error: ', result.errorMessage);
      throw new Error(result.errorMessage || 'Failed to take photo');
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const imageAsset: ImageAsset = {
        uri: asset.uri!,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.type,
        fileSize: asset.fileSize,
        base64: asset.base64,
      };

      // Simpan base64 preview
      await saveBase64Preview([imageAsset]);

      return imageAsset;
    }

    return null;
  } catch (error) {
    console.error('Error in camera with base64:', error);
    throw error;
  }
};