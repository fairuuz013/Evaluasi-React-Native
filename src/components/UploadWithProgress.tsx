import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { uploadFile, UploadResult } from '../utils/uploadUtils';
import LoadingIndicator from './LoadingIndicator';

interface UploadWithProgressProps {
  onUploadComplete: (result: UploadResult) => void;
  uploadUrl: string;
  buttonText?: string;
  maxFileSize?: number; // in bytes
}

const UploadWithProgress: React.FC<UploadWithProgressProps> = ({
  onUploadComplete,
  uploadUrl,
  buttonText = 'Upload File',
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<{ uri: string; fileName: string } | null>(null);

  const handleFileSelect = async () => {
    // TODO: Integrasi dengan image picker yang sudah ada
    // Untuk sekarang, kita simulasi file selection
    const mockFile = {
      uri: 'file://mock/path/image.jpg',
      fileName: 'sample_image.jpg',
    };
    setSelectedFile(mockFile);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Pilih file terlebih dahulu');
      return;
    }

    // Validasi file size
    // Note: Untuk real implementation, perlu get file size dari image picker
    // if (selectedFile.fileSize > maxFileSize) {
    //   Alert.alert('Error', `File terlalu besar. Maksimal ${maxFileSize / 1024 / 1024}MB`);
    //   return;
    // }

    try {
      setUploading(true);
      setProgress(0);

      const result = await uploadFile(
        selectedFile.uri,
        selectedFile.fileName,
        uploadUrl,
        (uploadProgress) => {
          setProgress(uploadProgress);
        }
      );

      if (result.success) {
        Alert.alert('Sukses', 'File berhasil diupload!');
        onUploadComplete(result);
      } else {
        Alert.alert('Error', `Upload gagal: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat upload');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      {/* File Preview */}
      {selectedFile && (
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: selectedFile.uri }} 
            style={styles.previewImage}
            defaultSource={require('../images/placeholder.jpg')}
          />
          <Text style={styles.fileName}>{selectedFile.fileName}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.selectButton]}
          onPress={handleFileSelect}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>
            {selectedFile ? 'Ganti File' : 'Pilih File'}
          </Text>
        </TouchableOpacity>

        {selectedFile && (
          <TouchableOpacity
            style={[styles.button, styles.uploadButton]}
            onPress={handleUpload}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading Indicator */}
      <LoadingIndicator
        visible={uploading}
        message={`Mengupload... ${progress}%`}
        progress={progress}
        type="progress"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: '#6C757D',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default UploadWithProgress;