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
    const formData = new FormData();
    
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: fileName,
    } as any);

    formData.append('quality', '0.7');
    formData.append('timestamp', Date.now().toString());

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

      xhr.open('POST', uploadUrl);
      xhr.timeout = 30000;
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