import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { requestStoragePermissionAndSave, pickKTPFromGallery, KTPPhoto } from '../utils/ktpCamera';
import { uploadFile } from '../utils/uploadUtils';
import LoadingIndicator from './LoadingIndicator';

interface KTPUploadComponentProps {
  onKTPUploaded?: (ktpPhoto: KTPPhoto) => void;
  onUploadComplete?: (result: any) => void;
  initialPhoto?: KTPPhoto | null;
  autoUpload?: boolean;
  uploadUrl?: string;
}

const KTPUploadComponent: React.FC<KTPUploadComponentProps> = ({
  onKTPUploaded,
  onUploadComplete,
  initialPhoto = null,
  autoUpload = true,
  uploadUrl = 'https://your-api.com/upload/ktp',
}) => {
  const [ktpPhoto, setKtpPhoto] = useState<KTPPhoto | null>(initialPhoto);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleTakeKTPPhoto = async () => {
    setLoading(true);
    try {
      const photo = await requestStoragePermissionAndSave();
      if (photo) {
        setKtpPhoto(photo);
        if (onKTPUploaded) {
          onKTPUploaded(photo);
        }
        
        // Auto upload setelah foto diambil
        if (autoUpload && uploadUrl) {
          await handleUploadKTP(photo);
        }
      }
    } catch (error) {
      console.error('Error taking KTP photo:', error);
      Alert.alert('Error', 'Gagal mengambil foto KTP');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadKTP = async (photo: KTPPhoto) => {
    if (!photo.uri) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const result = await uploadFile(
        photo.uri,
        photo.fileName || `ktp_${Date.now()}.jpg`,
        uploadUrl,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (result.success) {
        console.log('KTP uploaded successfully:', result.data);
        Alert.alert('Sukses', 'KTP berhasil diupload!');
        if (onUploadComplete) {
          onUploadComplete(result.data);
        }
      } else {
        Alert.alert('Upload Gagal', `Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Gagal mengupload KTP');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePickFromGallery = async () => {
    setLoading(true);
    try {
      const photo = await pickKTPFromGallery();
      if (photo) {
        setKtpPhoto(photo);
        if (onKTPUploaded) {
          onKTPUploaded(photo);
        }
        
        if (autoUpload && uploadUrl) {
          await handleUploadKTP(photo);
        }
      }
    } catch (error) {
      console.error('Error picking KTP photo:', error);
      Alert.alert('Error', 'Gagal memilih foto dari galeri');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      'Hapus Foto KTP',
      'Apakah Anda yakin ingin menghapus foto KTP?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setKtpPhoto(null);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foto KTP</Text>
      <Text style={styles.subtitle}>
        Untuk verifikasi identitas. Foto akan disimpan sebagai backup di galeri.
      </Text>

      {/* Preview Foto KTP */}
      {ktpPhoto ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: ktpPhoto.uri }} style={styles.photo} />
          <View style={styles.photoInfo}>
            <Text style={styles.fileName}>{ktpPhoto.fileName}</Text>
            <Text style={styles.fileSize}>
              {ktpPhoto.fileSize ? `Size: ${Math.round(ktpPhoto.fileSize / 1024)} KB` : ''}
            </Text>
            {ktpPhoto.savedToGallery && (
              <Text style={styles.savedBadge}>✓ Tersimpan di Galeri</Text>
            )}
          </View>
          <TouchableOpacity style={styles.removeButton} onPress={handleRemovePhoto}>
            <Text style={styles.removeButtonText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Belum ada foto KTP</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleTakeKTPPhoto}
          disabled={loading || uploading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Ambil Foto KTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handlePickFromGallery}
          disabled={loading || uploading}
        >
          <Text style={styles.buttonText}>Pilih dari Galeri</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Upload Button jika autoUpload false */}
      {!autoUpload && ktpPhoto && (
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={() => handleUploadKTP(ktpPhoto)}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload KTP</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Upload Progress Indicator */}
      <LoadingIndicator
        visible={uploading}
        message={`Mengupload KTP... ${uploadProgress}%`}
        progress={uploadProgress}
        type="progress"
      />

      {/* Info */}
      <Text style={styles.infoText}>
        • Foto akan disimpan di galeri sebagai backup{'\n'}
        • Pastikan KTP terbaca dengan jelas{'\n'}
        • Format: JPG, maksimal 1MB
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  photo: {
    width: 200,
    height: 120,
    borderRadius: 4,
    marginBottom: 8,
  },
  photoInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  fileSize: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  savedBadge: {
    fontSize: 10,
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 4,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  placeholder: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#6C757D',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonDisabled: {
    backgroundColor: '#6C757D',
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default KTPUploadComponent;