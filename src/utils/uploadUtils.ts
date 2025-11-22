import { Alert } from 'react-native';

export interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const uploadFile = async (
  fileUri: string,
  fileName: string,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  try {
    // Buat FormData
    const formData = new FormData();
    
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: fileName || `photo_${Date.now()}.jpg`,
    } as any);

    formData.append('quality', '0.7');
    formData.append('timestamp', Date.now().toString());

    // Konfigurasi fetch
    const xhr = new XMLHttpRequest();

    return new Promise((resolve) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(Math.round(progress));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              data: responseData,
            });
          } catch (error) {
            resolve({
              success: true,
              data: xhr.responseText,
            });
          }
        } else {
          resolve({
            success: false,
            error: `Upload failed with status: ${xhr.status}`,
          });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Network error occurred',
        });
      });

      xhr.addEventListener('timeout', () => {
        resolve({
          success: false,
          error: 'Upload timeout',
        });
      });

      xhr.open('POST', uploadUrl);
      xhr.timeout = 30000; // 30 seconds timeout
      
      // Set headers jika perlu
      // xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Failed to prepare upload',
    };
  }
};

export const uploadMultipleFiles = async (
  files: Array<{ uri: string; fileName: string }>,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, {
        uri: file.uri,
        type: 'image/jpeg',
        name: file.fileName || `photo_${Date.now()}_${index}.jpg`,
      } as any);
    });

    formData.append('quality', '0.7');
    formData.append('timestamp', Date.now().toString());

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Multiple files upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};